import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { executeTortoiseProc } from '../../utils/command-helpers.js';
import type { TortoiseSVNOptions } from '../../types/index.js';
import { z } from 'zod';

const TortoiseUnlockOptionsSchema = z.object({
  path: z.string(),
  closeOnEnd: z.enum(['0', '1', '2', '3', '4', '5', '6', '7']).optional(),
});

export const tortoiseUnlockTool: Tool = {
  name: 'tortoise_unlock',
  description: '[TortoiseSVN GUI] Unlock files',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'File or directory to unlock',
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

export async function handleTortoiseUnlock(args: unknown): Promise<unknown> {
  const options = TortoiseUnlockOptionsSchema.parse(args);
  
  const params: Record<string, string> = {
    path: options.path,
  };

  const tortoiseOptions: TortoiseSVNOptions = {};
  
  if (options.closeOnEnd) {
    tortoiseOptions.closeOnEnd = options.closeOnEnd;
  }

  const result = await executeTortoiseProc('unlock', params, tortoiseOptions);

  return {
    success: result.success,
    message: 'Unlock completed',
    stdout: result.stdout,
  };
}
