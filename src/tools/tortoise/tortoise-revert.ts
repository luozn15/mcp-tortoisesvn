import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { executeTortoiseProc } from '../../utils/command-helpers.js';
import type { TortoiseSVNOptions } from '../../types/index.js';
import { z } from 'zod';

const TortoiseRevertOptionsSchema = z.object({
  path: z.string(),
  closeOnEnd: z.enum(['0', '1', '2', '3', '4', '5', '6', '7']).optional(),
});

export const tortoiseRevertTool: Tool = {
  name: 'tortoise_revert',
  description: '[TortoiseSVN GUI] Revert local modifications',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Items to revert',
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

export async function handleTortoiseRevert(args: unknown): Promise<unknown> {
  const options = TortoiseRevertOptionsSchema.parse(args);
  
  const params: Record<string, string> = {
    path: options.path,
  };

  const tortoiseOptions: TortoiseSVNOptions = {};
  
  if (options.closeOnEnd) {
    tortoiseOptions.closeOnEnd = options.closeOnEnd;
  }

  const result = await executeTortoiseProc('revert', params, tortoiseOptions);

  return {
    success: result.success,
    message: 'Revert completed',
    stdout: result.stdout,
  };
}
