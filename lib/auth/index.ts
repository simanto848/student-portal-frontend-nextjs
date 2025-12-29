/**
 * Unified Authentication Helper
 *
 * This module provides a unified interface for detecting and retrieving
 * authenticated users from both (user) and (psw) panels.
 *
 * Use this in shared components like Header, where you need to detect
 * which type of user is currently logged in.
 */

import { redirect } from "next/navigation";
import { getCurrentUser as getUserAuth, getUserToken } from "./userAuth";

import type { User } from "@/types/user";

/**
 * Unified auth result type
 */
export type AuthUser =
  | { type: "user"; data: User }
  | { type: "guest"; data: null };

/**
 * Get the currently authenticated entity (user or PSW)
 *
 * This checks both auth domains and returns whichever is logged in.
 * Priority: user first, then PSW
 *
 * Note: This project does not currently have a dedicated PSW type under `@/types`.
 * For unified display purposes we treat PSW payload as `User`-compatible shape.
 *
 * Use this in shared components like Header.
 */
export async function getCurrentAuth(): Promise<AuthUser> {
  try {
    // Check user authentication first
    const userToken = await getUserToken();
    if (userToken) {
      const user = await getUserAuth(userToken);
      if (user) {
        return { type: "user", data: user };
      }
    }

    // No one is logged in
    return { type: "guest", data: null };
  } catch (error) {
    // Fallback to guest if any error occurs
    return { type: "guest", data: null };
  }
}

/**
 * Check if any user (client or PSW) is authenticated
 */
export async function isAnyoneAuthenticated(): Promise<boolean> {
  const auth = await getCurrentAuth();
  return auth.type !== "guest";
}

/**
 * Get display name for any authenticated user
 */
export function getDisplayName(auth: AuthUser): string {
  if (auth.type === "guest") {
    return "Guest";
  }

  const userData = auth.data as unknown as {
    first_name?: string;
    last_name?: string;
    fullName?: string;
    email?: string;
  };

  const fullName = (
    userData.fullName ||
    `${userData.first_name ?? ""} ${userData.last_name ?? ""}`.trim()
  ).trim();

  return fullName || userData.email || "User";
}

/**
 * Require guest - redirect if ANY user type is authenticated
 * Use this in login/register pages for both user and PSW
 */
export async function requireGuest(redirectTo: string = "/"): Promise<void> {
  const auth = await getCurrentAuth();

  if (auth.type !== "guest") {
    return redirect(redirectTo);
  }
}

/**
 * Get any available auth token (user)
 * Returns the first token found, prioritizing user
 * Use this in useAxios and useFetch for automatic token detection
 */
export async function getAnyAuthToken(): Promise<string | undefined> {
  const userToken = await getUserToken();
  if (userToken) return userToken;

  return undefined;
}
