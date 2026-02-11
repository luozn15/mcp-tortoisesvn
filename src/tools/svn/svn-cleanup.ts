import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { CleanupOptionsSchema, type CleanupOptions } from '../../types/index.js';
import { executeSVN, toPathArray } from '../../utils/command-helpers.js';

export const cleanupTool: Tool = {
  name: 'svn_cleanup',
  description: 'Either recover from an interrupted operation that left the working copy locked, or remove unwanted files',
  inputSchema: {
    type: 'object',
    properties: {
      paths: {
        oneOf: [
          { type: 'string' },
          { type: 'array', items: { type: 'string' } },
        ],
        description: 'Working copy paths to cleanup',
      },
      removeUnversioned: {
        type: 'boolean',
        description: 'Remove unversioned files and directories',
      },
      removeIgnored: {
        type: 'boolean',
        description: 'Remove ignored files and directories',
      },
      includeExternals: {
        type: 'boolean',
        description: 'Process externals definitions',
      },
      vacuumPristines: {
        type: 'boolean',
        description: 'Remove unreferenced pristines from .svn directory',
      },
      username: { type: 'string' },
      password: { type: 'string' },
      noAuthCache: { type: 'boolean' },
      nonInteractive: { type: 'boolean' },
      trustServerCert: { type: 'boolean' },
    },
    required: ['paths'],
  },
};

export async function handleCleanup(args: unknown): Promise<unknown> {
  const options: CleanupOptions = CleanupOptionsSchema.parse(args);
  
  const svnArgs: string[] = [];
  
  if (options.removeUnversioned) {
    svnArgs.push('--remove-unversioned');
  }
  if (options.removeIgnored) {
    svnArgs.push('--remove-ignored');
  }
  if (options.includeExternals) {
    svnArgs.push('--include-externals');
  }
  if (options.vacuumPristines) {
    svnArgs.push('--vacuum-pristines');
  }

  const paths = toPathArray(options.paths);
  svnArgs.push(...paths);

  const result = await executeSVN('cleanup', svnArgs, options);

  return {
    success: result.success,
    message: 'Cleanup completed successfully',
    stdout: result.stdout,
  };
}
