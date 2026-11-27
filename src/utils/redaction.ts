const REDACTED = '[REDACTED]';
const SENSITIVE_KEY = /^(?:password|passwd|pwd|passphrase|token|access[-_]?token|refresh[-_]?token|client[-_]?secret|secret|authorization)$/i;
const SENSITIVE_OPTION = /^(?:--|\/)(password|passwd|pwd|passphrase|token|secret)(?:[=:]([\s\S]*))?$/i;

/** Collect exact values as well as names so echoed credentials can be masked. */
export function collectSensitiveValues(value: unknown): string[] {
  const secrets = new Set<string>();
  const visited = new WeakSet<object>();

  function collect(item: unknown): void {
    if (typeof item !== 'object' || item === null || visited.has(item)) {
      return;
    }
    visited.add(item);
    if (Array.isArray(item)) {
      for (let index = 0; index < item.length; index += 1) {
        const argument: unknown = item[index];
        const match = typeof argument === 'string' ? SENSITIVE_OPTION.exec(argument) : null;
        const secret: unknown = match ? match[2] ?? item[index + 1] : undefined;
        if (typeof secret === 'string' && secret) {
          secrets.add(secret);
        }
        collect(argument);
      }
      return;
    }
    for (const [key, child] of Object.entries(item)) {
      if (SENSITIVE_KEY.test(key) && typeof child === 'string' && child) {
        secrets.add(child);
      }
      collect(child);
    }
  }

  collect(value);
  return [...secrets];
}

export function redactText(value: string, secrets: readonly string[] = []): string {
  const variants = new Set(secrets.filter(Boolean));
  for (const secret of secrets) {
    try {
      variants.add(encodeURIComponent(secret));
    } catch {
      // Invalid Unicode can still be masked using its original value.
    }
  }
  let result = value;
  const alternatives = [...variants]
    .filter(Boolean)
    .sort((left, right) => right.length - left.length)
    .map((secret) => secret.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (alternatives.length > 0) {
    result = result.replace(new RegExp(alternatives.join('|'), 'g'), REDACTED);
  }
  return result
    .replace(/([a-z][a-z\d+.-]*:\/\/)[^\s/@]+@/gi, `$1${REDACTED}@`)
    .replace(/((?:--|\/)(?:password|passwd|pwd|passphrase|token|secret)(?:\s+|[=:]))("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|[^\s]+)/gi, `$1${REDACTED}`)
    .replace(/(\b(?:password|passwd|pwd|passphrase|token|access[-_]?token|refresh[-_]?token|client[-_]?secret|secret|authorization)\b["']?\s*[:=]\s*)("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|[^\s,;]+)/gi, `$1${REDACTED}`);
}

export function redactSensitiveData(
  value: unknown,
  secrets: readonly string[] = collectSensitiveValues(value),
): unknown {
  const visited = new WeakSet<object>();

  function redact(item: unknown): unknown {
    if (typeof item === 'string') {
      return redactText(item, secrets);
    }
    if (typeof item !== 'object' || item === null) {
      return item;
    }
    if (visited.has(item)) {
      return '[Circular]';
    }
    visited.add(item);
    let result: unknown;
    if (Array.isArray(item)) {
      result = item.map((child: unknown) => redact(child));
    } else {
      const properties = item instanceof Error
        ? { ...item, name: item.name, message: item.message, stack: item.stack }
        : item;
      result = Object.fromEntries(Object.entries(properties).map(([key, child]) => [
        key,
        SENSITIVE_KEY.test(key) ? REDACTED : redact(child),
      ]));
    }
    visited.delete(item);
    return result;
  }

  return redact(value);
}
