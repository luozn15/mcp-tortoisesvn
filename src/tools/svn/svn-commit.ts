import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { CommitOptionsSchema, type CommitOptions } from '../../types/index.js';
import { executeSVN, toPathArray } from '../../utils/command-helpers.js';

export const commitTool: Tool = {
  name: 'svn_commit',
  description: 'Send changes from your working copy to the repository',
  inputSchema: {
    type: 'object',
    properties: {
      paths: {
        oneOf: [
          { type: 'string' },
          { type: 'array', items: { type: 'string' } },
        ],
        description: 'Working copy paths to commit',
      },
      message: {
        type: 'string',
        description: 'Commit log message',
      },
      depth: {
        type: 'string',
        enum: ['empty', 'files', 'immediates', 'infinity'],
        description: 'Limit operation by depth',
      },
      includeExternals: {
        type: 'boolean',
        description: 'Also commit file and dir externals',
      },
      keepChangelist: {
        type: 'boolean',
        description: 'Don\'t remove changelist after commit',
      },
      changelist: {
        type: 'string',
        description: 'Operate only on members of changelist',
      },
      username: { type: 'string' },
      password: { type: 'string' },
      noAuthCache: { type: 'boolean' },
      nonInteractive: { type: 'boolean' },
      trustServerCert: { type: 'boolean' },
    },
    required: ['paths', 'message'],
  },
};

export async function handleCommit(args: unknown): Promise<unknown> {
  const options: CommitOptions = CommitOptionsSchema.parse(args);
  
  const svnArgs: string[] = [];
  
  svnArgs.push('-m', options.message);
  
  if (options.depth) {
    svnArgs.push('--depth', options.depth);
  }
  if (options.includeExternals) {
    svnArgs.push('--include-externals');
  }
  if (options.keepChangelist) {
    svnArgs.push('--keep-changelist');
  }
  if (options.changelist) {
    svnArgs.push('--changelist', options.changelist);
  }

  const paths = toPathArray(options.paths);
  svnArgs.push(...paths);

  const result = await executeSVN('commit', svnArgs, options);

  // Parse committed revision
  const revisionMatch = result.stdout.match(/Committed revision (\d+)/);
  const committedRevision = revisionMatch ? parseInt(revisionMatch[1], 10) : undefined;

  return {
    success: result.success,
    message: committedRevision 
      ? `Committed revision ${committedRevision}` 
      : 'Commit completed',
    stdout: result.stdout,
    revision: committedRevision,
  };
}
