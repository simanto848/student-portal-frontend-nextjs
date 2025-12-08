import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getImageUrl = (path?: string) => {
  if (!path) return undefined;
  if (path.startsWith("http")) return path;

  const cleanPath = path.replace(/^public\//, "").replace(/^\//, "");
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
    "http://localhost:8000";

  return `${baseUrl}/public/${cleanPath}`;
};
