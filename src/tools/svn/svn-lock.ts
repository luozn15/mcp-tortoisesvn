import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { LockOptionsSchema, type LockOptions } from '../../types/index.js';
import { executeSVN, toPathArray } from '../../utils/command-helpers.js';

export const lockTool: Tool = {
  name: 'svn_lock',
  description: 'Lock working copy paths or URLs in the repository so that no other user can commit changes to them',
  inputSchema: {
    type: 'object',
    properties: {
      paths: {
        oneOf: [
          { type: 'string' },
          { type: 'array', items: { type: 'string' } },
        ],
        description: 'Working copy paths or URLs to lock',
      },
      message: {
        type: 'string',
        description: 'Lock comment message',
      },
      force: {
        type: 'boolean',
        description: 'Steal lock from another user or working copy',
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

export async function handleLock(args: unknown): Promise<unknown> {
  const options: LockOptions = LockOptionsSchema.parse(args);
  
  const svnArgs: string[] = [];
  
  if (options.message) {
    svnArgs.push('-m', options.message);
  }
  if (options.force) {
    svnArgs.push('--force');
  }

  const paths = toPathArray(options.paths);
  svnArgs.push(...paths);

  const result = await executeSVN('lock', svnArgs, options);

  return {
    success: result.success,
    message: 'Lock acquired successfully',
    stdout: result.stdout,
    lockedFiles: parseLockOutput(result.stdout),
  };
}

function parseLockOutput(output: string): string[] {
  const lines = output.trim().split('\n');
  const lockedFiles: string[] = [];

  for (const line of lines) {
    if (line.startsWith("'")) {
      const match = line.match(/'(.+?)'/);
      if (match && line.includes('locked')) {
        lockedFiles.push(match[1]);
      }
    }
  }

  return lockedFiles;
}
