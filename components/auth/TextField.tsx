"use client";
import React from "react";
import { Input } from "@/components/ui/input";

interface TextFieldProps {
    label: string;
    value?: string;
    onChange?: (v: string) => void;
    placeholder?: string;
    name?: string;
    type?: "text" | "email" | "tel" | "url";
    autoComplete?: string;
    required?: boolean;
}

export function TextField({
    label,
    value = "",
    onChange,
    placeholder,
    name,
    type = "text",
    autoComplete,
    required = false,
}: TextFieldProps) {
    return (
        <label className="flex flex-col gap-2">
            <p className="text-text-light dark:text-text-dark text-sm font-medium leading-normal">{label}</p>
            <Input
                name={name}
                type={type}
                autoComplete={autoComplete}
                required={required}
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                placeholder={placeholder}
                className="h-12 rounded-lg bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark border-border-light dark:border-border-dark placeholder:text-subtext-light dark:placeholder:text-subtext-dark"
            />
        </label>
    );
}
