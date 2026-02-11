import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { executeTortoiseProc } from '../../utils/command-helpers.js';
import type { TortoiseSVNOptions } from '../../types/index.js';
import { z } from 'zod';

const TortoiseRepoStatusOptionsSchema = z.object({
  path: z.string(),
  remote: z.boolean().optional(),
  closeOnEnd: z.enum(['0', '1', '2', '3', '4', '5', '6', '7']).optional(),
});

export const tortoiseRepoStatusTool: Tool = {
  name: 'tortoise_repostatus',
  description: '[TortoiseSVN GUI] Open check-for-modifications dialog',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Working copy directory',
      },
      remote: {
        type: 'boolean',
        description: 'Contact repository immediately on startup',
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

export async function handleTortoiseRepoStatus(args: unknown): Promise<unknown> {
  const options = TortoiseRepoStatusOptionsSchema.parse(args);
  
  const params: Record<string, string> = {
    path: options.path,
  };

  const tortoiseOptions: TortoiseSVNOptions = {};
  
  if (options.remote) {
    params.remote = '';
  }
  if (options.closeOnEnd) {
    tortoiseOptions.closeOnEnd = options.closeOnEnd;
  }

  const result = await executeTortoiseProc('repostatus', params, tortoiseOptions);

  return {
    success: result.success,
    message: 'Check-for-modifications dialog opened',
    stdout: result.stdout,
  };
}
