import { z } from 'zod';

// SVN revision types
export const RevisionSchema = z.union([
  z.object({ type: z.literal('number'), value: z.number() }),
  z.object({ type: z.literal('head') }),
  z.object({ type: z.literal('base') }),
  z.object({ type: z.literal('committed') }),
  z.object({ type: z.literal('prev') }),
  z.object({ type: z.literal('date'), value: z.string() }),
]);

export type Revision = z.infer<typeof RevisionSchema>;

// SVN depth options
export const SVNDepthSchema = z.enum(['empty', 'files', 'immediates', 'infinity']);

export type SVNDepth = z.infer<typeof SVNDepthSchema>;

// Base SVN operation options
export const BaseSVNOptionsSchema = z.object({
  username: z.string().optional(),
  password: z.string().optional(),
  noAuthCache: z.boolean().optional(),
  nonInteractive: z.boolean().optional(),
  trustServerCert: z.boolean().optional(),
  configDir: z.string().optional(),
});

export type BaseSVNOptions = z.infer<typeof BaseSVNOptionsSchema>;

// Checkout options
export const CheckoutOptionsSchema = BaseSVNOptionsSchema.extend({
  url: z.string(),
  path: z.string().optional(),
  revision: RevisionSchema.optional(),
  depth: SVNDepthSchema.optional(),
  ignoreExternals: z.boolean().optional(),
  force: z.boolean().optional(),
});

export type CheckoutOptions = z.infer<typeof CheckoutOptionsSchema>;

// Update options
export const UpdateOptionsSchema = BaseSVNOptionsSchema.extend({
  paths: z.union([z.string(), z.array(z.string())]),
  revision: RevisionSchema.optional(),
  depth: SVNDepthSchema.optional(),
  ignoreExternals: z.boolean().optional(),
  force: z.boolean().optional(),
  accept: z
    .enum([
      'postpone',
      'base',
      'mine-conflict',
      'theirs-conflict',
      'mine-full',
      'theirs-full',
      'edit',
      'launch',
    ])
    .optional(),
});

export type UpdateOptions = z.infer<typeof UpdateOptionsSchema>;

// Commit options
export const CommitOptionsSchema = BaseSVNOptionsSchema.extend({
  paths: z.union([z.string(), z.array(z.string())]),
  message: z.string(),
  depth: SVNDepthSchema.optional(),
  includeExternals: z.boolean().optional(),
  keepChangelist: z.boolean().optional(),
  changelist: z.string().optional(),
});

export type CommitOptions = z.infer<typeof CommitOptionsSchema>;

// Add options
export const AddOptionsSchema = BaseSVNOptionsSchema.extend({
  paths: z.union([z.string(), z.array(z.string())]),
  depth: SVNDepthSchema.optional(),
  force: z.boolean().optional(),
  noIgnore: z.boolean().optional(),
  autoProps: z.boolean().optional(),
  noAutoProps: z.boolean().optional(),
});

export type AddOptions = z.infer<typeof AddOptionsSchema>;

// Delete options
export const DeleteOptionsSchema = BaseSVNOptionsSchema.extend({
  paths: z.union([z.string(), z.array(z.string())]),
  message: z.string().optional(),
  keepLocal: z.boolean().optional(),
  force: z.boolean().optional(),
});

export type DeleteOptions = z.infer<typeof DeleteOptionsSchema>;

// Revert options
export const RevertOptionsSchema = BaseSVNOptionsSchema.extend({
  paths: z.union([z.string(), z.array(z.string())]),
  depth: SVNDepthSchema.optional(),
  changelist: z.string().optional(),
});

export type RevertOptions = z.infer<typeof RevertOptionsSchema>;

// Cleanup options
export const CleanupOptionsSchema = BaseSVNOptionsSchema.extend({
  paths: z.union([z.string(), z.array(z.string())]),
  removeUnversioned: z.boolean().optional(),
  removeIgnored: z.boolean().optional(),
  includeExternals: z.boolean().optional(),
  vacuumPristines: z.boolean().optional(),
});

export type CleanupOptions = z.infer<typeof CleanupOptionsSchema>;

// Status options
export const StatusOptionsSchema = BaseSVNOptionsSchema.extend({
  paths: z.union([z.string(), z.array(z.string())]).optional(),
  revision: RevisionSchema.optional(),
  depth: SVNDepthSchema.optional(),
  verbose: z.boolean().optional(),
  showUpdates: z.boolean().optional(),
  quiet: z.boolean().optional(),
  noIgnore: z.boolean().optional(),
  ignoreExternals: z.boolean().optional(),
});

export type StatusOptions = z.infer<typeof StatusOptionsSchema>;

// Log options
export const LogOptionsSchema = BaseSVNOptionsSchema.extend({
  paths: z.union([z.string(), z.array(z.string())]).optional(),
  revisionRange: z
    .object({
      start: RevisionSchema,
      end: RevisionSchema,
    })
    .optional(),
  limit: z.number().optional(),
  verbose: z.boolean().optional(),
  useMergeHistory: z.boolean().optional(),
  stopOnCopy: z.boolean().optional(),
  incremental: z.boolean().optional(),
  xml: z.boolean().optional(),
});

export type LogOptions = z.infer<typeof LogOptionsSchema>;

// Diff options
export const DiffOptionsSchema = BaseSVNOptionsSchema.extend({
  paths: z.union([z.string(), z.array(z.string())]).optional(),
  revisionRange: z
    .object({
      start: RevisionSchema,
      end: RevisionSchema,
    })
    .optional(),
  depth: SVNDepthSchema.optional(),
  force: z.boolean().optional(),
  useAncestry: z.boolean().optional(),
  noticeAncestry: z.boolean().optional(),
  showCopiesAsAdds: z.boolean().optional(),
  git: z.boolean().optional(),
});

export type DiffOptions = z.infer<typeof DiffOptionsSchema>;

// Blame options
export const BlameOptionsSchema = BaseSVNOptionsSchema.extend({
  path: z.string(),
  revision: RevisionSchema.optional(),
  revisionRange: z
    .object({
      start: RevisionSchema,
      end: RevisionSchema,
    })
    .optional(),
  verbose: z.boolean().optional(),
  force: z.boolean().optional(),
  useMergeHistory: z.boolean().optional(),
  incremental: z.boolean().optional(),
  xml: z.boolean().optional(),
});

export type BlameOptions = z.infer<typeof BlameOptionsSchema>;

// Info options
export const InfoOptionsSchema = BaseSVNOptionsSchema.extend({
  paths: z.union([z.string(), z.array(z.string())]).optional(),
  revision: RevisionSchema.optional(),
  depth: SVNDepthSchema.optional(),
  includeExternals: z.boolean().optional(),
});

export type InfoOptions = z.infer<typeof InfoOptionsSchema>;

// Copy/Move options
export const CopyOptionsSchema = BaseSVNOptionsSchema.extend({
  source: z.string(),
  destination: z.string(),
  message: z.string().optional(),
  revision: RevisionSchema.optional(),
  parents: z.boolean().optional(),
  pinExternals: z.boolean().optional(),
});

export type CopyOptions = z.infer<typeof CopyOptionsSchema>;

export const MoveOptionsSchema = BaseSVNOptionsSchema.extend({
  source: z.string(),
  destination: z.string(),
  message: z.string().optional(),
  revision: RevisionSchema.optional(),
  parents: z.boolean().optional(),
  force: z.boolean().optional(),
});

export type MoveOptions = z.infer<typeof MoveOptionsSchema>;

// Merge options
export const MergeOptionsSchema = BaseSVNOptionsSchema.extend({
  source: z.string(),
  target: z.string().optional(),
  revisionRange: z
    .object({
      start: RevisionSchema,
      end: RevisionSchema,
    })
    .optional(),
  depth: SVNDepthSchema.optional(),
  force: z.boolean().optional(),
  dryRun: z.boolean().optional(),
  recordOnly: z.boolean().optional(),
  reintegrate: z.boolean().optional(),
  accept: z
    .enum([
      'postpone',
      'base',
      'mine-conflict',
      'theirs-conflict',
      'mine-full',
      'theirs-full',
      'edit',
      'launch',
    ])
    .optional(),
});

export type MergeOptions = z.infer<typeof MergeOptionsSchema>;

// Switch options
export const SwitchOptionsSchema = BaseSVNOptionsSchema.extend({
  path: z.string(),
  url: z.string(),
  revision: RevisionSchema.optional(),
  depth: SVNDepthSchema.optional(),
  force: z.boolean().optional(),
  ignoreExternals: z.boolean().optional(),
  accept: z
    .enum([
      'postpone',
      'base',
      'mine-conflict',
      'theirs-conflict',
      'mine-full',
      'theirs-full',
      'edit',
      'launch',
    ])
    .optional(),
  ignoreAncestry: z.boolean().optional(),
});

export type SwitchOptions = z.infer<typeof SwitchOptionsSchema>;

// Lock options
export const LockOptionsSchema = BaseSVNOptionsSchema.extend({
  paths: z.union([z.string(), z.array(z.string())]),
  message: z.string().optional(),
  force: z.boolean().optional(),
});

export type LockOptions = z.infer<typeof LockOptionsSchema>;

export const UnlockOptionsSchema = BaseSVNOptionsSchema.extend({
  paths: z.union([z.string(), z.array(z.string())]),
  force: z.boolean().optional(),
});

export type UnlockOptions = z.infer<typeof UnlockOptionsSchema>;

// Property options
export const PropsetOptionsSchema = BaseSVNOptionsSchema.extend({
  name: z.string(),
  value: z.string(),
  paths: z.union([z.string(), z.array(z.string())]),
  revision: RevisionSchema.optional(),
  depth: SVNDepthSchema.optional(),
  force: z.boolean().optional(),
});

export type PropsetOptions = z.infer<typeof PropsetOptionsSchema>;

export const PropgetOptionsSchema = BaseSVNOptionsSchema.extend({
  name: z.string(),
  path: z.string(),
  revision: RevisionSchema.optional(),
  depth: SVNDepthSchema.optional(),
  strict: z.boolean().optional(),
  xml: z.boolean().optional(),
});

export type PropgetOptions = z.infer<typeof PropgetOptionsSchema>;

export const ProplistOptionsSchema = BaseSVNOptionsSchema.extend({
  paths: z.union([z.string(), z.array(z.string())]).optional(),
  revision: RevisionSchema.optional(),
  depth: SVNDepthSchema.optional(),
  verbose: z.boolean().optional(),
  xml: z.boolean().optional(),
});

export type ProplistOptions = z.infer<typeof ProplistOptionsSchema>;

export const PropdelOptionsSchema = BaseSVNOptionsSchema.extend({
  name: z.string(),
  paths: z.union([z.string(), z.array(z.string())]),
  revision: RevisionSchema.optional(),
  depth: SVNDepthSchema.optional(),
});

export type PropdelOptions = z.infer<typeof PropdelOptionsSchema>;

// Export options
export const ExportOptionsSchema = BaseSVNOptionsSchema.extend({
  url: z.string(),
  path: z.string(),
  revision: RevisionSchema.optional(),
  depth: SVNDepthSchema.optional(),
  force: z.boolean().optional(),
  ignoreExternals: z.boolean().optional(),
  ignoreKeywords: z.boolean().optional(),
});

export type ExportOptions = z.infer<typeof ExportOptionsSchema>;

// Import options
export const ImportOptionsSchema = BaseSVNOptionsSchema.extend({
  path: z.string(),
  url: z.string(),
  message: z.string(),
  depth: SVNDepthSchema.optional(),
  force: z.boolean().optional(),
  noIgnore: z.boolean().optional(),
  autoProps: z.boolean().optional(),
  noAutoProps: z.boolean().optional(),
});

export type ImportOptions = z.infer<typeof ImportOptionsSchema>;

// Relocate options
export const RelocateOptionsSchema = BaseSVNOptionsSchema.extend({
  path: z.string(),
  from: z.string(),
  to: z.string(),
  ignoreExternals: z.boolean().optional(),
});

export type RelocateOptions = z.infer<typeof RelocateOptionsSchema>;

// Changelist options
export const ChangelistAddOptionsSchema = BaseSVNOptionsSchema.extend({
  name: z.string(),
  paths: z.union([z.string(), z.array(z.string())]),
  depth: SVNDepthSchema.optional(),
});

export type ChangelistAddOptions = z.infer<typeof ChangelistAddOptionsSchema>;

export const ChangelistRemoveOptionsSchema = BaseSVNOptionsSchema.extend({
  paths: z.union([z.string(), z.array(z.string())]),
  name: z.string().optional(),
  depth: SVNDepthSchema.optional(),
});

export type ChangelistRemoveOptions = z.infer<typeof ChangelistRemoveOptionsSchema>;

// Resolve options
export const ResolveOptionsSchema = BaseSVNOptionsSchema.extend({
  paths: z.union([z.string(), z.array(z.string())]),
  depth: SVNDepthSchema.optional(),
  accept: z.enum([
    'working',
    'base',
    'mine-conflict',
    'theirs-conflict',
    'mine-full',
    'theirs-full',
    'edit',
    'launch',
  ]),
});

export type ResolveOptions = z.infer<typeof ResolveOptionsSchema>;

// Patch options
export const PatchOptionsSchema = BaseSVNOptionsSchema.extend({
  patchFile: z.string(),
  targetPath: z.string().optional(),
  dryRun: z.boolean().optional(),
  strip: z.number().optional(),
  reverse: z.boolean().optional(),
});

export type PatchOptions = z.infer<typeof PatchOptionsSchema>;

// TortoiseSVN specific GUI options
export const TortoiseSVNOptionsSchema = z.object({
  closeOnEnd: z.enum(['0', '1', '2', '3', '4', '5', '6', '7']).optional(),
  closeForLocal: z.boolean().optional(),
  closeForRemote: z.boolean().optional(),
  noMerge: z.boolean().optional(),
  noCommit: z.boolean().optional(),
  noLock: z.boolean().optional(),
  noUniDiff: z.boolean().optional(),
});

export type TortoiseSVNOptions = z.infer<typeof TortoiseSVNOptionsSchema>;

// Repository browser options
export const RepoBrowserOptionsSchema = BaseSVNOptionsSchema.extend({
  url: z.string(),
  revision: RevisionSchema.optional(),
  pegRevision: RevisionSchema.optional(),
  closeOnEnd: z.enum(['0', '1', '2', '3', '4', '5', '6', '7']).optional(),
});

export type RepoBrowserOptions = z.infer<typeof RepoBrowserOptionsSchema>;

// Revision graph options
export const RevisionGraphOptionsSchema = BaseSVNOptionsSchema.extend({
  path: z.string(),
  closeOnEnd: z.enum(['0', '1', '2', '3', '4', '5', '6', '7']).optional(),
});

export type RevisionGraphOptions = z.infer<typeof RevisionGraphOptionsSchema>;

// Create patch options
export const CreatePatchOptionsSchema = BaseSVNOptionsSchema.extend({
  paths: z.union([z.string(), z.array(z.string())]),
  outputPath: z.string(),
  depth: SVNDepthSchema.optional(),
  git: z.boolean().optional(),
  noNewline: z.boolean().optional(),
  ignoreWhitespace: z.boolean().optional(),
});

export type CreatePatchOptions = z.infer<typeof CreatePatchOptionsSchema>;

// Apply patch options
export const ApplyPatchOptionsSchema = BaseSVNOptionsSchema.extend({
  patchFile: z.string(),
  targetPath: z.string().optional(),
  strip: z.number().optional(),
  reverse: z.boolean().optional(),
});

export type ApplyPatchOptions = z.infer<typeof ApplyPatchOptionsSchema>;

// Settings options
export const SettingsOptionsSchema = z.object({
  page: z
    .enum([
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
    ])
    .optional(),
});

export type SettingsOptions = z.infer<typeof SettingsOptionsSchema>;

// SVN Info result type
export const SVNInfoSchema = z.object({
  path: z.string(),
  url: z.string(),
  repositoryRoot: z.string(),
  uuid: z.string(),
  revision: z.number(),
  nodeKind: z.enum(['file', 'directory']),
  schedule: z.enum(['normal', 'add', 'delete', 'replace']).optional(),
  author: z.string().optional(),
  lastChangedRevision: z.number().optional(),
  lastChangedDate: z.string().optional(),
  lastChangedAuthor: z.string().optional(),
});

export type SVNInfo = z.infer<typeof SVNInfoSchema>;

// SVN Status entry
export const SVNStatusEntrySchema = z.object({
  path: z.string(),
  status: z.enum([
    'noStatus',
    'unversioned',
    'none',
    'normal',
    'added',
    'missing',
    'deleted',
    'replaced',
    'modified',
    'merged',
    'conflicted',
    'obstructed',
    'ignored',
    'external',
    'incomplete',
  ]),
  propsStatus: z.enum(['noStatus', 'none', 'normal', 'conflicted', 'modified']),
  revision: z.number().optional(),
  lastCommittedRevision: z.number().optional(),
  lastCommittedDate: z.string().optional(),
  lastCommitAuthor: z.string().optional(),
  isCopied: z.boolean().optional(),
  isSwitched: z.boolean().optional(),
  isLocked: z.boolean().optional(),
  isRepoLocked: z.boolean().optional(),
});

export type SVNStatusEntry = z.infer<typeof SVNStatusEntrySchema>;

// SVN Log entry
export const SVNLogEntrySchema = z.object({
  revision: z.number(),
  author: z.string(),
  date: z.string(),
  message: z.string(),
  paths: z
    .array(
      z.object({
        action: z.enum(['A', 'M', 'D', 'R']),
        path: z.string(),
        copyFromPath: z.string().optional(),
        copyFromRevision: z.number().optional(),
      })
    )
    .optional(),
});

export type SVNLogEntry = z.infer<typeof SVNLogEntrySchema>;

// SVN Blame line
export const SVNBlameLineSchema = z.object({
  revision: z.number(),
  author: z.string(),
  date: z.string(),
  line: z.string(),
  lineNumber: z.number(),
});

export type SVNBlameLine = z.infer<typeof SVNBlameLineSchema>;

// Command result
export const CommandResultSchema = z.object({
  success: z.boolean(),
  stdout: z.string(),
  stderr: z.string(),
  exitCode: z.number(),
});

export type CommandResult = z.infer<typeof CommandResultSchema>;
