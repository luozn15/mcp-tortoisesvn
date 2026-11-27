import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { StatusOptionsSchema, type StatusOptions } from '../../types/index.js';
import { executeSVN, buildRevisionArg, toPathArray } from '../../utils/command-helpers.js';
import { buildQueryResult, parseStatusResultXml } from '../../utils/svn-xml.js';

export const statusTool: Tool = {
  name: 'svn_status',
  description: 'Print the status of working copy files and directories',
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
        description: 'Working copy paths to check status',
      },
      revision: {
        type: 'object',
        description: 'Show status against specified revision',
        properties: {
          type: { type: 'string', enum: ['number', 'head', 'base', 'committed', 'prev', 'date'] },
          value: { type: ['number', 'string'] },
        },
      },
      depth: {
        type: 'string',
        enum: ['empty', 'files', 'immediates', 'infinity'],
        description: 'Limit operation by depth',
      },
      verbose: {
        type: 'boolean',
        description: 'Print extra information',
      },
      showUpdates: {
        type: 'boolean',
        description: 'Display update information',
      },
      quiet: {
        type: 'boolean',
        description: 'Print only summary information',
      },
      noIgnore: {
        type: 'boolean',
        description: 'Disregard default and svn:ignore ignores',
      },
      ignoreExternals: {
        type: 'boolean',
        description: 'Ignore externals definitions',
      },
      username: { type: 'string' },
      password: { type: 'string' },
      noAuthCache: { type: 'boolean' },
      nonInteractive: { type: 'boolean' },
      trustServerCert: { type: 'boolean' },
    },
  },
};

export async function handleStatus(args: unknown): Promise<unknown> {
  const options: StatusOptions = StatusOptionsSchema.parse(args);
  
  const svnArgs: string[] = ['--xml'];
  
  if (options.revision) {
    svnArgs.push('-r', buildRevisionArg(options.revision));
  }
  if (options.depth) {
    svnArgs.push('--depth', options.depth);
  }
  if (options.verbose) {
    svnArgs.push('-v');
  }
  if (options.showUpdates) {
    svnArgs.push('-u');
  }
  if (options.quiet) {
    svnArgs.push('-q');
  }
  if (options.noIgnore) {
    svnArgs.push('--no-ignore');
  }
  if (options.ignoreExternals) {
    svnArgs.push('--ignore-externals');
  }

  if (options.paths) {
    const paths = toPathArray(options.paths);
    svnArgs.push('--', ...paths);
  }

  const result = await executeSVN('status', svnArgs, options);

  const status = parseStatusResultXml(result.stdout);
  return {
    ...buildQueryResult(result, status.entries, options.includeRaw),
    ...(options.showUpdates ? { targets: status.targets } : {}),
  };
}
