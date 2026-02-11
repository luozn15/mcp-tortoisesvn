import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { executeTortoiseProc } from '../../utils/command-helpers.js';
import type { TortoiseSVNOptions } from '../../types/index.js';
import { z } from 'zod';

const TortoiseCommitOptionsSchema = z.object({
  path: z.string(),
  logmsg: z.string().optional(),
  logmsgfile: z.string().optional(),
  bugid: z.string().optional(),
  closeOnEnd: z.enum(['0', '1', '2', '3', '4', '5', '6', '7']).optional(),
});

export const tortoiseCommitTool: Tool = {
  name: 'tortoise_commit',
  description: '[TortoiseSVN GUI] Open the commit dialog',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Target directory or files to commit',
      },
      logmsg: {
        type: 'string',
        description: 'Predefined log message',
      },
      logmsgfile: {
        type: 'string',
        description: 'Path to file containing log message',
      },
      bugid: {
        type: 'string',
        description: 'Bug ID for bug tracker integration',
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

export async function handleTortoiseCommit(args: unknown): Promise<unknown> {
  const options = TortoiseCommitOptionsSchema.parse(args);
  
  const params: Record<string, string> = {
    path: options.path,
  };

  const tortoiseOptions: TortoiseSVNOptions = {};
  
  if (options.logmsg) {
    params.logmsg = options.logmsg;
  }
  if (options.logmsgfile) {
    params.logmsgfile = options.logmsgfile;
  }
  if (options.bugid) {
    params.bugid = options.bugid;
  }
  if (options.closeOnEnd) {
    tortoiseOptions.closeOnEnd = options.closeOnEnd;
  }

  const result = await executeTortoiseProc('commit', params, tortoiseOptions);

  return {
    success: result.success,
    message: 'Commit dialog opened',
    stdout: result.stdout,
  };
}
