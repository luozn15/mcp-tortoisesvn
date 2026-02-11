import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { executeTortoiseProc } from '../../utils/command-helpers.js';
import type { TortoiseSVNOptions } from '../../types/index.js';
import { z } from 'zod';

const TortoiseMergeOptionsSchema = z.object({
  path: z.string(),
  fromurl: z.string().optional(),
  tourl: z.string().optional(),
  revrange: z.string().optional(),
  fromrev: z.object({ type: z.string(), value: z.union([z.number(), z.string()]).optional() }).optional(),
  torev: z.object({ type: z.string(), value: z.union([z.number(), z.string()]).optional() }).optional(),
  closeOnEnd: z.enum(['0', '1', '2', '3', '4', '5', '6', '7']).optional(),
});

export const tortoiseMergeTool: Tool = {
  name: 'tortoise_merge',
  description: '[TortoiseSVN GUI] Open the merge dialog',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Target working copy directory',
      },
      fromurl: {
        type: 'string',
        description: 'Source URL to merge from',
      },
      tourl: {
        type: 'string',
        description: 'Target URL (for two-tree merge)',
      },
      revrange: {
        type: 'string',
        description: 'Revision range to merge (e.g., "1-10")',
      },
      fromrev: {
        type: 'object',
        description: 'From revision (for two-tree merge)',
        properties: {
          type: { type: 'string', enum: ['number', 'head', 'base', 'committed', 'prev', 'date'] },
          value: { type: ['number', 'string'] },
        },
      },
      torev: {
        type: 'object',
        description: 'To revision (for two-tree merge)',
        properties: {
          type: { type: 'string', enum: ['number', 'head', 'base', 'committed', 'prev', 'date'] },
          value: { type: ['number', 'string'] },
        },
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

export async function handleTortoiseMerge(args: unknown): Promise<unknown> {
  const options = TortoiseMergeOptionsSchema.parse(args);
  
  const params: Record<string, string> = {
    path: options.path,
  };

  const tortoiseOptions: TortoiseSVNOptions = {};
  
  if (options.fromurl) {
    params.fromurl = options.fromurl;
  }
  if (options.tourl) {
    params.tourl = options.tourl;
  }
  if (options.revrange) {
    params.revrange = options.revrange;
  }
  if (options.fromrev) {
    params.fromrev = String(options.fromrev.value || options.fromrev.type);
  }
  if (options.torev) {
    params.torev = String(options.torev.value || options.torev.type);
  }
  if (options.closeOnEnd) {
    tortoiseOptions.closeOnEnd = options.closeOnEnd;
  }

  const result = await executeTortoiseProc('merge', params, tortoiseOptions);

  return {
    success: result.success,
    message: 'Merge dialog opened',
    stdout: result.stdout,
  };
}
