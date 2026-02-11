import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { executeTortoiseProc } from '../../utils/command-helpers.js';
import type { TortoiseSVNOptions } from '../../types/index.js';
import { z } from 'zod';

const TortoiseImportOptionsSchema = z.object({
  path: z.string(),
  logmsg: z.string().optional(),
  logmsgfile: z.string().optional(),
  closeOnEnd: z.enum(['0', '1', '2', '3', '4', '5', '6', '7']).optional(),
});

export const tortoiseImportTool: Tool = {
  name: 'tortoise_import',
  description: '[TortoiseSVN GUI] Open the import dialog',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Directory with data to import',
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
    required: ['path'],
  },
};

export async function handleTortoiseImport(args: unknown): Promise<unknown> {
  const options = TortoiseImportOptionsSchema.parse(args);
  
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
  if (options.closeOnEnd) {
    tortoiseOptions.closeOnEnd = options.closeOnEnd;
  }

  const result = await executeTortoiseProc('import', params, tortoiseOptions);

  return {
    success: result.success,
    message: 'Import dialog opened',
    stdout: result.stdout,
  };
}
