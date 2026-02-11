import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { PropdelOptionsSchema, type PropdelOptions } from '../../types/index.js';
import { executeSVN, buildRevisionArg, toPathArray } from '../../utils/command-helpers.js';

export const propdelTool: Tool = {
  name: 'svn_propdel',
  description: 'Remove a property from files, directories, or revisions',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Property name to delete',
      },
      paths: {
        oneOf: [
          { type: 'string' },
          { type: 'array', items: { type: 'string' } },
        ],
        description: 'Working copy paths to delete property from',
      },
      revision: {
        type: 'object',
        description: 'Revision to delete property from',
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
      username: { type: 'string' },
      password: { type: 'string' },
      noAuthCache: { type: 'boolean' },
      nonInteractive: { type: 'boolean' },
      trustServerCert: { type: 'boolean' },
    },
    required: ['name', 'paths'],
  },
};

export async function handlePropdel(args: unknown): Promise<unknown> {
  const options: PropdelOptions = PropdelOptionsSchema.parse(args);
  
  const svnArgs: string[] = [];
  
  if (options.revision) {
    svnArgs.push('-r', buildRevisionArg(options.revision));
  }
  if (options.depth) {
    svnArgs.push('--depth', options.depth);
  }

  svnArgs.push(options.name);
  
  const paths = toPathArray(options.paths);
  svnArgs.push(...paths);

  const result = await executeSVN('propdel', svnArgs, options);

  return {
    success: result.success,
    message: `Property '${options.name}' deleted successfully`,
    stdout: result.stdout,
  };
}
