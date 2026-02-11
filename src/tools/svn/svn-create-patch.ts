import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { CreatePatchOptionsSchema, type CreatePatchOptions } from '../../types/index.js';
import { executeSVN, toPathArray } from '../../utils/command-helpers.js';

export const createPatchTool: Tool = {
  name: 'svn_create_patch',
  description: 'Create a patch file from the working copy changes',
  inputSchema: {
    type: 'object',
    properties: {
      paths: {
        oneOf: [
          { type: 'string' },
          { type: 'array', items: { type: 'string' } },
        ],
        description: 'Working copy paths to create patch from',
      },
      outputPath: {
        type: 'string',
        description: 'Output file path for the patch',
      },
      depth: {
        type: 'string',
        enum: ['empty', 'files', 'immediates', 'infinity'],
        description: 'Limit operation by depth',
      },
      git: {
        type: 'boolean',
        description: 'Use git extended diff format',
      },
      noNewline: {
        type: 'boolean',
        description: 'Do not add newline at end of file',
      },
      ignoreWhitespace: {
        type: 'boolean',
        description: 'Ignore whitespace when comparing lines',
      },
      username: { type: 'string' },
      password: { type: 'string' },
      noAuthCache: { type: 'boolean' },
      nonInteractive: { type: 'boolean' },
      trustServerCert: { type: 'boolean' },
    },
    required: ['paths', 'outputPath'],
  },
};

export async function handleCreatePatch(args: unknown): Promise<unknown> {
  const options: CreatePatchOptions = CreatePatchOptionsSchema.parse(args);
  
  const svnArgs: string[] = [];
  
  if (options.depth) {
    svnArgs.push('--depth', options.depth);
  }
  if (options.git) {
    svnArgs.push('--git');
  }
  if (options.noNewline) {
    svnArgs.push('--no-newline');
  }
  if (options.ignoreWhitespace) {
    svnArgs.push('-x', '-w');
  }

  const paths = toPathArray(options.paths);
  svnArgs.push(...paths);

  const result = await executeSVN('diff', svnArgs, options);

  // Write patch to file
  const fs = await import('fs');
  await fs.promises.writeFile(options.outputPath, result.stdout, 'utf-8');

  return {
    success: result.success,
    message: `Patch created at ${options.outputPath}`,
    stdout: result.stdout,
    patchFile: options.outputPath,
  };
}
