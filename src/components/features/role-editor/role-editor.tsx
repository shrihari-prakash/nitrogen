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
import axiosInstance from "@/service/axios";
import { Role } from "@/types/role";
import { camelCaseToWords } from "@/utils/string";
import { PencilIcon, PlusCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

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

  const formDefaults = role || {
    id: undefined,
    displayName: undefined,
    description: undefined,
    rank: 0,
  };

  const form = useForm({
    defaultValues: formDefaults,
  });

  async function create(formValues: any) {
    const promise = axiosInstance.post("/roles/admin-api/create", formValues);
    toast.promise(promise, {
      loading: "Processing creation...",
      success: "Role created",
      error: (data: any) => {
        console.log(data);
        const errors = data?.response?.data?.additionalInfo?.errors;
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
    const promise = axiosInstance.patch("/roles/admin-api/update", {
      target: role._id,
      ...formValues,
    });
    toast.promise(promise, {
      loading: "Processing changes...",
      success: "Update complete",
      error: (data: any) => {
        console.log(data);
        const errors = data?.response?.data?.additionalInfo?.errors;
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

  if (!isPermissionAllowed("admin:role:write")) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="ml-2">
          {role ? (
            <PencilIcon className="h-4 w-4" />
          ) : (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Role
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-full md:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {role ? "Update Role" : "Create Role"}
          </DialogTitle>
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
                    <FormLabel>Role Identifier</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        autoCapitalize="none"
                        minLength={8}
                        disabled={!!role}
                      />
                    </FormControl>
                    <FormDescription>
                      Must be atleast 8 characters long. Can include alphabets,
                      numbers and underscores.
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
                    <FormLabel>Display Name</FormLabel>
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
                    <FormLabel>Description</FormLabel>
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
                    <FormLabel>Rank</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Save changes</Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
