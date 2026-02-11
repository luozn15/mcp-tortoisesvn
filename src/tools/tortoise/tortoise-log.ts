import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { executeTortoiseProc, buildRevisionArg } from '../../utils/command-helpers.js';
import { z } from 'zod';
import { RevisionSchema } from '../../types/index.js';
import type { TortoiseSVNOptions } from '../../types/index.js';

const TortoiseLogOptionsSchema = z.object({
  path: z.string(),
  startRev: RevisionSchema.optional(),
  endRev: RevisionSchema.optional(),
  strict: z.boolean().optional(),
  merge: z.boolean().optional(),
  dateMin: z.string().optional(),
  dateMax: z.string().optional(),
  findString: z.string().optional(),
  findText: z.boolean().optional(),
  findRegex: z.boolean().optional(),
  findType: z.number().optional(),
  outfile: z.string().optional(),
  closeOnEnd: z.enum(['0', '1', '2', '3', '4', '5', '6', '7']).optional(),
});

export const tortoiseLogTool: Tool = {
  name: 'tortoise_log',
  description: '[TortoiseSVN GUI] Open the log dialog to view revision history',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'File or folder to show log for',
      },
      startRev: {
        type: 'object',
        description: 'Start revision',
        properties: {
          type: { type: 'string', enum: ['number', 'head', 'base', 'committed', 'prev', 'date'] },
          value: { type: ['number', 'string'] },
        },
      },
      endRev: {
        type: 'object',
        description: 'End revision',
        properties: {
          type: { type: 'string', enum: ['number', 'head', 'base', 'committed', 'prev', 'date'] },
          value: { type: ['number', 'string'] },
        },
      },
      strict: {
        type: 'boolean',
        description: 'Enable stop-on-copy checkbox',
      },
      merge: {
        type: 'boolean',
        description: 'Enable include merged revisions checkbox',
      },
      dateMin: {
        type: 'string',
        description: 'Start date for filter (e.g., "{2006-02-17}")',
      },
      dateMax: {
        type: 'string',
        description: 'End date for filter',
      },
      findString: {
        type: 'string',
        description: 'Filter text',
      },
      findText: {
        type: 'boolean',
        description: 'Force filter to use text (not regex)',
      },
      findRegex: {
        type: 'boolean',
        description: 'Force filter to use regex',
      },
      findType: {
        type: 'number',
        description: 'Filter type (0-511, sum of options)',
      },
      outfile: {
        type: 'string',
        description: 'File to write selected revisions to',
      },
      closeOnEnd: {
        type: 'string',
        enum: ['0', '1', '2', '3'],
        description: 'Auto-close dialog (0=no, 1=if no errors, 2=if no errors/conflicts, 3=if no errors/conflicts/merges)',
      },
    },
    required: ['path'],
  },
};

export async function handleTortoiseLog(args: unknown): Promise<unknown> {
  const options = TortoiseLogOptionsSchema.parse(args);
  
  const params: Record<string, string> = {
    path: options.path,
  };

  const tortoiseOptions: TortoiseSVNOptions = {};
  
  if (options.startRev) {
    params.startrev = buildRevisionArg(options.startRev);
  }
  if (options.endRev) {
    params.endrev = buildRevisionArg(options.endRev);
  }
  if (options.strict) {
    params.strict = '';
  }
  if (options.merge) {
    params.merge = '';
  }
  if (options.dateMin) {
    params.datemin = options.dateMin;
  }
  if (options.dateMax) {
    params.datemax = options.dateMax;
  }
  if (options.findString) {
    params.findstring = options.findString;
  }
  if (options.findText) {
    params.findtext = '';
  }
  if (options.findRegex) {
    params.findregex = '';
  }
  if (options.findType !== undefined) {
    params.findtype = String(options.findType);
  }
  if (options.outfile) {
    params.outfile = options.outfile;
  }
  if (options.closeOnEnd) {
    tortoiseOptions.closeOnEnd = options.closeOnEnd;
  }

  const result = await executeTortoiseProc('log', params, tortoiseOptions);

  return {
    success: result.success,
    message: 'Log dialog opened',
    stdout: result.stdout,
  };
}
