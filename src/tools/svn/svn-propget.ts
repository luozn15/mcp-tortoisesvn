import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { PropgetOptionsSchema, type PropgetOptions } from '../../types/index.js';
import { executeSVN, buildRevisionArg } from '../../utils/command-helpers.js';

export const propgetTool: Tool = {
  name: 'svn_propget',
  description: 'Print the value of a property on files, directories, or revisions',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Property name',
      },
      path: {
        type: 'string',
        description: 'Working copy path or URL',
      },
      revision: {
        type: 'object',
        description: 'Revision to get property from',
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
      strict: {
        type: 'boolean',
        description: 'Use strict semantics',
      },
      xml: {
        type: 'boolean',
        description: 'Output in XML format',
      },
      username: { type: 'string' },
      password: { type: 'string' },
      noAuthCache: { type: 'boolean' },
      nonInteractive: { type: 'boolean' },
      trustServerCert: { type: 'boolean' },
    },
    required: ['name', 'path'],
  },
};

export async function handlePropget(args: unknown): Promise<unknown> {
  const options: PropgetOptions = PropgetOptionsSchema.parse(args);

  const svnArgs: string[] = [];

  if (options.revision) {
    svnArgs.push('-r', buildRevisionArg(options.revision));
  }
  if (options.depth) {
    svnArgs.push('--depth', options.depth);
  }
  if (options.strict) {
    svnArgs.push('--strict');
  }
  if (options.xml) {
    svnArgs.push('--xml');
  }

  svnArgs.push(options.name, options.path);

  const result = await executeSVN('propget', svnArgs, options);

  return {
    success: result.success,
    propertyName: options.name,
    propertyValue: result.stdout.trim(),
  };
}
