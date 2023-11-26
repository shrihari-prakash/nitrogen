import { createContext } from "react";

export type ISubscriptionTiersContext = {
  subscriptionTiers: any[] | null;
  refreshSubscriptionTiers: any;
};

const SubscriptionTiersContext = createContext<ISubscriptionTiersContext>({
  subscriptionTiers: null,
  refreshSubscriptionTiers: null,
});
export default SubscriptionTiersContext;
