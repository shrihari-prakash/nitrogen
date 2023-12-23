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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tag, TagInput } from "@/components/ui/tag-input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import RolesContext from "@/context/roles-context";
import usePermissions from "@/hooks/use-permissions";
import axiosInstance from "@/service/axios";
import { Application } from "@/types/application";
import { PencilIcon, PlusCircle } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { v4 as uuid } from "uuid";

const grants = [
  { label: "Authorization Code", value: "authorization_code" },
  { label: "Refresh Token", value: "refresh_token" },
  { label: "Client Credentials", value: "client_credentials" },
];

export default function ApplicationEditor({
  onCreate,
  application,
  onUpdate,
}: {
  onCreate?: any;
  onUpdate?: any;
  application?: Application;
}) {
  const [open, setOpen] = useState(false);
  const [selectedGrants, setSelectedGrants] = useState<any[]>([]);
  const [redirectUris, setRedirectUris] = useState<Tag[]>([]);

  const onGrantSelect = (g: any) => {
    console.log(g);
    setSelectedGrants(g);
  };

  const { roles, refreshRoles } = useContext(RolesContext);

  useEffect(() => {
    if (!roles) refreshRoles();
  }, [roles, refreshRoles]);

  const isPermissionAllowed = usePermissions();

  const formDefaults = application || {
    id: undefined,
    displayName: undefined,
    secret: undefined,
    role: undefined,
    redirectUris: undefined,
  };

  formDefaults.secret = "";

  const form = useForm({
    defaultValues: formDefaults,
  });

  useEffect(() => {
    if (application) {
      const uris = application.redirectUris.map((uri) => ({
        id: uuid(),
        text: uri,
      }));
      setRedirectUris(uris);
    }
  }, [application, setRedirectUris]);

  async function create(formValues: any) {
    const promise = axiosInstance.post("/client/admin-api/create", formValues);
    toast.promise(promise, {
      loading: "Submitting...",
      success: "Creation successfull",
      error: "Creation failed!",
    });
    return await promise;
  }

  async function update(formValues: any) {
    if (!application) {
      return;
    }
    if (!formValues.grants.length) {
      formValues.grants = application.grants;
    }
    delete formValues._id;
    delete formValues.scope;
    delete formValues.__v;
    for (const field in formValues) {
      if(!formValues[field]) {
        delete formValues[field];
      }
    }
    const promise = axiosInstance.patch("/client/admin-api/update", {
      target: application._id,
      ...formValues,
    });
    toast.promise(promise, {
      loading: "Submitting...",
      success: "Update successfull",
      error: "Update failed!",
    });
    await promise;
    if (onUpdate) {
      onUpdate(formValues);
    }
  }

  async function onSubmit(formValues: any) {
    formValues = {
      ...formValues,
      redirectUris: redirectUris.map((uri) => uri.text),
      grants: selectedGrants,
    };
    if (!Array.isArray(formValues.redirectUris)) {
      formValues.redirectUris = formValues.redirectUris.split(",");
    }
    if (!application) {
      const result = await create(formValues);
      if (onCreate) {
        onCreate(result.data.data.client);
      }
    } else {
      await update(formValues);
    }
    setOpen(false);

    if (!application) {
      form.reset();
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="ml-2">
          {application ? (
            <PencilIcon className="h-4 w-4" />
          ) : (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Application
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-full md:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {application ? "Update Application" : "Create Application"}
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
                    <FormLabel>Application ID</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        autoCapitalize="none"
                        minLength={8}
                        disabled={!!application}
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
                name="secret"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Application Secret</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      For security reasons, this secret will never be shown
                      again.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent defaultValue="external_client">
                        <SelectItem
                          value="internal_client"
                          disabled={
                            !isPermissionAllowed(
                              "admin:system:internal-client:write"
                            )
                          }
                        >
                          Internal Client
                        </SelectItem>
                        <SelectItem
                          value="external_client"
                          disabled={
                            !isPermissionAllowed(
                              "admin:system:external-client:write"
                            )
                          }
                        >
                          External Client
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel>Grants</FormLabel>
                <ToggleGroup
                  size={"sm"}
                  className="justify-between"
                  type="multiple"
                  onValueChange={onGrantSelect}
                  variant="outline"
                  defaultValue={application && application.grants}
                >
                  {grants.map((grant) => (
                    <ToggleGroupItem
                      value={grant.value}
                      aria-label={grant.label}
                      className="text-xs"
                      key={grant.value}
                    >
                      {grant.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </FormItem>
              <FormField
                control={form.control}
                name="redirectUris"
                render={() => (
                  <FormItem>
                    <FormLabel>Redirect URIs</FormLabel>
                    <FormControl>
                      <TagInput
                        placeholder="Type a URL and press enter"
                        tags={redirectUris}
                        textCase={"lowercase"}
                        className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        setTags={(newTags) => setRedirectUris(newTags)}
                      />
                    </FormControl>
                    <FormDescription>
                      Comma separated list of redirect URIs. Make sure you
                      update your Liquid CORS settings and restart once you add
                      a URI.
                    </FormDescription>
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
