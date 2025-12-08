import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getImageUrl = (path?: string) => {
  if (!path) return undefined;
  // If path is already a full URL, return it
  if (path.startsWith('http')) return path;

  // Clean the path
  const cleanPath = path.replace(/^public\//, '').replace(/^\//, '');

  // Use environment variable (Gateway) as the primary source
  // The gateway is now configured to proxy /public to the user service
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000';

  return `${baseUrl}/public/${cleanPath}`;
}
