"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
    return (
        <Toaster
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
    );
}