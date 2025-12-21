import axios, { InternalAxiosRequestConfig } from 'axios';
import { getAnyAuthToken } from './authHelper';
import { logAPICall, getTimestamp } from './logger';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface CustomAxiosConfig extends InternalAxiosRequestConfig {
	requestTimestamp?: string;
	requestStartTime?: number;
}

/**
 * Create an authenticated API instance for server-side requests
 * This should be used in server components and server actions
 */
export async function getAxios(token?: string) {
	const authToken = token || await getAnyAuthToken();
	const api = axios.create({
		baseURL: BASE_URL,
		timeout: 30000, // 30 seconds
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
			...(authToken && { Authorization: `Bearer ${authToken}` }),
		},
		withCredentials: true,
	});

	// Request interceptor to log outgoing requests
	api.interceptors.request.use(
		(config: InternalAxiosRequestConfig) => {
			const customConfig = config as CustomAxiosConfig;
			customConfig.requestTimestamp = getTimestamp();
			customConfig.requestStartTime = Date.now();
			return customConfig;
		},
		(error) => {
			return Promise.reject(error);
		}
	);

	// Response interceptor to log responses and errors
	api.interceptors.response.use(
		async (response) => {
			const config = response.config as CustomAxiosConfig;
			const duration = config.requestStartTime
				? Date.now() - config.requestStartTime
				: undefined;

			await logAPICall({
				timestamp: config.requestTimestamp || getTimestamp(),
				method: response.config.method || 'unknown',
				url: `${response.config.baseURL}${response.config.url}`,
				status: response.status,
				requestData: response.config.data ? JSON.parse(response.config.data) : undefined,
				responseData: response.data,
				duration,
			});

			return response?.data;
		},
		async (error) => {
			const config = error.config as CustomAxiosConfig;
			const duration = config?.requestStartTime
				? Date.now() - config.requestStartTime
				: undefined;

			await logAPICall({
				timestamp: config?.requestTimestamp || getTimestamp(),
				method: error.config?.method || 'unknown',
				url: `${error.config?.baseURL}${error.config?.url}`,
				status: error.response?.status,
				requestData: error.config?.data ? JSON.parse(error.config.data) : undefined,
				responseData: error.response?.data,
				error: {
					message: error.message,
					code: error.code,
				},
				duration,
			});

			return Promise.reject(error?.response || error);
		}
	);
	return api;
}
