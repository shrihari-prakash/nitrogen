import { useContext, useEffect, useMemo, useState } from "react";
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
import { BiUserPlus } from "react-icons/bi";
import { UserPlus } from "lucide-react";
import { camelCaseToWords } from "@/utils/string";
import { toast } from "sonner";
import axiosInstance from "@/service/axios";
import UsersContext, {
  UsersSearchResultsContext,
} from "@/context/users-context";
import usePermissions from "@/hooks/use-permissions";

const UserCreate = () => {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { setUsers } = useContext(UsersContext);
  const { setUsersSearchResults } = useContext(UsersSearchResultsContext);
  const isPermissionAllowed = usePermissions();

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
    setSubmitting(true);
    console.log(formValues);
    let promise;
    try {
      promise = axiosInstance.post("/user/admin-api/create", [formValues]);
      toast.promise(promise, {
        loading: "Creating user...",
        success: "User created successfully!",
        error: (data: any) => {
          console.log(data);
          const errors = data?.response?.data?.additionalInfo?.errors;
          if (errors) {
            return "Invalid " + camelCaseToWords(errors[0].path);
          }
          if (data?.response?.data?.additionalInfo?.existingUsers) {
            return "User already exists!";
          }
          return "Failed to create user!";
        },
      });
      await promise;
      setUsers(() => []);
      setUsersSearchResults(null);
    } finally {
      setSubmitting(false);
    }
  }

  if (!isPermissionAllowed("admin:profile:create:write")) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger>
        <Button variant="outline" className="gap-1">
          <BiUserPlus className="text-xl" /> Create User
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full md:!max-w-[550px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Create user</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input autoComplete="hjadsfiioq" {...field} />
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
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
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
                  <FormLabel>Last Name</FormLabel>
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
                  <FormLabel>Email</FormLabel>
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
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="hjadsfiioq"
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Must be atleast 8 characters long.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SheetFooter className="flex-col sm:justify-center">
              <Button type="submit" className="mb-2 md:mb-0" variant="outline">
                <UserPlus className="h-4 w-4 mr-2" />
                {submitting ? "Creating..." : "Create"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default UserCreate;
