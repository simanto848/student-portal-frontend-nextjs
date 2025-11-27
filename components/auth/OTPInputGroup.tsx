"use client";
import React, { useRef } from "react";

interface OTPInputGroupProps {
    length?: number;
    value: string;
    onChange: (val: string) => void;
}

export function OTPInputGroup({ length = 6, value, onChange }: OTPInputGroupProps) {
    const inputs = Array.from({ length });
    const refs = useRef<HTMLInputElement[]>([]);

    function handleInput(idx: number, v: string) {
        if (!/^[0-9]?$/.test(v)) return;

        const chars = value.split("");
        chars[idx] = v;
        const newVal = chars.join("");
        onChange(newVal);
        if (v && idx < length - 1) {
            refs.current[idx + 1]?.focus();
        }
    }

    function handleKey(idx: number, e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Backspace" && !value[idx] && idx > 0) {
            refs.current[idx - 1]?.focus();
        }
        if (e.key === "ArrowLeft" && idx > 0) refs.current[idx - 1]?.focus();
        if (e.key === "ArrowRight" && idx < length - 1) refs.current[idx + 1]?.focus();
    }

    return (
        <fieldset className="relative flex gap-3">
            {inputs.map((_, i) => (
                <input
                    key={i}
                    ref={(el) => { if (el) refs.current[i] = el; }}
                    className="flex h-14 w-12 text-center text-lg font-bold appearance-none rounded-lg border border-border-light bg-white dark:border-border-dark dark:bg-background-dark focus:border-accent focus:ring-2 focus:ring-accent/50 dark:focus:border-accent"
                    inputMode="numeric"
                    maxLength={1}
                    value={value[i] === " " ? "" : (value[i] ?? "")}
                    onChange={(e) => handleInput(i, e.target.value.slice(-1))}
                    onKeyDown={(e) => handleKey(i, e)}
                />
            ))}
        </fieldset>
    );
}
