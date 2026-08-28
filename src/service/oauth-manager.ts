import Cookies from "js-cookie";
import axios from "axios";
import axiosInstance from "./axios";
import { liquid } from "./liquid";

class OAuthManager {
  tokenEndpoint = `${import.meta.env.VITE_LIQUID_HOST}/oauth/token`;

  generateCodeVerifier(): string {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return btoa(String.fromCharCode.apply(null, Array.from(array)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }

  async generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await window.crypto.subtle.digest("SHA-256", data);
    return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(digest))))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }

  async redirectToLogin() {
    const verifier = this.generateCodeVerifier();
    sessionStorage.setItem("pkce_code_verifier", verifier);
    const challenge = await this.generateCodeChallenge(verifier);
    window.location.href =
      import.meta.env.VITE_LIQUID_HOST +
      "?redirect_uri=" +
      encodeURIComponent(this.makeRedirectUri()) +
      "&code_challenge=" +
      encodeURIComponent(challenge) +
      "&code_challenge_method=S256";
  }

  async getTokenFromCode(code: string) {
    const codeVerifier = sessionStorage.getItem("pkce_code_verifier") || "";
    const data: Record<string, string> = {
      grant_type: "authorization_code",
      client_id: import.meta.env.VITE_LIQUID_CLIENT_ID,
      redirect_uri: this.makeRedirectUri(),
      code: code,
    };
    if (codeVerifier) {
      data.code_verifier = codeVerifier;
    }
    const response = await axios.post(
      this.tokenEndpoint,
      new URLSearchParams(data),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    sessionStorage.removeItem("pkce_code_verifier");
    this.saveTokens(response);
    return response.data;
  }

  checkCredentials() {
    return (
      Cookies.get("oauth_access_token") || Cookies.get("oauth_refresh_token")
    );
  }

  clearCredentials() {
    Cookies.remove("oauth_access_token");
    Cookies.remove("oauth_refresh_token");
  }

  private refreshPromise: Promise<string | null> | null = null;

  async refreshAccessToken(): Promise<string | null> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const refreshToken = Cookies.get("oauth_refresh_token");
        if (!refreshToken) {
          this.clearCredentials();
          return null;
        }
        const data: Record<string, string> = {
          grant_type: "refresh_token",
          client_id: import.meta.env.VITE_LIQUID_CLIENT_ID,
          refresh_token: refreshToken,
        };
        const response = await axios.post(
          this.tokenEndpoint,
          new URLSearchParams(data),
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );
        this.saveTokens(response);
        return response.data.access_token;
      } catch (error: any) {
        console.error("Token refresh error:", error?.response?.data || error?.message || error);
        this.clearCredentials();
        return null;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  async getAccessToken(forceRefresh = false): Promise<string | null> {
    const accessToken = Cookies.get("oauth_access_token");
    if (accessToken && !forceRefresh) {
      return accessToken;
    }
    return this.refreshAccessToken();
  }

  saveTokens(response: any) {
    const accessTokenExpiry = new Date();
    accessTokenExpiry.setSeconds(
      accessTokenExpiry.getSeconds() + response.data.expires_in
    );
    Cookies.set("oauth_access_token", response.data.access_token, {
      expires: accessTokenExpiry,
    });
    Cookies.set("oauth_refresh_token", response.data.refresh_token, {
      expires: 15,
    });
    axiosInstance.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${response.data.access_token}`;
  }

  async me() {
    try {
      let response = await liquid.users.getMe();
      if (response.status === 401) {
        const newToken = await this.refreshAccessToken();
        if (newToken) {
          response = await liquid.users.getMe();
        }
      }
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized");
        }
        return false;
      }
      return (response.data as any)?.user;
    } catch (error: any) {
      if (error?.message === "Unauthorized" || error?.status === 401) {
        throw error;
      } else {
        return false;
      }
    }
  }

  makeRedirectUri() {
    return location.protocol + "//" + location.host;
  }
}

const oauthManager = new OAuthManager();
export default oauthManager;
