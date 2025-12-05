import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { FaCirclePlus } from "react-icons/fa6";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FaPen } from "react-icons/fa";
import { toast } from "sonner";
import { useCreateRole, useUpdateRole } from "@/hooks/api/use-role-mutations";

export default function RoleEditor({
  onCreate,
  role,
  onUpdate,
}: {
  onCreate?: any;
  onUpdate?: any;
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
    if (!role) {
      const result = await create(formValues);
      if (onCreate) {
        onCreate(result.data.data.role);
      }
    } else {
      await update(formValues);
    }
    setOpen(false);

    if (!role) {
      form.reset();
    }
  }

  if (!isPermissionAllowed("admin:roles:write")) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={role ? "outline" : "default"} className="ml-2">
          {role ? (
            <FaPen className="h-4 w-4" />
          ) : (
            <>
              <FaCirclePlus className="h-4 w-4 mr-2" />
              {t("button.create-role")}
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-full md:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{role ? "Update Role" : "Create Role"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-2 p-4 max-h-[60vh] overflow-y-auto"
            >
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
                        minLength={8}
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
                      <Input {...field} minLength={8} />
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
              <Button type="submit">{t("button.save-changes")}</Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
