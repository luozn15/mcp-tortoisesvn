import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { executeTortoiseProc, buildRevisionArg } from '../../utils/command-helpers.js';
import { z } from 'zod';
import { RevisionSchema } from '../../types/index.js';
import type { TortoiseSVNOptions, Revision } from '../../types/index.js';

const TortoiseUpdateOptionsSchema = z.object({
  path: z.string(),
  rev: z.union([RevisionSchema, z.literal('ask')]).optional(),
  nonRecursive: z.boolean().optional(),
  ignoreExternals: z.boolean().optional(),
  includeExternals: z.boolean().optional(),
  stickyDepth: z.boolean().optional(),
  skipPreChecks: z.boolean().optional(),
  closeOnEnd: z.enum(['0', '1', '2', '3', '4', '5', '6', '7']).optional(),
});

export const tortoiseUpdateTool: Tool = {
  name: 'tortoise_update',
  description: '[TortoiseSVN GUI] Update the working copy',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Working copy path to update',
      },
      rev: {
        oneOf: [
          { type: 'string', enum: ['ask'] },
          {
            type: 'object',
            description: 'Specific revision to update to',
            properties: {
              type: {
                type: 'string',
                enum: ['number', 'head', 'base', 'committed', 'prev', 'date'],
              },
              value: { type: ['number', 'string'] },
            },
          },
        ],
        description: 'Revision to update to, or "ask" to show dialog',
      },
      nonRecursive: {
        type: 'boolean',
        description: 'Non-recursive update',
      },
      ignoreExternals: {
        type: 'boolean',
        description: 'Ignore externals',
      },
      includeExternals: {
        type: 'boolean',
        description: 'Include externals',
      },
      stickyDepth: {
        type: 'boolean',
        description: 'Make depth sticky (sparse checkout)',
      },
      skipPreChecks: {
        type: 'boolean',
        description: 'Skip pre-update checks',
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

export async function handleTortoiseUpdate(args: unknown): Promise<unknown> {
  const options = TortoiseUpdateOptionsSchema.parse(args);

  const params: Record<string, string> = {
    path: options.path,
  };

  const tortoiseOptions: TortoiseSVNOptions = {};

  if (options.rev === 'ask') {
    params.rev = '';
  } else if (options.rev) {
    params.rev = buildRevisionArg(options.rev as Revision);
  }
  if (options.nonRecursive) {
    params.nonrecursive = '';
  }
  if (options.ignoreExternals) {
    params.ignoreexternals = '';
  }
  if (options.includeExternals) {
    params.includeexternals = '';
  }
  if (options.stickyDepth) {
    params.stickydepth = '';
  }
  if (options.skipPreChecks) {
    params.skipprechecks = '';
  }
  if (options.closeOnEnd) {
    tortoiseOptions.closeOnEnd = options.closeOnEnd;
  }

  const result = await executeTortoiseProc('update', params, tortoiseOptions);

  return {
    success: result.success,
    message: 'Working copy updated',
    stdout: result.stdout,
  };
}
