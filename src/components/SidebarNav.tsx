
import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { ActivitySquare, ChevronLeft, ChevronRight, FolderOpen, LogOut, Settings, UserRound, MessageSquare } from "lucide-react";

interface SidebarItemProps {
  icon: React.ReactNode;
  title: string;
  to: string;
  isCollapsed: boolean;
}

const SidebarItem = ({ icon, title, to, isCollapsed }: SidebarItemProps) => {
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => cn(
        "flex items-center py-3 px-3 rounded-md transition-all",
        isCollapsed ? "justify-center px-2" : "justify-start px-4",
        isActive 
          ? "bg-sidebar-accent text-sidebar-accent-foreground" 
          : "text-sidebar-foreground hover:bg-sidebar-accent/50"
      )}
    >
      <div className="mr-2 text-lg">{icon}</div>
      {!isCollapsed && <span className="font-medium">{title}</span>}
    </NavLink>
  );
};

interface SidebarNavProps {
  onCollapseChange?: (collapsed: boolean) => void;
}

export const SidebarNav = ({ onCollapseChange }: SidebarNavProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const { currentUser, logout } = useAuth();

  // Notify parent component when sidebar collapse state changes
  useEffect(() => {
    if (onCollapseChange) {
      onCollapseChange(collapsed);
    }
  }, [collapsed, onCollapseChange]);

  return (
    <div 
      className={cn(
        "h-screen bg-sidebar flex flex-col transition-all duration-300 border-r border-sidebar-border fixed left-0 top-0 z-10", 
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center p-4 border-b border-sidebar-border">
        <ActivitySquare className="text-white mr-2" size={collapsed ? 24 : 28} />
        {!collapsed && <span className="text-white font-semibold text-xl">Nexus Medic</span>}
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-3">
        <nav className="space-y-2">
          <SidebarItem 
            icon={<Settings />} 
            title="Manual Control" 
            to="/dashboard" 
            isCollapsed={collapsed} 
          />
          <SidebarItem 
            icon={<UserRound />} 
            title="Patients Details" 
            to="/patients" 
            isCollapsed={collapsed} 
          />
          <SidebarItem 
            icon={<FolderOpen />} 
            title="Patient Folders" 
            to="/folders" 
            isCollapsed={collapsed} 
          />
          <SidebarItem 
            icon={<MessageSquare />} 
            title="Response" 
            to="/responses" 
            isCollapsed={collapsed} 
          />
        </nav>
      </div>
      
      <div className="border-t border-sidebar-border p-4">
        <div className={cn(
          "flex items-center", 
          collapsed ? "justify-center" : "justify-between"
        )}>
          {!collapsed && (
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center text-white font-medium">
                {currentUser?.name.charAt(0)}
              </div>
              <div className="ml-2">
                <p className="text-sm font-medium text-white truncate max-w-[120px]">
                  {currentUser?.name}
                </p>
              </div>
            </div>
          )}
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={() => logout()}
          >
            <LogOut size={20} />
          </Button>
        </div>
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-10 h-6 w-6 rounded-full bg-medical-500 text-white hover:bg-medical-600 border border-white"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </Button>
    </div>
  );
};
