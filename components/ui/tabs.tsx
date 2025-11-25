"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const Tabs = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
        value: string;
        onValueChange: (value: string) => void;
        defaultValue?: string;
    }
>(({ className, value, onValueChange, defaultValue, children, ...props }, ref) => {
    // Simple state management for tabs if not controlled (though we use controlled in our pages)
    // For this implementation, we'll assume controlled usage as per our pages
    return (
        <div ref={ref} className={cn("w-full", className)} {...props}>
            {/* Pass value and onValueChange to children via context or cloning if needed, 
          but for simplicity in this specific usage pattern, we'll rely on the structure 
          Tabs -> TabsList -> TabsTrigger to just work with the props passed to TabsList/Trigger 
          Wait, Radix primitives usually use Context. 
          Let's make a simple Context-based implementation.
      */}
            <TabsContext.Provider value={{ value: value || defaultValue || "", onValueChange }}>
                {children}
            </TabsContext.Provider>
        </div>
    );
});
Tabs.displayName = "Tabs";

const TabsContext = React.createContext<{
    value: string;
    onValueChange: (value: string) => void;
}>({ value: "", onValueChange: () => { } });

const TabsList = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
            className
        )}
        {...props}
    />
));
TabsList.displayName = "TabsList";

const TabsTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }
>(({ className, value, ...props }, ref) => {
    const context = React.useContext(TabsContext);
    const isSelected = context.value === value;

    return (
        <button
            ref={ref}
            type="button"
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                isSelected
                    ? "bg-background text-foreground shadow-sm"
                    : "hover:bg-background/50 hover:text-foreground",
                className
            )}
            onClick={() => context.onValueChange(value)}
            {...props}
        />
    );
});
TabsTrigger.displayName = "TabsTrigger";

const TabsContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, value, children, ...props }, ref) => {
    const context = React.useContext(TabsContext);
    if (context.value !== value) return null;

    return (
        <div
            ref={ref}
            className={cn(
                "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
});
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
