"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface SearchableOption {
  value: string;
  label: string;
  description?: string;
}

export interface SearchableSelectProps {
  options: SearchableOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select option...",
  disabled = false,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);

  const selectedOption = options.find((option) => option.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-12 px-4 rounded-xl bg-slate-50 border-slate-200 hover:bg-white hover:border-indigo-300 hover:text-indigo-600 hover:shadow-sm transition-all text-slate-900 font-normal group"
          disabled={disabled}
        >
          {selectedOption ? (
            <div className="flex flex-col items-start text-left overflow-hidden">
              <span className="truncate font-medium text-slate-700 group-hover:text-indigo-700 leading-tight">
                {selectedOption.label}
              </span>
              {selectedOption.description && (
                <span className="truncate text-xs text-slate-400 group-hover:text-indigo-400">
                  {selectedOption.description}
                </span>
              )}
            </div>
          ) : (
            <span className="text-slate-500">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity text-slate-500 group-hover:text-indigo-500" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0 rounded-xl shadow-xl border-slate-200 overflow-hidden"
        align="start"
        collisionPadding={10}
      >
        <Command className="w-full bg-white">
          <CommandInput placeholder="Search..." className="h-11 text-sm border-b border-slate-100 bg-slate-50/50" />
          <CommandList
            className="max-h-[260px] overflow-y-auto scroll-smooth [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
          >
            <CommandEmpty className="py-4 text-center text-sm text-slate-500">No options found.</CommandEmpty>
            <CommandGroup className="p-1.5">
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label} // Filter by label
                  onSelect={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className="relative flex items-center py-2.5 px-3 rounded-lg text-sm cursor-pointer transition-colors aria-selected:bg-indigo-50 aria-selected:text-indigo-700 data-[selected=true]:bg-indigo-50 group mb-0.5 last:mb-0"
                  keywords={[option.label, option.value, option.description || ""]}
                >
                  <div className="flex flex-col flex-1 min-w-0 mr-4">
                    <span className="font-medium text-slate-700 group-aria-selected:text-indigo-700 truncate">
                      {option.label}
                    </span>
                    {option.description && (
                      <span className="text-xs text-slate-400 group-aria-selected:text-indigo-400/80 truncate">
                        {option.description}
                      </span>
                    )}
                  </div>
                  <Check
                    className={cn(
                      "h-4 w-4 text-indigo-600 shrink-0",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
