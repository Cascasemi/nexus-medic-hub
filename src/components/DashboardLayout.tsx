
import { ReactNode, useState, useEffect } from "react";
import { SidebarNav } from "@/components/SidebarNav";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { ActivitySquare } from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { isAuthenticated, loading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-medical-100">
        <div className="animate-pulse text-medical-500 flex flex-col items-center">
          <ActivitySquare size={40} />
          <p className="mt-4 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex min-h-screen">
      <SidebarNav onCollapseChange={setSidebarCollapsed} />
      <div 
        className={`flex-1 overflow-y-auto ${sidebarCollapsed ? 'sidebar-fixed-layout-collapsed' : 'sidebar-fixed-layout'}`}
      >
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
