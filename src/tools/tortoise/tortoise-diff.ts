import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { executeTortoiseProc } from '../../utils/command-helpers.js';
import type { TortoiseSVNOptions } from '../../types/index.js';
import { z } from 'zod';

const TortoiseDiffOptionsSchema = z.object({
  path: z.string(),
  path2: z.string().optional(),
  startrev: z.object({ type: z.string(), value: z.union([z.number(), z.string()]).optional() }).optional(),
  endrev: z.object({ type: z.string(), value: z.union([z.number(), z.string()]).optional() }).optional(),
  pegrevision: z.object({ type: z.string(), value: z.union([z.number(), z.string()]).optional() }).optional(),
  ignoreprops: z.boolean().optional(),
  blame: z.boolean().optional(),
  line: z.number().optional(),
  closeOnEnd: z.enum(['0', '1', '2', '3', '4', '5', '6', '7']).optional(),
});

export const tortoiseDiffTool: Tool = {
  name: 'tortoise_diff',
  description: '[TortoiseSVN GUI] Launch external diff program',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'First file to compare',
      },
      path2: {
        type: 'string',
        description: 'Second file to compare (optional, defaults to BASE)',
      },
      startrev: {
        type: 'object',
        description: 'Start revision',
        properties: {
          type: { type: 'string', enum: ['number', 'head', 'base', 'committed', 'prev', 'date'] },
          value: { type: ['number', 'string'] },
        },
      },
      endrev: {
        type: 'object',
        description: 'End revision',
        properties: {
          type: { type: 'string', enum: ['number', 'head', 'base', 'committed', 'prev', 'date'] },
          value: { type: ['number', 'string'] },
        },
      },
      pegrevision: {
        type: 'object',
        description: 'Peg revision',
        properties: {
          type: { type: 'string', enum: ['number', 'head', 'base', 'committed', 'prev', 'date'] },
          value: { type: ['number', 'string'] },
        },
      },
      ignoreprops: {
        type: 'boolean',
        description: 'Ignore property modifications',
      },
      blame: {
        type: 'boolean',
        description: 'Blame files before diffing',
      },
      line: {
        type: 'number',
        description: 'Line number to jump to',
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

export async function handleTortoiseDiff(args: unknown): Promise<unknown> {
  const options = TortoiseDiffOptionsSchema.parse(args);
  
  const params: Record<string, string> = {
    path: options.path,
  };

  const tortoiseOptions: TortoiseSVNOptions = {};
  
  if (options.path2) {
    params.path2 = options.path2;
  }
  if (options.startrev) {
    params.startrev = String(options.startrev.value || options.startrev.type);
  }
  if (options.endrev) {
    params.endrev = String(options.endrev.value || options.endrev.type);
  }
  if (options.pegrevision) {
    params.pegrevision = String(options.pegrevision.value || options.pegrevision.type);
  }
  if (options.ignoreprops) {
    params.ignoreprops = '';
  }
  if (options.blame) {
    params.blame = '';
  }
  if (options.line !== undefined) {
    params.line = String(options.line);
  }
  if (options.closeOnEnd) {
    tortoiseOptions.closeOnEnd = options.closeOnEnd;
  }

  const result = await executeTortoiseProc('diff', params, tortoiseOptions);

  return {
    success: result.success,
    message: 'Diff viewer opened',
    stdout: result.stdout,
  };
}
