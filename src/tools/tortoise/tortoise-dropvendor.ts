import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { executeTortoiseProc } from '../../utils/command-helpers.js';
import type { TortoiseSVNOptions } from '../../types/index.js';
import { z } from 'zod';

const TortoiseDropVendorOptionsSchema = z.object({
  path: z.string(),
  droptarget: z.string(),
  closeOnEnd: z.enum(['0', '1', '2', '3', '4', '5', '6', '7']).optional(),
});

export const tortoiseDropVendorTool: Tool = {
  name: 'tortoise_dropvendor',
  description: '[TortoiseSVN GUI] Vendor branch operation - copy folder and update target',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Source folder to copy',
      },
      droptarget: {
        type: 'string',
        description: 'Target directory in working copy',
      },
      closeOnEnd: {
        type: 'string',
        enum: ['0', '1', '2', '3'],
        description: 'Auto-close dialog',
      },
    },
    required: ['path', 'droptarget'],
  },
};

export async function handleTortoiseDropVendor(args: unknown): Promise<unknown> {
  const options = TortoiseDropVendorOptionsSchema.parse(args);
  
  const params: Record<string, string> = {
    path: options.path,
    droptarget: options.droptarget,
  };

  const tortoiseOptions: TortoiseSVNOptions = {};
  
  if (options.closeOnEnd) {
    tortoiseOptions.closeOnEnd = options.closeOnEnd;
  }

  const result = await executeTortoiseProc('dropvendor', params, tortoiseOptions);

  return {
    success: result.success,
    message: 'Vendor drop completed',
    stdout: result.stdout,
  };
}
