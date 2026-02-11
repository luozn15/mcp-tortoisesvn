import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { executeTortoiseProc } from '../../utils/command-helpers.js';
import type { TortoiseSVNOptions } from '../../types/index.js';
import { z } from 'zod';

const TortoiseRenameOptionsSchema = z.object({
  path: z.string(),
  noquestion: z.boolean().optional(),
  closeOnEnd: z.enum(['0', '1', '2', '3', '4', '5', '6', '7']).optional(),
});

export const tortoiseRenameTool: Tool = {
  name: 'tortoise_rename',
  description: '[TortoiseSVN GUI] Rename a file',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'File to rename',
      },
      noquestion: {
        type: 'boolean',
        description: 'Skip question about renaming similar files',
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

export async function handleTortoiseRename(args: unknown): Promise<unknown> {
  const options = TortoiseRenameOptionsSchema.parse(args);
  
  const params: Record<string, string> = {
    path: options.path,
  };

  const tortoiseOptions: TortoiseSVNOptions = {};
  
  if (options.noquestion) {
    params.noquestion = '';
  }
  if (options.closeOnEnd) {
    tortoiseOptions.closeOnEnd = options.closeOnEnd;
  }

  const result = await executeTortoiseProc('rename', params, tortoiseOptions);

  return {
    success: result.success,
    message: 'Rename dialog opened',
    stdout: result.stdout,
  };
}
