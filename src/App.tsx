import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { AuthPage } from "@/components/auth/AuthPage";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import RiskDetail from "./pages/RiskDetail";
import UserManagement from "./pages/UserManagement";
import Help from "./pages/Help";
import SeedData from "./pages/SeedData";
import { Loader2 } from "lucide-react";
import { GlobalFilterProvider } from "@/context/GlobalFilterContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, loading } = useAuth();
  
  console.log('AppContent rendering - user:', user, 'loading:', loading);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/risco/:id" element={<RiskDetail />} />
      <Route path="/usuarios" element={<UserManagement />} />
      <Route path="/ajuda" element={<Help />} />
      <Route path="/seed-data" element={<SeedData />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <AuthProvider>
            <GlobalFilterProvider>
              <Toaster />
              <Sonner />
              <AppContent />
            </GlobalFilterProvider>
          </AuthProvider>
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
