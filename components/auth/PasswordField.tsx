"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";

interface PasswordFieldProps {
    label: string;
    value?: string;
    onChange?: (v: string) => void;
    placeholder?: string;
    name?: string;
    autoComplete?: string;
}

export function PasswordField({ label, value = "", onChange, placeholder, name, autoComplete }: PasswordFieldProps) {
    const [visible, setVisible] = useState(false);
    return (
        <label className="flex flex-col gap-2">
            <p className="text-text-light dark:text-text-dark text-sm font-medium leading-normal">{label}</p>
            <div className="relative flex w-full items-stretch">
                <Input
                    name={name}
                    autoComplete={autoComplete}
                    type={visible ? "text" : "password"}
                    value={value}
                    onChange={(e) => onChange?.(e.target.value)}
                    placeholder={placeholder}
                    className="h-12 rounded-lg bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark border-border-light dark:border-border-dark placeholder:text-subtext-light dark:placeholder:text-subtext-dark pr-12"
                />
                <button
                    type="button"
                    aria-label="Toggle password visibility"
                    onClick={() => setVisible(v => !v)}
                    className="absolute inset-y-0 right-0 flex items-center justify-center pr-4 text-subtext-light dark:text-subtext-dark"
                >
                    {visible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
            </div>
        </label>
    );
}
