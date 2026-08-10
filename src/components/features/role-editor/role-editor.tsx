import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
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
import usePermissions from "@/hooks/use-permissions";
import { Role } from "@/types/role";
import { camelCaseToWords } from "@/utils/string";
import { PlusCircle, Pencil } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useCreateRole, useUpdateRole } from "@/hooks/api/use-role-mutations";

export default function RoleEditor({
  onCreate,
  role,
  onUpdate,
}: {
  onCreate?: (role: Role) => void;
  onUpdate?: (role: Role) => void;
  role?: Role;
}) {
  const [open, setOpen] = useState(false);

  const { isPermissionAllowed } = usePermissions();

  const { t } = useTranslation();

  const formDefaults = role || {
    id: undefined,
    displayName: undefined,
    description: undefined,
    rank: 0,
  };

  const form = useForm({
    defaultValues: formDefaults,
  });

  const { mutateAsync: createRole } = useCreateRole();
  const { mutateAsync: updateRole } = useUpdateRole();

  async function create(formValues: any) {
    const promise = createRole(formValues);
    toast.promise(promise, {
      loading: "Processing creation...",
      success: "Role created",
      error: (error: any) => {
        console.log(error);
        const data = error.response?.data;
        const errors = data?.additionalInfo?.errors;
        if (errors) {
          return "Invalid " + camelCaseToWords(errors[0].path);
        }
        return "Creation failed!";
      },
    });
    return await promise;
  }

  async function update(formValues: any) {
    if (!role) {
      return;
    }
    formValues.target = role.id;
    delete formValues._id;
    delete formValues.scope;
    delete formValues.__v;
    for (const field in formValues) {
      if (!formValues[field]) {
        delete formValues[field];
      }
    }
    const promise = updateRole({
      target: role._id,
      ...formValues,
    });
    toast.promise(promise, {
      loading: "Processing changes...",
      success: "Update complete",
      error: (error: any) => {
        console.log(error);
        const data = error.response?.data;
        const errors = data?.additionalInfo?.errors;
        if (errors) {
          return `Invalid ${camelCaseToWords(errors[0].param)}`;
        }
        return "Update failed!";
      },
    });
    await promise;
    if (onUpdate) {
      onUpdate(formValues);
    }
  }

  async function onSubmit(formValues: any) {
    try {
      if (!role) {
        const result = await create(formValues);
        const createdRole = result?.role || result?.data?.role || result;
        if (onCreate && createdRole) {
          onCreate(createdRole);
        }
      } else {
        await update(formValues);
      }
      setOpen(false);

      if (!role) {
        form.reset();
      }
    } catch (error) {
      console.error("Error submitting role form:", error);
    }
  }

  if (!isPermissionAllowed("admin:roles:write")) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {role ? (
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-xl border-border/70 hover:bg-accent transition-colors"
            title={t("action.edit-role")}
          >
            <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        ) : (
          <Button variant="default">
            <PlusCircle className="h-4 w-4 mr-2" />
            {t("button.create-role")}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent
        className="w-full md:!max-w-[500px] overflow-y-auto flex flex-col justify-between p-0 gap-0"
      >
        <SheetHeader className="p-6 pb-4 border-b border-border/40 bg-card/60">
          <SheetTitle className="text-xl font-bold tracking-tight text-left">
            {role ? t("heading.update-role") : t("heading.create-role")}
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground mt-0.5 text-left">
            {role ? "Modify role settings and ranking." : "Create a new role definition."}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-1 flex flex-col justify-between"
          >
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <FormField
                control={form.control}
                name="id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("label.role-id")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        autoCapitalize="none"
                        minLength={1}
                        disabled={!!role}
                      />
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
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("label.display-name")}</FormLabel>
                    <FormControl>
                      <Input {...field} minLength={1} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("label.description")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ranking"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("label.rank")}</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <SheetFooter className="p-4 border-t border-border/40 bg-card/60 flex items-center justify-between sm:justify-between">
              <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)} className="text-xs hidden md:block">
                {t("button.cancel")}
              </Button>
              <Button type="submit" size="sm" className="text-xs font-semibold">
                {role ? t("button.save-changes") : t("button.create")}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
