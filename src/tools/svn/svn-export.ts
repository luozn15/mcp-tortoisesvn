import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ExportOptionsSchema, type ExportOptions } from '../../types/index.js';
import { executeSVN, buildRevisionArg, validateUrl } from '../../utils/command-helpers.js';

export const exportTool: Tool = {
  name: 'svn_export',
  description: 'Create an unversioned copy of a tree',
  inputSchema: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description: 'Source URL to export from',
      },
      path: {
        type: 'string',
        description: 'Destination path for export',
      },
      revision: {
        type: 'object',
        description: 'Revision to export',
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
        description: 'Force operation to run, overwriting existing files',
      },
      ignoreExternals: {
        type: 'boolean',
        description: 'Ignore externals definitions',
      },
      ignoreKeywords: {
        type: 'boolean',
        description: 'Don\'t expand keywords',
      },
      username: { type: 'string' },
      password: { type: 'string' },
      noAuthCache: { type: 'boolean' },
      nonInteractive: { type: 'boolean' },
      trustServerCert: { type: 'boolean' },
    },
    required: ['url', 'path'],
  },
};

export async function handleExport(args: unknown): Promise<unknown> {
  const options: ExportOptions = ExportOptionsSchema.parse(args);
  
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
  if (options.ignoreKeywords) {
    svnArgs.push('--ignore-keywords');
  }

  svnArgs.push(options.url, options.path);

  const result = await executeSVN('export', svnArgs, options);

  // Parse exported revision
  const revisionMatch = result.stdout.match(/Exported revision (\d+)/);
  const exportedRevision = revisionMatch ? parseInt(revisionMatch[1], 10) : undefined;

  return {
    success: result.success,
    message: exportedRevision 
      ? `Exported revision ${exportedRevision}` 
      : 'Export completed',
    stdout: result.stdout,
    revision: exportedRevision,
  };
}
