import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SheetFooter } from "@/components/ui/sheet";
import UsersContext, {
  UsersSearchResultsContext,
} from "@/context/users-context";
import { User } from "@/types/user";
import { useContext } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { PiCoinVertical } from "react-icons/pi";
import { toast } from "sonner";
import { useUpdateCredits } from "@/hooks/api/use-user-mutations";

export default function CreditsEditor({
  user,
  setUser,
}: {
  user: User;
  setUser: any;
}) {
  const formDefaults = {
    value: user.credits || 0,
  };

  const { mutateAsync: updateCredits, isPending: submitting } = useUpdateCredits();

  const { setUsers } = useContext(UsersContext);
  const { setUsersSearchResults } = useContext(UsersSearchResultsContext);

  const { t } = useTranslation();

  const form = useForm({
    defaultValues: formDefaults,
  });

  async function onSubmit(formValues: any) {
    const value = parseInt(formValues.value);
    if (isNaN(value) || value < 0) {
      toast.error(t("message.invalid-credit-value"));
      return;
    }

    let promise;
    try {
      promise = updateCredits({
        target: user._id,
        type: "set",
        value: value,
      });
      toast.promise(promise, {
        loading: t("message.processing-credits-update"),
        success: t("message.credits-updated-successfully"),
        error: (error: any) => {
          console.log(error);
          const message = error.response?.data?.message;
          if (message) {
            return message;
          }
          return t("message.credits-update-failed");
        },
      });
      await promise;

      const cb = (users: User[]) => {
        if (!users) return users;
        return users.map((iterationUser) =>
          user._id === iterationUser._id
            ? { ...iterationUser, credits: value }
            : iterationUser
        );
      };
      setUsers(cb);
      setUsersSearchResults(cb);
      setUser((user: User) => ({ ...user, credits: value }));
    } catch (e) {
      // Error handled by toast
    }
  }

  return (
    <div className="grid gap-4">
      <div className="flex justify-between items-center pb-4 mb-2 border-b">
        <div>
          <h3 className="font-medium text-sm text-muted-foreground">{t("label.credits")} Balance</h3>
          <p className="text-2xl font-semibold">{user.credits || 0}</p>
        </div>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("label.credits")}
                </FormLabel>
                <FormDescription>
                  {t("message.credits-description")}
                </FormDescription>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min="0"
                    placeholder={t("label.enter-credit-amount")}
                  />
                </FormControl>
                <div className="flex gap-2 pt-2">
                  {[10, 50, 100, 500].map((amount) => (
                    <Button
                      key={amount}
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => {
                        const current = parseInt(form.getValues("value") as any) || 0;
                        form.setValue("value", current + amount, { shouldValidate: true, shouldDirty: true });
                      }}
                    >
                      +{amount}
                    </Button>
                  ))}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs ml-auto"
                    onClick={() => {
                      form.setValue("value", 0, { shouldValidate: true, shouldDirty: true });
                    }}
                  >
                    {t("button.reset")}
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <SheetFooter className="mt-4">
            <Button
              type="submit"
              disabled={submitting}
            >
              <PiCoinVertical className="h-4 w-4 mr-2" />
              {submitting ? t("button.updating") : t("button.update-credits")}
            </Button>
          </SheetFooter>
        </form>
      </Form>
    </div>
  );
}
