import Cookies from "js-cookie";
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
    const response = await axiosInstance.post(
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

  async getAccessToken() {
    const accessToken = Cookies.get("oauth_access_token");
    if (accessToken) {
      return accessToken;
    }
    const refreshToken = Cookies.get("oauth_refresh_token");
    if (refreshToken) {
      const data = {
        grant_type: "refresh_token",
        client_id: import.meta.env.VITE_LIQUID_CLIENT_ID,
        redirect_uri: this.makeRedirectUri(),
        refresh_token: refreshToken,
      };
      const response = await axiosInstance.post(
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
    }
    return null;
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
  }

  async me() {
    try {
      const response = await liquid.users.getMe();
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
