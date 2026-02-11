import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { RevisionGraphOptionsSchema, type RevisionGraphOptions } from '../../types/index.js';
import { executeTortoiseProc } from '../../utils/command-helpers.js';
import type { TortoiseSVNOptions } from '../../types/index.js';

export const tortoiseRevisionGraphTool: Tool = {
  name: 'tortoise_revisiongraph',
  description: '[TortoiseSVN GUI] Open Revision Graph to visualize revision history',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Working copy path or URL to show revision graph for',
      },
      closeOnEnd: {
        type: 'string',
        enum: ['0', '1', '2', '3', '4', '5', '6', '7'],
        description: 'Auto-close dialog when finished (0=no, 1=yes, 2=if no errors, etc.)',
      },
    },
    required: ['path'],
  },
};

export async function handleTortoiseRevisionGraph(args: unknown): Promise<unknown> {
  const options: RevisionGraphOptions = RevisionGraphOptionsSchema.parse(args);
  
  const params: Record<string, string> = {
    path: options.path,
  };

  const tortoiseOptions: TortoiseSVNOptions = {};
  
  if (options.closeOnEnd) {
    tortoiseOptions.closeOnEnd = options.closeOnEnd;
  }

  const result = await executeTortoiseProc('revisiongraph', params, tortoiseOptions);

  return {
    success: result.success,
    message: 'Revision graph opened',
    stdout: result.stdout,
  };
}
