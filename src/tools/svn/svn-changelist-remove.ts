import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ChangelistRemoveOptionsSchema, type ChangelistRemoveOptions } from '../../types/index.js';
import { executeSVN, toPathArray } from '../../utils/command-helpers.js';

export const changelistRemoveTool: Tool = {
  name: 'svn_changelist_remove',
  description: 'Remove files from a changelist or all changelists',
  inputSchema: {
    type: 'object',
    properties: {
      paths: {
        oneOf: [
          { type: 'string' },
          { type: 'array', items: { type: 'string' } },
        ],
        description: 'Paths to remove from changelist',
      },
      name: {
        type: 'string',
        description: 'Name of the changelist (if not specified, remove from all changelists)',
      },
      depth: {
        type: 'string',
        enum: ['empty', 'files', 'immediates', 'infinity'],
        description: 'Limit operation by depth',
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

export async function handleChangelistRemove(args: unknown): Promise<unknown> {
  const options: ChangelistRemoveOptions = ChangelistRemoveOptionsSchema.parse(args);
  
  const svnArgs: string[] = ['--remove'];
  
  if (options.depth) {
    svnArgs.push('--depth', options.depth);
  }
  if (options.name) {
    svnArgs.push(options.name);
  }

  const paths = toPathArray(options.paths);
  svnArgs.push(...paths);

  const result = await executeSVN('changelist', svnArgs, options);

  return {
    success: result.success,
    message: options.name 
      ? `Paths removed from changelist '${options.name}'`
      : 'Paths removed from all changelists',
    stdout: result.stdout,
  };
}
