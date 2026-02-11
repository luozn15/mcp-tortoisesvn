import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ImportOptionsSchema, type ImportOptions } from '../../types/index.js';
import { executeSVN, validateUrl } from '../../utils/command-helpers.js';

export const importTool: Tool = {
  name: 'svn_import',
  description: 'Commit an unversioned file or tree into the repository',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Local path to import',
      },
      url: {
        type: 'string',
        description: 'Repository URL to import to',
      },
      message: {
        type: 'string',
        description: 'Log message',
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
    required: ['path', 'url', 'message'],
  },
};

export async function handleImport(args: unknown): Promise<unknown> {
  const options: ImportOptions = ImportOptionsSchema.parse(args);
  
  validateUrl(options.url);
  
  const svnArgs: string[] = [];
  
  svnArgs.push('-m', options.message);
  
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

  svnArgs.push(options.path, options.url);

  const result = await executeSVN('import', svnArgs, options);

  // Parse imported revision
  const revisionMatch = result.stdout.match(/Committed revision (\d+)/);
  const committedRevision = revisionMatch ? parseInt(revisionMatch[1], 10) : undefined;

  return {
    success: result.success,
    message: committedRevision 
      ? `Imported and committed revision ${committedRevision}` 
      : 'Import completed',
    stdout: result.stdout,
    revision: committedRevision,
  };
}
