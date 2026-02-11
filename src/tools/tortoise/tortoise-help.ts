import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { executeTortoiseProc } from '../../utils/command-helpers.js';

export const tortoiseHelpTool: Tool = {
  name: 'tortoise_help',
  description: '[TortoiseSVN GUI] Open the help file',
  inputSchema: {
    type: 'object',
    properties: {},
  },
};

export async function handleTortoiseHelp(): Promise<unknown> {
  const result = await executeTortoiseProc('help', {});

  return {
    success: result.success,
    message: 'Help file opened',
    stdout: result.stdout,
  };
}
