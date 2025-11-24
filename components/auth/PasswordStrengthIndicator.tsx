"use client";
import React from "react";

interface PasswordStrengthIndicatorProps {
    password: string;
}

function score(password: string) {
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s; // 0-4
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
    const s = score(password);
    const percent = (s / 4) * 100;
    const label = ["Too weak", "Weak", "Fair", "Good", "Strong"][s];
    const barColor = s >= 3 ? "bg-success" : s === 2 ? "bg-warning" : "bg-error";

    return (
        <div className="flex flex-col gap-3">
            <div className="flex justify-between">
                <p className="text-text-light dark:text-text-dark text-base font-medium">Password Strength</p>
            </div>
            <div className="rounded-full bg-border-light dark:bg-border-alt-dark h-2">
                <div className={`h-2 rounded-full transition-all duration-300 ${barColor}`} style={{ width: `${percent}%` }} />
            </div>
            <p className={`text-sm font-medium ${barColor.replace("bg-", "text-")}`}>{label}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                <Check ok={password.length >= 8} label="Minimum 8 characters" />
                <Check ok={/[A-Z]/.test(password)} label="At least one uppercase letter" />
                <Check ok={/[0-9]/.test(password)} label="At least one number" />
                <Check ok={/[^A-Za-z0-9]/.test(password)} label="At least one special character" />
            </div>
        </div>
    );
}

function Check({ ok, label }: { ok: boolean; label: string }) {
    return (
        <label className="flex gap-x-3 py-2 flex-row items-center">
            <input
                type="checkbox"
                checked={ok}
                readOnly
                className="h-5 w-5 rounded border-border-light dark:border-border-alt-dark border-2 bg-transparent text-success checked:bg-success checked:border-success focus:ring-0 focus:ring-offset-0"
            />
            <p className="text-text-light dark:text-text-dark text-base font-normal leading-normal">{label}</p>
        </label>
    );
}
