import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { CheckoutOptionsSchema, type CheckoutOptions } from '../../types/index.js';
import { executeSVN, buildRevisionArg, validateUrl } from '../../utils/command-helpers.js';

export const checkoutTool: Tool = {
  name: 'svn_checkout',
  description: 'Check out a working copy from a repository',
  inputSchema: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description: 'Repository URL to check out from',
      },
      path: {
        type: 'string',
        description: 'Local path where to create the working copy',
      },
      revision: {
        type: 'object',
        description: 'Revision to check out (defaults to HEAD)',
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
      ignoreExternals: {
        type: 'boolean',
        description: 'Ignore externals definitions',
      },
      force: {
        type: 'boolean',
        description: 'Force operation to run',
      },
      username: {
        type: 'string',
        description: 'Username for authentication',
      },
      password: {
        type: 'string',
        description: 'Password for authentication',
      },
      noAuthCache: {
        type: 'boolean',
        description: 'Do not cache authentication tokens',
      },
      nonInteractive: {
        type: 'boolean',
        description: 'Do no interactive prompting',
      },
      trustServerCert: {
        type: 'boolean',
        description: 'Accept SSL server certificates from unknown certificate authorities',
      },
    },
    required: ['url'],
  },
};

export async function handleCheckout(args: unknown): Promise<unknown> {
  const options: CheckoutOptions = CheckoutOptionsSchema.parse(args);
  
  validateUrl(options.url);

  const svnArgs: string[] = [];
  
  if (options.revision) {
    svnArgs.push('-r', buildRevisionArg(options.revision));
  }
  if (options.depth) {
    svnArgs.push('--depth', options.depth);
  }
  if (options.ignoreExternals) {
    svnArgs.push('--ignore-externals');
  }
  if (options.force) {
    svnArgs.push('--force');
  }

  svnArgs.push(options.url);
  
  if (options.path) {
    svnArgs.push(options.path);
  }

  const result = await executeSVN('checkout', svnArgs, options);

  return {
    success: result.success,
    message: 'Checkout completed successfully',
    stdout: result.stdout,
  };
}
