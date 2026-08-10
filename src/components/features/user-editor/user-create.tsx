import { useEffect, useMemo, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { UserPlus } from "lucide-react";
import { useCreateUser } from "@/hooks/api/use-users";

const createUserSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .min(6, "Username must be at least 6 characters")
    .max(30, "Username must not exceed 30 characters")
    .regex(
      /^[a-zA-Z0-9_.]+$/,
      "Username can only contain letters, numbers, underscores, and dots"
    ),
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(32, "First name must not exceed 32 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(32, "Last name must not exceed 32 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must not exceed 128 characters"),
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;

const UserCreate = () => {
  const [open, setOpen] = useState(false);
  const { mutateAsync: createUser, isPending: submitting } = useCreateUser();
  const { isPermissionAllowed } = usePermissions();
  const { t } = useTranslation();

  const formDefaults: CreateUserFormValues = useMemo(
    () => ({
      username: "",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    }),
    []
  );

  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: formDefaults,
    mode: "onTouched",
  });

  useEffect(() => {
    if (open) {
      form.reset(formDefaults);
    }
  }, [open, form, formDefaults]);

  function parseAndSetApiErrors(
    error: any,
    formInstance: UseFormReturn<CreateUserFormValues>,
    formValues: CreateUserFormValues
  ): string {
    const data = error?.response?.data || error?.data || error;
    const additionalInfo = data?.additionalInfo;
    let mainErrorMessage = "";
    let mappedFieldError = false;

    const knownFields: (keyof CreateUserFormValues)[] = [
      "username",
      "firstName",
      "lastName",
      "email",
      "password",
    ];

    // 1. Parse express-validator field errors from Liquid API
    if (Array.isArray(additionalInfo?.errors) && additionalInfo.errors.length > 0) {
      additionalInfo.errors.forEach((err: any) => {
        const rawPath: string = err.path || err.param || "";
        
        // Find which known form field this raw path relates to
        const cleanPath = knownFields.find(
          (field) =>
            rawPath === field ||
            rawPath.endsWith(`.${field}`) ||
            rawPath.startsWith(`${field}.`) ||
            rawPath.replace(/^(\d+\.|\*\.)/, "") === field
        );

        if (cleanPath) {
          const fieldLabel = camelCaseToWords(cleanPath);
          const customMsg =
            err.msg && err.msg !== "Invalid value"
              ? err.msg
              : `Invalid ${fieldLabel.toLowerCase()}`;

          formInstance.setError(cleanPath, {
            type: "server",
            message: customMsg,
          });
          mappedFieldError = true;
          if (!mainErrorMessage) {
            mainErrorMessage = customMsg;
          }
        }
      });
    }

    // 2. Parse duplicate user conflicts from Liquid API
    if (Array.isArray(additionalInfo?.existingUsers) && additionalInfo.existingUsers.length > 0) {
      additionalInfo.existingUsers.forEach((existing: any) => {
        if (
          existing.username &&
          formValues.username &&
          existing.username.toLowerCase() === formValues.username.toLowerCase()
        ) {
          formInstance.setError("username", {
            type: "server",
            message: "Username is already taken",
          });
          mappedFieldError = true;
          if (!mainErrorMessage) mainErrorMessage = "Username is already taken";
        }
        if (
          existing.email &&
          formValues.email &&
          existing.email.toLowerCase() === formValues.email.toLowerCase()
        ) {
          formInstance.setError("email", {
            type: "server",
            message: "Email address is already registered",
          });
          mappedFieldError = true;
          if (!mainErrorMessage) mainErrorMessage = "Email address is already registered";
        }
      });

      if (!mainErrorMessage) {
        mainErrorMessage = "A user with this username or email already exists";
      }
    }

    // 3. Handle generic Liquid error codes
    if (!mainErrorMessage) {
      const errCode = data?.error || error?.error;
      if (errCode === "insufficient-privileges" || errCode === "InsufficientPrivileges") {
        mainErrorMessage = "You do not have sufficient privileges to create users";
      } else if (errCode === "client-input-error" || errCode === "ClientInputError") {
        mainErrorMessage = mappedFieldError ? "Please fix the highlighted errors" : "Invalid user details provided";
      } else if (data?.message) {
        mainErrorMessage = data.message;
      } else if (error?.message) {
        mainErrorMessage = error.message;
      } else {
        mainErrorMessage = "Failed to create user";
      }
    }

    return mainErrorMessage;
  }

  async function onSubmit(formValues: CreateUserFormValues) {
    try {
      await createUser(formValues);
      toast.success("User created successfully!");
      form.reset(formDefaults);
      setOpen(false);
    } catch (error: any) {
      console.error("User creation failed:", error);
      const errorMessage = parseAndSetApiErrors(error, form, formValues);
      toast.error(errorMessage);
    }
  }

  if (!isPermissionAllowed("admin:profile:create:write")) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="default" className="gap-1.5" data-t="create-user-button">
          <UserPlus className="h-4 w-4" />
          {t("heading.create-user")}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full md:!max-w-[550px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t("heading.create-user")}</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("label.username")}</FormLabel>
                  <FormControl>
                    <Input autoComplete="off" placeholder="john_doe" {...field} />
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
                    <Input autoComplete="off" placeholder="John" {...field} />
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
                    <Input autoComplete="off" placeholder="Doe" {...field} />
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
                    <Input autoComplete="off" type="email" placeholder="john@example.com" {...field} />
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
                      autoComplete="new-password"
                      type="password"
                      placeholder="••••••••"
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
            <SheetFooter className="flex-col sm:justify-center pt-2">
              <Button
                type="submit"
                disabled={submitting}
                className="w-full mb-2 md:mb-0"
                data-t="create-user-submit"
              >
                <UserPlus className="h-4 w-4 mr-2" />
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
