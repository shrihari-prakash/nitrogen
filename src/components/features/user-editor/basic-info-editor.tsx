import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { SheetFooter } from "@/components/ui/sheet";
import CountriesContext from "@/context/countries-context";
import EditableFieldsContext from "@/context/editable-fields-context";
import MeContext from "@/context/me-context";
import RolesContext from "@/context/roles-context";
import SettingsContext from "@/context/settings-context";
import UsersContext, {
  UsersSearchResultsContext,
} from "@/context/users-context";
import usePermissions from "@/hooks/use-permissions";
import axiosInstance from "@/service/axios";
import { Role } from "@/types/role";
import { User } from "@/types/user";
import { camelCaseToWords } from "@/utils/string";
import { useContext, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FaCopy } from "react-icons/fa";
import { FaFloppyDisk } from "react-icons/fa6";
import { toast } from "sonner";

export default function BasicInfoEditor({
  user,
  setUser,
}: {
  user: User;
  setUser: any;
}) {
  const formDefaults = {
    _id: user._id,
    username: user.username,
    firstName: user.firstName,
    middleName: user.middleName || "",
    lastName: user.lastName,
    email: user.email,
    emailVerified: user.emailVerified,
    password: "",
    organization: user.organization,
    country: user.country || "",
    role: user.role || "",
  };

  const [submitting, setSubmitting] = useState(false);

  const { me } = useContext(MeContext);
  const { countries, refreshCountries } = useContext(CountriesContext);
  const { roles, refreshRoles } = useContext(RolesContext);
  const { settings, refreshSettings } = useContext(SettingsContext);
  const { editableFields, refreshEditableFields } = useContext(
    EditableFieldsContext
  );
  const { setUsers } = useContext(UsersContext);
  const { setUsersSearchResults } = useContext(UsersSearchResultsContext);

  const { isPermissionAllowed } = usePermissions();

  const { t } = useTranslation();

  const savedFormRef = useRef(formDefaults);

  useEffect(() => {
    if (!roles) refreshRoles();
  }, [roles, refreshRoles]);

  useEffect(() => {
    if (!settings) refreshSettings();
  }, [settings, refreshSettings]);

  useEffect(() => {
    if (!editableFields) refreshEditableFields();
  }, [editableFields, refreshEditableFields]);

  useEffect(() => {
    if (!countries) refreshCountries();
  }, [countries, refreshCountries]);

  console.log(countries);

  const shouldAllowFieldEdit = (field: string) => {
    if (!isPermissionAllowed("admin:profile:write")) {
      return false;
    }
    if (!editableFields || !user) {
      return false;
    }
    if (
      getRoleRank((me as User).role as string) >
      getRoleRank(user.role as string)
    ) {
      return false;
    } else if (
      getRoleRank((me as User).role as string) ===
      getRoleRank(user.role as string)
    ) {
      if (
        settings &&
        !(settings as any)["admin-api.user.profile.can-edit-peer-data"]
      ) {
        return false;
      }
    }
    if (editableFields.includes(field)) {
      return true;
    }
  };

  const getRoleRank = (role: string) => {
    return roles
      ? (roles as any[]).find((r: any) => r.id === role)?.ranking
      : 999;
  };

  const copyId = async (e: any) => {
    try {
      e.preventDefault();
      await navigator.clipboard.writeText(user._id);
      toast("Copied!");
    } catch (err) {
      toast("Copy failed!");
    }
  };

  const form = useForm({
    defaultValues: formDefaults,
  });

  async function onSubmit(formValues: any) {
    setSubmitting(true);
    const savedForm = { ...formDefaults, ...formValues };
    Object.keys(formValues).forEach((key) => {
      if (formValues[key] === (savedFormRef.current as any)[key]) {
        delete formValues[key];
        return;
      }
      if (formValues[key] === "") {
        formValues[key] = "__unset__";
      }
    });
    console.log(formValues);
    let promise;
    try {
      promise = axiosInstance.patch("/user/admin-api/update", {
        target: user._id,
        ...formValues,
      });
      toast.promise(promise, {
        loading: "Processing changes...",
        success: "Update complete",
        error: (data: any) => {
          console.log(data);
          const errors = data?.response?.data?.additionalInfo?.errors;
          if (errors) {
            return "Invalid " + camelCaseToWords(errors[0].param);
          }
          return "Update failed!";
        },
      });
      await promise;
      savedFormRef.current = savedForm;
      const cb = (users: User[]) => {
        if (!users) return users;
        return users.map((iterationUser) =>
          user._id === iterationUser._id
            ? { ...user, ...formValues }
            : iterationUser
        );
      };
      setUsers(cb);
      setUsersSearchResults(cb);
      setUser((user: User) => ({ ...user, ...formValues }));
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
            name="_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("label.id")}</FormLabel>
                <div className="flex">
                  <FormControl>
                    <Input disabled {...field} />
                  </FormControl>
                  <Button
                    onClick={copyId}
                    type="button"
                    className="ml-2"
                    variant="outline"
                  >
                    <FaCopy className="h-4 w-4" />
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("label.username")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={!shouldAllowFieldEdit("username")}
                  />
                </FormControl>
                <FormDescription>{t("message.username-help")}</FormDescription>
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
                  disabled={!shouldAllowFieldEdit("role")}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent defaultValue={user.role}>
                    {(roles || [])
                      .filter((role: Role) => role.type === "user")
                      .map((role: Role) => (
                        <SelectItem value={role.id} key={role.id}>
                          {role.displayName}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
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
                  <Input
                    {...field}
                    disabled={!shouldAllowFieldEdit("firstName")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="middleName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("label.middle-name")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={!shouldAllowFieldEdit("middleName")}
                  />
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
                  <Input
                    {...field}
                    disabled={!shouldAllowFieldEdit("lastName")}
                  />
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
                  <Input {...field} disabled={!shouldAllowFieldEdit("email")} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="emailVerified"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    defaultChecked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={!shouldAllowFieldEdit("emailVerified")}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>{t("label.email-verified")}</FormLabel>
                  <FormDescription>
                    Unverified users cannot login.
                  </FormDescription>
                </div>
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
                    {...field}
                    disabled={!shouldAllowFieldEdit("password")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("label.country")}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={!shouldAllowFieldEdit("country")}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a Country" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent
                    defaultValue={user.country}
                    className="overflow-y-auto max-h-[40vh]"
                  >
                    {(countries || []).map((country: any) => (
                      <SelectItem value={country.iso} key={country.iso}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="organization"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("label.organization")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={!shouldAllowFieldEdit("organization")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <SheetFooter className="flex-col sm:justify-center">
            <Button
              type="submit"
              disabled={!isPermissionAllowed("admin:profile:write")}
              className="mb-2 md:mb-0"
              variant="outline"
            >
              <FaFloppyDisk className="h-4 w-4 mr-2" />
              {submitting ? "Saving..." : "Save Basic Info"}
            </Button>
          </SheetFooter>
        </form>
      </Form>
    </div>
  );
}
