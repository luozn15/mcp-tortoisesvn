import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { executeTortoiseProc } from '../../utils/command-helpers.js';
import { z } from 'zod';
import type { TortoiseSVNOptions } from '../../types/index.js';

const TortoiseAddOptionsSchema = z.object({
  path: z.string(),
  closeOnEnd: z.enum(['0', '1', '2', '3', '4', '5', '6', '7']).optional(),
});

export const tortoiseAddTool: Tool = {
  name: 'tortoise_add',
  description: '[TortoiseSVN GUI] Add files to version control',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Files or directory to add',
      },
      closeOnEnd: {
        type: 'string',
        enum: ['0', '1', '2', '3', '4', '5', '6', '7'],
        description: 'Auto-close dialog',
      },
    },
    required: ['path'],
  },
};

export async function handleTortoiseAdd(args: unknown): Promise<unknown> {
  const options = TortoiseAddOptionsSchema.parse(args);

  const params: Record<string, string> = {
    path: options.path,
  };

  const tortoiseOptions: TortoiseSVNOptions = {};

  if (options.closeOnEnd) {
    tortoiseOptions.closeOnEnd = options.closeOnEnd;
  }

  const result = await executeTortoiseProc('add', params, tortoiseOptions);

  return {
    success: result.success,
    message: 'Files added to version control',
    stdout: result.stdout,
  };
}
