import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { executeTortoiseProc } from '../../utils/command-helpers.js';
import type { TortoiseSVNOptions } from '../../types/index.js';
import { z } from 'zod';

const TortoiseSyncOptionsSchema = z.object({
  path: z.string().optional(),
  askforpath: z.boolean().optional(),
  load: z.boolean().optional(),
  save: z.boolean().optional(),
  local: z.boolean().optional(),
  closeOnEnd: z.enum(['0', '1', '2', '3', '4', '5', '6', '7']).optional(),
});

export const tortoiseSyncTool: Tool = {
  name: 'tortoise_sync',
  description: '[TortoiseSVN GUI] Export/import settings',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Path to store/read settings from',
      },
      askforpath: {
        type: 'boolean',
        description: 'Show file dialog for user to chose path',
      },
      load: {
        type: 'boolean',
        description: 'Import settings from file',
      },
      save: {
        type: 'boolean',
        description: 'Export current settings to file',
      },
      local: {
        type: 'boolean',
        description: 'Include local settings in export',
      },
      closeOnEnd: {
        type: 'string',
        enum: ['0', '1', '2', '3'],
        description: 'Auto-close dialog',
      },
    },
  },
};

export async function handleTortoiseSync(args: unknown): Promise<unknown> {
  const options = TortoiseSyncOptionsSchema.parse(args);
  
  const params: Record<string, string> = {};

  const tortoiseOptions: TortoiseSVNOptions = {};
  
  if (options.path) {
    params.path = options.path;
  }
  if (options.askforpath) {
    params.askforpath = '';
  }
  if (options.load) {
    params.load = '';
  }
  if (options.save) {
    params.save = '';
  }
  if (options.local) {
    params.local = '';
  }
  if (options.closeOnEnd) {
    tortoiseOptions.closeOnEnd = options.closeOnEnd;
  }

  const result = await executeTortoiseProc('sync', params, tortoiseOptions);

  return {
    success: result.success,
    message: 'Settings sync dialog opened',
    stdout: result.stdout,
  };
}
