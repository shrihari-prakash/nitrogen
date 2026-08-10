import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
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
import { Application } from "@/types/application";
import { camelCaseToWords } from "@/utils/string";
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FaPen } from "react-icons/fa";
import { FaCirclePlus } from "react-icons/fa6";
import { Eye, EyeOff, Copy } from "lucide-react";
import { toast } from "sonner";
import { v4 as uuid } from "uuid";
import { useCreateApplication, useUpdateApplication } from "@/hooks/api/use-application-mutations";

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
  const [showSecret, setShowSecret] = useState(false);

  const { t } = useTranslation();

  const grants = [
    {
      label: t("message.grant-type.authorization-code"),
      value: "authorization_code",
    },
    { label: t("message.grant-type.refresh-token"), value: "refresh_token" },
    {
      label: t("message.grant-type.client-credentials"),
      value: "client_credentials",
    },
  ];

  const onGrantSelect = (g: any) => {
    console.log(g);
    setSelectedGrants(g);
  };

  const { roles, refreshRoles } = useContext(RolesContext);

  useEffect(() => {
    if (!roles) refreshRoles();
  }, [roles, refreshRoles]);

  const { isPermissionAllowed } = usePermissions();

  const formDefaults = application
    ? {
      id: application.id || "",
      displayName: application.displayName || "",
      secret: application.secret || "",
      role: application.role || "external_client",
      redirectUris: application.redirectUris || [],
    }
    : {
      id: "",
      displayName: "",
      secret: "",
      role: "external_client" as "internal_client" | "external_client",
      redirectUris: [] as string[],
    };

  const form = useForm({
    defaultValues: formDefaults,
  });

  useEffect(() => {
    if (open) {
      if (application) {
        const uris = (application.redirectUris || []).map((uri) => ({
          id: uuid(),
          text: uri,
        }));
        setRedirectUris(uris);
        setSelectedGrants(application.grants || []);
        form.reset({
          id: application.id || "",
          displayName: application.displayName || "",
          secret: application.secret || "",
          role: application.role || "external_client",
          redirectUris: application.redirectUris || [],
        });
      } else {
        setRedirectUris([]);
        setSelectedGrants([]);
        form.reset({
          id: "",
          displayName: "",
          secret: "",
          role: "external_client",
          redirectUris: [],
        });
      }
      setShowSecret(false);
    }
  }, [open, application, form]);

  const { mutateAsync: createApplication } = useCreateApplication();
  const { mutateAsync: updateApplication } = useUpdateApplication();

  async function create(formValues: any) {
    const promise = createApplication(formValues);
    toast.promise(promise, {
      loading: "Processing creation...",
      success: "Application created",
      error: (error: any) => {
        console.log(error);
        const data = error.response?.data;
        const errors = data?.additionalInfo?.errors;
        if (errors) {
          return "Invalid " + camelCaseToWords(errors[0].param);
        }
        return "Creation failed!";
      },
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
      if (!formValues[field]) {
        delete formValues[field];
      }
    }
    const promise = updateApplication({
      target: application._id,
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
        const createdClient = result?.client || result?.data?.client || result;
        if (onCreate && createdClient) {
          onCreate(createdClient);
        }
      } else {
        await update(formValues);
      }
      setOpen(false);

      if (!application) {
        form.reset();
      }
    } catch (error) {
      console.error("Error submitting application form:", error);
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setShowSecret(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        {application ? (
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-xl border-border/70 hover:bg-accent transition-colors"
            title={t("action.edit-application")}
          >
            <FaPen className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        ) : (
          <Button variant="default">
            <FaCirclePlus className="h-4 w-4 mr-2" />
            {t("heading.create-application")}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="sm:max-w-md md:max-w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {application ? "Update Application" : "Create Application"}
          </SheetTitle>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("label.application-id")}</FormLabel>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          autoCapitalize="none"
                          minLength={8}
                          disabled={!!application}
                        />
                      </FormControl>
                      {field.value && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="shrink-0"
                          title={t("action.copy-application-id")}
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(field.value);
                              toast(t("message.copied-application-id"));
                            } catch (err) {
                              toast(t("message.copy-failed"));
                            }
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
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
                name="secret"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("label.application-secret")}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          type={showSecret ? "text" : "password"}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-foreground"
                          onClick={() => setShowSecret((prev) => !prev)}
                          aria-label={showSecret ? "Hide secret" : "Show secret"}
                        >
                          {showSecret ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("label.role")}</FormLabel>
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
                <FormLabel>{t("label.grants")}</FormLabel>
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
                    <FormLabel>{t("label.redirect-uris")}</FormLabel>
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
                      {t("message.redirect-uri-help")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">{t("button.save-changes")}</Button>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
