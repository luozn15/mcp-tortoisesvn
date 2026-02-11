import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { executeTortoiseProc, buildRevisionArg } from '../../utils/command-helpers.js';
import { z } from 'zod';
import { RevisionSchema, type Revision } from '../../types/index.js';
import type { TortoiseSVNOptions } from '../../types/index.js';

const TortoiseCatOptionsSchema = z.object({
  path: z.string(),
  savepath: z.string(),
  revision: RevisionSchema.optional(),
  closeOnEnd: z.enum(['0', '1', '2', '3', '4', '5', '6', '7']).optional(),
});

export const tortoiseCatTool: Tool = {
  name: 'tortoise_cat',
  description: '[TortoiseSVN GUI] Save a file from URL or working copy at specific revision',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'URL or working copy path',
      },
      savepath: {
        type: 'string',
        description: 'Target location to save file',
      },
      revision: {
        type: 'object',
        description: 'Revision to save',
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
    required: ['path', 'savepath'],
  },
};

export async function handleTortoiseCat(args: unknown): Promise<unknown> {
  const options = TortoiseCatOptionsSchema.parse(args);
  
  const params: Record<string, string> = {
    path: options.path,
    savepath: options.savepath,
  };

  const tortoiseOptions: TortoiseSVNOptions = {};
  
  if (options.revision) {
    params.revision = buildRevisionArg(options.revision as Revision);
  }
  if (options.closeOnEnd) {
    tortoiseOptions.closeOnEnd = options.closeOnEnd;
  }

  const result = await executeTortoiseProc('cat', params, tortoiseOptions);

  return {
    success: result.success,
    message: `File saved to ${options.savepath}`,
    stdout: result.stdout,
  };
}
