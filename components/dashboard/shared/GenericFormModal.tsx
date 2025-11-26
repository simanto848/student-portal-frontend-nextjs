"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useCallback, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

export interface FormField {
    name: string;
    label: string;
    type: "text" | "email" | "number" | "select" | "date" | "textarea" | "time" | "searchable-select" | "multi-select";
    placeholder?: string;
    required?: boolean;
    options?: { label: string; value: string }[];
}

type FormDataType = Record<string, any>;

interface GenericFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: FormDataType) => void;
    title: string;
    description?: string;
    fields: FormField[];
    initialData?: FormDataType;
    isSubmitting?: boolean;
}

function FormContent({
    fields,
    initialData,
    onSubmit,
    onClose,
    isSubmitting,
}: {
    fields: FormField[];
    initialData: FormDataType;
    onSubmit: (data: FormDataType) => void;
    onClose: () => void;
    isSubmitting: boolean;
}) {
    const [formData, setFormData] = useState<FormDataType>(initialData);

    const handleChange = useCallback((name: string, value: any) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    }, []);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleFormSubmit}>
            <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
                {fields.map((field) => (
                    <div key={field.name} className="space-y-2">
                        <Label htmlFor={field.name} className="text-[#344e41] font-medium">
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        {field.type === "select" ? (
                            <Select
                                value={formData[field.name] || ""}
                                onValueChange={(value) => handleChange(field.name, value)}
                            >
                                <SelectTrigger className="w-full bg-white border-[#a3b18a]/50 focus:ring-[#588157] text-[#344e41]">
                                    <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-[#a3b18a]/30">
                                    {field.options?.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                            className="hover:bg-[#a3b18a]/20 focus:bg-[#a3b18a]/30 text-[#344e41]"
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : field.type === "searchable-select" ? (
                            <SearchableSelect
                                options={field.options || []}
                                value={formData[field.name] || ""}
                                onChange={(value) => handleChange(field.name, value)}
                                placeholder={field.placeholder}
                            />
                        ) : field.type === "multi-select" ? (
                            <div className="space-y-2">
                                <div className="flex flex-wrap gap-1 mb-2">
                                    {Array.isArray(formData[field.name]) && formData[field.name].map((val: string) => {
                                        const option = field.options?.find(o => o.value === val);
                                        return (
                                            <Badge key={val} variant="secondary" className="bg-[#a3b18a]/30 text-[#344e41] hover:bg-[#a3b18a]/40">
                                                {option?.label || val}
                                                <button
                                                    type="button"
                                                    className="ml-1 hover:text-red-500"
                                                    onClick={() => {
                                                        const current = Array.isArray(formData[field.name]) ? formData[field.name] : [];
                                                        handleChange(field.name, current.filter((v: string) => v !== val));
                                                    }}
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        );
                                    })}
                                </div>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            className="w-full justify-between bg-white border-[#a3b18a]/50 text-[#344e41]"
                                        >
                                            {field.placeholder || "Select items..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0 bg-white border-[#a3b18a]/30">
                                        <Command>
                                            <CommandInput placeholder="Search..." />
                                            <CommandEmpty>No item found.</CommandEmpty>
                                            <CommandGroup className="max-h-[200px] overflow-auto">
                                                {field.options?.map((option) => (
                                                    <CommandItem
                                                        key={option.value}
                                                        value={option.label}
                                                        onSelect={() => {
                                                            const current = Array.isArray(formData[field.name]) ? formData[field.name] : [];
                                                            const isSelected = current.includes(option.value);
                                                            const newValue = isSelected
                                                                ? current.filter((v: string) => v !== option.value)
                                                                : [...current, option.value];
                                                            handleChange(field.name, newValue);
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                Array.isArray(formData[field.name]) && formData[field.name].includes(option.value)
                                                                    ? "opacity-100"
                                                                    : "opacity-0"
                                                            )}
                                                        />
                                                        {option.label}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        ) : field.type === "textarea" ? (
                            <textarea
                                id={field.name}
                                name={field.name}
                                placeholder={field.placeholder}
                                value={formData[field.name] || ""}
                                onChange={(e) => handleChange(field.name, e.target.value)}
                                className="w-full min-h-[100px] px-3 py-2 rounded-md bg-white border border-[#a3b18a]/50 text-[#344e41] placeholder:text-[#344e41]/50 focus:outline-none focus:ring-2 focus:ring-[#588157] focus:border-transparent resize-none"
                                required={field.required}
                            />
                        ) : field.type === "time" ? (
                            <Input
                                id={field.name}
                                name={field.name}
                                type="time"
                                placeholder={field.placeholder}
                                value={formData[field.name] || ""}
                                onChange={(e) => handleChange(field.name, e.target.value)}
                                className="w-full bg-white border-[#a3b18a]/50 text-[#344e41] placeholder:text-[#344e41]/50 focus-visible:ring-[#588157]"
                                required={field.required}
                            />
                        ) : (
                            <Input
                                id={field.name}
                                name={field.name}
                                type={field.type}
                                placeholder={field.placeholder}
                                value={formData[field.name] || ""}
                                onChange={(e) => handleChange(field.name, e.target.value)}
                                className="w-full bg-white border-[#a3b18a]/50 text-[#344e41] placeholder:text-[#344e41]/50 focus-visible:ring-[#588157]"
                                required={field.required}
                            />
                        )}
                    </div>
                ))}
            </div>
            <DialogFooter className="bg-[#a3b18a]/20 px-6 py-4 border-t border-[#a3b18a]/30">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="border-[#a3b18a] text-[#344e41] hover:bg-[#a3b18a]/30"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    className="bg-[#588157] hover:bg-[#3a5a40] text-white shadow-sm"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Saving..." : "Save changes"}
                </Button>
            </DialogFooter>
        </form>
    );
}

export function GenericFormModal({
    isOpen,
    onClose,
    onSubmit,
    title,
    description,
    fields,
    initialData = {},
    isSubmitting = false,
}: GenericFormModalProps) {
    const formKey = JSON.stringify(initialData);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] bg-[#dad7cd] border-[#a3b18a]/30 p-0 overflow-hidden">
                <DialogHeader className="bg-[#344e41] px-6 py-4">
                    <DialogTitle className="text-white text-lg">{title}</DialogTitle>
                    {description && <DialogDescription className="text-white/70">{description}</DialogDescription>}
                </DialogHeader>
                {isOpen && (
                    <FormContent
                        key={formKey}
                        fields={fields}
                        initialData={initialData}
                        onSubmit={onSubmit}
                        onClose={onClose}
                        isSubmitting={isSubmitting}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
