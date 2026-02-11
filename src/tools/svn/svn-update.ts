import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { UpdateOptionsSchema, type UpdateOptions } from '../../types/index.js';
import { executeSVN, buildRevisionArg, toPathArray } from '../../utils/command-helpers.js';

export const updateTool: Tool = {
  name: 'svn_update',
  description: 'Bring changes from the repository into the working copy',
  inputSchema: {
    type: 'object',
    properties: {
      paths: {
        oneOf: [
          { type: 'string' },
          { type: 'array', items: { type: 'string' } },
        ],
        description: 'Working copy paths to update',
      },
      revision: {
        type: 'object',
        description: 'Revision to update to (defaults to HEAD)',
        properties: {
          type: { type: 'string', enum: ['number', 'head', 'base', 'committed', 'prev', 'date'] },
          value: { type: ['number', 'string'] },
        },
      },
      depth: {
        type: 'string',
        enum: ['empty', 'files', 'immediates', 'infinity'],
        description: 'Limit operation by depth',
      },
      ignoreExternals: {
        type: 'boolean',
        description: 'Ignore externals definitions',
      },
      force: {
        type: 'boolean',
        description: 'Force operation to run',
      },
      accept: {
        type: 'string',
        enum: ['postpone', 'base', 'mine-conflict', 'theirs-conflict', 'mine-full', 'theirs-full', 'edit', 'launch'],
        description: 'Specify automatic conflict resolution action',
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

export async function handleUpdate(args: unknown): Promise<unknown> {
  const options: UpdateOptions = UpdateOptionsSchema.parse(args);
  
  const svnArgs: string[] = [];
  
  if (options.revision) {
    svnArgs.push('-r', buildRevisionArg(options.revision));
  }
  if (options.depth) {
    svnArgs.push('--depth', options.depth);
  }
  if (options.ignoreExternals) {
    svnArgs.push('--ignore-externals');
  }
  if (options.force) {
    svnArgs.push('--force');
  }
  if (options.accept) {
    svnArgs.push('--accept', options.accept);
  }

  const paths = toPathArray(options.paths);
  svnArgs.push(...paths);

  const result = await executeSVN('update', svnArgs, options);

  return {
    success: result.success,
    message: 'Update completed successfully',
    stdout: result.stdout,
    updatedFiles: parseUpdateOutput(result.stdout),
  };
}

function parseUpdateOutput(output: string): Array<{ path: string; status: string; revision?: number }> {
  const lines = output.trim().split('\n');
  const results = [];

  for (const line of lines) {
    // Parse update output format: A    file.txt (revision number sometimes included)
    const match = line.match(/^([A-Z])\s+(.+?)(?:\s*\(\s*revision\s+(\d+)\s*\))?\s*$/);
    if (match) {
      results.push({
        status: match[1],
        path: match[2].trim(),
        revision: match[3] ? parseInt(match[3], 10) : undefined,
      });
    }
  }

  return results;
}
