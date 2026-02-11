import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { executeTortoiseProc } from '../../utils/command-helpers.js';
import type { TortoiseSVNOptions } from '../../types/index.js';
import { z } from 'zod';

const TortoiseResolveOptionsSchema = z.object({
  path: z.string(),
  noquestion: z.boolean().optional(),
  closeOnEnd: z.enum(['0', '1', '2', '3', '4', '5', '6', '7']).optional(),
});

export const tortoiseResolveTool: Tool = {
  name: 'tortoise_resolve',
  description: '[TortoiseSVN GUI] Mark conflicted file as resolved',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Conflicted file path',
      },
      noquestion: {
        type: 'boolean',
        description: 'Resolve without asking user first',
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

export async function handleTortoiseResolve(args: unknown): Promise<unknown> {
  const options = TortoiseResolveOptionsSchema.parse(args);
  
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

  const result = await executeTortoiseProc('resolve', params, tortoiseOptions);

  return {
    success: result.success,
    message: 'File marked as resolved',
    stdout: result.stdout,
  };
}
