import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AppLayout from "./components/layout/AppLayout";
import Alteracoes from "@/pages/Alteracoes";
import LoginPage from "@/pages/Login";
import { getCurrentUser } from "@/lib/auth";

const queryClient = new QueryClient();

const App = () => {
  const user = getCurrentUser();
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster />
        <Sonner />
        <Routes>
          {!user ? (
            <Route path="*" element={<LoginPage />} />
          ) : (
            <Route element={<AppLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/alteracoes" element={<Alteracoes />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          )}
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;