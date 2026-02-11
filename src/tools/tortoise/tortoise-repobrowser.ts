import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import {
  RepoBrowserOptionsSchema,
  type RepoBrowserOptions,
  TortoiseSVNOptions,
  type Revision,
} from '../../types/index.js';
import { executeTortoiseProc, buildRevisionArg, validateUrl } from '../../utils/command-helpers.js';

export const tortoiseRepoBrowserTool: Tool = {
  name: 'tortoise_repobrowser',
  description: '[TortoiseSVN GUI] Open Repository Browser to browse the repository',
  inputSchema: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description: 'Repository URL to browse',
      },
      revision: {
        type: 'object',
        description: 'Revision to browse',
        properties: {
          type: { type: 'string', enum: ['number', 'head', 'base', 'committed', 'prev', 'date'] },
          value: { type: ['number', 'string'] },
        },
      },
      pegRevision: {
        type: 'object',
        description: 'Peg revision for URL',
        properties: {
          type: { type: 'string', enum: ['number', 'head', 'base', 'committed', 'prev', 'date'] },
          value: { type: ['number', 'string'] },
        },
      },
      closeOnEnd: {
        type: 'string',
        enum: ['0', '1', '2', '3', '4', '5', '6', '7'],
        description: 'Auto-close dialog when finished (0=no, 1=yes, 2=if no errors, etc.)',
      },
    },
    required: ['url'],
  },
};

export async function handleTortoiseRepoBrowser(args: unknown): Promise<unknown> {
  const options: RepoBrowserOptions = RepoBrowserOptionsSchema.parse(args);

  validateUrl(options.url);

  const params: Record<string, string> = {
    path: options.url,
  };

  const tortoiseOptions: TortoiseSVNOptions = {};

  if (options.revision) {
    params.startrev = buildRevisionArg(options.revision as Revision);
  }
  if (options.pegRevision) {
    params.pegrev = buildRevisionArg(options.pegRevision as Revision);
  }
  if (options.closeOnEnd) {
    tortoiseOptions.closeOnEnd = options.closeOnEnd;
  }

  const result = await executeTortoiseProc('repobrowser', params, tortoiseOptions);

  return {
    success: result.success,
    message: 'Repository browser opened',
    stdout: result.stdout,
  };
}
