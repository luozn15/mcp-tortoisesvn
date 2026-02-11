import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { PropsetOptionsSchema, type PropsetOptions } from '../../types/index.js';
import { executeSVN, buildRevisionArg, toPathArray } from '../../utils/command-helpers.js';

export const propsetTool: Tool = {
  name: 'svn_propset',
  description: 'Set the value of a property on files, directories, or revisions',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Property name',
      },
      value: {
        type: 'string',
        description: 'Property value',
      },
      paths: {
        oneOf: [
          { type: 'string' },
          { type: 'array', items: { type: 'string' } },
        ],
        description: 'Working copy paths to set property on',
      },
      revision: {
        type: 'object',
        description: 'Revision to set property on (for repository properties)',
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
    required: ['name', 'value', 'paths'],
  },
};

export async function handlePropset(args: unknown): Promise<unknown> {
  const options: PropsetOptions = PropsetOptionsSchema.parse(args);
  
  const svnArgs: string[] = [];
  
  if (options.revision) {
    svnArgs.push('-r', buildRevisionArg(options.revision));
  }
  if (options.depth) {
    svnArgs.push('--depth', options.depth);
  }
  if (options.force) {
    svnArgs.push('--force');
  }

  svnArgs.push(options.name, options.value);
  
  const paths = toPathArray(options.paths);
  svnArgs.push(...paths);

  const result = await executeSVN('propset', svnArgs, options);

  return {
    success: result.success,
    message: `Property '${options.name}' set successfully`,
    stdout: result.stdout,
  };
}
