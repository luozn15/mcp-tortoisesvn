import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { executeTortoiseProc } from '../../utils/command-helpers.js';
import { z } from 'zod';

const TortoiseRebuildIconCacheOptionsSchema = z.object({
  noquestion: z.boolean().optional(),
});

export const tortoiseRebuildIconCacheTool: Tool = {
  name: 'tortoise_rebuildiconcache',
  description: '[TortoiseSVN GUI] Rebuild the Windows icon cache',
  inputSchema: {
    type: 'object',
    properties: {
      noquestion: {
        type: 'boolean',
        description: 'Suppress the confirmation message box',
      },
    },
  },
};

export async function handleTortoiseRebuildIconCache(args: unknown): Promise<unknown> {
  const options = TortoiseRebuildIconCacheOptionsSchema.parse(args);
  
  const params: Record<string, string> = {};

  if (options.noquestion) {
    params.noquestion = '';
  }

  const result = await executeTortoiseProc('rebuildiconcache', params);

  return {
    success: result.success,
    message: 'Icon cache rebuilt',
    stdout: result.stdout,
  };
}
