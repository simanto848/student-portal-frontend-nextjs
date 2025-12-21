const ACCESS_TOKEN_COOKIE_NAME = 'accessToken';

export async function getAuthToken(): Promise<string | undefined> {
    if (typeof window !== 'undefined') {
        return localStorage.getItem(ACCESS_TOKEN_COOKIE_NAME) || undefined;
    }

    try {
        const { cookies } = await import('next/headers');
        const cookieStore = await cookies();
        return cookieStore.get(ACCESS_TOKEN_COOKIE_NAME)?.value;
    } catch (error) {
        console.error('Error getting auth token on server:', error);
        return undefined;
    }
}

export async function getAnyAuthToken(): Promise<string | undefined> {
    return getAuthToken();
}
