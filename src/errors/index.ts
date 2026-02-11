/**
 * Custom error class for SVN-related errors
 */
export class SVNError extends Error {
  constructor(
    message: string,
    public readonly code: number,
    public readonly stderr: string = '',
    public readonly stdout: string = ''
  ) {
    super(message);
    this.name = 'SVNError';
  }
}

/**
 * Error for when TortoiseProc is not found
 */
export class TortoiseNotFoundError extends Error {
  constructor(message: string = 'TortoiseProc.exe not found') {
    super(message);
    this.name = 'TortoiseNotFoundError';
  }
}

/**
 * Error for invalid arguments
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Error for operation timeout
 */
export class TimeoutError extends Error {
  constructor(message: string = 'Operation timed out') {
    super(message);
    this.name = 'TimeoutError';
  }
}

/**
 * Error for operation cancellation
 */
export class CancelledError extends Error {
  constructor(message: string = 'Operation was cancelled') {
    super(message);
    this.name = 'CancelledError';
  }
}
