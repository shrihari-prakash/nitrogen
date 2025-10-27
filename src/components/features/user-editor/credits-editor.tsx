import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
import axiosInstance from "@/service/axios";
import { User } from "@/types/user";
import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { PiCoinVertical } from "react-icons/pi";
import { toast } from "sonner";

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

  const [submitting, setSubmitting] = useState(false);

  const { setUsers } = useContext(UsersContext);
  const { setUsersSearchResults } = useContext(UsersSearchResultsContext);

  const { t } = useTranslation();

  const form = useForm({
    defaultValues: formDefaults,
  });

  async function onSubmit(formValues: any) {
    setSubmitting(true);
    const value = parseInt(formValues.value);
    if (isNaN(value) || value < 0) {
      toast.error(t("message.invalid-credit-value"));
      setSubmitting(false);
      return;
    }

    let promise;
    try {
      promise = axiosInstance.post("/user/admin-api/credits", {
        target: user._id,
        type: "set",
        value: value,
      });
      toast.promise(promise, {
        loading: t("message.processing-credits-update"),
        success: t("message.credits-updated-successfully"),
        error: (data: any) => {
          console.log(data);
          const message = data?.response?.data?.message;
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
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("label.credits")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min="0"
                    placeholder={t("label.enter-credit-amount")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <SheetFooter className="flex-col sm:justify-center">
            <Button
              type="submit"
              disabled={submitting}
              className="mb-2 md:mb-0"
              variant="outline"
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
