import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { executeTortoiseProc } from '../../utils/command-helpers.js';
import type { TortoiseSVNOptions } from '../../types/index.js';
import { z } from 'zod';

const TortoiseCopyOptionsSchema = z.object({
  path: z.string(),
  url: z.string(),
  switchaftercopy: z.boolean().optional(),
  makeparents: z.boolean().optional(),
  logmsg: z.string().optional(),
  logmsgfile: z.string().optional(),
  closeOnEnd: z.enum(['0', '1', '2', '3', '4', '5', '6', '7']).optional(),
});

export const tortoiseCopyTool: Tool = {
  name: 'tortoise_copy',
  description: '[TortoiseSVN GUI] Open the branch/tag dialog',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Working copy to branch/tag from',
      },
      url: {
        type: 'string',
        description: 'Target URL (use ^ for repository root relative)',
      },
      switchaftercopy: {
        type: 'boolean',
        description: 'Switch working copy to new branch/tag',
      },
      makeparents: {
        type: 'boolean',
        description: 'Create intermediate folders',
      },
      logmsg: {
        type: 'string',
        description: 'Predefined log message',
      },
      logmsgfile: {
        type: 'string',
        description: 'Path to file containing log message',
      },
      closeOnEnd: {
        type: 'string',
        enum: ['0', '1', '2', '3'],
        description: 'Auto-close dialog',
      },
    },
    required: ['path', 'url'],
  },
};

export async function handleTortoiseCopy(args: unknown): Promise<unknown> {
  const options = TortoiseCopyOptionsSchema.parse(args);
  
  const params: Record<string, string> = {
    path: options.path,
    url: options.url,
  };

  const tortoiseOptions: TortoiseSVNOptions = {};
  
  if (options.switchaftercopy) {
    params.switchaftercopy = '';
  }
  if (options.makeparents) {
    params.makeparents = '';
  }
  if (options.logmsg) {
    params.logmsg = options.logmsg;
  }
  if (options.logmsgfile) {
    params.logmsgfile = options.logmsgfile;
  }
  if (options.closeOnEnd) {
    tortoiseOptions.closeOnEnd = options.closeOnEnd;
  }

  const result = await executeTortoiseProc('copy', params, tortoiseOptions);

  return {
    success: result.success,
    message: 'Branch/tag dialog opened',
    stdout: result.stdout,
  };
}
