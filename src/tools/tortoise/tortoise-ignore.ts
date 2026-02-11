import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { executeTortoiseProc } from '../../utils/command-helpers.js';
import type { TortoiseSVNOptions } from '../../types/index.js';
import { z } from 'zod';

const TortoiseIgnoreOptionsSchema = z.object({
  path: z.string(),
  closeOnEnd: z.enum(['0', '1', '2', '3', '4', '5', '6', '7']).optional(),
});

export const tortoiseIgnoreTool: Tool = {
  name: 'tortoise_ignore',
  description: '[TortoiseSVN GUI] Add files to the ignore list',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Files or directories to ignore',
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

export async function handleTortoiseIgnore(args: unknown): Promise<unknown> {
  const options = TortoiseIgnoreOptionsSchema.parse(args);
  
  const params: Record<string, string> = {
    path: options.path,
  };

  const tortoiseOptions: TortoiseSVNOptions = {};
  
  if (options.closeOnEnd) {
    tortoiseOptions.closeOnEnd = options.closeOnEnd;
  }

  const result = await executeTortoiseProc('ignore', params, tortoiseOptions);

  return {
    success: result.success,
    message: 'Files added to ignore list',
    stdout: result.stdout,
  };
}
