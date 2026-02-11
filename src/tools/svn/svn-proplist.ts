import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ProplistOptionsSchema, type ProplistOptions } from '../../types/index.js';
import { executeSVN, buildRevisionArg, toPathArray } from '../../utils/command-helpers.js';

export const proplistTool: Tool = {
  name: 'svn_proplist',
  description: 'List all properties on files, directories, or revisions',
  inputSchema: {
    type: 'object',
    properties: {
      paths: {
        oneOf: [
          { type: 'string' },
          { type: 'array', items: { type: 'string' } },
        ],
        description: 'Working copy paths or URLs to list properties for',
      },
      revision: {
        type: 'object',
        description: 'Revision to list properties from',
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
      verbose: {
        type: 'boolean',
        description: 'Print property values along with names',
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
  },
};

export async function handleProplist(args: unknown): Promise<unknown> {
  const options: ProplistOptions = ProplistOptionsSchema.parse(args);
  
  const svnArgs: string[] = [];
  
  if (options.revision) {
    svnArgs.push('-r', buildRevisionArg(options.revision));
  }
  if (options.depth) {
    svnArgs.push('--depth', options.depth);
  }
  if (options.verbose) {
    svnArgs.push('-v');
  }
  if (options.xml) {
    svnArgs.push('--xml');
  }

  if (options.paths) {
    const paths = toPathArray(options.paths);
    svnArgs.push(...paths);
  }

  const result = await executeSVN('proplist', svnArgs, options);

  return {
    success: result.success,
    stdout: result.stdout,
    properties: parseProplistOutput(result.stdout),
  };
}

function parseProplistOutput(output: string): Array<{ name: string; value?: string }> {
  const lines = output.trim().split('\n');
  const properties: Array<{ name: string; value?: string }> = [];
  let currentValue = '';
  let currentName = '';

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (trimmedLine.startsWith('svn:') || trimmedLine.startsWith('custom:')) {
      // Save previous property if exists
      if (currentName) {
        properties.push({ name: currentName, value: currentValue.trim() || undefined });
      }
      
      // Check if this line contains value too (verbose mode)
      const spaceIndex = trimmedLine.indexOf(' ');
      if (spaceIndex > 0) {
        currentName = trimmedLine.substring(0, spaceIndex);
        currentValue = trimmedLine.substring(spaceIndex + 1);
      } else {
        currentName = trimmedLine;
        currentValue = '';
      }
    } else if (currentName && trimmedLine) {
      // Continuation of multi-line value
      currentValue += '\n' + trimmedLine;
    }
  }

  // Don't forget the last property
  if (currentName) {
    properties.push({ name: currentName, value: currentValue.trim() || undefined });
  }

  return properties;
}
