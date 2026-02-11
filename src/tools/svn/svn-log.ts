import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { LogOptionsSchema, type LogOptions } from '../../types/index.js';
import { executeSVN, buildRevisionArg, toPathArray } from '../../utils/command-helpers.js';

export const logTool: Tool = {
  name: 'svn_log',
  description: 'Show the log messages for a set of revision(s) and/or path(s)',
  inputSchema: {
    type: 'object',
    properties: {
      paths: {
        oneOf: [
          { type: 'string' },
          { type: 'array', items: { type: 'string' } },
        ],
        description: 'Paths to show log for',
      },
      revisionRange: {
        type: 'object',
        description: 'Revision range to show log for',
        properties: {
          start: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['number', 'head', 'base', 'committed', 'prev', 'date'] },
              value: { type: ['number', 'string'] },
            },
          },
          end: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['number', 'head', 'base', 'committed', 'prev', 'date'] },
              value: { type: ['number', 'string'] },
            },
          },
        },
      },
      limit: {
        type: 'number',
        description: 'Maximum number of log entries to show',
      },
      verbose: {
        type: 'boolean',
        description: 'Print affected paths',
      },
      useMergeHistory: {
        type: 'boolean',
        description: 'Include merge history in log',
      },
      stopOnCopy: {
        type: 'boolean',
        description: 'Do not cross copies while traversing history',
      },
      incremental: {
        type: 'boolean',
        description: 'Print output in incremental format',
      },
      xml: {
        type: 'boolean',
        description: 'Output in XML format',
      },
      username: { type: 'string' },
      password: { type: 'string' },
      noAuthCache: { type: 'boolean' },
      nonInteractive: { type: 'boolean' },
      trustServerCert: { type: 'boolean' },
    },
  },
};

export async function handleLog(args: unknown): Promise<unknown> {
  const options: LogOptions = LogOptionsSchema.parse(args);
  
  const svnArgs: string[] = ['--xml'];
  
  if (options.revisionRange) {
    const startRev = buildRevisionArg(options.revisionRange.start);
    const endRev = buildRevisionArg(options.revisionRange.end);
    svnArgs.push('-r', `${startRev}:${endRev}`);
  }
  if (options.limit !== undefined) {
    svnArgs.push('-l', String(options.limit));
  }
  if (options.verbose) {
    svnArgs.push('-v');
  }
  if (options.useMergeHistory) {
    svnArgs.push('-g');
  }
  if (options.stopOnCopy) {
    svnArgs.push('--stop-on-copy');
  }
  if (options.incremental) {
    svnArgs.push('--incremental');
  }

  if (options.paths) {
    const paths = toPathArray(options.paths);
    svnArgs.push(...paths);
  }

  const result = await executeSVN('log', svnArgs, options);

  return {
    success: result.success,
    stdout: result.stdout,
    entries: parseLogXml(result.stdout),
  };
}

function parseLogXml(xml: string): Array<{
  revision: number;
  author: string;
  date: string;
  message: string;
  paths?: Array<{ action: string; path: string }>;
}> {
  const entries = [];
  const entryRegex = /<logentry[^>]*revision="(\d+)"[^>]*>([\s\S]*?)<\/logentry>/g;
  let match;

  while ((match = entryRegex.exec(xml)) !== null) {
    const revision = parseInt(match[1], 10);
    const entryContent = match[2];

    const authorMatch = /<author>([^<]*)<\/author>/g.exec(entryContent);
    const dateMatch = /<date>([^<]*)<\/date>/g.exec(entryContent);
    const msgMatch = /<msg>([\s\S]*?)<\/msg>/g.exec(entryContent);

    const entry: {
      revision: number;
      author: string;
      date: string;
      message: string;
      paths?: Array<{ action: string; path: string }>;
    } = {
      revision,
      author: authorMatch ? authorMatch[1] : '',
      date: dateMatch ? dateMatch[1] : '',
      message: msgMatch ? msgMatch[1].trim() : '',
    };

    // Parse changed paths if present
    const pathsMatch = /<paths>([\s\S]*?)<\/paths>/g.exec(entryContent);
    if (pathsMatch) {
      const pathsContent = pathsMatch[1];
      const pathRegex = /<path[^>]*action="([^"]*)"[^>]*>([^<]*)<\/path>/g;
      const paths = [];
      let pathMatch;
      while ((pathMatch = pathRegex.exec(pathsContent)) !== null) {
        paths.push({
          action: pathMatch[1],
          path: pathMatch[2],
        });
      }
      entry.paths = paths;
    }

    entries.push(entry);
  }

  return entries.reverse(); // Return oldest first
}
