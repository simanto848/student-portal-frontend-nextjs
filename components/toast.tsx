import toast from "react-hot-toast";
import {
  CheckCircle2,
  Info,
  Loader2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { X } from "lucide-react";

const getPath = (obj: any, path: string) => {
  if (!obj || !path) return undefined;
  return path
    .split(".")
    .reduce((acc: any, key) => (acc == null ? undefined : acc[key]), obj);
};

export type ToastType = "success" | "error" | "info" | "warning" | "loading";

interface ToastOptions {
  id?: string;
  duration?: number;
  position?:
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";
}

const getToastIcon = (type: ToastType, toastId?: string) => {
  const iconClass = "text-current!";

  const closeButton = toastId ? (
    <button
      onClick={() => toast.dismiss(toastId)}
      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-current hover:opacity-80"
    >
      <X className="w-4 h-4" />
    </button>
  ) : null;

  const icon = (() => {
    switch (type) {
      case "success":
        return <CheckCircle2 className={`${iconClass}`} />;
      case "error":
        return <XCircle className={`${iconClass}`} />;
      case "info":
        return <Info className={`${iconClass}`} />;
      case "warning":
        return <AlertTriangle className={`${iconClass}`} />;
      case "loading":
        return <Loader2 className={`text-gray-500 animate-spin`} />;
      default:
        return null;
    }
  })();

  return (
    <div className="flex items-center">
      {icon}
      {closeButton}
    </div>
  );
};

const getToastStyle = (type: ToastType) => {
  const baseStyle =
    "relative pr-10! flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg";

  switch (type) {
    case "success":
      return `${baseStyle} bg-primary! text-white!`;
    case "error":
      return `${baseStyle} bg-error! text-white!`;
    case "info":
      return `${baseStyle} bg-info! text-white!`;
    case "warning":
      return `${baseStyle} bg-warning! text-white!`;
    case "loading":
      return `${baseStyle} bg-gray-50 text-gray-900 border border-gray-200`;
    default:
      return `${baseStyle} bg-white text-gray-900 border border-gray-200`;
  }
};

export const notify = (
  message: string,
  type: ToastType = "info",
  options?: ToastOptions
) => {
  const toastId = options?.id || toast.loading("", { duration: 0 }); // Create a toast ID for dismissal
  const icon = getToastIcon(type, toastId);
  const style = getToastStyle(type);

  const defaultOptions = {
    duration: options?.duration || 3000,
    position: options?.position || "top-right",
    style: {
      padding: 10,
      background: "transparent",
      boxShadow: "none",
    },
    className: style,
    icon,
  };

  switch (type) {
    case "success":
      return toast.success(message, { ...defaultOptions, id: toastId } as any);
    case "error":
      return toast.error(message, { ...defaultOptions, id: toastId } as any);
    case "loading":
      return toast.loading(message, { ...defaultOptions, id: toastId } as any);
    default:
      return toast(message, { ...defaultOptions, id: toastId } as any);
  }
};

export const notifyErrorResponse = (errorResponse: any) => {
  const message =
    getPath(errorResponse, "data.message") ||
    getPath(errorResponse, "message") ||
    "An error occurred";
  notify(message, "error");
};

export const notifySuccessResponse = (successResponse: any) => {
  const message = getPath(successResponse, "message") || "Successful";
  notify(message, "success");
};

// Convenience methods
export const notifySuccess = (message: string, options?: ToastOptions) => {
  return notify(message, "success", options);
};

export const notifyError = (message: string, options?: ToastOptions) => {
  return notify(message, "error", options);
};

export const notifyInfo = (message: string, options?: ToastOptions) => {
  return notify(message, "info", options);
};

export const notifyWarning = (message: string, options?: ToastOptions) => {
  return notify(message, "warning", options);
};

export const notifyLoading = (message: string, options?: ToastOptions) => {
  return notify(message, "loading", options);
};

// Promise-based toast for async operations
export const notifyPromise = <T,>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: any) => string);
  },
  options?: ToastOptions
) => {
  return toast.promise(
    promise,
    {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    },
    {
      duration: options?.duration || 3000,
      position: options?.position || "top-right",
      style: {
        padding: 0,
        background: "transparent",
        boxShadow: "none",
      },
      success: {
        icon: getToastIcon("success"),
        className: getToastStyle("success"),
      },
      error: {
        icon: getToastIcon("error"),
        className: getToastStyle("error"),
      },
      loading: {
        icon: getToastIcon("loading"),
        className: getToastStyle("loading"),
      },
    } as any
  );
};

// Dismiss a specific toast or all toasts
export const dismissToast = (toastId?: string) => {
  if (toastId) {
    toast.dismiss(toastId);
  } else {
    toast.dismiss();
  }
};
