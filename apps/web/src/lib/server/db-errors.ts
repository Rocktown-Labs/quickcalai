const RECOVERABLE_SCHEMA_SQLSTATE_CODES = new Set([
  "42P01", // undefined_table
  "42703", // undefined_column
  "42704", // undefined_object
]);

function getErrorMessage(value: unknown): string | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const maybeMessage = (value as { message?: unknown }).message;
  if (typeof maybeMessage === "string") {
    return maybeMessage;
  }

  return undefined;
}

function getErrorCode(value: unknown): string | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const maybeCode = (value as { code?: unknown }).code;
  if (typeof maybeCode === "string") {
    return maybeCode;
  }

  return undefined;
}

function getErrorCause(value: unknown): unknown {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  return (value as { cause?: unknown }).cause;
}

export function isRecoverableFreshDatabaseError(error: unknown): boolean {
  let current: unknown = error;
  let depth = 0;

  while (current && depth < 10) {
    const code = getErrorCode(current);
    if (code && RECOVERABLE_SCHEMA_SQLSTATE_CODES.has(code)) {
      return true;
    }

    const message = getErrorMessage(current)?.toLowerCase();
    if (message?.includes("does not exist")) {
      return true;
    }

    current = getErrorCause(current);
    depth += 1;
  }

  return false;
}
