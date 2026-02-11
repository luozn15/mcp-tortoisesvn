import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { executeTortoiseProc } from '../../utils/command-helpers.js';
import type { TortoiseSVNOptions } from '../../types/index.js';
import { z } from 'zod';

const TortoiseCreatePatchOptionsSchema = z.object({
  path: z.string(),
  savepath: z.string().optional(),
  noview: z.boolean().optional(),
  closeOnEnd: z.enum(['0', '1', '2', '3', '4', '5', '6', '7']).optional(),
});

export const tortoiseCreatePatchTool: Tool = {
  name: 'tortoise_createpatch',
  description: '[TortoiseSVN GUI] Create a patch file',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Path to create patch from',
      },
      savepath: {
        type: 'string',
        description: 'Path to save patch file (skips Save-As dialog)',
      },
      noview: {
        type: 'boolean',
        description: 'Do not show unified diff viewer after creation',
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

export async function handleTortoiseCreatePatch(args: unknown): Promise<unknown> {
  const options = TortoiseCreatePatchOptionsSchema.parse(args);
  
  const params: Record<string, string> = {
    path: options.path,
  };

  const tortoiseOptions: TortoiseSVNOptions = {};
  
  if (options.savepath) {
    params.savepath = options.savepath;
  }
  if (options.noview) {
    params.noview = '';
  }
  if (options.closeOnEnd) {
    tortoiseOptions.closeOnEnd = options.closeOnEnd;
  }

  const result = await executeTortoiseProc('createpatch', params, tortoiseOptions);

  return {
    success: result.success,
    message: 'Patch file created',
    stdout: result.stdout,
  };
}
