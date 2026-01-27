"use client";

import { Toaster as HotToaster } from "react-hot-toast";
import { Toaster as SonnerToaster } from "sonner";

export function ToastProvider() {
    return (
        <>
            <HotToaster
                position="top-right"
                reverseOrder={false}
                gutter={8}
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: "transparent",
                        boxShadow: "none",
                        padding: 0,
                    },
                }}
            />
            <SonnerToaster position="top-right" richColors closeButton theme="light" />
        </>
    );
}