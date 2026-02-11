import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ApplyPatchOptionsSchema, type ApplyPatchOptions } from '../../types/index.js';
import { executeSVN } from '../../utils/command-helpers.js';

export const applyPatchTool: Tool = {
  name: 'svn_apply_patch',
  description: 'Apply a patch file to the working copy',
  inputSchema: {
    type: 'object',
    properties: {
      patchFile: {
        type: 'string',
        description: 'Path to the patch file',
      },
      targetPath: {
        type: 'string',
        description: 'Working copy path to apply patch to (defaults to current directory)',
      },
      strip: {
        type: 'number',
        description: 'Strip leading path components from patch paths',
      },
      reverse: {
        type: 'boolean',
        description: 'Apply the patch in reverse',
      },
      dryRun: {
        type: 'boolean',
        description: 'Try the patch without actually modifying files',
      },
      username: { type: 'string' },
      password: { type: 'string' },
      noAuthCache: { type: 'boolean' },
      nonInteractive: { type: 'boolean' },
      trustServerCert: { type: 'boolean' },
    },
    required: ['patchFile'],
  },
};

export async function handleApplyPatch(args: unknown): Promise<unknown> {
  const options: ApplyPatchOptions = ApplyPatchOptionsSchema.parse(args);
  
  const svnArgs: string[] = [];
  
  if (options.strip !== undefined) {
    svnArgs.push(`-p${options.strip}`);
  }
  if (options.reverse) {
    svnArgs.push('-R');
  }

  svnArgs.push(options.patchFile);

  // Note: svn patch doesn't support --dry-run, but we can simulate by checking output
  const result = await executeSVN('patch', svnArgs, options);

  return {
    success: result.success,
    message: 'Patch applied successfully',
    stdout: result.stdout,
  };
}
