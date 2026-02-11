import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { executeTortoiseProc, buildRevisionArg } from '../../utils/command-helpers.js';
import { z } from 'zod';
import { RevisionSchema, type Revision } from '../../types/index.js';
import type { TortoiseSVNOptions } from '../../types/index.js';

const TortoisePropertiesOptionsSchema = z.object({
  path: z.string(),
  revision: RevisionSchema.optional(),
  property: z.string().optional(),
  closeOnEnd: z.enum(['0', '1', '2', '3', '4', '5', '6', '7']).optional(),
});

export const tortoisePropertiesTool: Tool = {
  name: 'tortoise_properties',
  description: '[TortoiseSVN GUI] Show the properties dialog',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Path to show properties for',
      },
      revision: {
        type: 'object',
        description: 'Revision (for URL, requires /path to be URL)',
        properties: {
          type: { type: 'string', enum: ['number', 'head', 'base', 'committed', 'prev', 'date'] },
          value: { type: ['number', 'string'] },
        },
      },
      property: {
        type: 'string',
        description: 'Specific property name to open directly',
      },
      closeOnEnd: {
        type: 'string',
        enum: ['0', '1', '2', '3'],
        description: 'Auto-close dialog',
      },
    },
    required: ['path'],
  },
};

export async function handleTortoiseProperties(args: unknown): Promise<unknown> {
  const options = TortoisePropertiesOptionsSchema.parse(args);
  
  const params: Record<string, string> = {
    path: options.path,
  };

  const tortoiseOptions: TortoiseSVNOptions = {};
  
  if (options.revision) {
    params.rev = buildRevisionArg(options.revision as Revision);
  }
  if (options.property) {
    params.property = options.property;
  }
  if (options.closeOnEnd) {
    tortoiseOptions.closeOnEnd = options.closeOnEnd;
  }

  const result = await executeTortoiseProc('properties', params, tortoiseOptions);

  return {
    success: result.success,
    message: 'Properties dialog opened',
    stdout: result.stdout,
  };
}
