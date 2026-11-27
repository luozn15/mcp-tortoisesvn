import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { InfoOptionsSchema, type InfoOptions } from '../../types/index.js';
import { executeSVN, buildRevisionArg, toPathArray } from '../../utils/command-helpers.js';
import { buildQueryResult, parseInfoXml } from '../../utils/svn-xml.js';

export const infoTool: Tool = {
  name: 'svn_info',
  description: 'Display information about a local or remote item',
  inputSchema: {
    type: 'object',
    properties: {
      includeRaw: {
        type: 'boolean',
        description: 'Include raw XML stdout in addition to structured entries; omitted by default',
      },
      paths: {
        oneOf: [
          { type: 'string' },
          { type: 'array', items: { type: 'string' } },
        ],
        description: 'Working copy paths or URLs to show info for',
      },
      revision: {
        type: 'object',
        description: 'Revision to show info for',
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
      includeExternals: {
        type: 'boolean',
        description: 'Also print info about externals',
      },
      username: { type: 'string' },
      password: { type: 'string' },
      noAuthCache: { type: 'boolean' },
      nonInteractive: { type: 'boolean' },
      trustServerCert: { type: 'boolean' },
    },
  },
};

export async function handleInfo(args: unknown): Promise<unknown> {
  const options: InfoOptions = InfoOptionsSchema.parse(args);
  
  const svnArgs: string[] = ['--xml'];
  
  if (options.revision) {
    svnArgs.push('-r', buildRevisionArg(options.revision));
  }
  if (options.depth) {
    svnArgs.push('--depth', options.depth);
  }
  if (options.includeExternals) {
    svnArgs.push('--include-externals');
  }

  if (options.paths) {
    const paths = toPathArray(options.paths);
    svnArgs.push('--', ...paths);
  }

  const result = await executeSVN('info', svnArgs, options);

  return buildQueryResult(result, parseInfoXml(result.stdout), options.includeRaw);
}
