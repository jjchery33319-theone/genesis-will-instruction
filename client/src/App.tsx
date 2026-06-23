import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import WillForm from "./pages/WillForm";
import AdminDashboard from "./pages/AdminDashboard";
import SubmissionDetail from "./pages/SubmissionDetail";
import SubmissionSuccess from "./pages/SubmissionSuccess";
import AdminGuard from "./components/AdminGuard";
import WillPreview from "./pages/WillPreview";
import AdminSubmissionEditor from "./pages/AdminSubmissionEditor";
import LpaManager from "./pages/LpaManager";
import WillDraftingV2 from "./pages/WillDraftingV2";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={WillForm} />
      <Route path={"/form"} component={WillForm} />
      <Route path={"/admin"}>
        <AdminGuard><AdminDashboard /></AdminGuard>
      </Route>
      <Route path={"/admin/submission/:id"}>
        <AdminGuard><SubmissionDetail /></AdminGuard>
      </Route>
      <Route path={"/admin/submission/:id/will-preview"}>
        <AdminGuard><WillPreview /></AdminGuard>
      </Route>
      <Route path={"/admin/submission/:id/edit"}>
        <AdminGuard><AdminSubmissionEditor /></AdminGuard>
      </Route>
      <Route path={"/admin/submission/:id/lpa"}>
        <AdminGuard><LpaManager /></AdminGuard>
      </Route>
      <Route path={"/admin/wills"}>
        <AdminGuard><WillDraftingV2 /></AdminGuard>
      </Route>
      <Route path={"/success/:ref"} component={SubmissionSuccess} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster richColors position="top-right" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
