"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  User,
  UserRole,
  LoginCredentials,
  LoginResponse,
  ADMIN_ROLES,
  STAFF_ROLE_ROUTES,
  getDashboardPath,
} from "@/types/user";
import { api } from "@/lib/api";
import { AUTH_CONFIG } from "@/config/constants";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials, role: UserRole) => Promise<void | { twoFactorRequired: boolean; tempToken: string }>;
  verify2FA: (tempToken: string, otp: string) => Promise<void>;
  resend2FA: (tempToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  getDashboardRoute: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Role-based login endpoints
const getLoginEndpoint = (role: UserRole): string => {
  const endpoints: Record<string, string> = {
    student: "/user/auth/students/login",
    teacher: "/user/auth/teachers/login",
    staff: "/user/auth/staffs/login",
    admin: "/user/auth/admins/login",
  };

  if (ADMIN_ROLES.includes(role)) {
    return endpoints.admin;
  }
  if (STAFF_ROLE_ROUTES[role]) {
    return endpoints.staff;
  }

  return endpoints[role] || endpoints.student;
};

const getRedirectPath = (role: UserRole, requestedRole?: UserRole): string => {
  // Normalize role to handle potential hyphen vs underscore mismatches
  const normalizedRole = role.toString().replace(/-/g, '_');

  if (requestedRole === "staff" && (STAFF_ROLE_ROUTES[role] || STAFF_ROLE_ROUTES[normalizedRole])) {
    return STAFF_ROLE_ROUTES[role] || STAFF_ROLE_ROUTES[normalizedRole];
  }

  // Try to find route with normalized role if direct lookup fails
  if (STAFF_ROLE_ROUTES[normalizedRole]) {
    return STAFF_ROLE_ROUTES[normalizedRole];
  }

  // Fallback: Hardcoded checks for specific roles that might be failing lookup
  if (normalizedRole === 'exam_controller') {
    return '/dashboard/staff/exam-controller';
  }

  return getDashboardPath(role);
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      if (typeof window === "undefined") {
        setIsLoading(false);
        return;
      }

      const token = localStorage.getItem(AUTH_CONFIG.ACCESS_TOKEN_KEY);

      if (token) {
        // Sync token to cookie if missing (for server-side components)
        const isSecure = window.location.protocol === "https:";
        const maxAge = AUTH_CONFIG.TOKEN_EXPIRY_DAYS * 24 * 60 * 60;
        document.cookie = `${AUTH_CONFIG.TOKEN_COOKIE_NAME}=${token}; path=/; max-age=${maxAge}; SameSite=Lax${isSecure ? "; Secure" : ""}`;

        try {
          const response = await api.get("/user/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const userData = response.data?.data?.user;

          if (userData) {
            const normalizedUser = {
              ...userData,
              role: (userData.role as string).toLowerCase() as UserRole
            };
            setUser(normalizedUser);
            setIsAuthenticated(true);
            localStorage.setItem(
              AUTH_CONFIG.USER_STORAGE_KEY,
              JSON.stringify(normalizedUser),
            );
          }
        } catch (error) {
          console.error("Session verification failed:", error);
          clearAuthData();
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const clearAuthData = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);

    if (typeof window !== "undefined") {
      localStorage.removeItem(AUTH_CONFIG.USER_STORAGE_KEY);
      localStorage.removeItem(AUTH_CONFIG.ACCESS_TOKEN_KEY);
      localStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);

      const isSecure = window.location.protocol === "https:";
      document.cookie = `${AUTH_CONFIG.TOKEN_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax${isSecure ? "; Secure" : ""}`;
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem(AUTH_CONFIG.ACCESS_TOKEN_KEY);
    if (!token) return;

    try {
      const response = await api.get("/user/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = response.data?.data?.user;

      if (userData) {
        const normalizedUser = {
          ...userData,
          role: (userData.role as string).toLowerCase() as UserRole
        };
        setUser(normalizedUser);
        setIsAuthenticated(true);
        localStorage.setItem(
          AUTH_CONFIG.USER_STORAGE_KEY,
          JSON.stringify(normalizedUser),
        );
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials, role: UserRole) => {
      setIsLoading(true);

      try {
        const endpoint = getLoginEndpoint(role);
        const response = await api.post(endpoint, credentials);
        const data: LoginResponse = response.data?.data;

        if (data.twoFactorRequired && data.tempToken) {
          return { twoFactorRequired: true, tempToken: data.tempToken };
        }

        if (!data || !data.user || !data.accessToken || !data.refreshToken) {
          throw new Error("Invalid login response");
        }

        const userRole = (data.user.role || role).toLowerCase() as UserRole;
        const normalizedUser = {
          ...data.user,
          role: userRole
        };

        setUser(normalizedUser);
        setIsAuthenticated(true);

        localStorage.setItem(
          AUTH_CONFIG.USER_STORAGE_KEY,
          JSON.stringify(normalizedUser),
        );
        localStorage.setItem(AUTH_CONFIG.ACCESS_TOKEN_KEY, data.accessToken);
        localStorage.setItem(AUTH_CONFIG.REFRESH_TOKEN_KEY, data.refreshToken);

        const maxAge = AUTH_CONFIG.TOKEN_EXPIRY_DAYS * 24 * 60 * 60;
        const isSecure = window.location.protocol === "https:";
        document.cookie = `${AUTH_CONFIG.TOKEN_COOKIE_NAME}=${data.accessToken}; path=/; max-age=${maxAge}; SameSite=Lax${isSecure ? "; Secure" : ""}`;

        // Explicitly handle exam_controller role variations if necessary, though standard flow should catch it via STAFF_ROLE_ROUTES
        // We trust the backend returning the correct role enum value (with underscore)

        console.log("LOGIN DEBUG:", {
          receivedUserRole: data.user.role,
          computedUserRole: userRole,
          requestedRole: role,
          mappedRoute: STAFF_ROLE_ROUTES[userRole],
          allStaffRoutes: STAFF_ROLE_ROUTES
        });

        const redirectPath = getRedirectPath(userRole, role);
        router.push(redirectPath);
      } catch (error) {
        console.error("Login failed:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [router],
  );

  const resend2FA = useCallback(async (tempToken: string) => {
    try {
      await api.post("/user/auth/resend-2fa", { tempToken });
    } catch (error) {
      console.error("Resend 2FA failed", error);
      throw error;
    }
  }, []);

  const verify2FA = useCallback(
    async (tempToken: string, otp: string) => {
      setIsLoading(true);
      try {
        const response = await api.post("/user/auth/verify-2fa", {
          tempToken,
          otp
        });
        const data: LoginResponse = response.data?.data;

        if (!data || !data.user || !data.accessToken || !data.refreshToken) {
          throw new Error("Invalid 2FA verification response");
        }

        const userRole = (data.user.role || "student").toLowerCase() as UserRole;
        const normalizedUser = {
          ...data.user,
          role: userRole
        };

        setUser(normalizedUser);
        setIsAuthenticated(true);

        localStorage.setItem(
          AUTH_CONFIG.USER_STORAGE_KEY,
          JSON.stringify(normalizedUser),
        );
        localStorage.setItem(AUTH_CONFIG.ACCESS_TOKEN_KEY, data.accessToken);
        localStorage.setItem(AUTH_CONFIG.REFRESH_TOKEN_KEY, data.refreshToken);

        const maxAge = AUTH_CONFIG.TOKEN_EXPIRY_DAYS * 24 * 60 * 60;
        const isSecure = window.location.protocol === "https:";
        document.cookie = `${AUTH_CONFIG.TOKEN_COOKIE_NAME}=${data.accessToken}; path=/; max-age=${maxAge}; SameSite=Lax${isSecure ? "; Secure" : ""}`;

        const redirectPath = getRedirectPath(userRole);
        router.push(redirectPath);

      } catch (error) {
        console.error("2FA Verification failed", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const logout = useCallback(async () => {
    setIsLoading(true);

    try {
      await api.post("/user/auth/logout").catch(() => {
        // Ignore logout API errors
      });
    } finally {
      clearAuthData();
      router.push("/login");
      setIsLoading(false);
    }
  }, [router, clearAuthData]);

  const hasRole = useCallback(
    (role: UserRole | UserRole[]): boolean => {
      if (!user) return false;

      const roles = Array.isArray(role) ? role : [role];
      return roles.includes(user.role);
    },
    [user],
  );

  const getDashboardRoute = useCallback((): string => {
    if (!user) return "/login";
    return getRedirectPath(user.role);
  }, [user]);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    verify2FA,
    resend2FA,
    logout,
    refreshUser,
    hasRole,
    getDashboardRoute,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

export type { AuthContextType };
