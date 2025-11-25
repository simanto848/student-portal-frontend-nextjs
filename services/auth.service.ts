import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/';

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
        const response = await axios.post(`${API_URL}${endpoint}`, credentials);
        return response.data.data;
    }

    async logout(): Promise<void> {
        await axios.post(`${API_URL}/user/auth/logout`);
    }

    async forgotPassword(email: string, role: UserRole): Promise<void> {
        await axios.post(`${API_URL}/user/auth/forgot-password`, { email, role });
    }

    async refreshToken(token: string): Promise<any> {
        const response = await axios.post(`${API_URL}/user/auth/refresh-token`, { refreshToken: token });
        return response.data.data;
    }

    async getCurrentUser(token: string): Promise<any> {
        const response = await axios.get(`${API_URL}/user/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.data.user;
    }
}

export const authService = new AuthService();
