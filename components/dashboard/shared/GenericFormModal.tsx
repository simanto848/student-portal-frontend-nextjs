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
import { TimePicker } from "@/components/ui/time-picker";
import { DatePicker } from "@/components/ui/date-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useCallback, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { useDashboardTheme } from "@/contexts/DashboardThemeContext";
import { motion, AnimatePresence } from "framer-motion";

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
    onFieldChange?: (name: string, value: any, setValue: (name: string, value: any) => void) => void;
}

function FormContent({
    fields,
    initialData,
    onSubmit,
    onClose,
    isSubmitting,
    onFieldChange,
}: {
    fields: FormField[];
    initialData: FormDataType;
    onSubmit: (data: FormDataType) => void;
    onClose: () => void;
    isSubmitting: boolean;
    onFieldChange?: (name: string, value: any, setValue: (name: string, value: any) => void) => void;
}) {
    const theme = useDashboardTheme();
    const [formData, setFormData] = useState<FormDataType>(initialData);

    const handleChange = useCallback((name: string, value: any) => {
        const setValue = (n: string, v: any) => setFormData(prev => ({ ...prev, [n]: v }));
        setValue(name, value);
        onFieldChange?.(name, value, setValue);
    }, [onFieldChange]);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleFormSubmit}>
            <div className="px-6 py-6 space-y-5 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {fields.map((field, idx) => (
                    <motion.div
                        key={field.name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="space-y-2"
                    >
                        <Label htmlFor={field.name} className={`text-xs font-bold uppercase tracking-wider ${theme.colors.sidebar.text}/60`}>
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        {field.type === "select" ? (
                            <Select
                                value={formData[field.name] || ""}
                                onValueChange={(value) => handleChange(field.name, value)}
                            >
                                <SelectTrigger className={`w-full bg-slate-50 border-slate-200/60 focus:ring-1 ${theme.colors.accent.primary.replace('text-', 'ring-')} rounded-xl h-11 text-slate-900 font-medium`}>
                                    <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-slate-200 shadow-xl rounded-xl">
                                    {field.options?.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                            className="hover:bg-slate-50 focus:bg-slate-50 rounded-lg m-1 font-medium"
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
                                <div className="flex flex-wrap gap-2 mb-2">
                                    <AnimatePresence>
                                        {Array.isArray(formData[field.name]) && formData[field.name].map((val: string) => {
                                            const option = field.options?.find(o => o.value === val);
                                            return (
                                                <motion.div
                                                    key={val}
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.8 }}
                                                >
                                                    <Badge
                                                        className={cn(
                                                            "ring-1 ring-inset font-bold flex items-center gap-1 transition-all rounded-lg px-2 py-1",
                                                            theme.colors.sidebar.active,
                                                            theme.colors.sidebar.activeText,
                                                            theme.colors.sidebar.borderSubtle.replace('border-', 'ring-')
                                                        )}
                                                    >
                                                        {option?.label || val}
                                                        <button
                                                            type="button"
                                                            className={cn("ml-1 transition-colors opacity-60 hover:opacity-100", theme.colors.sidebar.activeText)}
                                                            onClick={() => {
                                                                const current = Array.isArray(formData[field.name]) ? formData[field.name] : [];
                                                                handleChange(field.name, current.filter((v: string) => v !== val));
                                                            }}
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </Badge>
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                </div>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            className={cn(
                                                "w-full justify-between bg-slate-50 border-slate-200 h-11 text-slate-700 font-medium rounded-xl transition-all group",
                                                `hover:bg-slate-100 ${theme.colors.accent.primary.replace('text-', 'hover:text-')} ${theme.colors.accent.primary.replace('text-', 'hover:border-').replace('600', '300')}`
                                            )}
                                        >
                                            {field.placeholder || "Select items..."}
                                            <ChevronsUpDown className={cn("ml-2 h-4 w-4 shrink-0 opacity-50 transition-colors", theme.colors.accent.primary.replace('text-', 'group-hover:text-'))} />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-white border-slate-200 shadow-xl rounded-xl">
                                        <Command>
                                            <CommandInput placeholder="Search..." className="h-11 border-none focus:ring-0" />
                                            <CommandEmpty>No item found.</CommandEmpty>
                                            <CommandGroup className="p-1">
                                                <CommandList className="max-h-[250px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                                                    {field.options?.map((option) => (
                                                        <CommandItem
                                                            key={option.value}
                                                            value={option.label}
                                                            className={cn(
                                                                "rounded-lg m-1 font-medium cursor-pointer transition-colors",
                                                                `aria-selected:${theme.colors.sidebar.active} aria-selected:${theme.colors.sidebar.activeText} hover:${theme.colors.sidebar.active} hover:${theme.colors.sidebar.activeText}`
                                                            )}
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
                                                                        ? `transition-all opacity-100 ${theme.colors.accent.primary}`
                                                                        : "opacity-0"
                                                                )}
                                                            />
                                                            {option.label}
                                                        </CommandItem>
                                                    ))}
                                                </CommandList>
                                            </CommandGroup>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        ) : field.type === "date" ? (
                            <DatePicker
                                date={formData[field.name] ? new Date(formData[field.name]) : undefined}
                                onChange={(date: Date | undefined) => {
                                    if (date) {
                                        // Store as YYYY-MM-DD string for form compatibility
                                        const dateStr = date.toISOString().split('T')[0];
                                        handleChange(field.name, dateStr);
                                    } else {
                                        handleChange(field.name, undefined);
                                    }
                                }}
                                placeholder={field.placeholder}
                                className="h-11 rounded-xl bg-slate-50 border-slate-200/60 font-medium"
                            />
                        ) : field.type === "time" ? (
                            <TimePicker
                                value={formData[field.name] || ""}
                                onChange={(value) => handleChange(field.name, value)}
                                placeholder={field.placeholder}
                                disabled={isSubmitting}
                            />
                        ) : field.type === "textarea" ? (
                            <textarea
                                id={field.name}
                                name={field.name}
                                placeholder={field.placeholder}
                                value={formData[field.name] || ""}
                                onChange={(e) => handleChange(field.name, e.target.value)}
                                className="w-full min-h-[120px] px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-transparent resize-none font-medium transition-all"
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
                                className="w-full h-11 bg-slate-50 border-slate-200/60 text-slate-900 placeholder:text-slate-400 focus-visible:ring-amber-500 rounded-xl font-medium transition-all"
                                required={field.required}
                            />
                        )}
                    </motion.div>
                ))}
            </div>
            <DialogFooter className="bg-slate-50/50 px-6 py-5 border-t border-slate-100">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl px-6 h-11 font-bold uppercase text-xs tracking-wider transition-all"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    className={`${theme.colors.accent.secondary} hover:opacity-90 text-white shadow-md rounded-xl px-8 h-11 font-bold uppercase text-xs tracking-wider transition-all active:scale-95`}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            <span>Saving...</span>
                        </div>
                    ) : "Save Changes"}
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
    onFieldChange,
}: GenericFormModalProps) {
    const theme = useDashboardTheme();
    const formKey = JSON.stringify(initialData);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[550px] bg-white border-slate-200 p-0 overflow-hidden rounded-2xl shadow-2xl">
                <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${theme.colors.accent.secondary.replace('bg-', 'from-')} to-orange-400`} />
                <DialogHeader className="px-8 pt-8 pb-4">
                    <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">{title}</DialogTitle>
                    {description && (
                        <DialogDescription className="text-slate-500 font-medium text-sm mt-1">
                            {description}
                        </DialogDescription>
                    )}
                </DialogHeader>
                {isOpen && (
                    <FormContent
                        key={formKey}
                        fields={fields}
                        initialData={initialData}
                        onSubmit={onSubmit}
                        onClose={onClose}
                        isSubmitting={isSubmitting}
                        onFieldChange={onFieldChange}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
