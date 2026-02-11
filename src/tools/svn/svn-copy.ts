import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { CopyOptionsSchema, type CopyOptions } from '../../types/index.js';
import { executeSVN, buildRevisionArg } from '../../utils/command-helpers.js';

export const copyTool: Tool = {
  name: 'svn_copy',
  description: 'Duplicate something in working copy or repository, remembering history',
  inputSchema: {
    type: 'object',
    properties: {
      source: {
        type: 'string',
        description: 'Source path or URL',
      },
      destination: {
        type: 'string',
        description: 'Destination path or URL',
      },
      message: {
        type: 'string',
        description: 'Log message for repository copy',
      },
      revision: {
        type: 'object',
        description: 'Source revision to copy from',
        properties: {
          type: { type: 'string', enum: ['number', 'head', 'base', 'committed', 'prev', 'date'] },
          value: { type: ['number', 'string'] },
        },
      },
      parents: {
        type: 'boolean',
        description: 'Create parent directories if they do not exist',
      },
      pinExternals: {
        type: 'boolean',
        description: 'Pin externals to their current revision',
      },
      username: { type: 'string' },
      password: { type: 'string' },
      noAuthCache: { type: 'boolean' },
      nonInteractive: { type: 'boolean' },
      trustServerCert: { type: 'boolean' },
    },
    required: ['source', 'destination'],
  },
};

export async function handleCopy(args: unknown): Promise<unknown> {
  const options: CopyOptions = CopyOptionsSchema.parse(args);
  
  const svnArgs: string[] = [];
  
  if (options.message) {
    svnArgs.push('-m', options.message);
  }
  if (options.revision) {
    svnArgs.push('-r', buildRevisionArg(options.revision));
  }
  if (options.parents) {
    svnArgs.push('--parents');
  }
  if (options.pinExternals) {
    svnArgs.push('--pin-externals');
  }

  svnArgs.push(options.source, options.destination);

  const result = await executeSVN('copy', svnArgs, options);

  // Parse copied revision
  const revisionMatch = result.stdout.match(/Committed revision (\d+)/);
  const committedRevision = revisionMatch ? parseInt(revisionMatch[1], 10) : undefined;

  return {
    success: result.success,
    message: committedRevision 
      ? `Copied and committed revision ${committedRevision}` 
      : 'Copy completed',
    stdout: result.stdout,
    revision: committedRevision,
  };
}
