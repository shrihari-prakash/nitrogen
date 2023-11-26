import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Save, XCircle } from "lucide-react";
import { useContext, useEffect } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { User } from "@/types/user";
import SubscriptionTiersContext from "@/context/subscription-tiers-context";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { SelectValue } from "@radix-ui/react-select";
import { SheetClose, SheetFooter } from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import axiosInstance from "@/service/axios";
import UsersContext, {
  UsersSearchResultsContext,
} from "@/context/users-context";
import { toast } from "react-toastify";

export default function SubscriptionManager({ user }: { user: User }) {
  const { subscriptionTiers, refreshSubscriptionTiers } = useContext(
    SubscriptionTiersContext
  );

  const { setUsers } = useContext(UsersContext);
  const { setUsersSearchResults } = useContext(UsersSearchResultsContext);

  const setUserSubscription = (
    setter: any,
    tier: string,
    isSubscribed: boolean
  ) => {
    setter((users: User[]) => {
      if (!users) return users;
      return users.map((iterationUser) =>
        user._id === iterationUser._id
          ? { ...user, subscriptionTier: tier, isSubscribed }
          : iterationUser
      );
    });
  };

  const form = useForm({
    defaultValues: {
      tier: user.subscriptionTier,
      expiry: user.subscriptionExpiry,
    },
  });

  useEffect(() => {
    if (!subscriptionTiers) {
      refreshSubscriptionTiers();
    }
  }, [subscriptionTiers, refreshSubscriptionTiers]);

  if (!subscriptionTiers) {
    return null;
  }

  const onSubmit = async (formValues: any) => {
    if (typeof formValues.expiry !== "string") {
      formValues.expiry = formValues.expiry.toISOString();
    }
    formValues.state = true;
    formValues.target = user._id;
    const promise = axiosInstance.post(
      "/user/admin-api/subscription",
      formValues
    );
    toast.promise(promise, {
      pending: "Submitting...",
      success: "Update successfull",
      error: "Update failed!",
    });
    await promise;
    const targetSubscription = subscriptionTiers.find(
      (subscription) => subscription.name === formValues.tier
    );
    const isSubscribed = !targetSubscription.isBaseTier;
    setUserSubscription(setUsers, formValues.tier, isSubscribed);
    setUserSubscription(setUsersSearchResults, formValues.tier, isSubscribed);
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="md:flex">
            <FormField
              control={form.control}
              name="tier"
              render={({ field }) => (
                <FormItem className="flex flex-col w-full md:w-1/2 mr-0 mb-2 md:mr-2 md:mb-0">
                  <FormLabel>Subscription Tier</FormLabel>
                  <Select
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className="capitalize">
                        <SelectValue placeholder="Select Tier" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent defaultValue={field.value}>
                      <SelectGroup>
                        {subscriptionTiers.map((subscriptionTier) => (
                          <SelectItem
                            value={subscriptionTier.name}
                            key={subscriptionTier.name}
                            className="capitalize"
                          >
                            {subscriptionTier.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="expiry"
              render={({ field }) => (
                <FormItem className="flex flex-col w-full md:w-1/2">
                  <FormLabel>Date of birth</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={
                            "pl-3 text-left font-normal" +
                            (!field.value && "text-muted-foreground")
                          }
                        >
                          {field.value ? (
                            format(new Date(field.value), "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(Date.now() - 86400000)
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <SheetFooter className="flex-col mt-8">
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              Save Subscription
            </Button>
            <SheetClose asChild>
              <Button variant="outline">
                <XCircle className="h-4 w-4 mr-2" /> Close
              </Button>
            </SheetClose>
          </SheetFooter>
        </form>
      </Form>
    </>
  );
}
