import { spawn } from "child_process";
import process from "process";
import { readFileSync, appendFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { SVNError, TimeoutError } from "../errors/index.js";
import { getLogger } from "./logger.js";
import type {
  CommandResult,
  BaseSVNOptions,
  Revision,
  TortoiseSVNOptions,
} from "../types/index.js";

const DEFAULT_TIMEOUT = 300000;

function getLogFilePath(): string {
  const logDir = process.env.TSVN_MCP_LOG_DIR || join(process.cwd(), "logs");
  if (!existsSync(logDir)) {
    mkdirSync(logDir, { recursive: true });
  }
  return join(logDir, "command.log");
}

function logCommand(tool: string, input: unknown, command: string): void {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${tool}\n  Input: ${JSON.stringify(input, null, 2).replace(/\n/g, "\n  ")}\n  Command: ${command}\n\n`;

  getLogger().info(`[${tool}] Executing: ${command}`);

  try {
    const logFile = getLogFilePath();
    appendFileSync(logFile, logEntry, "utf8");
  } catch (err) {
    getLogger().error(`Failed to write log: ${err}`);
  }
}

/**
 * Check if running in WSL (Windows Subsystem for Linux)
 */
function isWSL(): boolean {
  if (process.platform !== "linux") return false;
  try {
    const version = readFileSync("/proc/version", "utf8");
    return (
      version.toLowerCase().includes("microsoft") || version.includes("WSL")
    );
  } catch {
    return false;
  }
}

/**
 * Cache WSL detection result
 */
let _isWSL: boolean | undefined;

function getIsWSL(): boolean {
  if (_isWSL === undefined) {
    _isWSL = isWSL();
  }
  return _isWSL;
}

/**
 * Get the platform-specific SVN command
 */
function getSVNCommand(): string {
  if (process.platform === "win32") {
    return "svn.exe";
  }
  return "svn";
}

/**
 * Get the platform-specific TortoiseProc command
 */
function getTortoiseProcCommand(): string | null {
  if (process.platform === "win32" || getIsWSL()) {
    return "TortoiseProc.exe";
  }
  return null;
}

/**
 * Convert WSL path to Windows path
 * /mnt/d/path -> D:\path
 * /mnt/c/Users/... -> C:\Users\...
 */
export function wslPathToWindows(path: string): string {
  if (!getIsWSL()) return path;

  // Match /mnt/X/ pattern where X is a drive letter
  const wslMountPattern = /^\/mnt\/([a-zA-Z])\/(.*)$/;
  const match = path.match(wslMountPattern);

  if (match) {
    const driveLetter = match[1].toUpperCase();
    const restPath = match[2];
    // Convert forward slashes to backslashes
    const windowsPath = restPath.replace(/\//g, "\\");
    return `${driveLetter}:\\${windowsPath}`;
  }

  // If it's a WSL path but not under /mnt/, it's inside WSL filesystem
  // TortoiseProc can't access these, but we return as-is and let it fail with clear error
  return path;
}

/**
 * Check if a value looks like a file path
 */
function isPathLike(value: unknown): boolean {
  if (typeof value !== "string") return false;
  // Starts with / or \ or drive letter pattern
  return (
    value.startsWith("/") || value.startsWith("\\") || /^[a-zA-Z]:/.test(value)
  );
}

/**
 * Convert all path-like values in a record from WSL to Windows format
 */
function convertPathsToWindows(
  params: Record<string, string>,
): Record<string, string> {
  const converted: Record<string, string> = {};

  for (const [key, value] of Object.entries(params)) {
    if (isPathLike(value)) {
      converted[key] = wslPathToWindows(value);
    } else {
      converted[key] = value;
    }
  }

  return converted;
}

/**
 * Builds revision argument string
 */
export function buildRevisionArg(revision: Revision): string {
  switch (revision.type) {
    case "number":
      return String(revision.value);
    case "head":
      return "HEAD";
    case "base":
      return "BASE";
    case "committed":
      return "COMMITTED";
    case "prev":
      return "PREV";
    case "date":
      return `{${revision.value}}`;
    default:
      return "HEAD";
  }
}

/**
 * Builds common SVN command arguments
 */
export function buildCommonArgs(options: BaseSVNOptions): string[] {
  const args: string[] = [];

  if (options.username) {
    args.push("--username", options.username);
  }
  if (options.password) {
    args.push("--password", options.password);
  }
  if (options.noAuthCache) {
    args.push("--no-auth-cache");
  }
  if (options.nonInteractive) {
    args.push("--non-interactive");
  }
  if (options.trustServerCert) {
    args.push("--trust-server-cert");
  }
  if (options.configDir) {
    args.push("--config-dir", options.configDir);
  }

  return args;
}

/**
 * Builds TortoiseSVN GUI options
 */
export function buildTortoiseOptions(options: TortoiseSVNOptions): string[] {
  const args: string[] = [];

  if (options.closeOnEnd !== undefined) {
    args.push(`/closeonend:${options.closeOnEnd}`);
  }
  if (options.closeForLocal) {
    args.push("/closeforlocal");
  }
  if (options.closeForRemote) {
    args.push("/closeforremote");
  }
  if (options.noMerge) {
    args.push("/nomerge");
  }
  if (options.noCommit) {
    args.push("/nocommit");
  }
  if (options.noLock) {
    args.push("/nolock");
  }
  if (options.noUniDiff) {
    args.push("/nounidiff");
  }

  return args;
}

/**
 * Normalizes paths for Windows
 */
export function normalizePath(path: string): string {
  // Convert forward slashes to backslashes for Windows
  return path.replace(/\//g, "\\");
}

/**
 * Converts path or array of paths to array
 */
export function toPathArray(paths: string | string[]): string[] {
  return Array.isArray(paths) ? paths : [paths];
}

/**
 * Escapes arguments for shell execution
 */
export function escapeArg(arg: string): string {
  if (arg.includes(" ")) {
    return `"${arg.replace(/"/g, '\\"')}"`;
  }
  return arg;
}

const PATH_PARAM_NAMES = new Set([
  "path",
  "path2",
  "savepath",
  "droptarget",
  "outfile",
  "logmsgfile",
  "url",
  "fromurl",
  "tourl",
  "output",
  "configdir",
  "projectpropertiespath",
]);

const QUOTED_PARAM_NAMES = new Set([
  "datemin",
  "datemax",
  "logmsg",
  "findstring",
]);

function escapePathArg(path: string): string {
  let cleanPath = path.replace(/^"|"$/g, "");
  cleanPath = cleanPath.replace(/"/g, '\\"');
  return `"${cleanPath}"`;
}

/**
 * Executes a command and returns the result
 */
export async function executeCommand(
  command: string,
  args: string[],
  timeout: number = DEFAULT_TIMEOUT,
): Promise<CommandResult> {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, {
      shell: true,
      windowsVerbatimArguments: true,
    });

    let stdout = "";
    let stderr = "";
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    // Set timeout
    if (timeout > 0) {
      timeoutId = setTimeout(() => {
        process.kill("SIGTERM");
        reject(new TimeoutError(`Command timed out after ${timeout}ms`));
      }, timeout);
    }

    process.stdout?.on("data", (data: Buffer) => {
      stdout += data.toString();
    });

    process.stderr?.on("data", (data: Buffer) => {
      stderr += data.toString();
    });

    process.on("close", (code: number | null) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      if (code === 0) {
        resolve({
          success: true,
          stdout,
          stderr,
          exitCode: 0,
        });
      } else {
        reject(
          new SVNError(
            `Command failed with exit code ${code}`,
            code || 1,
            stderr,
            stdout,
          ),
        );
      }
    });

    process.on("error", (error: Error) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      reject(new SVNError(`Failed to execute command: ${error.message}`, 1));
    });
  });
}

/**
 * Executes TortoiseProc with given command and parameters
 */
export async function executeTortoiseProc(
  command: string,
  parameters: Record<string, string>,
  tortoiseOptions: TortoiseSVNOptions = {},
  timeout: number = DEFAULT_TIMEOUT,
): Promise<CommandResult> {
  const tortoiseCmd = getTortoiseProcCommand();
  if (!tortoiseCmd) {
    throw new SVNError(
      "TortoiseProc is only available on Windows. Use svn_* tools for command-line operations on other platforms.",
      1,
    );
  }

  const convertedParams = convertPathsToWindows(parameters);

  const args: string[] = ["/command:" + command];

  for (const [key, value] of Object.entries(convertedParams)) {
    if (value) {
      const keyLower = key.toLowerCase();
      let escapedValue: string;
      if (PATH_PARAM_NAMES.has(keyLower)) {
        escapedValue = escapePathArg(value);
      } else if (QUOTED_PARAM_NAMES.has(keyLower)) {
        escapedValue = escapePathArg(value);
      } else {
        escapedValue = escapeArg(value);
      }
      args.push(`/${key}:${escapedValue}`);
    }
  }

  args.push(...buildTortoiseOptions(tortoiseOptions));

  const fullCommand = `${tortoiseCmd} ${args.join(" ")}`;
  logCommand(
    `tortoise_${command}`,
    { parameters, tortoiseOptions },
    fullCommand,
  );

  return executeCommand(tortoiseCmd, args, timeout);
}

/**
 * Executes svn with given arguments
 */
export async function executeSVN(
  subcommand: string,
  args: string[],
  options: BaseSVNOptions = {},
  timeout: number = DEFAULT_TIMEOUT,
): Promise<CommandResult> {
  const svnCmd = getSVNCommand();
  const allArgs = [subcommand, ...buildCommonArgs(options), ...args];
  const fullCommand = `${svnCmd} ${allArgs.join(" ")}`;
  logCommand(`svn_${subcommand}`, { args, options }, fullCommand);
  return executeCommand(svnCmd, allArgs, timeout);
}

/**
 * Parses XML output from SVN commands
 */
export function parseSVNXml(xml: string): Record<string, unknown> {
  // Simple XML to object parser for SVN output
  const result: Record<string, unknown> = {};

  // Extract entry elements
  const entryRegex = /<entry([^>]*)>([\s\S]*?)<\/entry>/g;
  let match;

  while ((match = entryRegex.exec(xml)) !== null) {
    const attrs = match[1];
    const content = match[2];

    // Extract path from attributes
    const pathMatch = /path="([^"]*)"/.exec(attrs);
    if (pathMatch) {
      const path = pathMatch[1];
      const entryData: Record<string, unknown> = { path };

      // Parse child elements
      const childRegex = /<([^>]+)>([^<]*)<\/\1>/g;
      let childMatch;
      while ((childMatch = childRegex.exec(content)) !== null) {
        entryData[childMatch[1]] = childMatch[2];
      }

      if (!result.entries) {
        result.entries = [];
      }
      (result.entries as Record<string, unknown>[]).push(entryData);
    }
  }

  return result;
}

/**
 * Parses SVN status output
 */
export function parseStatusOutput(output: string): Array<{
  status: string;
  props: string;
  locked: string;
  history: string;
  switched: string;
  lockToken: string;
  path: string;
}> {
  const lines = output.trim().split("\n");
  const results = [];

  for (const line of lines) {
    if (line.length < 8) continue;

    // SVN status format: XXXXXXXXX path
    // Columns: status, props, locked, history, switched, lock token
    const status = line.charAt(0);
    const props = line.charAt(1);
    const locked = line.charAt(2);
    const history = line.charAt(3);
    const switched = line.charAt(4);
    const lockToken = line.charAt(5);
    const path = line.substring(7).trim();

    results.push({
      status,
      props,
      locked,
      history,
      switched,
      lockToken,
      path,
    });
  }

  return results;
}

/**
 * Parses SVN info output
 */
export function parseInfoOutput(output: string): Record<string, string> {
  const lines = output.trim().split("\n");
  const info: Record<string, string> = {};

  for (const line of lines) {
    const colonIndex = line.indexOf(":");
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();
      info[key] = value;
    }
  }

  return info;
}

/**
 * Validates that a path exists and is accessible
 */
export function validatePath(path: string): void {
  if (!path || typeof path !== "string") {
    throw new Error("Path must be a non-empty string");
  }
}

/**
 * Validates that a URL is valid
 */
export function validateUrl(url: string): void {
  if (!url || typeof url !== "string") {
    throw new Error("URL must be a non-empty string");
  }

  const validProtocols = [
    "http://",
    "https://",
    "svn://",
    "svn+ssh://",
    "file://",
  ];
  const hasValidProtocol = validProtocols.some((protocol) =>
    url.startsWith(protocol),
  );

  if (!hasValidProtocol) {
    throw new Error(`URL must start with one of: ${validProtocols.join(", ")}`);
  }
}
