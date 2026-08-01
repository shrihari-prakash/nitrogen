import { createLiquidClient } from "liquid-js-sdk";
import oauthManager from "./oauth-manager";

export const liquid = createLiquidClient({
  baseUrl: import.meta.env.VITE_LIQUID_HOST || "",
  getAccessToken: async () => {
    const token = await oauthManager.getAccessToken();
    return token || "";
  },
});
