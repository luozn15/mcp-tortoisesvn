import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { executeTortoiseProc } from '../../utils/command-helpers.js';
import type { TortoiseSVNOptions } from '../../types/index.js';
import { z } from 'zod';

const TortoiseLockOptionsSchema = z.object({
  path: z.string(),
  closeOnEnd: z.enum(['0', '1', '2', '3', '4', '5', '6', '7']).optional(),
});

export const tortoiseLockTool: Tool = {
  name: 'tortoise_lock',
  description: '[TortoiseSVN GUI] Lock files (shows lock dialog for comment)',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'File or directory to lock',
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

export async function handleTortoiseLock(args: unknown): Promise<unknown> {
  const options = TortoiseLockOptionsSchema.parse(args);
  
  const params: Record<string, string> = {
    path: options.path,
  };

  const tortoiseOptions: TortoiseSVNOptions = {};
  
  if (options.closeOnEnd) {
    tortoiseOptions.closeOnEnd = options.closeOnEnd;
  }

  const result = await executeTortoiseProc('lock', params, tortoiseOptions);

  return {
    success: result.success,
    message: 'Lock dialog opened',
    stdout: result.stdout,
  };
}
