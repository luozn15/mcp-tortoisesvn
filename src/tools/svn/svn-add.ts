import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { AddOptionsSchema, type AddOptions } from '../../types/index.js';
import { executeSVN, toPathArray } from '../../utils/command-helpers.js';

export const addTool: Tool = {
  name: 'svn_add',
  description: 'Put files and directories under version control, scheduling them for addition to repository',
  inputSchema: {
    type: 'object',
    properties: {
      paths: {
        oneOf: [
          { type: 'string' },
          { type: 'array', items: { type: 'string' } },
        ],
        description: 'Paths to add to version control',
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
      noIgnore: {
        type: 'boolean',
        description: 'Disregard default and svn:ignore property ignores',
      },
      autoProps: {
        type: 'boolean',
        description: 'Enable automatic properties',
      },
      noAutoProps: {
        type: 'boolean',
        description: 'Disable automatic properties',
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

export async function handleAdd(args: unknown): Promise<unknown> {
  const options: AddOptions = AddOptionsSchema.parse(args);
  
  const svnArgs: string[] = [];
  
  if (options.depth) {
    svnArgs.push('--depth', options.depth);
  }
  if (options.force) {
    svnArgs.push('--force');
  }
  if (options.noIgnore) {
    svnArgs.push('--no-ignore');
  }
  if (options.autoProps) {
    svnArgs.push('--auto-props');
  }
  if (options.noAutoProps) {
    svnArgs.push('--no-auto-props');
  }

  const paths = toPathArray(options.paths);
  svnArgs.push(...paths);

  const result = await executeSVN('add', svnArgs, options);

  return {
    success: result.success,
    message: 'Files scheduled for addition',
    stdout: result.stdout,
    addedFiles: parseAddOutput(result.stdout),
  };
}

function parseAddOutput(output: string): string[] {
  const lines = output.trim().split('\n');
  const addedFiles: string[] = [];

  for (const line of lines) {
    if (line.startsWith('A')) {
      const path = line.substring(1).trim();
      if (path) {
        addedFiles.push(path);
      }
    }
  }

  return addedFiles;
}
