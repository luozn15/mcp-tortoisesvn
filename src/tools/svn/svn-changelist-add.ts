import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ChangelistAddOptionsSchema, type ChangelistAddOptions } from '../../types/index.js';
import { executeSVN, toPathArray } from '../../utils/command-helpers.js';

export const changelistAddTool: Tool = {
  name: 'svn_changelist_add',
  description: 'Add files to a changelist',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Name of the changelist',
      },
      paths: {
        oneOf: [
          { type: 'string' },
          { type: 'array', items: { type: 'string' } },
        ],
        description: 'Paths to add to changelist',
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
    required: ['name', 'paths'],
  },
};

export async function handleChangelistAdd(args: unknown): Promise<unknown> {
  const options: ChangelistAddOptions = ChangelistAddOptionsSchema.parse(args);
  
  const svnArgs: string[] = [];
  
  if (options.depth) {
    svnArgs.push('--depth', options.depth);
  }

  svnArgs.push(options.name);
  
  const paths = toPathArray(options.paths);
  svnArgs.push(...paths);

  const result = await executeSVN('changelist', svnArgs, options);

  return {
    success: result.success,
    message: `Paths added to changelist '${options.name}'`,
    stdout: result.stdout,
  };
}
