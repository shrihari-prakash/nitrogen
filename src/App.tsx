import { ThemeProvider } from "@/components/theme-provider";
import SideBar from "./components/ui/sidebar";
import Page from "./components/ui/page";
import UserList from "./components/features/user-list/user-list";
import { Route, Switch } from "wouter";
import UserEditor from "./components/features/user-editor/user-editor";
import { useEffect, useState } from "react";
import oauthManager from "./service/oauth-manager";
import axiosInstance from "./service/axios";
import i18n from "i18next";
import { useTranslation, initReactI18next } from "react-i18next";
import enJSON from "./strings/en.json";

import EditableFieldsContext from "./context/editable-fields-context";
import UsersContext, {
  UsersSearchResultsContext,
} from "./context/users-context";
import RolesContext from "./context/roles-context";
import SettingsContext from "./context/settings-context";
import MeContext from "./context/me-context";
import { KeyRound, ShieldOff } from "lucide-react";
import { BsFillBoxFill, BsFillShieldLockFill } from "react-icons/bs";
import ScopesContext from "./context/scopes-context";
import { Scope } from "./components/ui/scope-selector";
import ApplicationList from "./components/features/application-list/application-list";
import CountriesContext from "./context/countries-context";
import SubscriptionTiersContext from "./context/subscription-tiers-context";
import { Toaster } from "./components/ui/sonner";
import RoleList from "./components/features/role-list/role-list";
import { PageTitle } from "./components/features/common/page-title";
import { FaUsers } from "react-icons/fa";

let scopesFetchInProgess = false;
let countriesFetchInProgess = false;
let roleFetchInProgess = false;
let settingsFetchInProgess = false;
let editableFieldsFetchInProgess = false;
let subscriptionTiersFetchInProgess = false;

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: enJSON,
    },
  },
  lng: "en",
  fallbackLng: "en",

  interpolation: {
    escapeValue: false,
  },
});

function App() {
  const [authError, setAuthError] = useState(false);
  const [scopes, setScopes] = useState<any>(null);
  const [me, setMe] = useState(null);
  const [editableFields, setEditableFields] = useState(null);
  const [subscriptionTiers, setSubscriptionTiers] = useState(null);
  const [countries, setCountries] = useState(null);
  const [roles, setRoles] = useState(null);
  const [settings, setSettings] = useState(null);
  const [users, setUsers] = useState([]);
  const [usersSearchResults, setUsersSearchResults] = useState(null);

  const { t } = useTranslation();

  const getSettings = () => {
    if (settingsFetchInProgess) return;
    settingsFetchInProgess = true;
    axiosInstance
      .get("/system/settings")
      .then((response: any) => setSettings(response.data.data.settings))
      .finally(() => (settingsFetchInProgess = false));
  };

  useEffect(() => {
    if (!settings) {
      return;
    }
    document.title = settings["system.app-name"];
  }, [settings]);

  const refreshCountries = async () => {
    if (countriesFetchInProgess) return;
    countriesFetchInProgess = true;
    axiosInstance
      .get("/system/countries-insecure")
      .then((response: any) => setCountries(response.data.data.countries))
      .finally(() => (countriesFetchInProgess = false));
  };

  const refreshRoles = async () => {
    if (roleFetchInProgess) return;
    roleFetchInProgess = true;
    axiosInstance
      .get("/roles/list")
      .then((response: any) => {
        console.error(response.data);
        setRoles(response.data.data.roles);
      })
      .finally(() => (roleFetchInProgess = false));
  };

  const refreshScopes = async () => {
    if (scopesFetchInProgess) return;
    scopesFetchInProgess = true;
    axiosInstance
      .get("/user/scopes")
      .then((response: any) => {
        const scopesObject = response.data.data.scopes;
        const scopes = Object.keys(scopesObject).map(
          (key) => scopesObject[key]
        ) as Scope[];
        setScopes(scopes);
      })
      .finally(() => (scopesFetchInProgess = false));
  };

  const refreshEditableFields = () => {
    if (editableFieldsFetchInProgess) return;
    editableFieldsFetchInProgess = true;
    axiosInstance
      .get("/user/admin-api/editable-fields")
      .then((response: any) =>
        setEditableFields(response.data.data.editableFields)
      )
      .finally(() => (editableFieldsFetchInProgess = false));
  };

  const refreshSubscriptionTiers = () => {
    if (subscriptionTiersFetchInProgess) return;
    subscriptionTiersFetchInProgess = true;
    axiosInstance
      .get("/user/admin-api/subscription-tiers")
      .then((response: any) =>
        setSubscriptionTiers(response.data.data.subscriptionTiers)
      )
      .finally(() => (subscriptionTiersFetchInProgess = false));
  };

  const redirectToLogin = () => {
    window.location.href =
      import.meta.env.VITE_LIQUID_HOST +
      "?redirect_uri=" +
      oauthManager.makeRedirectUri();
  };

  const onLogin = async (me: any) => {
    console.log(me);
    setMe(me);
    const accessToken = await oauthManager.getAccessToken();
    axiosInstance.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${accessToken}`;
    axiosInstance.defaults.baseURL = import.meta.env.VITE_LIQUID_HOST;
  };

  function removeQueryParam(paramName: string | string[]): void {
    if (typeof paramName === "string") {
      paramName = [paramName];
    }
    const currentUrl = window.location.href;
    const url = new URL(currentUrl);
    for (let i = 0; i < paramName.length; i++) {
      url.searchParams.delete(paramName[i]);
    }
    const newUrl = url.toString();
    window.history.replaceState({}, document.title, newUrl);
  }

  useEffect(() => {
    (async () => {
      if (!me) {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        const error = urlParams.get("error");
        if (error) {
          setAuthError(true);
          return;
        }
        try {
          if (code) {
            try {
              await oauthManager.getTokenFromCode(code);
              onLogin(await oauthManager.me());
              removeQueryParam(["code", "state"]);
            } catch {
              setAuthError(true);
            }
          } else if (oauthManager.checkCredentials()) {
            onLogin(await oauthManager.me());
          } else {
            oauthManager.clearCredentials();
            redirectToLogin();
          }
        } catch (e) {
          console.error(e);
          oauthManager.clearCredentials();
          redirectToLogin();
        }
      }
    })();
  }, [me]);

  if (authError) {
    return (
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <div className="h-full w-full flex items-center justify-center">
          <ShieldOff className="mx-4" />
          {t("error.authentication-failed")}
        </div>
      </ThemeProvider>
    );
  }

  if (!me) {
    return (
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <div className="h-full w-full flex items-center justify-center">
          <KeyRound className="mx-4" />
          {t("message.authenticating")}
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <SettingsContext.Provider
        value={{ settings, setSettings, refreshSettings: getSettings }}
      >
        <CountriesContext.Provider value={{ countries, refreshCountries }}>
          <UsersContext.Provider value={{ users, setUsers }}>
            <UsersSearchResultsContext.Provider
              value={{ usersSearchResults, setUsersSearchResults }}
            >
              <ScopesContext.Provider value={{ scopes, refreshScopes }}>
                <SubscriptionTiersContext.Provider
                  value={{ subscriptionTiers, refreshSubscriptionTiers }}
                >
                  <MeContext.Provider value={{ me, setMe }}>
                    <EditableFieldsContext.Provider
                      value={{
                        editableFields,
                        setEditableFields,
                        refreshEditableFields,
                      }}
                    >
                      <RolesContext.Provider value={{ roles, refreshRoles }}>
                        <div className="flex flex-col-reverse md:flex-row h-full w-full">
                          <SideBar />
                          <Page>
                            <Switch>
                              <Route path="/">
                                <PageTitle
                                  title={t("heading.users")}
                                  icon={<FaUsers className="h-6 w-6" />}
                                />
                                <UserList />
                              </Route>
                              <Route path="/users">
                                <PageTitle
                                  title={t("heading.users")}
                                  icon={<FaUsers className="h-6 w-6" />}
                                />
                                <UserList />
                              </Route>
                              <Route path="/users/:id">
                                <PageTitle
                                  title={t("heading.users")}
                                  icon={<FaUsers className="h-6 w-6" />}
                                />
                                <UserList />
                              </Route>
                              <Route path="/applications">
                                <PageTitle
                                  title={t("heading.applications")}
                                  icon={<BsFillBoxFill className="h-6 w-6" />}
                                />
                                <ApplicationList />
                              </Route>
                              <Route path="/roles">
                                <PageTitle
                                  title={t("heading.roles-and-permissions")}
                                  icon={
                                    <BsFillShieldLockFill className="h-6 w-6" />
                                  }
                                />
                                <RoleList />
                              </Route>
                            </Switch>
                            <Route path="/users/:id" component={UserEditor} />
                          </Page>
                          <Toaster position="bottom-center" closeButton />
                        </div>
                      </RolesContext.Provider>
                    </EditableFieldsContext.Provider>
                  </MeContext.Provider>
                </SubscriptionTiersContext.Provider>
              </ScopesContext.Provider>
            </UsersSearchResultsContext.Provider>
          </UsersContext.Provider>
        </CountriesContext.Provider>
      </SettingsContext.Provider>
    </ThemeProvider>
  );
}

export default App;
