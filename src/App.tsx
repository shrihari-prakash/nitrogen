import { ThemeProvider } from "@/components/theme-provider";
import SideBar from "./components/ui/sidebar";
import Page from "./components/ui/page";
import UserList from "./components/features/user-list/user-list";
import { Route, Switch } from "wouter";
import UserDetails from "./components/features/user-details/user-details";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
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
    </ThemeProvider>
  );
}

export default App;
