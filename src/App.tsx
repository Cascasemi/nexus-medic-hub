
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";

import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import ManualControl from "@/pages/ManualControl";
import Patients from "@/pages/Patients";
import Folders from "@/pages/Folders";
import Responses from "@/pages/Responses";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/dashboard" element={
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              } />
              <Route path="/manual-control" element={
                <DashboardLayout>
                  <ManualControl />
                </DashboardLayout>
              } />
              <Route path="/patients" element={
                <DashboardLayout>
                  <Patients />
                </DashboardLayout>
              } />
              <Route path="/folders" element={
                <DashboardLayout>
                  <Folders />
                </DashboardLayout>
              } />
              <Route path="/responses" element={
                <DashboardLayout>
                  <Responses />
                </DashboardLayout>
              } />
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" />} />
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
