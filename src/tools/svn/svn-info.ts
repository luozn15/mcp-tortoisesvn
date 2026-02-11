import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { InfoOptionsSchema, type InfoOptions } from '../../types/index.js';
import { executeSVN, buildRevisionArg, toPathArray } from '../../utils/command-helpers.js';

export const infoTool: Tool = {
  name: 'svn_info',
  description: 'Display information about a local or remote item',
  inputSchema: {
    type: 'object',
    properties: {
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
    svnArgs.push(...paths);
  }

  const result = await executeSVN('info', svnArgs, options);

  return {
    success: result.success,
    stdout: result.stdout,
    entries: parseInfoXml(result.stdout),
  };
}

function parseInfoXml(xml: string): Array<{
  path: string;
  url: string;
  repositoryRoot: string;
  uuid: string;
  revision: number;
  nodeKind: string;
  schedule?: string;
  author?: string;
  lastChangedRevision?: number;
  lastChangedDate?: string;
  lastChangedAuthor?: string;
}> {
  const entries = [];
  const entryRegex = /<entry[^>]*kind="([^"]*)"[^>]*path="([^"]*)"[^>]*revision="(\d+)"[^>]*>([\s\S]*?)<\/entry>/g;
  let match;

  while ((match = entryRegex.exec(xml)) !== null) {
    const nodeKind = match[1];
    const path = match[2];
    const revision = parseInt(match[3], 10);
    const entryContent = match[4];

    const urlMatch = /<url>([^<]*)<\/url>/g.exec(entryContent);
    const rootMatch = /<root>([^<]*)<\/root>/g.exec(entryContent);
    const uuidMatch = /<uuid>([^<]*)<\/uuid>/g.exec(entryContent);
    const scheduleMatch = /<schedule>([^<]*)<\/schedule>/g.exec(entryContent);
    const commitMatch = /<commit[^>]*revision="(\d+)"[^>]*>([\s\S]*?)<\/commit>/g.exec(entryContent);

    const entry: {
      path: string;
      url: string;
      repositoryRoot: string;
      uuid: string;
      revision: number;
      nodeKind: string;
      schedule?: string;
      author?: string;
      lastChangedRevision?: number;
      lastChangedDate?: string;
      lastChangedAuthor?: string;
    } = {
      path,
      url: urlMatch ? urlMatch[1] : '',
      repositoryRoot: rootMatch ? rootMatch[1] : '',
      uuid: uuidMatch ? uuidMatch[1] : '',
      revision,
      nodeKind,
    };

    if (scheduleMatch) {
      entry.schedule = scheduleMatch[1];
    }

    if (commitMatch) {
      entry.lastChangedRevision = parseInt(commitMatch[1], 10);
      const commitContent = commitMatch[2];
      const authorMatch = /<author>([^<]*)<\/author>/g.exec(commitContent);
      const dateMatch = /<date>([^<]*)<\/date>/g.exec(commitContent);
      
      if (authorMatch) {
        entry.lastChangedAuthor = authorMatch[1];
      }
      if (dateMatch) {
        entry.lastChangedDate = dateMatch[1];
      }
    }

    entries.push(entry);
  }

  return entries;
}
