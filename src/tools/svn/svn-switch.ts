import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { SwitchOptionsSchema, type SwitchOptions } from '../../types/index.js';
import { executeSVN, buildRevisionArg, validateUrl } from '../../utils/command-helpers.js';

export const switchTool: Tool = {
  name: 'svn_switch',
  description: 'Update working copy to a different URL within the same repository',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Working copy path to switch',
      },
      url: {
        type: 'string',
        description: 'Repository URL to switch to',
      },
      revision: {
        type: 'object',
        description: 'Revision to switch to',
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
      ignoreExternals: {
        type: 'boolean',
        description: 'Ignore externals definitions',
      },
      accept: {
        type: 'string',
        enum: ['postpone', 'base', 'mine-conflict', 'theirs-conflict', 'mine-full', 'theirs-full', 'edit', 'launch'],
        description: 'Specify automatic conflict resolution action',
      },
      ignoreAncestry: {
        type: 'boolean',
        description: 'Ignore ancestry when calculating differences',
      },
      username: { type: 'string' },
      password: { type: 'string' },
      noAuthCache: { type: 'boolean' },
      nonInteractive: { type: 'boolean' },
      trustServerCert: { type: 'boolean' },
    },
    required: ['path', 'url'],
  },
};

export async function handleSwitch(args: unknown): Promise<unknown> {
  const options: SwitchOptions = SwitchOptionsSchema.parse(args);
  
  validateUrl(options.url);
  
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
  if (options.ignoreExternals) {
    svnArgs.push('--ignore-externals');
  }
  if (options.accept) {
    svnArgs.push('--accept', options.accept);
  }
  if (options.ignoreAncestry) {
    svnArgs.push('--ignore-ancestry');
  }

  svnArgs.push(options.url, options.path);

  const result = await executeSVN('switch', svnArgs, options);

  return {
    success: result.success,
    message: 'Switch completed successfully',
    stdout: result.stdout,
  };
}
