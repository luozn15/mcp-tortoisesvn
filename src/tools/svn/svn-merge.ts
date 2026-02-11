import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MergeOptionsSchema, type MergeOptions } from '../../types/index.js';
import { executeSVN, buildRevisionArg, validateUrl } from '../../utils/command-helpers.js';

export const mergeTool: Tool = {
  name: 'svn_merge',
  description: 'Apply the differences between two sources to a working copy path',
  inputSchema: {
    type: 'object',
    properties: {
      source: {
        type: 'string',
        description: 'Source URL or path to merge from',
      },
      target: {
        type: 'string',
        description: 'Target working copy path to merge into (defaults to current directory)',
      },
      revisionRange: {
        type: 'object',
        description: 'Revision range to merge',
        properties: {
          start: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['number', 'head', 'base', 'committed', 'prev', 'date'] },
              value: { type: ['number', 'string'] },
            },
          },
          end: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['number', 'head', 'base', 'committed', 'prev', 'date'] },
              value: { type: ['number', 'string'] },
            },
          },
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
      dryRun: {
        type: 'boolean',
        description: 'Try operation but make no changes',
      },
      recordOnly: {
        type: 'boolean',
        description: 'Mark a revision as merged without actually merging',
      },
      reintegrate: {
        type: 'boolean',
        description: 'Perform automatic reintegration merge (deprecated)',
      },
      accept: {
        type: 'string',
        enum: ['postpone', 'base', 'mine-conflict', 'theirs-conflict', 'mine-full', 'theirs-full', 'edit', 'launch'],
        description: 'Specify automatic conflict resolution action',
      },
      username: { type: 'string' },
      password: { type: 'string' },
      noAuthCache: { type: 'boolean' },
      nonInteractive: { type: 'boolean' },
      trustServerCert: { type: 'boolean' },
    },
    required: ['source'],
  },
};

export async function handleMerge(args: unknown): Promise<unknown> {
  const options: MergeOptions = MergeOptionsSchema.parse(args);
  
  validateUrl(options.source);
  
  const svnArgs: string[] = [];
  
  if (options.revisionRange) {
    const startRev = buildRevisionArg(options.revisionRange.start);
    const endRev = buildRevisionArg(options.revisionRange.end);
    svnArgs.push('-r', `${startRev}:${endRev}`);
  }
  if (options.depth) {
    svnArgs.push('--depth', options.depth);
  }
  if (options.force) {
    svnArgs.push('--force');
  }
  if (options.dryRun) {
    svnArgs.push('--dry-run');
  }
  if (options.recordOnly) {
    svnArgs.push('--record-only');
  }
  if (options.reintegrate) {
    svnArgs.push('--reintegrate');
  }
  if (options.accept) {
    svnArgs.push('--accept', options.accept);
  }

  svnArgs.push(options.source);
  
  if (options.target) {
    svnArgs.push(options.target);
  }

  const result = await executeSVN('merge', svnArgs, options);

  return {
    success: result.success,
    message: options.dryRun ? 'Dry run completed' : 'Merge completed',
    stdout: result.stdout,
    dryRun: options.dryRun || false,
  };
}
