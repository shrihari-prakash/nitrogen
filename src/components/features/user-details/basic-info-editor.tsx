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
import { SheetClose, SheetFooter } from "@/components/ui/sheet";
import { TypographyH4 } from "@/components/ui/typography";
import axiosInstance from "@/service/axios";
import { User } from "@/types/user";
import { Copy, Save, XCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

export default function BasicInfoEditor({ user }: { user: User }) {
  const [submitting, setSubmitting] = useState(false);

  const copyId = async (e: any) => {
    try {
      e.preventDefault();
      await navigator.clipboard.writeText(user._id);
      toast("Copied!");
    } catch (err) {
      toast("Copy failed!");
    }
  };

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
  };

  const form = useForm({
    defaultValues: formDefaults,
  });

  async function onSubmit(values: any) {
    setSubmitting(true);
    Object.keys(values).forEach((key) => {
      if (values[key] === (formDefaults as any)[key]) {
        delete values[key];
        return;
      }
      if (values[key] === "") {
        values[key] = "__unset__";
      }
    });
    console.log(values);
    let promise;
    try {
      promise = axiosInstance.patch("/user/admin-api/user", {
        target: user._id,
        ...values,
      });
      toast.promise(promise, {
        pending: "Submitting...",
        success: "Update successfull",
        error: "Update failed!",
      });
      await promise;
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-4 py-4">
      <TypographyH4>Basic Info</TypographyH4>
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
                    <Input disabled defaultValue={user._id} {...field} />
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
                  <Input {...field} />
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
                  <Input {...field} />
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
                  <Input {...field} />
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
                  <Input {...field} />
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
                  <Input {...field} />
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
                  <Input {...field} />
                </FormControl>
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
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <SheetFooter className="flex-col">
            <Button type="submit" className="mb-3">
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
