import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { UnlockOptionsSchema, type UnlockOptions } from '../../types/index.js';
import { executeSVN, toPathArray } from '../../utils/command-helpers.js';

export const unlockTool: Tool = {
  name: 'svn_unlock',
  description: 'Unlock working copy paths or URLs',
  inputSchema: {
    type: 'object',
    properties: {
      paths: {
        oneOf: [
          { type: 'string' },
          { type: 'array', items: { type: 'string' } },
        ],
        description: 'Working copy paths or URLs to unlock',
      },
      force: {
        type: 'boolean',
        description: 'Break locks of other users or working copies',
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

export async function handleUnlock(args: unknown): Promise<unknown> {
  const options: UnlockOptions = UnlockOptionsSchema.parse(args);
  
  const svnArgs: string[] = [];
  
  if (options.force) {
    svnArgs.push('--force');
  }

  const paths = toPathArray(options.paths);
  svnArgs.push(...paths);

  const result = await executeSVN('unlock', svnArgs, options);

  return {
    success: result.success,
    message: 'Unlock completed successfully',
    stdout: result.stdout,
    unlockedFiles: parseUnlockOutput(result.stdout),
  };
}

function parseUnlockOutput(output: string): string[] {
  const lines = output.trim().split('\n');
  const unlockedFiles: string[] = [];

  for (const line of lines) {
    if (line.startsWith("'")) {
      const match = line.match(/'(.+?)'/);
      if (match && line.includes('unlocked')) {
        unlockedFiles.push(match[1]);
      }
    }
  }

  return unlockedFiles;
}
