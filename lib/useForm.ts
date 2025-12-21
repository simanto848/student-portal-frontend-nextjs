"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import * as yup from "yup";
import isEqual from "lodash/isEqual";
import cloneDeep from "lodash/cloneDeep";
import get from "lodash/get";
import set from "lodash/set";

/**
 * ========== Types ==========
 */

export type FormDataConvertible =
    | Array<FormDataConvertible>
    | { [key: string]: FormDataConvertible }
    | Blob
    | File
    | FileList
    | Date
    | boolean
    | number
    | string
    | null
    | undefined;

export type Errors<T> =
    T extends Array<infer U>
    ? Errors<U>[]
    : T extends object
    ? { [K in keyof T]?: Errors<T[K]> }
    : string;

export type SanitizerFn<V = any, R = any> = (value: V) => R;

export type Sanitizers<TForm extends Record<string, any>> = Partial<{
    [K in keyof TForm]: SanitizerFn<any, any>;
}>;

export interface FormSubmitOptions {
    onBefore?: () => void;
    onStart?: () => void;
    onSuccess?: (response: any) => void | Promise<void>;
    onError?: (errors: Record<string, string>, errResponse: any) => void | Promise<void>;
    onFinish?: () => void;
}

export interface UseFormOptions<TForm extends Record<string, any>> {
    validator?: (y: typeof yup) => Partial<Record<keyof TForm, yup.AnySchema>>;
    sanitize?: () => Sanitizers<TForm>;
}

export interface UseFormReturn<TForm extends Record<string, any>> {
    data: TForm;
    errors: Errors<TForm>;
    setData: <K extends keyof TForm>(key: K, value: TForm[K]) => void;
    setError: (field: keyof TForm | Record<string, any>, value?: string) => void;
    clearErrors: (...fields: (keyof TForm)[]) => void;
    reset: (...fields: (keyof TForm)[]) => void;
    setInitialData: (data: Partial<TForm>) => void;
    isDirty: boolean;
    hasErrors: boolean;
    processing: boolean;
    wasSuccessful: boolean;
    recentlySuccessful: boolean;
    validate: () => boolean;
    validateByKey: (keys: (keyof TForm)[]) => boolean;
    submit: (action: (state: any, formData: FormData) => Promise<any>, options?: FormSubmitOptions) => Promise<void>;
    fileInput: (event: React.ChangeEvent<HTMLInputElement>, key: keyof TForm) => void;
    hasChanged: (key?: keyof TForm) => boolean;
}

/**
 * ========== Helper Functions ==========
 */

function countErrors(errors: any): number {
    if (typeof errors === "string") return errors.trim() ? 1 : 0;
    if (Array.isArray(errors)) {
        return errors.reduce((count, item) => count + countErrors(item), 0);
    }
    if (typeof errors === "object" && errors !== null) {
        return Object.values(errors).reduce<number>((count: number, value: any) => count + countErrors(value), 0);
    }
    return 0;
}

function clearAllErrors(obj: any): any {
    if (typeof obj === "string") return "";
    if (Array.isArray(obj)) return obj.map(clearAllErrors);
    if (typeof obj === "object" && obj !== null) {
        return Object.keys(obj).reduce((acc, key) => {
            acc[key] = clearAllErrors(obj[key]);
            return acc;
        }, {} as any);
    }
    return "";
}

function createInitialErrors<T>(data: T): Errors<T> {
    if (Array.isArray(data)) {
        return data.map((item) => createInitialErrors(item)) as any;
    }
    if (typeof data === "object" && data !== null) {
        const errors: any = {};
        for (const key in data) {
            errors[key] = createInitialErrors(data[key]);
        }
        return errors;
    }
    return "" as any;
}

function setNestedError(obj: any, path: string, value: string) {
    const keys = path.split(".");
    let current = obj;

    for (let i = 0; i < keys.length; i++) {
        const key = isNaN(Number(keys[i])) ? keys[i] : Number(keys[i]);

        if (i === keys.length - 1) {
            current[key] = value;
        } else {
            if (!current[key]) {
                current[key] = typeof keys[i + 1] === "string" && isNaN(Number(keys[i + 1])) ? {} : [];
            }
            current = current[key];
        }
    }
}

/**
 * ========== Main Hook ==========
 * React version of Vue's useForm composable
 */

export function useForm<TForm extends Record<string, any>>(
    initialData: TForm | (() => TForm),
    options: UseFormOptions<TForm> = {}
): UseFormReturn<TForm> {
    const dataFn = typeof initialData === "function" ? (initialData as () => TForm) : () => initialData;
    const defaultsRef = useRef(cloneDeep(dataFn()));
    const originalDefaultsRef = useRef(cloneDeep(dataFn())); // Store original defaults separately
    const previousDataRef = useRef(cloneDeep(dataFn()));
    const changedKeysRef = useRef<(keyof TForm)[]>([]);

    const [data, setDataState] = useState<TForm>(cloneDeep(dataFn()));
    const [errors, setErrorsState] = useState<Errors<TForm>>(createInitialErrors(dataFn()));
    const [isDirty, setIsDirty] = useState(false);
    const [hasErrors, setHasErrors] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [wasSuccessful, setWasSuccessful] = useState(false);
    const [recentlySuccessful, setRecentlySuccessful] = useState(false);

    // Build validation schema
    const validator = options.validator?.(yup);
    const validationSchemaRef = useRef(yup.object().shape(validator || {}));

    const sanitizersRef = useRef(options.sanitize?.() || ({} as Sanitizers<TForm>));

    // Track dirty state
    useEffect(() => {
        const _changedKeys = Object.keys(data).filter(
            (key) => !isEqual(data[key], previousDataRef.current[key])
        ) as (keyof TForm)[];

        changedKeysRef.current = _changedKeys;
        setIsDirty(_changedKeys.length > 0);
    }, [data]);

    // Set single field data
    const setData = useCallback(<K extends keyof TForm>(key: K, value: TForm[K]) => {
        setDataState((prev) => {
            const newData = { ...prev };
            const sanitizerFn = sanitizersRef.current[key];
            const finalValue = sanitizerFn ? sanitizerFn(value) : value;
            set(newData, key as string, finalValue);

            // Validate on change if errors exist
            if (hasErrors && validationSchemaRef.current) {
                const fieldSchema = (validationSchemaRef.current as any).fields?.[key];
                if (fieldSchema) {
                    try {
                        fieldSchema.validateSync(finalValue);
                        // Clear error for this field if validation passes
                        setErrorsState((prevErrors) => {
                            const newErrors = cloneDeep(prevErrors);
                            set(newErrors, key as string, "");
                            return newErrors;
                        });
                    } catch (err: any) {
                        // Set error for this field if validation fails
                        if (err?.message) {
                            setErrorsState((prevErrors) => {
                                const newErrors = cloneDeep(prevErrors);
                                set(newErrors, key as string, err.message);
                                return newErrors;
                            });
                        }
                    }
                }
            }

            return newData;
        });
    }, [hasErrors]);

    // Set error
    const setError = useCallback((fieldOrErrors: keyof TForm | Record<string, any>, maybeValue?: string) => {
        setErrorsState((prev) => {
            const newErrors = cloneDeep(prev);

            if (typeof fieldOrErrors === "string") {
                setNestedError(newErrors, fieldOrErrors, maybeValue as string);
            } else {
                const errorObj = fieldOrErrors as Record<string, any>;
                for (const key in errorObj) {
                    const messages = errorObj[key];
                    if (Array.isArray(messages) && messages.length > 0) {
                        setNestedError(newErrors, key, messages[0]);
                    } else if (typeof messages === "string") {
                        setNestedError(newErrors, key, messages);
                    }
                }
            }

            return newErrors;
        });

        setHasErrors(true);
    }, []);

    // Clear errors
    const clearErrors = useCallback((...fields: (keyof TForm)[]) => {
        if (fields.length === 0) {
            setErrorsState((prev) => clearAllErrors(prev));
            setHasErrors(false);
        } else {
            setErrorsState((prev) => {
                const newErrors = cloneDeep(prev);
                fields.forEach((field) => {
                    set(newErrors, field as string, "");
                });
                return newErrors;
            });
            setHasErrors(countErrors(errors) > 0);
        }
    }, [errors]);

    // Reset form
    const reset = useCallback((...fields: (keyof TForm)[]) => {
        const resolvedDefaults = cloneDeep(originalDefaultsRef.current); // Use original defaults

        if (fields.length === 0) {
            // Reset all fields to initial defaults
            setDataState(resolvedDefaults);
            setErrorsState(createInitialErrors(resolvedDefaults));
            setHasErrors(false);
            setIsDirty(false);
            setWasSuccessful(false);
            setRecentlySuccessful(false);
            changedKeysRef.current = [];
            previousDataRef.current = cloneDeep(resolvedDefaults);
        } else {
            setDataState((prev) => {
                const newData = { ...prev };
                fields.forEach((field) => {
                    const defaultValue = get(resolvedDefaults, field);
                    set(newData, field, defaultValue);
                });
                return newData;
            });

            setErrorsState((prev) => {
                const newErrors = cloneDeep(prev);
                fields.forEach((field) => {
                    set(newErrors, field, "");
                });
                return newErrors;
            });

            setHasErrors(countErrors(errors) > 0);
        }
    }, [errors]);

    // Set initial data
    const setInitialData = useCallback((newData: Partial<TForm>) => {
        const newCompleteState = cloneDeep(defaultsRef.current);

        const applyValues = (source: Record<string, any>, target: Record<string, any>) => {
            for (const key in source) {
                if (!Object.prototype.hasOwnProperty.call(target, key)) continue;

                const sourceValue = source[key];
                const targetValue = target[key];

                if (sourceValue === null) {
                    target[key] = null;
                } else if (Array.isArray(sourceValue)) {
                    target[key] = cloneDeep(sourceValue);
                } else if (
                    typeof sourceValue === "object" &&
                    typeof targetValue === "object" &&
                    targetValue !== null &&
                    !Array.isArray(targetValue)
                ) {
                    applyValues(sourceValue, targetValue);
                } else {
                    target[key] = sourceValue;
                }
            }
        };

        applyValues(newData as Record<string, any>, newCompleteState);

        defaultsRef.current = newCompleteState as TForm;
        previousDataRef.current = cloneDeep(newCompleteState);
        setDataState(cloneDeep(newCompleteState) as TForm);
        setErrorsState(createInitialErrors(newCompleteState));
        setIsDirty(false);
        setHasErrors(false);
        changedKeysRef.current = [];
    }, []);

    // Validate entire form
    const validate = useCallback((): boolean => {
        if (!validationSchemaRef.current) return true;

        clearErrors();

        try {
            validationSchemaRef.current.validateSync(data, { abortEarly: false });
            setHasErrors(false);
            return true;
        } catch (err: any) {
            if (err.inner) {
                const validationErrors: Record<string, string> = {};
                for (const validationError of err.inner) {
                    const path = validationError.path;
                    if (path && !validationErrors[path]) {
                        validationErrors[path] = validationError.message;
                    }
                }
                setError(validationErrors);
            }
            return false;
        }
    }, [data, clearErrors, setError]);

    // Validate specific keys
    const validateByKey = useCallback(
        (keys: (keyof TForm)[]): boolean => {
            if (!validationSchemaRef.current || keys.length === 0) return true;

            const validationErrors: Record<string, string> = {};

            for (const key of keys) {
                try {
                    const fieldSchema = (validationSchemaRef.current as any).fields?.[key];
                    if (fieldSchema) {
                        fieldSchema.validateSync(data[key]);
                    }
                } catch (err: any) {
                    if (err?.message && !validationErrors[key as string]) {
                        validationErrors[key as string] = err.message;
                    }
                }
            }

            if (Object.keys(validationErrors).length > 0) {
                setError(validationErrors);
                return false;
            }

            return true;
        },
        [data, setError]
    );

    // File input handler
    const fileInput = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>, key: keyof TForm) => {
            const files = event.target.files;
            if (files && files.length > 0) {
                setData(key, (files.length === 1 ? files[0] : files) as TForm[keyof TForm]);
            }
        },
        [setData]
    );

    // Check if field has changed
    const hasChanged = useCallback((key?: keyof TForm): boolean => {
        if (!key) {
            return changedKeysRef.current.length > 0;
        }
        return changedKeysRef.current.includes(key);
    }, []);

    // Submit form
    const submit = useCallback(
        async (action: (state: any, formData: FormData) => Promise<any>, options: FormSubmitOptions = {}) => {
            // Validate before submit
            if (!validate()) {
                return;
            }

            options.onBefore?.();
            setProcessing(true);
            setWasSuccessful(false);
            clearErrors();

            // Convert data to FormData
            const formData = new FormData();

            const appendFormData = (value: any, key: string) => {
                if (value instanceof File || value instanceof Blob) {
                    formData.append(key, value);
                } else if (value instanceof FileList) {
                    Array.from(value).forEach((file, index) => {
                        formData.append(`${key}[${index}]`, file);
                    });
                } else if (Array.isArray(value)) {
                    value.forEach((item, index) => {
                        appendFormData(item, `${key}[${index}]`);
                    });
                } else if (value !== null && typeof value === "object" && !(value instanceof Date)) {
                    Object.entries(value).forEach(([subKey, subValue]) => {
                        appendFormData(subValue, `${key}[${subKey}]`);
                    });
                } else if (value !== undefined && value !== null) {
                    formData.append(key, value instanceof Date ? value.toISOString() : String(value));
                }
            };

            for (const [key, value] of Object.entries(data)) {
                appendFormData(value, key);
            }

            try {
                options.onStart?.();

                const response = await action(null, formData);
                if (response.success) {
                    setWasSuccessful(true);
                    setRecentlySuccessful(true);
                    defaultsRef.current = cloneDeep(data);
                    previousDataRef.current = cloneDeep(data);
                    setIsDirty(false);
                    changedKeysRef.current = [];

                    setTimeout(() => setRecentlySuccessful(false), 2000);

                    await options.onSuccess?.(response);
                } else {
                    if (response.errors) {
                        setError(response.errors);
                    }
                    await options.onError?.(response.errors || {}, response);
                }
            } catch (error: any) {
                const errorData = error?.response?.data || error;
                if (errorData?.errors) {
                    setError(errorData.errors);
                }
                await options.onError?.(errorData?.errors || {}, errorData);
            } finally {
                setProcessing(false);
                options.onFinish?.();
            }
        },
        [data, validate, clearErrors, setError]
    );

    return {
        data,
        errors,
        setData,
        setError,
        clearErrors,
        reset,
        setInitialData,
        isDirty,
        hasErrors,
        processing,
        wasSuccessful,
        recentlySuccessful,
        validate,
        validateByKey,
        submit,
        fileInput,
        hasChanged,
    };
}
