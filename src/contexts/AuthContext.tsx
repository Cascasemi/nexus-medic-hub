
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface Doctor {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface AuthContextType {
  currentUser: Doctor | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is already logged in from localStorage
  useEffect(() => {
    const user = localStorage.getItem("medic_user");
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
    setLoading(false);
  }, []);

  // Mock login function - in a real app, this would connect to an API
  const login = async (email: string, password: string) => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Simple validation - in a real app, this would verify credentials with backend
    if (email === "doctor@example.com" && password === "password") {
      const user = {
        id: "d-1",
        name: "Dr. Jane Smith",
        email: "doctor@example.com",
        role: "Senior Physician",
        avatar: "/doctor-avatar.jpg"
      };
      
      setCurrentUser(user);
      localStorage.setItem("medic_user", JSON.stringify(user));
      navigate("/dashboard");
    } else {
      throw new Error("Invalid email or password");
    }
    
    setLoading(false);
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("medic_user");
    navigate("/");
  };

  const value = {
    currentUser,
    loading,
    login,
    logout,
    isAuthenticated: !!currentUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
