import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { DiffOptionsSchema, type DiffOptions } from '../../types/index.js';
import { executeSVN, buildRevisionArg, toPathArray } from '../../utils/command-helpers.js';

export const diffTool: Tool = {
  name: 'svn_diff',
  description: 'Display the differences between two revisions or paths',
  inputSchema: {
    type: 'object',
    properties: {
      paths: {
        oneOf: [
          { type: 'string' },
          { type: 'array', items: { type: 'string' } },
        ],
        description: 'Working copy paths to compare',
      },
      revisionRange: {
        type: 'object',
        description: 'Revision range to compare',
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
      depth: {
        type: 'string',
        enum: ['empty', 'files', 'immediates', 'infinity'],
        description: 'Limit operation by depth',
      },
      force: {
        type: 'boolean',
        description: 'Force operation to run',
      },
      useAncestry: {
        type: 'boolean',
        description: 'Use ancestry when calculating differences',
      },
      noticeAncestry: {
        type: 'boolean',
        description: 'Notice ancestry when calculating differences',
      },
      showCopiesAsAdds: {
        type: 'boolean',
        description: 'Show copied files as added',
      },
      git: {
        type: 'boolean',
        description: 'Use git extended diff format',
      },
      username: { type: 'string' },
      password: { type: 'string' },
      noAuthCache: { type: 'boolean' },
      nonInteractive: { type: 'boolean' },
      trustServerCert: { type: 'boolean' },
    },
  },
};

export async function handleDiff(args: unknown): Promise<unknown> {
  const options: DiffOptions = DiffOptionsSchema.parse(args);
  
  const svnArgs: string[] = [];
  
  if (options.revisionRange) {
    const startRev = buildRevisionArg(options.revisionRange.start);
    const endRev = buildRevisionArg(options.revisionRange.end);
    svnArgs.push('-r', `${startRev}:${endRev}`);
  }
  if (options.depth) {
    svnArgs.push('--depth', options.depth);
  }
  if (options.force) {
    svnArgs.push('--force');
  }
  if (options.useAncestry !== undefined) {
    svnArgs.push(options.useAncestry ? '--use-ancestry' : '--ignore-ancestry');
  }
  if (options.noticeAncestry !== undefined) {
    svnArgs.push(options.noticeAncestry ? '--notice-ancestry' : '--ignore-ancestry');
  }
  if (options.showCopiesAsAdds) {
    svnArgs.push('--show-copies-as-adds');
  }
  if (options.git) {
    svnArgs.push('--git');
  }

  if (options.paths) {
    const paths = toPathArray(options.paths);
    svnArgs.push(...paths);
  }

  const result = await executeSVN('diff', svnArgs, options);

  return {
    success: result.success,
    stdout: result.stdout,
  };
}
