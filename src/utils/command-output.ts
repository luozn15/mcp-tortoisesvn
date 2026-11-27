import { spawnSync } from 'child_process';

const utf8Decoder = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true });
let fallbackEncoding: string | undefined;

function getFallbackEncoding(): string {
  if (process.env.TSVN_MCP_FALLBACK_ENCODING) {
    return process.env.TSVN_MCP_FALLBACK_ENCODING;
  }
  if (fallbackEncoding !== undefined) {
    return fallbackEncoding;
  }

  fallbackEncoding = 'utf-8';
  if (process.platform === 'win32') {
    const result = spawnSync(
      'reg.exe',
      ['query', 'HKLM\\SYSTEM\\CurrentControlSet\\Control\\Nls\\CodePage', '/v', 'ACP'],
      { encoding: 'utf8', windowsHide: true, timeout: 5000 },
    );
    const codePage = /\bACP\s+REG_SZ\s+(\d+)/.exec(result.stdout ?? '')?.[1];
    const encodings: Record<string, string> = {
      '65001': 'utf-8',
      '936': 'gb18030',
      '950': 'big5',
      '932': 'shift_jis',
      '949': 'euc-kr',
      '874': 'windows-874',
    };
    const encoding = codePage
      ? encodings[codePage] ?? `windows-${codePage}`
      : 'windows-1252';
    try {
      new TextDecoder(encoding);
      fallbackEncoding = encoding;
    } catch {
      fallbackEncoding = 'utf-8';
    }
  }
  return fallbackEncoding;
}

/** Decode completed output so multibyte characters can span process chunks. */
export function decodeCommandOutput(output: Buffer): string {
  const encoding = process.env.TSVN_MCP_ENCODING;
  if (encoding && encoding !== 'auto') {
    return new TextDecoder(encoding, { ignoreBOM: true }).decode(output);
  }

  try {
    return utf8Decoder.decode(output);
  } catch {
    // SVN diffs can mix localized ANSI headers with UTF-8 source lines.
    const legacyDecoder = new TextDecoder(getFallbackEncoding(), { ignoreBOM: true });
    const lines: string[] = [];
    let offset = 0;
    while (offset < output.length) {
      const newline = output.indexOf(0x0a, offset);
      const end = newline === -1 ? output.length : newline + 1;
      const line = output.subarray(offset, end);
      try {
        lines.push(utf8Decoder.decode(line));
      } catch {
        lines.push(legacyDecoder.decode(line));
      }
      offset = end;
    }
    return lines.join('');
  }
}
