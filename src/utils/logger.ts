/**
 * Simple structured logger
 */
export interface Logger {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}

/**
 * Default console logger
 */
export class ConsoleLogger implements Logger {
  constructor(private readonly prefix: string = 'TortoiseSVN-MCP') {}

  debug(message: string, ...args: unknown[]): void {
    console.debug(`[DEBUG] [${this.prefix}] ${message}`, ...args);
  }

  info(message: string, ...args: unknown[]): void {
    console.info(`[INFO] [${this.prefix}] ${message}`, ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    console.warn(`[WARN] [${this.prefix}] ${message}`, ...args);
  }

  error(message: string, ...args: unknown[]): void {
    console.error(`[ERROR] [${this.prefix}] ${message}`, ...args);
  }
}

/**
 * No-op logger for silent mode
 */
export class NoopLogger implements Logger {
  debug(): void {}
  info(): void {}
  warn(): void {}
  error(): void {}
}

let globalLogger: Logger = new ConsoleLogger();

/**
 * Sets the global logger
 */
export function setLogger(logger: Logger): void {
  globalLogger = logger;
}

/**
 * Gets the global logger
 */
export function getLogger(): Logger {
  return globalLogger;
}
