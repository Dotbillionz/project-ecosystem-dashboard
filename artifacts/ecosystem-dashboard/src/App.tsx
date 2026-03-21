import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Dashboard } from "@/pages/Dashboard";
import { SpotXPanel } from "@/pages/SpotXPanel";
import { UserDashboard } from "@/pages/UserDashboard";
import { LoginPage } from "@/pages/LoginPage";
import { useAuth } from "@workspace/replit-auth-web";

const queryClient = new QueryClient();

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050a10] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-white/30 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <LoginPage />;
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <AuthGate><Dashboard /></AuthGate>} />
      <Route path="/spotx" component={() => <AuthGate><SpotXPanel /></AuthGate>} />
      <Route path="/dashboard" component={() => <AuthGate><UserDashboard /></AuthGate>} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
