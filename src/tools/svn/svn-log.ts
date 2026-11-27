import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { LogOptionsSchema, type LogOptions } from '../../types/index.js';
import { executeSVN, buildRevisionArg, toPathArray } from '../../utils/command-helpers.js';
import { buildQueryResult, parseLogXml } from '../../utils/svn-xml.js';

export const logTool: Tool = {
  name: 'svn_log',
  description: 'Show the log messages for a set of revision(s) and/or path(s)',
  inputSchema: {
    type: 'object',
    properties: {
      includeRaw: {
        type: 'boolean',
        description: 'Include raw XML stdout in addition to structured entries; omitted by default',
      },
      paths: {
        oneOf: [
          { type: 'string' },
          { type: 'array', items: { type: 'string' } },
        ],
        description: 'Paths to show log for',
      },
      revisionRange: {
        type: 'object',
        description: 'Revision range to show log for; both start and end are required',
        required: ['start', 'end'],
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
        type: 'integer',
        minimum: 1,
        default: 30,
        description: 'Maximum number of log entries to show; defaults to 30',
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
        description: 'Include raw XML stdout; alias for includeRaw',
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
    svnArgs.push('--', ...paths);
  }

  const result = await executeSVN('log', svnArgs, options);

  return buildQueryResult(
    result,
    parseLogXml(result.stdout),
    options.includeRaw || options.xml,
  );
}
