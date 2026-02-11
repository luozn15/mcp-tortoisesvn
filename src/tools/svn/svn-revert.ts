import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { RevertOptionsSchema, type RevertOptions } from '../../types/index.js';
import { executeSVN, toPathArray } from '../../utils/command-helpers.js';

export const revertTool: Tool = {
  name: 'svn_revert',
  description: 'Restore pristine working copy file (undo most local edits)',
  inputSchema: {
    type: 'object',
    properties: {
      paths: {
        oneOf: [
          { type: 'string' },
          { type: 'array', items: { type: 'string' } },
        ],
        description: 'Paths to revert',
      },
      depth: {
        type: 'string',
        enum: ['empty', 'files', 'immediates', 'infinity'],
        description: 'Limit operation by depth',
      },
      changelist: {
        type: 'string',
        description: 'Operate only on members of changelist',
      },
      username: { type: 'string' },
      password: { type: 'string' },
      noAuthCache: { type: 'boolean' },
      nonInteractive: { type: 'boolean' },
      trustServerCert: { type: 'boolean' },
    },
    required: ['paths'],
  },
};

export async function handleRevert(args: unknown): Promise<unknown> {
  const options: RevertOptions = RevertOptionsSchema.parse(args);
  
  const svnArgs: string[] = [];
  
  if (options.depth) {
    svnArgs.push('--depth', options.depth);
  }
  if (options.changelist) {
    svnArgs.push('--changelist', options.changelist);
  }

  const paths = toPathArray(options.paths);
  svnArgs.push(...paths);

  const result = await executeSVN('revert', svnArgs, options);

  return {
    success: result.success,
    message: 'Reverted local changes',
    stdout: result.stdout,
    revertedFiles: parseRevertOutput(result.stdout),
  };
}

function parseRevertOutput(output: string): string[] {
  const lines = output.trim().split('\n');
  const revertedFiles: string[] = [];

  for (const line of lines) {
    if (line.startsWith('Reverted')) {
      const match = line.match(/Reverted ['"](.+?)['"]/);
      if (match) {
        revertedFiles.push(match[1]);
      }
    }
  }

  return revertedFiles;
}
