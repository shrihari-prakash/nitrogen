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
import { SheetClose, SheetFooter } from "@/components/ui/sheet";
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
import { User } from "@/types/user";
import { Copy, Save, XCircle } from "lucide-react";
import { useContext, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

export default function BasicInfoEditor({ user }: { user: User }) {
  const formDefaults = {
    _id: user._id,
    username: user.username,
    firstName: user.firstName,
    middleName: user.middleName,
    lastName: user.lastName,
    email: user.email,
    emailVerified: user.emailVerified,
    password: "",
    organization: user.organization,
    country: user.country,
    role: user.role,
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

  const isPermissionAllowed = usePermissions();

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
      ? (roles as any[]).find((r: any) => r.name === role).rank
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
        pending: "Submitting...",
        success: "Update successfull",
        error: "Update failed!",
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
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-4 py-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ID</FormLabel>
                <div className="flex">
                  <FormControl>
                    <Input disabled {...field} />
                  </FormControl>
                  <Button onClick={copyId} className="ml-2" variant="outline">
                    <Copy className="h-4 w-4" />
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
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={!shouldAllowFieldEdit("username")}
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
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
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
                    {(roles || []).map((role: any) => (
                      <SelectItem value={role.name} key={role.name}>
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
                <FormLabel>First Name</FormLabel>
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
                <FormLabel>Middle Name</FormLabel>
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
                <FormLabel>Last Name</FormLabel>
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
                <FormLabel>Email</FormLabel>
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
                  <FormLabel>Email Verified</FormLabel>
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
                <FormLabel>Password</FormLabel>
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
                <FormLabel>Country</FormLabel>
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
                    {(countries || []).map((role: any) => (
                      <SelectItem value={role.iso} key={role.iso}>
                        {role.name}
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
                <FormLabel>Organization</FormLabel>
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
          <SheetFooter className="flex-col">
            <Button
              type="submit"
              className="mb-3"
              disabled={!isPermissionAllowed("admin:profile:write")}
            >
              <Save className="h-4 w-4 mr-2" />
              {submitting ? "Saving..." : "Save changes"}
            </Button>
            <SheetClose asChild>
              <Button variant="outline">
                <XCircle className="h-4 w-4 mr-2" /> Close
              </Button>
            </SheetClose>
          </SheetFooter>
        </form>
      </Form>
    </div>
  );
}
