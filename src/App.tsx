import { ThemeProvider } from "@/components/theme-provider";
import SideBar from "./components/ui/sidebar";
import Page from "./components/ui/page";
import UserList from "./components/features/user-list/user-list";
import { Route, Switch } from "wouter";
import UserDetails from "./components/features/user-details/user-details";
import { useEffect, useState } from "react";
import oauthManager from "./service/oauth-manager";
import axiosInstance from "./service/axios";

import EditableFieldsContext from "./context/editable-fields-context";
import UsersContext, {
  UsersSearchResultsContext,
} from "./context/users-context";
import RolesContext from "./context/roles-context";
import SettingsContext from "./context/settings-context";
import MeContext from "./context/me-context";
import { KeyRound, ShieldOff } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import ScopesContext from "./context/scopes-context";
import { Scope } from "./components/ui/scope-selector";
import ApplicationList from "./components/features/application-list/application-list";

let scopesFetchInProgess = false;
let roleFetchInProgess = false;
let settingsFetchInProgess = false;
let editableFieldsFetchInProgess = false;

function App() {
  const [authError, setAuthError] = useState(false);
  const [scopes, setScopes] = useState<any>(null);
  const [me, setMe] = useState(null);
  const [editableFields, setEditableFields] = useState(null);
  const [roles, setRoles] = useState(null);
  const [settings, setSettings] = useState(null);
  const [users, setUsers] = useState([]);
  const [usersSearchResults, setUsersSearchResults] = useState(null);

  const getSettings = () => {
    if (settingsFetchInProgess) return;
    settingsFetchInProgess = true;
    axiosInstance
      .get("/system/settings")
      .then((response: any) => setSettings(response.data.data.settings))
      .finally(() => (settingsFetchInProgess = false));
  };

  const refreshRoles = async () => {
    if (roleFetchInProgess) return;
    roleFetchInProgess = true;
    axiosInstance
      .get("/user/admin-api/roles")
      .then((response: any) => setRoles(response.data.data.roles))
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
          Authentication Error
        </div>
      </ThemeProvider>
    );
  }

  if (!me) {
    return (
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <div className="h-full w-full flex items-center justify-center">
          <KeyRound className="mx-4" />
          Authenticating...
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <SettingsContext.Provider
        value={{ settings, setSettings, refreshSettings: getSettings }}
      >
        <UsersContext.Provider value={{ users, setUsers }}>
          <UsersSearchResultsContext.Provider
            value={{ usersSearchResults, setUsersSearchResults }}
          >
            <ScopesContext.Provider value={{ scopes, refreshScopes }}>
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
                            <UserList />
                          </Route>
                          <Route path="/users">
                            <UserList />
                          </Route>
                          <Route path="/users/:id">
                            <UserList />
                          </Route>
                          <Route path="/applications">
                            <ApplicationList />
                          </Route>
                          <Route path="/applications/:id">
                            <ApplicationList />
                          </Route>
                        </Switch>
                        <Route path="/users/:id" component={UserDetails} />
                      </Page>
                      <ToastContainer
                        position={toast.POSITION.BOTTOM_CENTER}
                        toastStyle={{
                          backgroundColor: "hsl(240 10% 3.9%)",
                          color: "#ffffff",
                          boxShadow: "none",
                          border: "1px solid #2a2a2a",
                        }}
                        closeButton={false}
                        autoClose={2500}
                        hideProgressBar
                      />
                    </div>
                  </RolesContext.Provider>
                </EditableFieldsContext.Provider>
              </MeContext.Provider>
            </ScopesContext.Provider>
          </UsersSearchResultsContext.Provider>
        </UsersContext.Provider>
      </SettingsContext.Provider>
    </ThemeProvider>
  );
}

export default App;
