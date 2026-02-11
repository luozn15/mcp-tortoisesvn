import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { executeTortoiseProc } from '../../utils/command-helpers.js';

export const tortoiseAboutTool: Tool = {
  name: 'tortoise_about',
  description: '[TortoiseSVN GUI] Show the about dialog',
  inputSchema: {
    type: 'object',
    properties: {},
  },
};

export async function handleTortoiseAbout(): Promise<unknown> {
  const result = await executeTortoiseProc('about', {});

  return {
    success: result.success,
    message: 'About dialog opened',
    stdout: result.stdout,
  };
}
