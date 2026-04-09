type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type LogContext = Record<string, unknown>;

function serializeError(error: Error) {
  return {
    name: error.name,
    message: error.message,
    stack: error.stack,
  };
}

function normalizeValue(value: unknown): unknown {
  if (value instanceof Error) {
    return serializeError(value);
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(normalizeValue);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, normalizeValue(entry)])
    );
  }

  return value;
}

function normalizeContext(context?: LogContext) {
  if (!context) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(context).map(([key, value]) => [key, normalizeValue(value)])
  );
}

function writeLog(level: LogLevel, message: string, context: LogContext) {
  if (process.env.NODE_ENV === 'test' && level === 'debug') {
    return;
  }

  const payload = {
    timestamp: new Date().toISOString(),
    level,
    ...context,
  };
  const prefix = `[quickcalai:${level}] ${message}`;

  switch (level) {
    case 'debug':
      console.debug(prefix, payload);
      break;
    case 'info':
      console.info(prefix, payload);
      break;
    case 'warn':
      console.warn(prefix, payload);
      break;
    case 'error':
      console.error(prefix, payload);
      break;
  }
}

export function toErrorDetails(error: unknown): LogContext {
  if (error instanceof Error) {
    return serializeError(error);
  }

  return {
    error: typeof error === 'string' ? error : 'Unknown error',
  };
}

export function createLogger(baseContext: LogContext = {}) {
  const normalizedBaseContext = normalizeContext(baseContext);

  const logWithLevel = (level: LogLevel, message: string, context?: LogContext) => {
    writeLog(level, message, {
      ...normalizedBaseContext,
      ...normalizeContext(context),
    });
  };

  return {
    child(childContext: LogContext) {
      return createLogger({
        ...normalizedBaseContext,
        ...normalizeContext(childContext),
      });
    },
    log(message: string, context?: LogContext) {
      logWithLevel('info', message, context);
    },
    info(message: string, context?: LogContext) {
      logWithLevel('info', message, context);
    },
    warn(message: string, context?: LogContext) {
      logWithLevel('warn', message, context);
    },
    error(message: string, context?: LogContext) {
      logWithLevel('error', message, context);
    },
    debug(message: string, context?: LogContext) {
      logWithLevel('debug', message, context);
    },
  };
}

export const logger = createLogger({ runtime: 'client' });
export const serverLogger = createLogger({ runtime: 'server' });
