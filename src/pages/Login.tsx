import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ActivitySquare, Eye, EyeOff } from "lucide-react";
import api from "@/utils/axiosConfig";

const Login = () => {
  const [email, setEmail] = useState("doctor@example.com");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Validate inputs
      if (!email || !password) {
        throw new Error("Please fill in all fields");
      }

      if (!email.includes("@")) {
        throw new Error("Please enter a valid email address");
      }

      // Call login function from AuthContext
      const response = await login(email, password);
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${response.user?.name || 'User'}!`,
      });
      
      // Redirect based on user role
      const redirectPath = getDashboardPath(response.user?.role);
      navigate(redirectPath);
      
    } catch (error) {
      console.error("Login error:", error);
      
      // Handle specific error cases
      let errorMessage = "Invalid email or password";
      
      if (error.response?.status === 401) {
        errorMessage = error.response.data?.error || "Invalid credentials";
      } else if (error.response?.status === 404) {
        errorMessage = "Staff member not found or inactive";
      } else if (error.response?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        variant: "destructive",
        title: "Login failed",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getDashboardPath = (role) => {
    switch (role) {
      case 'admin':
        return '/admin/dashboard';
      case 'doctor':
        return '/doctor/dashboard';
      case 'nurse':
        return '/nurse/dashboard';
      case 'pharmacist':
        return '/pharmacy/dashboard';
      default:
        return '/dashboard';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-medical-100">
      <div className="w-full max-w-md px-4">
        <Card className="border-medical-300 shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-2">
              <ActivitySquare size={40} className="text-medical-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-medical-700">
              Nexus Medic Hub
            </CardTitle>
            <CardDescription>
              Enter your credentials to access your dashboard
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="doctor@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.trim())}
                  disabled={isLoading}
                  className="focus:ring-medical-500 focus:border-medical-500"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    className="text-sm text-medical-500 hover:text-medical-600"
                    onClick={() => {
                      toast({
                        title: "Password Reset",
                        description: "Please contact your system administrator for password reset.",
                      });
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="focus:ring-medical-500 focus:border-medical-500 pr-10"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-medical-500 hover:bg-medical-600 disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Secure access for registered medical professionals only
            </p>
          </CardFooter>
        </Card>
        
        {/* Demo credentials - Remove in production */}
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>Demo credentials: doctor@example.com / password123</p>
          <p className="text-xs mt-1">
            Contact IT support if you need account access
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;