import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Check, Loader2 } from "lucide-react";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import UsersContext, {
  UsersSearchResultsContext,
} from "@/context/users-context";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useUpdateSubscription } from "@/hooks/api/use-user-mutations";

export default function SubscriptionManager({
  user,
  setUser,
}: {
  user: User;
  setUser?: any;
}) {
  const { mutateAsync: updateSubscription, isPending: submitting } = useUpdateSubscription();

  const { subscriptionTiers, refreshSubscriptionTiers } = useContext(
    SubscriptionTiersContext
  );
  const { setUsers } = useContext(UsersContext);
  const { setUsersSearchResults } = useContext(UsersSearchResultsContext);

  const { t } = useTranslation();

  const updateUserInMemory = (
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
    setUser &&
      setUser((user: User) => ({
        ...user,
        subscriptionTier: tier,
        isSubscribed,
      }));
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
    try {
      if (typeof formValues.expiry !== "string") {
        formValues.expiry = formValues.expiry.toISOString();
      }
      formValues.state = true;
      formValues.target = user._id;
      const promise = updateSubscription(formValues);
      toast.promise(promise, {
        loading: "Submitting...",
        success: "Update complete",
        error: "Update failed!",
      });
      await promise;
      const targetSubscription = subscriptionTiers.find(
        (subscription) => subscription.name === formValues.tier
      );
      const isSubscribed =
        !targetSubscription.isBaseTier &&
        !(new Date(formValues.expiry) < new Date());
      updateUserInMemory(setUsers, formValues.tier, isSubscribed);
      updateUserInMemory(setUsersSearchResults, formValues.tier, isSubscribed);
    } catch (e) {
      // Error handled by toast
    }
  };

  return (
    <div className="grid gap-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="tier"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t("label.plan-tier")}</FormLabel>
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
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="expiry"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t("label.expiration-date")}</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={
                            "pl-3 text-left font-normal " +
                            (!field.value ? "text-muted-foreground" : "")
                          }
                        >
                          {field.value ? (
                            format(new Date(field.value), "PPP")
                          ) : (
                            <span>{t("label.pick-date")}</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        captionLayout="dropdown"
                        startMonth={
                          new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000)
                        } // ~5 years
                        endMonth={
                          new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000)
                        } // ~5 years
                        selected={field.value ? new Date(field.value) : undefined}
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
          
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              {t("button.save-changes")}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
