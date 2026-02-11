import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { executeTortoiseProc } from '../../utils/command-helpers.js';
import type { TortoiseSVNOptions } from '../../types/index.js';
import { z } from 'zod';

const TortoiseShowCompareOptionsSchema = z.object({
  url1: z.string(),
  url2: z.string(),
  revision1: z.object({ type: z.string(), value: z.union([z.number(), z.string()]).optional() }),
  revision2: z.object({ type: z.string(), value: z.union([z.number(), z.string()]).optional() }),
  pegrevision: z.object({ type: z.string(), value: z.union([z.number(), z.string()]).optional() }).optional(),
  ignoreancestry: z.boolean().optional(),
  blame: z.boolean().optional(),
  unified: z.boolean().optional(),
  ignoreprops: z.boolean().optional(),
  closeOnEnd: z.enum(['0', '1', '2', '3', '4', '5', '6', '7']).optional(),
});

export const tortoiseShowCompareTool: Tool = {
  name: 'tortoise_showcompare',
  description: '[TortoiseSVN GUI] Show unified diff or file list comparison',
  inputSchema: {
    type: 'object',
    properties: {
      url1: {
        type: 'string',
        description: 'First URL to compare',
      },
      url2: {
        type: 'string',
        description: 'Second URL to compare',
      },
      revision1: {
        type: 'object',
        description: 'First revision',
        properties: {
          type: { type: 'string', enum: ['number', 'head', 'base', 'committed', 'prev', 'date'] },
          value: { type: ['number', 'string'] },
        },
      },
      revision2: {
        type: 'object',
        description: 'Second revision',
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
      ignoreancestry: {
        type: 'boolean',
        description: 'Ignore ancestry',
      },
      blame: {
        type: 'boolean',
        description: 'Blame before comparing',
      },
      unified: {
        type: 'boolean',
        description: 'Show unified diff',
      },
      ignoreprops: {
        type: 'boolean',
        description: 'Ignore property modifications',
      },
      closeOnEnd: {
        type: 'string',
        enum: ['0', '1', '2', '3'],
        description: 'Auto-close dialog',
      },
    },
    required: ['url1', 'url2', 'revision1', 'revision2'],
  },
};

export async function handleTortoiseShowCompare(args: unknown): Promise<unknown> {
  const options = TortoiseShowCompareOptionsSchema.parse(args);
  
  const params: Record<string, string> = {
    url1: options.url1,
    url2: options.url2,
    revision1: String(options.revision1.value || options.revision1.type),
    revision2: String(options.revision2.value || options.revision2.type),
  };

  const tortoiseOptions: TortoiseSVNOptions = {};
  
  if (options.pegrevision) {
    params.pegrevision = String(options.pegrevision.value || options.pegrevision.type);
  }
  if (options.ignoreancestry) {
    params.ignoreancestry = '';
  }
  if (options.blame) {
    params.blame = '';
  }
  if (options.unified) {
    params.unified = '';
  }
  if (options.ignoreprops) {
    params.ignoreprops = '';
  }
  if (options.closeOnEnd) {
    tortoiseOptions.closeOnEnd = options.closeOnEnd;
  }

  const result = await executeTortoiseProc('showcompare', params, tortoiseOptions);

  return {
    success: result.success,
    message: 'Comparison viewer opened',
    stdout: result.stdout,
  };
}
