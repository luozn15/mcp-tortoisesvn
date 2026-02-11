import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { executeTortoiseProc, buildRevisionArg } from '../../utils/command-helpers.js';
import { z } from 'zod';
import { RevisionSchema, type Revision } from '../../types/index.js';
import type { TortoiseSVNOptions } from '../../types/index.js';

const TortoiseSwitchOptionsSchema = z.object({
  path: z.string(),
  url: z.string(),
  revision: RevisionSchema.optional(),
  closeOnEnd: z.enum(['0', '1', '2', '3', '4', '5', '6', '7']).optional(),
});

export const tortoiseSwitchTool: Tool = {
  name: 'tortoise_switch',
  description: '[TortoiseSVN GUI] Open the switch dialog',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Working copy path to switch',
      },
      url: {
        type: 'string',
        description: 'URL to switch to',
      },
      revision: {
        type: 'object',
        description: 'Revision to switch to',
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
    required: ['path', 'url'],
  },
};

export async function handleTortoiseSwitch(args: unknown): Promise<unknown> {
  const options = TortoiseSwitchOptionsSchema.parse(args);
  
  const params: Record<string, string> = {
    path: options.path,
    url: options.url,
  };

  const tortoiseOptions: TortoiseSVNOptions = {};
  
  if (options.revision) {
    params.revision = buildRevisionArg(options.revision as Revision);
  }
  if (options.closeOnEnd) {
    tortoiseOptions.closeOnEnd = options.closeOnEnd;
  }

  const result = await executeTortoiseProc('switch', params, tortoiseOptions);

  return {
    success: result.success,
    message: 'Switch dialog opened',
    stdout: result.stdout,
  };
}
