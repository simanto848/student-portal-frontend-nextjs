"use server";

import { revalidateTag } from "next/cache";

/**
 * Revalidate the "current user" caches (both user + PSW).
 *
 * Note: In a `"use server"` module, you may only export async functions.
 * Keep any constants/types local to this file.
 */
export async function revalidateCurrentUser(): Promise<void> {
  revalidateTag("current-user", "default");
  revalidateTag("current-psw", "default");
}
