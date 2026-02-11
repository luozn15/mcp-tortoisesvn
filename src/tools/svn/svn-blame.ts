import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { BlameOptionsSchema, type BlameOptions } from '../../types/index.js';
import { executeSVN, buildRevisionArg } from '../../utils/command-helpers.js';

export const blameTool: Tool = {
  name: 'svn_blame',
  description: 'Show author and revision information inline for the specified files or URLs',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Path or URL of the file to blame',
      },
      revision: {
        type: 'object',
        description: 'Blame as of this revision',
        properties: {
          type: { type: 'string', enum: ['number', 'head', 'base', 'committed', 'prev', 'date'] },
          value: { type: ['number', 'string'] },
        },
      },
      revisionRange: {
        type: 'object',
        description: 'Blame within this revision range',
        properties: {
          start: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                enum: ['number', 'head', 'base', 'committed', 'prev', 'date'],
              },
              value: { type: ['number', 'string'] },
            },
          },
          end: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                enum: ['number', 'head', 'base', 'committed', 'prev', 'date'],
              },
              value: { type: ['number', 'string'] },
            },
          },
        },
      },
      verbose: {
        type: 'boolean',
        description: 'Also print the date of the last change',
      },
      force: {
        type: 'boolean',
        description: 'Force operation to run',
      },
      useMergeHistory: {
        type: 'boolean',
        description: 'Include merge history in blame',
      },
      xml: {
        type: 'boolean',
        description: 'Output in XML format',
      },
      username: { type: 'string' },
      password: { type: 'string' },
      noAuthCache: { type: 'boolean' },
      nonInteractive: { type: 'boolean' },
      trustServerCert: { type: 'boolean' },
    },
    required: ['path'],
  },
};

export async function handleBlame(args: unknown): Promise<unknown> {
  const options: BlameOptions = BlameOptionsSchema.parse(args);

  const svnArgs: string[] = ['--xml'];

  if (options.revision) {
    svnArgs.push('-r', buildRevisionArg(options.revision));
  }
  if (options.revisionRange) {
    const startRev = buildRevisionArg(options.revisionRange.start);
    const endRev = buildRevisionArg(options.revisionRange.end);
    svnArgs.push('-r', `${startRev}:${endRev}`);
  }
  if (options.verbose) {
    svnArgs.push('-v');
  }
  if (options.force) {
    svnArgs.push('--force');
  }
  if (options.useMergeHistory) {
    svnArgs.push('-g');
  }

  svnArgs.push(options.path);

  const result = await executeSVN('blame', svnArgs, options);

  return {
    success: result.success,
    stdout: result.stdout,
    lines: parseBlameXml(result.stdout),
  };
}

function parseBlameXml(xml: string): Array<{
  revision: number;
  author: string;
  date: string;
  line: string;
  lineNumber: number;
}> {
  const lines: Array<{
    lineNumber: number;
    revision: number;
    author: string;
    date: string;
    line: string;
  }> = [];
  const targetRegex = /<target[^>]*path="([^"]*)"[^>]*>([\s\S]*?)<\/target>/g;
  const targetMatch = targetRegex.exec(xml);

  if (!targetMatch) {
    return lines;
  }

  const targetContent = targetMatch[2];
  const entryRegex = /<entry[^>]*line-number="(\d+)"[^>]*>([\s\S]*?)<\/entry>/g;
  let entryMatch;

  while ((entryMatch = entryRegex.exec(targetContent)) !== null) {
    const lineNumber = parseInt(entryMatch[1], 10);
    const entryContent = entryMatch[2];

    const commitMatch = /<commit[^>]*revision="(\d+)"[^>]*>/g.exec(entryContent);
    const authorMatch = /<author>([^<]*)<\/author>/g.exec(entryContent);
    const dateMatch = /<date>([^<]*)<\/date>/g.exec(entryContent);

    // Extract line content - it's in the text element
    const textMatch = /<text>([\s\S]*?)<\/text>/g.exec(entryContent);

    lines.push({
      lineNumber,
      revision: commitMatch ? parseInt(commitMatch[1], 10) : 0,
      author: authorMatch ? authorMatch[1] : '',
      date: dateMatch ? dateMatch[1] : '',
      line: textMatch ? textMatch[1] : '',
    });
  }

  return lines;
}
