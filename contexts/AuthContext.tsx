"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, UserRole, LoginResponse } from '../services/auth.service';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: any | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: any, role: UserRole) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<any | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const router = useRouter();

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('accessToken');

            if (token) {
                try {
                    const user = await authService.getCurrentUser(token);
                    setUser(user);
                    setIsAuthenticated(true);
                    localStorage.setItem('user', JSON.stringify(user));
                } catch (error) {
                    console.error("Session verification failed:", error);
                    localStorage.removeItem('user');
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    setUser(null);
                    setIsAuthenticated(false);
                }
            }
            setIsLoading(false);
        };

        initAuth();
    }, []);

    const login = async (credentials: any, role: UserRole) => {
        setIsLoading(true);
        try {
            const data: LoginResponse = await authService.login(credentials, role);
            setUser(data.user);
            setIsAuthenticated(true);

            // Store session data
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);

            // Redirect based on role
            let targetRole = role;
            if (['super_admin', 'moderator', 'admin'].includes(role)) {
                targetRole = 'admin';
            }
            router.push(`/dashboard/${targetRole}`);
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await authService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            router.push('/login');
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
