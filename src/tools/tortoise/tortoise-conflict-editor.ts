import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { executeTortoiseProc } from '../../utils/command-helpers.js';
import type { TortoiseSVNOptions } from '../../types/index.js';
import { z } from 'zod';

const ConflictEditorOptionsSchema = z.object({
  path: z.string(),
  closeOnEnd: z.enum(['0', '1', '2', '3', '4', '5', '6', '7']).optional(),
});

export const tortoiseConflictEditorTool: Tool = {
  name: 'tortoise_conflict_editor',
  description: '[TortoiseSVN GUI] Open Conflict Editor for resolving conflicts',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Path to the conflicted file',
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

export async function handleTortoiseConflictEditor(args: unknown): Promise<unknown> {
  const options = ConflictEditorOptionsSchema.parse(args);
  
  const params: Record<string, string> = {
    path: options.path,
  };

  const tortoiseOptions: TortoiseSVNOptions = {};
  
  if (options.closeOnEnd) {
    tortoiseOptions.closeOnEnd = options.closeOnEnd;
  }

  const result = await executeTortoiseProc('conflicteditor', params, tortoiseOptions);

  return {
    success: result.success,
    message: 'Conflict editor opened',
    stdout: result.stdout,
  };
}
