import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'mysupersecrectkey';

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('accessToken')?.value;
    const path = request.nextUrl.pathname;

    const isPublicPath = path === '/login' || path.startsWith('/login/') || path.startsWith('/forgot-password');
    if (!token) {
        if (!isPublicPath && path.startsWith('/dashboard')) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
        return NextResponse.next();
    }

    try {
        const secret = new TextEncoder().encode(JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        const role = payload.role as string;

        let dashboardRole = role;
        if (['super_admin', 'moderator', 'admin'].includes(role)) {
            dashboardRole = 'admin';
        }

        if (isPublicPath) {
            return NextResponse.redirect(new URL(`/dashboard/${dashboardRole}`, request.url));
        }

        if (path.startsWith('/dashboard')) {
            if (path.startsWith(`/dashboard/${dashboardRole}`)) {
                return NextResponse.next();
            }

            if (path.startsWith('/dashboard/')) {
                return NextResponse.redirect(new URL(`/dashboard/${dashboardRole}`, request.url));
            }

            if (path === '/dashboard') {
                return NextResponse.redirect(new URL(`/dashboard/${dashboardRole}`, request.url));
            }
        }

        return NextResponse.next();

    } catch (error) {
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('accessToken');
        response.cookies.delete('refreshToken');
        return response;
    }
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/login/:path*',
        '/forgot-password/:path*',
    ],
};
