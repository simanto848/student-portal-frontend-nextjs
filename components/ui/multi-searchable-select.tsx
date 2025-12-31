"use client";

import * as React from "react";
import { X, Check, ChevronsUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Command,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";
import { cn } from "@/lib/utils";

export interface Option {
    label: string;
    value: string;
}

interface MultiSearchableSelectProps {
    options: Option[];
    value: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
    disabled?: boolean;
}

export function MultiSearchableSelect({
    options,
    value,
    onChange,
    placeholder = "Select options...",
    disabled = false,
}: MultiSearchableSelectProps) {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [open, setOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState("");

    const handleUnselect = (optionValue: string) => {
        onChange(value.filter((v) => v !== optionValue));
    };

    const handleSelect = (optionValue: string) => {
        if (value.includes(optionValue)) {
            onChange(value.filter((v) => v !== optionValue));
        } else {
            onChange([...value, optionValue]);
        }
        setInputValue("");
    };

    const selected = React.useMemo(() => {
        const uniqueValues = Array.from(new Set(value));
        return uniqueValues
            .map((v) => options.find((opt) => opt.value === v))
            .filter(Boolean) as Option[];
    }, [value, options]);

    const filteredOptions = React.useMemo(() => {
        const seen = new Set();
        return options
            .filter(option =>
                option.label.toLowerCase().includes(inputValue.toLowerCase()) &&
                !seen.has(option.value) &&
                seen.add(option.value)
            );
    }, [options, inputValue]);

    return (
        <Command onKeyDown={(e) => {
            if (e.key === "Backspace" && !inputValue) {
                e.preventDefault();
                if (value.length > 0) {
                    onChange(value.slice(0, -1));
                }
            }
            if (e.key === "Escape") {
                inputRef.current?.blur();
            }
        }}
            shouldFilter={false}
            className="overflow-visible bg-transparent">
            <div
                className={cn(
                    "group border border-input px-3 py-2 text-sm ring-offset-background rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
                    disabled && "opacity-50 cursor-not-allowed"
                )}
            >
                <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                    {selected.map((option) => (
                        <Badge key={option.value} variant="secondary" className="hover:bg-secondary/80">
                            {option.label}
                            <button
                                className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleUnselect(option.value);
                                    }
                                }}
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                                onClick={() => handleUnselect(option.value)}
                                disabled={disabled}
                            >
                                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                            </button>
                        </Badge>
                    ))}
                    <CommandPrimitive.Input
                        ref={inputRef}
                        value={inputValue}
                        onValueChange={setInputValue}
                        onBlur={() => setOpen(false)}
                        onFocus={() => setOpen(true)}
                        placeholder={selected.length === 0 ? placeholder : undefined}
                        className={cn(
                            "ml-2 bg-transparent outline-none placeholder:text-muted-foreground flex-1",
                            disabled && "cursor-not-allowed"
                        )}
                        disabled={disabled}
                    />
                </div>
            </div>
            <div className="relative mt-2">
                {open && filteredOptions.length > 0 ? (
                    <div
                        className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in"
                        onMouseDown={(e) => {
                            e.preventDefault();
                        }}
                    >
                        <CommandList className="h-full max-h-60 overflow-auto p-1">
                            {filteredOptions.map((option) => {
                                const isSelected = value.includes(option.value);
                                return (
                                    <CommandItem
                                        key={option.value}
                                        value={option.label}
                                        onSelect={() => handleSelect(option.value)}
                                        className="cursor-pointer aria-selected:text-white"
                                    >
                                        <div
                                            className={cn(
                                                "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                isSelected
                                                    ? "bg-primary text-primary-foreground"
                                                    : "opacity-50 [&_svg]:invisible"
                                            )}
                                        >
                                            <Check className={cn("h-4 w-4")} />
                                        </div>
                                        <span>{option.label}</span>
                                    </CommandItem>
                                );
                            })}
                        </CommandList>
                    </div>
                ) : null}
            </div>
        </Command>
    );
}
