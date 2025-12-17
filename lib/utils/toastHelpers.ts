export const getErrorMessage = (
  error: unknown,
  defaultMessage: string = "An error occurred",
): string => {
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as Record<string, unknown>).message === "string"
  ) {
    return (error as Record<string, unknown>).message as string;
  }

  if (
    error &&
    typeof error === "object" &&
    "data" in error &&
    error.data &&
    typeof error.data === "object" &&
    "message" in error.data &&
    typeof (error.data as Record<string, unknown>).message === "string"
  ) {
    return (error.data as Record<string, unknown>).message as string;
  }

  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    error.response &&
    typeof error.response === "object" &&
    "data" in error.response &&
    error.response.data &&
    typeof error.response.data === "object" &&
    "message" in error.response.data &&
    typeof (error.response.data as Record<string, unknown>).message === "string"
  ) {
    return (error.response.data as Record<string, unknown>).message as string;
  }

  if (typeof error === "string") {
    return error;
  }

  if (
    error &&
    typeof error === "object" &&
    "statusText" in error &&
    typeof (error as Record<string, unknown>).statusText === "string"
  ) {
    return (error as Record<string, unknown>).statusText as string;
  }

  return defaultMessage;
};

export const getSuccessMessage = (
  response: unknown,
  defaultMessage: string = "Operation successful",
): string => {
  if (
    response &&
    typeof response === "object" &&
    "message" in response &&
    typeof (response as Record<string, unknown>).message === "string"
  ) {
    return (response as Record<string, unknown>).message as string;
  }

  if (
    response &&
    typeof response === "object" &&
    "data" in response &&
    response.data &&
    typeof response.data === "object" &&
    "message" in response.data &&
    typeof (response.data as Record<string, unknown>).message === "string"
  ) {
    return (response.data as Record<string, unknown>).message as string;
  }

  return defaultMessage;
};

export const getValidationErrors = (error: unknown): string[] => {
  const errors: string[] = [];

  if (!error || typeof error !== "object") {
    return errors;
  }

  const errorObj = error as Record<string, unknown>;
  if (Array.isArray(errorObj.errors)) {
    errorObj.errors.forEach((err: unknown) => {
      if (typeof err === "string") {
        errors.push(err);
      } else if (
        err &&
        typeof err === "object" &&
        "message" in err &&
        typeof (err as Record<string, unknown>).message === "string"
      ) {
        errors.push((err as Record<string, unknown>).message as string);
      }
    });
  }

  if (
    errorObj.data &&
    typeof errorObj.data === "object" &&
    Array.isArray((errorObj.data as Record<string, unknown>).errors)
  ) {
    const dataErrors = (errorObj.data as Record<string, unknown>)
      .errors as unknown[];
    dataErrors.forEach((err: unknown) => {
      if (typeof err === "string") {
        errors.push(err);
      } else if (
        err &&
        typeof err === "object" &&
        "message" in err &&
        typeof (err as Record<string, unknown>).message === "string"
      ) {
        errors.push((err as Record<string, unknown>).message as string);
      }
    });
  }

  return errors;
};

export const formatValidationErrors = (errors: string[]): string => {
  if (errors.length === 0) return "Validation failed";
  if (errors.length === 1) return errors[0];
  return `${errors.length} validation errors occurred`;
};
