import { getAnyAuthToken } from './authHelper';
import { logAPICall, getTimestamp } from './logger';

type FetchMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface FetchOptions<T = unknown> {
	method?: FetchMethod;
	body?: T;
	token?: string;
	revalidate?: number | false;
	noStore?: boolean;
	headers?: Record<string, string>;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

/**
 * Server Fetch Wrapper with:
 * - Request logging
 * - Token auto injection
 * - Caching + Revalidate support
 */
export async function apiFetch<T = unknown, P = unknown>(
	url: string,
	options: FetchOptions<P> = {}
): Promise<T> {
	const timestamp = getTimestamp();
	const token = options.token ?? (await getAnyAuthToken());

	const headers: Record<string, string> = {
		"Content-Type": "application/json",
		Accept: "application/json",
		...(options.headers || {}),
		...(token && { Authorization: `Bearer ${token}` }),
	};

	const fetchOptions: RequestInit & { next?: { revalidate?: number } } = {
		method: options.method ?? "GET",
		headers,
		...(options.body && { body: JSON.stringify(options.body) }),
	};

	if (options.noStore) {
		fetchOptions.cache = "no-store";
	} else if (options.revalidate !== undefined && options.revalidate !== 0) {
		fetchOptions.next = { revalidate: typeof options.revalidate === "number" ? options.revalidate : 60 };
	}

	const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
	const startTime = Date.now();

	try {
		const res = await fetch(fullUrl, fetchOptions);

		let data: unknown = null;
		try {
			data = await res.json();
		} catch (_) { }

		const duration = Date.now() - startTime;

		await logAPICall({
			timestamp,
			method: fetchOptions.method ?? "GET",
			url: fullUrl,
			status: res.status,
			requestData: options.body,
			responseData: data,
			duration,
		});

		if (!res.ok) {
			throw {
				status: res.status,
				data,
			};
		}
		return data as T;
	} catch (error: unknown) {
		const duration = Date.now() - startTime;
		const errorStatus = (error as any)?.status ?? 500;
		const errorData = (error as any)?.data;

		await logAPICall({
			timestamp,
			method: fetchOptions.method ?? "GET",
			url: fullUrl,
			status: errorStatus,
			requestData: options.body,
			responseData: errorData,
			error: {
				message: (error as Error).message || 'Fetch error',
			},
			duration,
		});

		throw error;
	}
}
