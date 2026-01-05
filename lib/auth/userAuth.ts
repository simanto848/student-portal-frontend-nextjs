/**
 * User Authentication Module
 *
 * Handles all authentication logic for the (user) panel:
 * - Token management (read from cookies)
 * - User validation and retrieval
 * - Authorization checks
 * - Logout functionality
 * - Request-level caching to avoid duplicate API calls
 *
 * This file is designed to be server-side only.
 * Uses the existing useAxios() helper for all API calls.
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAxios } from "@/lib/useAxios";
import type { User, UserRole } from "@/types/user";
import type { ApiResponse } from "@/types/api";

// ============================================================================
// TOKEN MANAGEMENT
// ============================================================================

const USER_TOKEN_COOKIE_NAME = "accessToken";

/**
 * Get the user authentication token from cookies
 * Returns undefined if no token exists (no API call made)
 */
export async function getUserToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(USER_TOKEN_COOKIE_NAME)?.value;
}

/**
 * Set user authentication token in cookie
 */
export async function setUserToken(
  token: string,
  maxAge: number = 60 * 60 * 24 * 7, // 7 days default
): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(USER_TOKEN_COOKIE_NAME, token, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge,
  });
}

/**
 * Remove user authentication token (used during logout)
 */
export async function clearUserToken(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(USER_TOKEN_COOKIE_NAME);
}

// ============================================================================
// USER VALIDATION & RETRIEVAL (with cross-request caching)
// ============================================================================

/**
 * Get the currently authenticated user
 *
 * Flow:
 * 1. Check if token exists in cookies (instant return null if missing)
 * 2. Call /user API endpoint with caching across requests
 * 3. Return user object or null
 *
 * This function is cached across requests with revalidation every 5 seconds.
 */
export const getCurrentUser = async (
  token: string | undefined,
): Promise<User | null> => {
  try {
    // Step 1: Check token existence (no API call if missing)
    if (!token) {
      return null;
    }

    // Step 2: Token exists, validate with backend
    const api = await getAxios(token);
    const response = (await api.get("/user/auth/me")) as ApiResponse<
      { user: User } | User
    >;

    // Unified data extraction logic similar to extractItemData in axios-instance
    if (response) {
      // If interceptor returned data directly or we have the full response object
      // Case 1: response is the full ApiResponse structure
      if ('success' in response && response.success && response.data) {
        const innerData = response.data;
        if (innerData && typeof innerData === 'object' && 'data' in innerData) {
          const payload = (innerData as any).data;
          if (payload && typeof payload === 'object' && 'user' in payload) {
            return payload.user;
          }
          return payload as User;
        }
        // Case 2: data is directly the user or { user: User }
        if (innerData && typeof innerData === 'object' && 'user' in innerData) {
          return (innerData as any).user;
        }
        return innerData as User;
      }

      // Case 3: response itself is the payload (interceptor behavior sometimes)
      if (response && typeof response === 'object' && 'user' in response) {
        return (response as any).user;
      }
      return response as unknown as User;
    }

    return null;
  } catch (error: unknown) {
    // Token is invalid or API error occurred
    // Don't clear token here - let logout handle it
    return null;
  }
};

export async function requireUser(
  redirectTo: string = "/login",
  allowedRoles?: UserRole[],
): Promise<User> {
  const token = await getUserToken();
  const user = await getCurrentUser(token);

  if (!user) {
    return redirect(redirectTo);
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return redirect("/dashboard"); // Or wherever unauthorized users go
  }

  return user;
}

/**
 * Require guest user (not authenticated) or redirect to home
 * Use this in pages like login/register that should not be accessed by logged-in users
 */
export async function requireGuest(redirectTo: string = "/"): Promise<void> {
  const isAuthenticate = await isUserAuthenticated();
  if (isAuthenticate) {
    const token = await getUserToken();
    const user = await getCurrentUser(token);
    if (user) {
      redirect(redirectTo);
    }
  }
}

/**
 * Check if user is authenticated (returns boolean)
 * Lightweight check without fetching full user data
 */
export async function isUserAuthenticated(): Promise<boolean> {
  const token = await getUserToken();
  return !!token;
}

// ============================================================================
// LOGOUT
// ============================================================================

/**
 * Logout user - calls backend API and clears token
 */
export async function logoutUser(): Promise<{
  success: boolean;
  message?: string;
}> {
  try {
    const token = await getUserToken();
    if (!token) {
      return { success: true, message: "Already logged out" };
    }

    // Call logout API
    const api = await getAxios();
    await api.post("/user/auth/logout");

    // Clear token regardless of API response
    await clearUserToken();

    return { success: true, message: "Logged out successfully" };
  } catch (_error: unknown) {
    // Clear token even if API fails
    await clearUserToken();

    return {
      success: false,
      message: "Logout failed but token cleared",
    };
  }
}

// ============================================================================
// OPTIONAL: Basic JWT decode (no verification, just reading payload)
// ============================================================================

/**
 * Decode JWT token payload (NO verification - just reading claims)
 * Useful for checking expiry before making API call
 *
 * WARNING: This does NOT verify the signature. Only use for optimization.
 */
export function decodeUserToken(token: string): unknown | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const decoded = Buffer.from(payload, "base64").toString("utf-8");
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/**
 * Check if token is expired (client-side check, not authoritative)
 */
export function isUserTokenExpired(token: string): boolean {
  const decoded = decodeUserToken(token) as { exp?: number } | null;
  if (!decoded || typeof decoded.exp !== "number") return true;

  const now = Math.floor(Date.now() / 1000);
  return decoded.exp < now;
}
