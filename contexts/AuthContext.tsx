"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authService, UserRole, LoginResponse } from "../services/auth.service";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: any, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("accessToken");

      if (token) {
        try {
          const user = await authService.getCurrentUser(token);
          setUser(user);
          setIsAuthenticated(true);
          localStorage.setItem("user", JSON.stringify(user));
        } catch (error) {
          console.error("Session verification failed:", error);
          localStorage.removeItem("user");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: any, role: UserRole) => {
    setIsLoading(true);
    try {
      const data: LoginResponse = await authService.login(credentials, role);
      setUser(data.user);
      setIsAuthenticated(true);

      // Store session data
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      // Set cookie for middleware
      document.cookie = `accessToken=${data.accessToken}; path=/; max-age=${
        7 * 24 * 60 * 60
      }; SameSite=Lax; Secure`;

      // Get the actual user role from response
      const userRole = data.user?.role || role;

      // Redirect based on role
      let redirectPath = `/dashboard/${role}`;

      // Handle admin roles
      if (["super_admin", "moderator", "admin"].includes(userRole)) {
        redirectPath = "/dashboard/admin";
      }
      // Handle staff roles - redirect to specific staff dashboard based on their role
      else if (role === "staff") {
        const staffRoleRoutes: Record<string, string> = {
          program_controller: "/dashboard/staff/program-controller",
          admission: "/dashboard/staff/admission",
          exam: "/dashboard/staff/exam",
          finance: "/dashboard/staff/finance",
          library: "/dashboard/staff/library",
          transport: "/dashboard/staff/transport",
          hr: "/dashboard/staff/hr",
          it: "/dashboard/staff/it",
          hostel: "/dashboard/staff/hostel",
          hostel_warden: "/dashboard/staff/hostel-warden",
          hostel_supervisor: "/dashboard/staff/hostel-supervisor",
          maintenance: "/dashboard/staff/maintenance",
        };
        redirectPath = staffRoleRoutes[userRole] || "/dashboard/staff";
      }

      router.push(redirectPath);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      // Clear cookie
      document.cookie = "accessToken=; path=/; max-age=0; SameSite=Lax; Secure";

      router.push("/login");
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
