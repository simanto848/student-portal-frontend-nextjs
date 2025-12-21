"use client";

import React, { ReactNode } from 'react';
import { QueryProvider } from './QueryProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/lib/ToastProvider';

interface ProvidersProps {
    children: ReactNode;
}

/**
 * Combined providers wrapper component
 * Wraps the application with all necessary providers in the correct order
 *
 * Order matters:
 * 1. QueryProvider - React Query for data fetching (outermost)
 * 2. AuthProvider - Authentication context
 * 3. Children - Application components
 * 4. ToastProvider - Toast notifications (doesn't wrap children)
 */
export function Providers({ children }: ProvidersProps) {
    return (
        <QueryProvider>
            <AuthProvider>
                {children}
                <ToastProvider />
            </AuthProvider>
        </QueryProvider>
    );
}

export { QueryProvider } from './QueryProvider';
export { AuthProvider } from '@/contexts/AuthContext';
