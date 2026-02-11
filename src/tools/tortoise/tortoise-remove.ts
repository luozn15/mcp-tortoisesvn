import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { executeTortoiseProc } from '../../utils/command-helpers.js';
import type { TortoiseSVNOptions } from '../../types/index.js';
import { z } from 'zod';

const TortoiseRemoveOptionsSchema = z.object({
  path: z.string(),
  closeOnEnd: z.enum(['0', '1', '2', '3', '4', '5', '6', '7']).optional(),
});

export const tortoiseRemoveTool: Tool = {
  name: 'tortoise_remove',
  description: '[TortoiseSVN GUI] Remove files from version control',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Files to remove',
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

export async function handleTortoiseRemove(args: unknown): Promise<unknown> {
  const options = TortoiseRemoveOptionsSchema.parse(args);
  
  const params: Record<string, string> = {
    path: options.path,
  };

  const tortoiseOptions: TortoiseSVNOptions = {};
  
  if (options.closeOnEnd) {
    tortoiseOptions.closeOnEnd = options.closeOnEnd;
  }

  const result = await executeTortoiseProc('remove', params, tortoiseOptions);

  return {
    success: result.success,
    message: 'Files removed from version control',
    stdout: result.stdout,
  };
}
