import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { executeTortoiseProc, buildRevisionArg } from '../../utils/command-helpers.js';
import { z } from 'zod';
import { RevisionSchema, type Revision } from '../../types/index.js';
import type { TortoiseSVNOptions } from '../../types/index.js';

const TortoiseCheckoutOptionsSchema = z.object({
  path: z.string(),
  url: z.string(),
  revision: RevisionSchema.optional(),
  blockPathAdjustments: z.boolean().optional(),
  closeOnEnd: z.enum(['0', '1', '2', '3', '4', '5', '6', '7']).optional(),
});

export const tortoiseCheckoutTool: Tool = {
  name: 'tortoise_checkout',
  description: '[TortoiseSVN GUI] Open the checkout dialog',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Target directory for checkout',
      },
      url: {
        type: 'string',
        description: 'URL to checkout from',
      },
      revision: {
        type: 'object',
        description: 'Revision to checkout',
        properties: {
          type: { type: 'string', enum: ['number', 'head', 'base', 'committed', 'prev', 'date'] },
          value: { type: ['number', 'string'] },
        },
      },
      blockPathAdjustments: {
        type: 'boolean',
        description: 'Block automatic checkout path adjustments',
      },
      closeOnEnd: {
        type: 'string',
        enum: ['0', '1', '2', '3'],
        description: 'Auto-close dialog',
      },
    },
    required: ['path', 'url'],
  },
};

export async function handleTortoiseCheckout(args: unknown): Promise<unknown> {
  const options = TortoiseCheckoutOptionsSchema.parse(args);
  
  const params: Record<string, string> = {
    path: options.path,
    url: options.url,
  };

  const tortoiseOptions: TortoiseSVNOptions = {};
  
  if (options.revision) {
    params.revision = buildRevisionArg(options.revision as Revision);
  }
  if (options.blockPathAdjustments) {
    params.blockpathadjustments = '';
  }
  if (options.closeOnEnd) {
    tortoiseOptions.closeOnEnd = options.closeOnEnd;
  }

  const result = await executeTortoiseProc('checkout', params, tortoiseOptions);

  return {
    success: result.success,
    message: 'Checkout dialog opened',
    stdout: result.stdout,
  };
}
