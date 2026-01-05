"use server";

import { z, ZodSchema } from "zod";
import * as yup from "yup";

type HttpMethod = "get" | "post" | "put" | "patch" | "delete";

interface FormActionConfig<T = unknown> {
    /** HTTP method (get, post, put, patch, delete) */
    method: HttpMethod;

    /** API endpoint (e.g., 'login', 'users', 'posts/123') */
    endpoint: string;

    /** Validation schema (Yup or Zod) */
    schema?: yup.AnyObjectSchema | ZodSchema<T>;

    /** Transform form data before validation */
    transformData?: (formData: FormData) => unknown;

    /** Called on successful response */
    onSuccess?: (data: unknown) => Promise<void> | void;

    /** Called on error */
    onError?: (error: unknown) => Promise<void> | void;

    /** Called on validation error */
    onValidationError?: (errors: Record<string, string>) => Promise<void> | void;

    /** Additional headers */
    headers?: Record<string, string>;
}

interface FormActionResponse {
    success: boolean;
    data?: unknown;
    errors?: Record<string, string> | null;
    message?: string;
}

/**
 * Converts Zod validation errors to a flat object
 */
function flattenZodErrors(zodError: z.ZodError): Record<string, string> {
    const flattened: Record<string, string> = {};

    zodError.issues.forEach((error) => {
        const path = error.path.join(".");
        if (!flattened[path]) {
            flattened[path] = error.message;
        }
    });

    return flattened;
}

/**
 * Converts Yup validation errors to a flat object
 */
function flattenYupErrors(yupError: yup.ValidationError): Record<string, string> {
    const flattened: Record<string, string> = {};

    if (yupError.inner && yupError.inner.length > 0) {
        // Multiple errors
        yupError.inner.forEach((error) => {
            if (error.path && !flattened[error.path]) {
                flattened[error.path] = error.message;
            }
        });
    } else if (yupError.path) {
        // Single error
        flattened[yupError.path] = yupError.message;
    }

    return flattened;
}

/**
 * Check if schema is a Yup schema
 */
function isYupSchema(schema: unknown): schema is yup.AnyObjectSchema {
    return !!schema && typeof (schema as Record<string, unknown>).validate === "function" && typeof (schema as Record<string, unknown>).validateSync === "function";
}

/**
 * Check if schema is a Zod schema
 */
function isZodSchema(schema: unknown): schema is ZodSchema {
    return !!schema && typeof (schema as Record<string, unknown>).safeParse === "function";
}

/**
 * Converts FormData to plain object
 */
function formDataToObject(formData: FormData): Record<string, unknown> {
    const obj: Record<string, unknown> = {};

    formData.forEach((value, key) => {
        // Handle multiple values with same key (e.g., checkboxes)
        if (obj[key]) {
            if (Array.isArray(obj[key])) {
                (obj[key] as unknown[]).push(value);
            } else {
                obj[key] = [obj[key], value];
            }
        } else {
            obj[key] = value;
        }
    });

    return obj;
}

/**
 * Creates a dynamic form action with validation, error handling, and callbacks
 *
 * @example
 * const loginAction = createFormAction({
 *   method: "post",
 *   endpoint: "login",
 *   schema: z.object({
 *     email: z.string().email("Invalid email"),
 *     password: z.string().min(6, "Password must be at least 6 characters")
 *   }),
 *   onSuccess: async (data) => {
 *     if (data.token) {
 *       (await cookies()).set("token", data.token);
 *     }
 *   }
 * });
 */
export async function createFormAction<T = unknown>(
    config: FormActionConfig<T>,
    state: unknown,
    formData: FormData
): Promise<FormActionResponse> {
    try {
        // Transform FormData to object
        let data = config.transformData
            ? config.transformData(formData)
            : formDataToObject(formData);

        // Validation (if schema provided)
        if (config.schema) {
            // Yup validation
            if (isYupSchema(config.schema)) {
                try {
                    data = await config.schema.validate(data, { abortEarly: false });
                } catch (error) {
                    if (error instanceof yup.ValidationError) {
                        const errors = flattenYupErrors(error);
                        console.warn("Yup validation failed:", errors);

                        if (config.onValidationError) {
                            await config.onValidationError(errors);
                        }

                        return {
                            success: false,
                            errors,
                            message: "Validation failed",
                        };
                    }
                    throw error;
                }
            }
            // Zod validation
            else if (isZodSchema(config.schema)) {
                const zodSchema = config.schema as ZodSchema<T>;
                const validation = zodSchema.safeParse(data);

                if (!validation.success) {
                    const errors = flattenZodErrors(validation.error);
                    console.warn("Zod validation failed:", errors);

                    if (config.onValidationError) {
                        await config.onValidationError(errors);
                    }

                    return {
                        success: false,
                        errors,
                        message: "Validation failed",
                    };
                }

                data = validation.data;
            }
        }

        // Make API request with authentication
        const { getAxios } = await import("@/lib/useAxios");
        const api = await getAxios();
        const requestConfig = {
            headers: config.headers || {},
        };

        let responseData: { data?: unknown; message?: string; errors?: Record<string, string> } | undefined;

        switch (config.method.toLowerCase()) {
            case "get":
                responseData = await api.get(config.endpoint, requestConfig);
                break;
            case "post":
                responseData = await api.post(config.endpoint, data, requestConfig);
                break;
            case "put":
                responseData = await api.put(config.endpoint, data, requestConfig);
                break;
            case "patch":
                responseData = await api.patch(config.endpoint, data, requestConfig);
                break;
            case "delete":
                responseData = await api.delete(config.endpoint, requestConfig);
                break;
            default:
                throw new Error(`Unsupported HTTP method: ${config.method}`);
        }


        // Call onSuccess callback
        if (config.onSuccess) {
            await config.onSuccess(responseData);
        }

        return {
            success: true,
            data: responseData?.data,
            errors: null,
            message: responseData?.message || "Success",
        };

    } catch (err: unknown) {
        // Handle validation errors from API
        const errorResponse = err as { data?: { errors?: Record<string, string>; message?: string }; status?: number };
        const errorData = errorResponse?.data;
        const apiErrors = errorData?.errors || null;
        const errorMessage = errorData?.message || (err as Error)?.message || "An error occurred";

        if (apiErrors) {
            if (config.onValidationError) {
                await config.onValidationError(apiErrors);
            }

            return {
                success: false,
                errors: apiErrors,
                data: errorData,
                message: errorMessage,
            };
        }

        // Handle other errors
        console.error(`${config.method.toUpperCase()} ${config.endpoint} error:`, {
            message: errorMessage,
            status: errorResponse?.status,
            data: errorData,
        });

        if (config.onError) {
            await config.onError(err);
        }

        return {
            success: false,
            errors: null,
            message: errorMessage,
        };
    }
}
