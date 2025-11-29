import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://student-portal-gateway-detpel38n.vercel.app/api/';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

export type UserRole = 'student' | 'teacher' | 'staff' | 'admin';

export interface LoginResponse {
    user: any;
    accessToken: string;
    refreshToken: string;
}

class AuthService {
    private getEndpoint(role: UserRole): string {
        switch (role) {
            case 'student':
                return '/user/auth/students/login';
            case 'teacher':
                return '/user/auth/teachers/login';
            case 'staff':
                return '/user/auth/staffs/login';
            case 'admin':
                return '/user/auth/admins/login';
            default:
                throw new Error('Invalid user role');
        }
    }

    async login(credentials: any, role: UserRole): Promise<LoginResponse> {
        const endpoint = this.getEndpoint(role);
        const response = await api.post(endpoint, credentials);
        return response.data.data;
    }

    async logout(): Promise<void> {
        await api.post('/user/auth/logout');
    }

    async forgotPassword(email: string, role: UserRole): Promise<void> {
        await api.post('/user/auth/forgot-password', { email, role });
    }

    async verifyResetOTP(email: string, otp: string, role: UserRole): Promise<void> {
        await api.post('/user/auth/verify-reset-otp', { email, otp, role });
    }

    async resetPassword(email: string, otp: string, newPassword: string, role: UserRole): Promise<void> {
        await api.post('/user/auth/reset-password', { email, otp, newPassword, role });
    }

    async refreshToken(token: string): Promise<any> {
        const response = await api.post('/user/auth/refresh-token', { refreshToken: token });
        return response.data.data;
    }

    async getCurrentUser(token: string): Promise<any> {
        const response = await api.get('/user/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.data.user;
    }
}

export const authService = new AuthService();
