import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MoveOptionsSchema, type MoveOptions } from '../../types/index.js';
import { executeSVN } from '../../utils/command-helpers.js';

export const moveTool: Tool = {
  name: 'svn_move',
  description: 'Move and/or rename something in working copy or repository',
  inputSchema: {
    type: 'object',
    properties: {
      source: {
        type: 'string',
        description: 'Source path',
      },
      destination: {
        type: 'string',
        description: 'Destination path',
      },
      message: {
        type: 'string',
        description: 'Log message for repository move',
      },
      parents: {
        type: 'boolean',
        description: 'Create parent directories if they do not exist',
      },
      force: {
        type: 'boolean',
        description: 'Force move even if local modifications exist',
      },
      username: { type: 'string' },
      password: { type: 'string' },
      noAuthCache: { type: 'boolean' },
      nonInteractive: { type: 'boolean' },
      trustServerCert: { type: 'boolean' },
    },
    required: ['source', 'destination'],
  },
};

export async function handleMove(args: unknown): Promise<unknown> {
  const options: MoveOptions = MoveOptionsSchema.parse(args);
  
  const svnArgs: string[] = [];
  
  if (options.message) {
    svnArgs.push('-m', options.message);
  }
  if (options.parents) {
    svnArgs.push('--parents');
  }
  if (options.force) {
    svnArgs.push('--force');
  }

  svnArgs.push(options.source, options.destination);

  const result = await executeSVN('move', svnArgs, options);

  // Parse committed revision
  const revisionMatch = result.stdout.match(/Committed revision (\d+)/);
  const committedRevision = revisionMatch ? parseInt(revisionMatch[1], 10) : undefined;

  return {
    success: result.success,
    message: committedRevision 
      ? `Moved and committed revision ${committedRevision}` 
      : 'Move completed',
    stdout: result.stdout,
    revision: committedRevision,
  };
}
