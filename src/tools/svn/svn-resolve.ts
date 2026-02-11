import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ResolveOptionsSchema, type ResolveOptions } from '../../types/index.js';
import { executeSVN, toPathArray } from '../../utils/command-helpers.js';

export const resolveTool: Tool = {
  name: 'svn_resolve',
  description: 'Resolve conflicts on working copy files or directories',
  inputSchema: {
    type: 'object',
    properties: {
      paths: {
        oneOf: [
          { type: 'string' },
          { type: 'array', items: { type: 'string' } },
        ],
        description: 'Paths to resolve conflicts on',
      },
      accept: {
        type: 'string',
        enum: ['working', 'base', 'mine-conflict', 'theirs-conflict', 'mine-full', 'theirs-full', 'edit', 'launch'],
        description: 'Specify automatic conflict resolution action',
      },
      depth: {
        type: 'string',
        enum: ['empty', 'files', 'immediates', 'infinity'],
        description: 'Limit operation by depth',
      },
      username: { type: 'string' },
      password: { type: 'string' },
      noAuthCache: { type: 'boolean' },
      nonInteractive: { type: 'boolean' },
      trustServerCert: { type: 'boolean' },
    },
    required: ['paths', 'accept'],
  },
};

export async function handleResolve(args: unknown): Promise<unknown> {
  const options: ResolveOptions = ResolveOptionsSchema.parse(args);
  
  const svnArgs: string[] = [];
  
  svnArgs.push('--accept', options.accept);
  
  if (options.depth) {
    svnArgs.push('--depth', options.depth);
  }

  const paths = toPathArray(options.paths);
  svnArgs.push(...paths);

  const result = await executeSVN('resolve', svnArgs, options);

  return {
    success: result.success,
    message: 'Conflicts resolved successfully',
    stdout: result.stdout,
  };
}
