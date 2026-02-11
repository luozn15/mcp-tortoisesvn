import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { executeTortoiseProc } from '../../utils/command-helpers.js';
import type { TortoiseSVNOptions } from '../../types/index.js';
import { z } from 'zod';

const TortoiseExportOptionsSchema = z.object({
  path: z.string(),
  droptarget: z.string().optional(),
  overwrite: z.boolean().optional(),
  autorename: z.boolean().optional(),
  extended: z.enum(['localchanges', 'unversioned']).optional(),
  blockPathAdjustments: z.boolean().optional(),
  closeOnEnd: z.enum(['0', '1', '2', '3', '4', '5', '6', '7']).optional(),
});

export const tortoiseExportTool: Tool = {
  name: 'tortoise_export',
  description: '[TortoiseSVN GUI] Export working copy to another directory',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Working copy path to export',
      },
      droptarget: {
        type: 'string',
        description: 'Target directory for export (direct export without dialog)',
      },
      overwrite: {
        type: 'boolean',
        description: 'Overwrite existing files without confirmation',
      },
      autorename: {
        type: 'boolean',
        description: 'Auto-rename files to avoid overwriting',
      },
      extended: {
        type: 'string',
        enum: ['localchanges', 'unversioned'],
        description: 'Export only local changes or include unversioned items',
      },
      blockPathAdjustments: {
        type: 'boolean',
        description: 'Block automatic export path adjustments',
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

export async function handleTortoiseExport(args: unknown): Promise<unknown> {
  const options = TortoiseExportOptionsSchema.parse(args);
  
  // Determine if this is a direct export (dropexport) or dialog export
  const isDirectExport = options.droptarget || options.overwrite || options.autorename || options.extended;
  const command = isDirectExport ? 'dropexport' : 'export';
  
  const params: Record<string, string> = {
    path: options.path,
  };

  const tortoiseOptions: TortoiseSVNOptions = {};
  
  if (options.droptarget) {
    params.droptarget = options.droptarget;
  }
  if (options.overwrite) {
    params.overwrite = '';
  }
  if (options.autorename) {
    params.autorename = '';
  }
  if (options.extended) {
    params.extended = options.extended;
  }
  if (options.blockPathAdjustments) {
    params.blockpathadjustments = '';
  }
  if (options.closeOnEnd) {
    tortoiseOptions.closeOnEnd = options.closeOnEnd;
  }

  const result = await executeTortoiseProc(command, params, tortoiseOptions);

  return {
    success: result.success,
    message: isDirectExport ? 'Export completed' : 'Export dialog opened',
    stdout: result.stdout,
  };
}
