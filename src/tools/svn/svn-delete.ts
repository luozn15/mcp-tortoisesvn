import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { DeleteOptionsSchema, type DeleteOptions } from '../../types/index.js';
import { executeSVN, toPathArray } from '../../utils/command-helpers.js';

export const deleteTool: Tool = {
  name: 'svn_delete',
  description: 'Remove files and directories from version control',
  inputSchema: {
    type: 'object',
    properties: {
      paths: {
        oneOf: [
          { type: 'string' },
          { type: 'array', items: { type: 'string' } },
        ],
        description: 'Paths to delete from version control',
      },
      message: {
        type: 'string',
        description: 'Log message for immediate commit',
      },
      keepLocal: {
        type: 'boolean',
        description: 'Do not remove files from local filesystem',
      },
      force: {
        type: 'boolean',
        description: 'Force operation to run',
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

export async function handleDelete(args: unknown): Promise<unknown> {
  const options: DeleteOptions = DeleteOptionsSchema.parse(args);
  
  const svnArgs: string[] = [];
  
  if (options.message) {
    svnArgs.push('-m', options.message);
  }
  if (options.keepLocal) {
    svnArgs.push('--keep-local');
  }
  if (options.force) {
    svnArgs.push('--force');
  }

  const paths = toPathArray(options.paths);
  svnArgs.push(...paths);

  const result = await executeSVN('delete', svnArgs, options);

  return {
    success: result.success,
    message: 'Files scheduled for deletion',
    stdout: result.stdout,
    deletedFiles: parseDeleteOutput(result.stdout),
  };
}

function parseDeleteOutput(output: string): string[] {
  const lines = output.trim().split('\n');
  const deletedFiles: string[] = [];

  for (const line of lines) {
    if (line.startsWith('D')) {
      const path = line.substring(1).trim();
      if (path) {
        deletedFiles.push(path);
      }
    }
  }

  return deletedFiles;
}
