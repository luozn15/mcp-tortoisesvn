import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { executeTortoiseProc, buildRevisionArg } from '../../utils/command-helpers.js';
import { z } from 'zod';
import { RevisionSchema, type Revision } from '../../types/index.js';
import type { TortoiseSVNOptions } from '../../types/index.js';

const TortoiseBlameOptionsSchema = z.object({
  path: z.string(),
  startrev: RevisionSchema.optional(),
  endrev: RevisionSchema.optional(),
  line: z.number().optional(),
  ignoreeol: z.boolean().optional(),
  ignorespaces: z.boolean().optional(),
  ignoreallspaces: z.boolean().optional(),
  closeOnEnd: z.enum(['0', '1', '2', '3', '4', '5', '6', '7']).optional(),
});

export const tortoiseBlameTool: Tool = {
  name: 'tortoise_blame',
  description: '[TortoiseSVN GUI] Open the blame dialog for a file',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'File to blame',
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
      line: {
        type: 'number',
        description: 'Line number to jump to',
      },
      ignoreeol: {
        type: 'boolean',
        description: 'Ignore end-of-line differences',
      },
      ignorespaces: {
        type: 'boolean',
        description: 'Ignore whitespace changes',
      },
      ignoreallspaces: {
        type: 'boolean',
        description: 'Ignore all whitespace',
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

export async function handleTortoiseBlame(args: unknown): Promise<unknown> {
  const options = TortoiseBlameOptionsSchema.parse(args);
  
  const params: Record<string, string> = {
    path: options.path,
  };

  const tortoiseOptions: TortoiseSVNOptions = {};
  
  if (options.startrev) {
    params.startrev = buildRevisionArg(options.startrev as Revision);
  }
  if (options.endrev) {
    params.endrev = buildRevisionArg(options.endrev as Revision);
  }
  if (options.line !== undefined) {
    params.line = String(options.line);
  }
  if (options.ignoreeol) {
    params.ignoreeol = '';
  }
  if (options.ignorespaces) {
    params.ignorespaces = '';
  }
  if (options.ignoreallspaces) {
    params.ignoreallspaces = '';
  }
  if (options.closeOnEnd) {
    tortoiseOptions.closeOnEnd = options.closeOnEnd;
  }

  const result = await executeTortoiseProc('blame', params, tortoiseOptions);

  return {
    success: result.success,
    message: 'Blame dialog opened',
    stdout: result.stdout,
  };
}
