import { useEffect, useMemo, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useForm } from "react-hook-form";
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
import { Button } from "@/components/ui/button";
import { camelCaseToWords } from "@/utils/string";
import { toast } from "sonner";
import usePermissions from "@/hooks/use-permissions";
import { useTranslation } from "react-i18next";
import { FaUserPlus } from "react-icons/fa";
import { useCreateUser } from "@/hooks/api/use-users";

const UserCreate = () => {
  const [open, setOpen] = useState(false);
  const { mutateAsync: createUser, isPending: submitting } = useCreateUser();
  const { isPermissionAllowed } = usePermissions();
  const { t } = useTranslation();

  const formDefaults = useMemo(
    () => ({
      username: "",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    }),
    []
  );

  const form = useForm({ defaultValues: formDefaults });

  useEffect(() => {
    form.reset(formDefaults);
  }, [open, form, formDefaults]);

  async function onSubmit(formValues: any) {
    console.log(formValues);
    let promise;
    try {
      promise = createUser(formValues);
      toast.promise(promise, {
        loading: "Creating user...",
        success: "User created successfully!",
        error: (error: any) => {
          console.log(error);
          const data = error.response?.data;
          const errors = data?.additionalInfo?.errors;
          if (errors) {
            return "Invalid " + camelCaseToWords(errors[0].path);
          }
          if (data?.additionalInfo?.existingUsers) {
            return "User already exists!";
          }
          return "Failed to create user!";
        },
      });
      await promise;
      form.reset(formDefaults);
      setOpen(false);
    } catch (e) {
      // Error handled by toast
    }
  }

  if (!isPermissionAllowed("admin:profile:create:write")) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger>
        <Button className="gap-1" data-t="create-user-button">
          <FaUserPlus className="h-4 w-4" />
          {t("heading.create-user")}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full md:!max-w-[550px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t("heading.create-user")}</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("label.username")}</FormLabel>
                  <FormControl>
                    <Input autoComplete="hjadsfiioq" {...field} />
                  </FormControl>
                  <FormDescription>
                    {t("message.username-help")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("label.first-name")}</FormLabel>
                  <FormControl>
                    <Input autoComplete="hjadsfiioq" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("label.last-name")}</FormLabel>
                  <FormControl>
                    <Input autoComplete="hjadsfiioq" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("label.email")}</FormLabel>
                  <FormControl>
                    <Input autoComplete="hjadsfiioq" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("label.password")}</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="hjadsfiioq"
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {t("message.password-help")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SheetFooter className="flex-col sm:justify-center">
              <Button
                type="submit"
                className="mb-2 md:mb-0"
                data-t="create-user-submit"
              >
                <FaUserPlus className="h-4 w-4 mr-2" />
                {submitting ? t("button.creating") : t("button.create")}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default UserCreate;
