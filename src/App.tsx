
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import { Agents } from "./pages/Agents";
import { AgentUpdate } from "./pages/AgentUpdate";
import Conversations from "./pages/Conversations";
import Telephony from "./pages/Telephony";
import { Sidebar } from "./components/Sidebar";

// Layout component for pages with sidebar
const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="hidden md:block w-64 border-r bg-white/80 backdrop-blur-sm">
        <Sidebar />
      </div>
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
};

// Wrapper to apply layout conditionally based on route
const AppContent = () => {
  const location = useLocation();
  
  // Only apply dashboard layout to internal pages
  const shouldUseLayout = !location.pathname.match(/^\/$/);
  
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/dashboard" element={
        <DashboardLayout>
          <Dashboard />
        </DashboardLayout>
      } />
      <Route path="/agents" element={
        <DashboardLayout>
          <Agents />
        </DashboardLayout>
      } />

      <Route path="/agents/:id" element={
        <DashboardLayout>
          <AgentUpdate />
        </DashboardLayout>
      } />
      
      <Route path="/conversations" element={
        <DashboardLayout>
          <Conversations />
        </DashboardLayout>
      } />
      
      <Route path="/telephony" element={
        <DashboardLayout>
          <Telephony />
        </DashboardLayout>
      } />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
