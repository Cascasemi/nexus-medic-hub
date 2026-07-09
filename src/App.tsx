import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoutes from "@/components/ProtectedRoutes";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import ManualControl from "@/pages/ManualControl";
import Patients from "@/pages/Patients";
import Folders from "@/pages/Folders";
import Responses from "@/pages/Responses";
import NotFound from "@/pages/NotFound";
import ManageStaff from "@/pages/ManageStaff";
import FolderView from "@/pages/FolderView";
import Test from "@/pages/Test";
import { FOLDER_ROLES, TEST_ROLES, DIAGNOSING_ROLES, ADMIN_ONLY } from "@/lib/roles";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />            <Routes>
              <Route path="/" element={<Login />} />
              <Route
                element={
                  <ProtectedRoutes>
                    <DashboardLayout>
                      <Outlet />
                    </DashboardLayout>
                  </ProtectedRoutes>
                }
              >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route
                  path="/manual-control"
                  element={
                    <ProtectedRoutes requiredRoles={DIAGNOSING_ROLES}>
                      <ManualControl />
                    </ProtectedRoutes>
                  }
                />
                <Route path="/patients" element={<Patients />} />
                <Route
                  path="/folders"
                  element={
                    <ProtectedRoutes requiredRoles={FOLDER_ROLES}>
                      <Folders />
                    </ProtectedRoutes>
                  }
                />
                <Route
                  path="/folders/:folder_id"
                  element={
                    <ProtectedRoutes requiredRoles={FOLDER_ROLES}>
                      <FolderView />
                    </ProtectedRoutes>
                  }
                />
                <Route
                  path="/tests"
                  element={
                    <ProtectedRoutes requiredRoles={TEST_ROLES}>
                      <Test />
                    </ProtectedRoutes>
                  }
                />
                <Route
                  path="/responses"
                  element={
                    <ProtectedRoutes requiredRoles={DIAGNOSING_ROLES}>
                      <Responses />
                    </ProtectedRoutes>
                  }
                />
                <Route
                  path="/manage-staff"
                  element={
                    <ProtectedRoutes requiredRoles={ADMIN_ONLY}>
                      <ManageStaff />
                    </ProtectedRoutes>
                  }
                />
              </Route>
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
