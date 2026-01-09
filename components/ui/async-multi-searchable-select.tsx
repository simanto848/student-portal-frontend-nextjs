"use client";

import * as React from "react";
import { X, Check } from "lucide-react";
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
    role?: string;
}

interface AsyncMultiSearchableSelectProps {
    options: Option[];
    value: string[];
    onChange: (value: string[]) => void;
    onSearch: (query: string) => void;
    placeholder?: string;
    isLoading?: boolean;
    disabled?: boolean;
}

export function AsyncMultiSearchableSelect({
    options,
    value,
    onChange,
    onSearch,
    placeholder = "Select options...",
    isLoading = false,
    disabled = false,
}: AsyncMultiSearchableSelectProps) {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [open, setOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState("");
    const [selectedCache, setSelectedCache] = React.useState<Map<string, Option>>(new Map());

    React.useEffect(() => {
        const timer = setTimeout(() => {
            onSearch(inputValue);
        }, 300);
        return () => clearTimeout(timer);
    }, [inputValue, onSearch]);

    React.useEffect(() => {
        if (options.length > 0) {
            setSelectedCache(prev => {
                const next = new Map(prev);
                options.forEach(opt => next.set(opt.value, opt));
                return next;
            });
        }
    }, [options]);

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
        return value.map(id => selectedCache.get(id) || options.find(o => o.value === id) || { value: id, label: id });
    }, [value, selectedCache, options]);

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
                    "group border border-input px-3 py-2 text-sm ring-offset-background rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 relative bg-white",
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
                {open && (
                    <div
                        className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in"
                        onMouseDown={(e) => {
                        }}
                    >
                        <CommandList className="h-full max-h-60 overflow-auto p-1 bg-white">
                            {isLoading && <CommandItem disabled className="py-6 text-center text-sm">Loading users...</CommandItem>}
                            {!isLoading && options.length === 0 && <CommandItem disabled className="py-6 text-center text-sm">No users found.</CommandItem>}
                            {options.map((option) => {
                                const isSelected = value.includes(option.value);
                                return (
                                    <CommandItem
                                        key={option.value}
                                        value={option.value}
                                        onSelect={() => handleSelect(option.value)}
                                        className="cursor-pointer aria-selected:bg-accent"
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
                                        <div className="flex flex-col">
                                            <span>{option.label}</span>
                                            {option.role && <span className="text-xs text-muted-foreground capitalize">{option.role}</span>}
                                        </div>
                                    </CommandItem>
                                );
                            })}
                        </CommandList>
                    </div>
                )}
            </div>
        </Command>
    );
}
