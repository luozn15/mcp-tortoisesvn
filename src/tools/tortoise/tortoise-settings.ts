import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { SettingsOptionsSchema, type SettingsOptions } from '../../types/index.js';
import { executeTortoiseProc } from '../../utils/command-helpers.js';

export const tortoiseSettingsTool: Tool = {
  name: 'tortoise_settings',
  description: '[TortoiseSVN GUI] Open TortoiseSVN Settings dialog',
  inputSchema: {
    type: 'object',
    properties: {
      page: {
        type: 'string',
        enum: [
          'general',
          'contextmenu',
          'dialogs',
          'colors',
          'saveddata',
          'hookscripts',
          'network',
          'externals',
          'revisiongraph',
          'tmerge',
          'tblame',
        ],
        description: 'Settings page to open',
      },
    },
  },
};

export async function handleTortoiseSettings(args: unknown): Promise<unknown> {
  const options: SettingsOptions = SettingsOptionsSchema.parse(args);
  
  const params: Record<string, string> = {};

  if (options.page) {
    params.page = options.page;
  }

  const result = await executeTortoiseProc('settings', params);

  return {
    success: result.success,
    message: 'Settings dialog opened',
    stdout: result.stdout,
  };
}
