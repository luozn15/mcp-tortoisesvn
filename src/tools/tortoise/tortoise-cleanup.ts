import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { executeTortoiseProc } from '../../utils/command-helpers.js';
import type { TortoiseSVNOptions } from '../../types/index.js';
import { z } from 'zod';

const TortoiseCleanupOptionsSchema = z.object({
  path: z.string(),
  noui: z.boolean().optional(),
  noprogressui: z.boolean().optional(),
  nodlg: z.boolean().optional(),
  cleanup: z.boolean().optional(),
  revert: z.boolean().optional(),
  delunversioned: z.boolean().optional(),
  delignored: z.boolean().optional(),
  refreshshell: z.boolean().optional(),
  externals: z.boolean().optional(),
  closeOnEnd: z.enum(['0', '1', '2', '3', '4', '5', '6', '7']).optional(),
});

export const tortoiseCleanupTool: Tool = {
  name: 'tortoise_cleanup',
  description: '[TortoiseSVN GUI] Clean up working copy',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Working copy path to cleanup',
      },
      noui: {
        type: 'boolean',
        description: 'Prevent result dialog from popping up',
      },
      noprogressui: {
        type: 'boolean',
        description: 'Disable progress dialog',
      },
      nodlg: {
        type: 'boolean',
        description: 'Disable cleanup dialog (use default options)',
      },
      cleanup: {
        type: 'boolean',
        description: 'Perform status cleanup',
      },
      revert: {
        type: 'boolean',
        description: 'Revert changes',
      },
      delunversioned: {
        type: 'boolean',
        description: 'Delete unversioned files',
      },
      delignored: {
        type: 'boolean',
        description: 'Delete ignored files',
      },
      refreshshell: {
        type: 'boolean',
        description: 'Refresh shell icons',
      },
      externals: {
        type: 'boolean',
        description: 'Include externals',
      },
      closeOnEnd: {
        type: 'string',
        enum: ['0', '1', '2', '3'],
        description: 'Auto-close dialog',
      },
    },
    required: ['path'],
  },
};

export async function handleTortoiseCleanup(args: unknown): Promise<unknown> {
  const options = TortoiseCleanupOptionsSchema.parse(args);
  
  const params: Record<string, string> = {
    path: options.path,
  };

  const tortoiseOptions: TortoiseSVNOptions = {};
  
  if (options.noui) {
    params.noui = '';
  }
  if (options.noprogressui) {
    params.noprogressui = '';
  }
  if (options.nodlg) {
    params.nodlg = '';
  }
  if (options.cleanup) {
    params.cleanup = '';
  }
  if (options.revert) {
    params.revert = '';
  }
  if (options.delunversioned) {
    params.delunversioned = '';
  }
  if (options.delignored) {
    params.delignored = '';
  }
  if (options.refreshshell) {
    params.refreshshell = '';
  }
  if (options.externals) {
    params.externals = '';
  }
  if (options.closeOnEnd) {
    tortoiseOptions.closeOnEnd = options.closeOnEnd;
  }

  const result = await executeTortoiseProc('cleanup', params, tortoiseOptions);

  return {
    success: result.success,
    message: 'Cleanup completed',
    stdout: result.stdout,
  };
}
