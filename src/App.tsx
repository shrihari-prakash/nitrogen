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
import UsersContext from "./context/users-context";
import RolesContext from "./context/roles-context";
import SettingsContext from "./context/settings-context";
import MeContext from "./context/me-context";
import { KeyRound, ShieldOff } from "lucide-react";

let roleFetchInProgess = false;
let settingsFetchInProgess = false;
let editableFieldsFetchInProgess = false;

function App() {
  const [authError, setAuthError] = useState(false);
  const [me, setMe] = useState(null);
  const [editableFields, setEditableFields] = useState(null);
  const [roles, setRoles] = useState(null);
  const [settings, setSettings] = useState(null);
  const [users, setUsers] = useState(null);

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
                      <Route path="/applications">Applications</Route>
                    </Switch>
                    <Route path="/users/:id" component={UserDetails} />
                  </Page>
                </div>
              </RolesContext.Provider>
            </EditableFieldsContext.Provider>
          </MeContext.Provider>
        </UsersContext.Provider>
      </SettingsContext.Provider>
    </ThemeProvider>
  );
}

export default App;
