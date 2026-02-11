import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { RelocateOptionsSchema, type RelocateOptions } from '../../types/index.js';
import { executeSVN, validateUrl } from '../../utils/command-helpers.js';

export const relocateTool: Tool = {
  name: 'svn_relocate',
  description: 'Relocate the working copy to point to a different repository root URL',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Working copy path to relocate',
      },
      from: {
        type: 'string',
        description: 'Current repository root URL (if not specified, will be detected)',
      },
      to: {
        type: 'string',
        description: 'New repository root URL',
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
    required: ['path', 'to'],
  },
};

export async function handleRelocate(args: unknown): Promise<unknown> {
  const options: RelocateOptions = RelocateOptionsSchema.parse(args);
  
  validateUrl(options.to);
  if (options.from) {
    validateUrl(options.from);
  }
  
  const svnArgs: string[] = [];
  
  if (options.ignoreExternals) {
    svnArgs.push('--ignore-externals');
  }

  svnArgs.push(options.path);
  
  if (options.from) {
    svnArgs.push(options.from);
  }
  svnArgs.push(options.to);

  const result = await executeSVN('relocate', svnArgs, options);

  return {
    success: result.success,
    message: 'Working copy relocated successfully',
    stdout: result.stdout,
  };
}
