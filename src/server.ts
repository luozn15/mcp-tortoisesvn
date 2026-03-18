import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { getLogger } from "./utils/logger.js";
import { SVNError } from "./errors/index.js";

// Import all Zod schemas from types
import {
  CheckoutOptionsSchema,
  UpdateOptionsSchema,
  CommitOptionsSchema,
  AddOptionsSchema,
  DeleteOptionsSchema,
  RevertOptionsSchema,
  CleanupOptionsSchema,
  StatusOptionsSchema,
  LogOptionsSchema,
  DiffOptionsSchema,
  BlameOptionsSchema,
  InfoOptionsSchema,
  CopyOptionsSchema,
  MoveOptionsSchema,
  MergeOptionsSchema,
  SwitchOptionsSchema,
  LockOptionsSchema,
  UnlockOptionsSchema,
  PropsetOptionsSchema,
  PropgetOptionsSchema,
  ProplistOptionsSchema,
  PropdelOptionsSchema,
  ExportOptionsSchema,
  ImportOptionsSchema,
  RelocateOptionsSchema,
  ChangelistAddOptionsSchema,
  ChangelistRemoveOptionsSchema,
  ResolveOptionsSchema,
  CreatePatchOptionsSchema,
  ApplyPatchOptionsSchema,
  RepoBrowserOptionsSchema,
  RevisionGraphOptionsSchema,
  SettingsOptionsSchema,
  TortoiseSVNOptionsSchema,
} from "./types/index.js";

// Import all tool handlers
import { handleCheckout } from "./tools/svn/svn-checkout.js";
import { handleUpdate } from "./tools/svn/svn-update.js";
import { handleCommit } from "./tools/svn/svn-commit.js";
import { handleAdd } from "./tools/svn/svn-add.js";
import { handleDelete } from "./tools/svn/svn-delete.js";
import { handleRevert } from "./tools/svn/svn-revert.js";
import { handleCleanup } from "./tools/svn/svn-cleanup.js";
import { handleStatus } from "./tools/svn/svn-status.js";
import { handleLog } from "./tools/svn/svn-log.js";
import { handleDiff } from "./tools/svn/svn-diff.js";
import { handleBlame } from "./tools/svn/svn-blame.js";
import { handleInfo } from "./tools/svn/svn-info.js";
import { handleCopy } from "./tools/svn/svn-copy.js";
import { handleMove } from "./tools/svn/svn-move.js";
import { handleMerge } from "./tools/svn/svn-merge.js";
import { handleSwitch } from "./tools/svn/svn-switch.js";
import { handleLock } from "./tools/svn/svn-lock.js";
import { handleUnlock } from "./tools/svn/svn-unlock.js";
import { handlePropset } from "./tools/svn/svn-propset.js";
import { handlePropget } from "./tools/svn/svn-propget.js";
import { handleProplist } from "./tools/svn/svn-proplist.js";
import { handlePropdel } from "./tools/svn/svn-propdel.js";
import { handleExport } from "./tools/svn/svn-export.js";
import { handleImport } from "./tools/svn/svn-import.js";
import { handleRelocate } from "./tools/svn/svn-relocate.js";
import { handleChangelistAdd } from "./tools/svn/svn-changelist-add.js";
import { handleChangelistRemove } from "./tools/svn/svn-changelist-remove.js";
import { handleResolve } from "./tools/svn/svn-resolve.js";
import { handleCreatePatch } from "./tools/svn/svn-create-patch.js";
import { handleApplyPatch } from "./tools/svn/svn-apply-patch.js";

// TortoiseSVN GUI tool handlers
import { handleTortoiseAbout } from "./tools/tortoise/tortoise-about.js";
import {
  handleTortoiseLog,
  TortoiseLogOptionsSchema,
} from "./tools/tortoise/tortoise-log.js";
import { handleTortoiseCheckout } from "./tools/tortoise/tortoise-checkout.js";
import { handleTortoiseImport } from "./tools/tortoise/tortoise-import.js";
import { handleTortoiseUpdate } from "./tools/tortoise/tortoise-update.js";
import { handleTortoiseCommit } from "./tools/tortoise/tortoise-commit.js";
import { handleTortoiseAdd } from "./tools/tortoise/tortoise-add.js";
import { handleTortoiseRevert } from "./tools/tortoise/tortoise-revert.js";
import { handleTortoiseCleanup } from "./tools/tortoise/tortoise-cleanup.js";
import { handleTortoiseResolve } from "./tools/tortoise/tortoise-resolve.js";
import { handleTortoiseRepoCreate } from "./tools/tortoise/tortoise-repocreate.js";
import { handleTortoiseSwitch } from "./tools/tortoise/tortoise-switch.js";
import { handleTortoiseExport } from "./tools/tortoise/tortoise-export.js";
import { handleTortoiseMerge } from "./tools/tortoise/tortoise-merge.js";
import { handleTortoiseMergeAll } from "./tools/tortoise/tortoise-mergeall.js";
import { handleTortoiseCopy } from "./tools/tortoise/tortoise-copy.js";
import { handleTortoiseRemove } from "./tools/tortoise/tortoise-remove.js";
import { handleTortoiseRename } from "./tools/tortoise/tortoise-rename.js";
import { handleTortoiseDiff } from "./tools/tortoise/tortoise-diff.js";
import { handleTortoiseShowCompare } from "./tools/tortoise/tortoise-showcompare.js";
import { handleTortoiseRelocate } from "./tools/tortoise/tortoise-relocate.js";
import { handleTortoiseHelp } from "./tools/tortoise/tortoise-help.js";
import { handleTortoiseRepoStatus } from "./tools/tortoise/tortoise-repostatus.js";
import { handleTortoiseRepoBrowser } from "./tools/tortoise/tortoise-repobrowser.js";
import { handleTortoiseIgnore } from "./tools/tortoise/tortoise-ignore.js";
import { handleTortoiseBlame } from "./tools/tortoise/tortoise-blame.js";
import { handleTortoiseCat } from "./tools/tortoise/tortoise-cat.js";
import { handleTortoiseCreatePatch } from "./tools/tortoise/tortoise-createpatch.js";
import { handleTortoiseRevisionGraph } from "./tools/tortoise/tortoise-revisiongraph.js";
import { handleTortoiseLock } from "./tools/tortoise/tortoise-lock.js";
import { handleTortoiseUnlock } from "./tools/tortoise/tortoise-unlock.js";
import { handleTortoiseProperties } from "./tools/tortoise/tortoise-properties.js";
import { handleTortoiseSettings } from "./tools/tortoise/tortoise-settings.js";
import { handleTortoiseSync } from "./tools/tortoise/tortoise-sync.js";
import { handleTortoiseConflictEditor } from "./tools/tortoise/tortoise-conflict-editor.js";
import { handleTortoiseRebuildIconCache } from "./tools/tortoise/tortoise-rebuildiconcache.js";
import { handleTortoiseDropVendor } from "./tools/tortoise/tortoise-dropvendor.js";

const logger = getLogger();

/**
 * Wraps a tool handler with error handling and response formatting
 */
function wrapHandler(
  name: string,
  handler: (args: unknown) => Promise<unknown>,
) {
  return async (args: Record<string, unknown>) => {
    logger.debug(`Executing tool: ${name}`, args);

    try {
      const result = await handler(args);
      const text =
        result !== undefined
          ? JSON.stringify(result, null, 2)
          : '{"success": true}';
      return {
        content: [
          {
            type: "text" as const,
            text,
          },
        ],
      };
    } catch (error) {
      logger.error(`Tool execution failed: ${name}`, error);

      let errorMessage: string;
      if (error instanceof SVNError) {
        errorMessage = error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      } else {
        errorMessage = String(error);
      }

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              success: false,
              error: errorMessage,
            }),
          },
        ],
        isError: true,
      };
    }
  };
}

/**
 * Creates and configures the MCP server using the new McpServer API
 */
export function createServer(): McpServer {
  const server = new McpServer(
    {
      name: "mcp-tortoisesvn",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );

  // Register SVN command-line tools
  server.registerTool(
    "svn_checkout",
    {
      description: "Check out a working copy from a repository",
      inputSchema: CheckoutOptionsSchema.shape,
    },
    wrapHandler("svn_checkout", handleCheckout),
  );

  server.registerTool(
    "svn_update",
    {
      description: "Update working copy to a different revision",
      inputSchema: UpdateOptionsSchema.shape,
    },
    wrapHandler("svn_update", handleUpdate),
  );

  server.registerTool(
    "svn_commit",
    {
      description: "Send changes from your working copy to the repository",
      inputSchema: CommitOptionsSchema.shape,
    },
    wrapHandler("svn_commit", handleCommit),
  );

  server.registerTool(
    "svn_add",
    {
      description: "Put files and directories under version control",
      inputSchema: AddOptionsSchema.shape,
    },
    wrapHandler("svn_add", handleAdd),
  );

  server.registerTool(
    "svn_delete",
    {
      description: "Remove files and directories from version control",
      inputSchema: DeleteOptionsSchema.shape,
    },
    wrapHandler("svn_delete", handleDelete),
  );

  server.registerTool(
    "svn_revert",
    {
      description: "Restore pristine working copy file (undo most local edits)",
      inputSchema: RevertOptionsSchema.shape,
    },
    wrapHandler("svn_revert", handleRevert),
  );

  server.registerTool(
    "svn_cleanup",
    {
      description:
        "Recover from an interrupted operation that left the working copy locked",
      inputSchema: CleanupOptionsSchema.shape,
    },
    wrapHandler("svn_cleanup", handleCleanup),
  );

  server.registerTool(
    "svn_status",
    {
      description: "Print the status of working copy files and directories",
      inputSchema: StatusOptionsSchema.shape,
    },
    wrapHandler("svn_status", handleStatus),
  );

  server.registerTool(
    "svn_log",
    {
      description:
        "Show the log messages for a set of revision(s) and/or path(s)",
      inputSchema: LogOptionsSchema.shape,
    },
    wrapHandler("svn_log", handleLog),
  );

  server.registerTool(
    "svn_diff",
    {
      description: "Display the differences between two revisions or paths",
      inputSchema: DiffOptionsSchema.shape,
    },
    wrapHandler("svn_diff", handleDiff),
  );

  server.registerTool(
    "svn_blame",
    {
      description:
        "Show author and revision information inline for the specified files or URLs",
      inputSchema: BlameOptionsSchema.shape,
    },
    wrapHandler("svn_blame", handleBlame),
  );

  server.registerTool(
    "svn_info",
    {
      description: "Display information about a local or remote item",
      inputSchema: InfoOptionsSchema.shape,
    },
    wrapHandler("svn_info", handleInfo),
  );

  server.registerTool(
    "svn_copy",
    {
      description:
        "Duplicate something in working copy or repository, remembering history",
      inputSchema: CopyOptionsSchema.shape,
    },
    wrapHandler("svn_copy", handleCopy),
  );

  server.registerTool(
    "svn_move",
    {
      description: "Move and/or rename something in working copy or repository",
      inputSchema: MoveOptionsSchema.shape,
    },
    wrapHandler("svn_move", handleMove),
  );

  server.registerTool(
    "svn_merge",
    {
      description:
        "Apply the differences between two sources to a working copy path",
      inputSchema: MergeOptionsSchema.shape,
    },
    wrapHandler("svn_merge", handleMerge),
  );

  server.registerTool(
    "svn_switch",
    {
      description:
        "Update working copy to a different URL within the same repository",
      inputSchema: SwitchOptionsSchema.shape,
    },
    wrapHandler("svn_switch", handleSwitch),
  );

  server.registerTool(
    "svn_lock",
    {
      description: "Lock working copy paths or URLs in the repository",
      inputSchema: LockOptionsSchema.shape,
    },
    wrapHandler("svn_lock", handleLock),
  );

  server.registerTool(
    "svn_unlock",
    {
      description: "Unlock working copy paths or URLs",
      inputSchema: UnlockOptionsSchema.shape,
    },
    wrapHandler("svn_unlock", handleUnlock),
  );

  server.registerTool(
    "svn_propset",
    {
      description:
        "Set the value of a property on files, directories, or revisions",
      inputSchema: PropsetOptionsSchema.shape,
    },
    wrapHandler("svn_propset", handlePropset),
  );

  server.registerTool(
    "svn_propget",
    {
      description:
        "Print the value of a property on files, directories, or revisions",
      inputSchema: PropgetOptionsSchema.shape,
    },
    wrapHandler("svn_propget", handlePropget),
  );

  server.registerTool(
    "svn_proplist",
    {
      description: "List all properties on files, directories, or revisions",
      inputSchema: ProplistOptionsSchema.shape,
    },
    wrapHandler("svn_proplist", handleProplist),
  );

  server.registerTool(
    "svn_propdel",
    {
      description: "Remove a property from files, directories, or revisions",
      inputSchema: PropdelOptionsSchema.shape,
    },
    wrapHandler("svn_propdel", handlePropdel),
  );

  server.registerTool(
    "svn_export",
    {
      description: "Create an unversioned copy of a tree",
      inputSchema: ExportOptionsSchema.shape,
    },
    wrapHandler("svn_export", handleExport),
  );

  server.registerTool(
    "svn_import",
    {
      description: "Commit an unversioned file or tree into the repository",
      inputSchema: ImportOptionsSchema.shape,
    },
    wrapHandler("svn_import", handleImport),
  );

  server.registerTool(
    "svn_relocate",
    {
      description:
        "Relocate the working copy to point to a different repository root URL",
      inputSchema: RelocateOptionsSchema.shape,
    },
    wrapHandler("svn_relocate", handleRelocate),
  );

  server.registerTool(
    "svn_changelist_add",
    {
      description: "Add files to a changelist",
      inputSchema: ChangelistAddOptionsSchema.shape,
    },
    wrapHandler("svn_changelist_add", handleChangelistAdd),
  );

  server.registerTool(
    "svn_changelist_remove",
    {
      description: "Remove files from a changelist or all changelists",
      inputSchema: ChangelistRemoveOptionsSchema.shape,
    },
    wrapHandler("svn_changelist_remove", handleChangelistRemove),
  );

  server.registerTool(
    "svn_resolve",
    {
      description: "Resolve conflicts on working copy files or directories",
      inputSchema: ResolveOptionsSchema.shape,
    },
    wrapHandler("svn_resolve", handleResolve),
  );

  server.registerTool(
    "svn_create_patch",
    {
      description: "Create a patch file from the working copy changes",
      inputSchema: CreatePatchOptionsSchema.shape,
    },
    wrapHandler("svn_create_patch", handleCreatePatch),
  );

  server.registerTool(
    "svn_apply_patch",
    {
      description: "Apply a patch file to the working copy",
      inputSchema: ApplyPatchOptionsSchema.shape,
    },
    wrapHandler("svn_apply_patch", handleApplyPatch),
  );

  // Register TortoiseSVN GUI tools
  server.registerTool(
    "tortoise_about",
    {
      description: "[TortoiseSVN GUI] Show the about dialog",
      inputSchema: TortoiseSVNOptionsSchema.shape,
    },
    wrapHandler("tortoise_about", handleTortoiseAbout),
  );

  server.registerTool(
    "tortoise_checkout",
    {
      description: "[TortoiseSVN GUI] Open the checkout dialog",
      inputSchema: TortoiseSVNOptionsSchema.shape,
    },
    wrapHandler("tortoise_checkout", handleTortoiseCheckout),
  );

  server.registerTool(
    "tortoise_import",
    {
      description: "[TortoiseSVN GUI] Open the import dialog",
      inputSchema: TortoiseSVNOptionsSchema.shape,
    },
    wrapHandler("tortoise_import", handleTortoiseImport),
  );

  server.registerTool(
    "tortoise_update",
    {
      description: "[TortoiseSVN GUI] Update the working copy",
      inputSchema: TortoiseSVNOptionsSchema.shape,
    },
    wrapHandler("tortoise_update", handleTortoiseUpdate),
  );

  server.registerTool(
    "tortoise_commit",
    {
      description: "[TortoiseSVN GUI] Open the commit dialog",
      inputSchema: TortoiseSVNOptionsSchema.shape,
    },
    wrapHandler("tortoise_commit", handleTortoiseCommit),
  );

  server.registerTool(
    "tortoise_add",
    {
      description: "[TortoiseSVN GUI] Add files to version control",
      inputSchema: TortoiseSVNOptionsSchema.shape,
    },
    wrapHandler("tortoise_add", handleTortoiseAdd),
  );

  server.registerTool(
    "tortoise_revert",
    {
      description: "[TortoiseSVN GUI] Revert local modifications",
      inputSchema: TortoiseSVNOptionsSchema.shape,
    },
    wrapHandler("tortoise_revert", handleTortoiseRevert),
  );

  server.registerTool(
    "tortoise_cleanup",
    {
      description: "[TortoiseSVN GUI] Clean up working copy",
      inputSchema: TortoiseSVNOptionsSchema.shape,
    },
    wrapHandler("tortoise_cleanup", handleTortoiseCleanup),
  );

  server.registerTool(
    "tortoise_resolve",
    {
      description: "[TortoiseSVN GUI] Mark conflicted file as resolved",
      inputSchema: TortoiseSVNOptionsSchema.shape,
    },
    wrapHandler("tortoise_resolve", handleTortoiseResolve),
  );

  server.registerTool(
    "tortoise_repocreate",
    {
      description: "[TortoiseSVN GUI] Create a repository",
      inputSchema: TortoiseSVNOptionsSchema.shape,
    },
    wrapHandler("tortoise_repocreate", handleTortoiseRepoCreate),
  );

  server.registerTool(
    "tortoise_switch",
    {
      description: "[TortoiseSVN GUI] Open the switch dialog",
      inputSchema: TortoiseSVNOptionsSchema.shape,
    },
    wrapHandler("tortoise_switch", handleTortoiseSwitch),
  );

  server.registerTool(
    "tortoise_export",
    {
      description: "[TortoiseSVN GUI] Export working copy to another directory",
      inputSchema: TortoiseSVNOptionsSchema.shape,
    },
    wrapHandler("tortoise_export", handleTortoiseExport),
  );

  server.registerTool(
    "tortoise_merge",
    {
      description: "[TortoiseSVN GUI] Open the merge dialog",
      inputSchema: TortoiseSVNOptionsSchema.shape,
    },
    wrapHandler("tortoise_merge", handleTortoiseMerge),
  );

  server.registerTool(
    "tortoise_mergeall",
    {
      description: "[TortoiseSVN GUI] Open the merge all dialog",
      inputSchema: TortoiseSVNOptionsSchema.shape,
    },
    wrapHandler("tortoise_mergeall", handleTortoiseMergeAll),
  );

  server.registerTool(
    "tortoise_copy",
    {
      description: "[TortoiseSVN GUI] Open the branch/tag dialog",
      inputSchema: TortoiseSVNOptionsSchema.shape,
    },
    wrapHandler("tortoise_copy", handleTortoiseCopy),
  );

  server.registerTool(
    "tortoise_log",
    {
      description:
        "[TortoiseSVN GUI] Open the log dialog to view revision history",
      inputSchema: TortoiseLogOptionsSchema.shape,
    },
    wrapHandler("tortoise_log", handleTortoiseLog),
  );

  server.registerTool(
    "tortoise_remove",
    {
      description: "[TortoiseSVN GUI] Remove files from version control",
      inputSchema: TortoiseSVNOptionsSchema.shape,
    },
    wrapHandler("tortoise_remove", handleTortoiseRemove),
  );

  server.registerTool(
    "tortoise_rename",
    {
      description: "[TortoiseSVN GUI] Rename a file",
      inputSchema: TortoiseSVNOptionsSchema.shape,
    },
    wrapHandler("tortoise_rename", handleTortoiseRename),
  );

  server.registerTool(
    "tortoise_diff",
    {
      description: "[TortoiseSVN GUI] Launch external diff program",
      inputSchema: TortoiseSVNOptionsSchema.shape,
    },
    wrapHandler("tortoise_diff", handleTortoiseDiff),
  );

  server.registerTool(
    "tortoise_showcompare",
    {
      description:
        "[TortoiseSVN GUI] Show unified diff or file list comparison",
      inputSchema: TortoiseSVNOptionsSchema.shape,
    },
    wrapHandler("tortoise_showcompare", handleTortoiseShowCompare),
  );

  server.registerTool(
    "tortoise_relocate",
    {
      description: "[TortoiseSVN GUI] Open the relocate dialog",
      inputSchema: TortoiseSVNOptionsSchema.shape,
    },
    wrapHandler("tortoise_relocate", handleTortoiseRelocate),
  );

  server.registerTool(
    "tortoise_help",
    {
      description: "[TortoiseSVN GUI] Open the help file",
      inputSchema: TortoiseSVNOptionsSchema.shape,
    },
    wrapHandler("tortoise_help", handleTortoiseHelp),
  );

  server.registerTool(
    "tortoise_repostatus",
    {
      description: "[TortoiseSVN GUI] Open check-for-modifications dialog",
      inputSchema: TortoiseSVNOptionsSchema.shape,
    },
    wrapHandler("tortoise_repostatus", handleTortoiseRepoStatus),
  );

  server.registerTool(
    "tortoise_repobrowser",
    {
      description:
        "[TortoiseSVN GUI] Open Repository Browser to browse the repository",
      inputSchema: RepoBrowserOptionsSchema.shape,
    },
    wrapHandler("tortoise_repobrowser", handleTortoiseRepoBrowser),
  );

  server.registerTool(
    "tortoise_ignore",
    {
      description: "[TortoiseSVN GUI] Add files to the ignore list",
      inputSchema: TortoiseSVNOptionsSchema.shape,
    },
    wrapHandler("tortoise_ignore", handleTortoiseIgnore),
  );

  server.registerTool(
    "tortoise_blame",
    {
      description: "[TortoiseSVN GUI] Open the blame dialog for a file",
      inputSchema: TortoiseSVNOptionsSchema.shape,
    },
    wrapHandler("tortoise_blame", handleTortoiseBlame),
  );

  server.registerTool(
    "tortoise_cat",
    {
      description:
        "[TortoiseSVN GUI] Save a file from URL or working copy at specific revision",
      inputSchema: TortoiseSVNOptionsSchema.shape,
    },
    wrapHandler("tortoise_cat", handleTortoiseCat),
  );

  server.registerTool(
    "tortoise_createpatch",
    {
      description: "[TortoiseSVN GUI] Create a patch file",
      inputSchema: TortoiseSVNOptionsSchema.shape,
    },
    wrapHandler("tortoise_createpatch", handleTortoiseCreatePatch),
  );

  server.registerTool(
    "tortoise_revisiongraph",
    {
      description:
        "[TortoiseSVN GUI] Open Revision Graph to visualize revision history",
      inputSchema: RevisionGraphOptionsSchema.shape,
    },
    wrapHandler("tortoise_revisiongraph", handleTortoiseRevisionGraph),
  );

  server.registerTool(
    "tortoise_lock",
    {
      description:
        "[TortoiseSVN GUI] Lock files (shows lock dialog for comment)",
      inputSchema: TortoiseSVNOptionsSchema.shape,
    },
    wrapHandler("tortoise_lock", handleTortoiseLock),
  );

  server.registerTool(
    "tortoise_unlock",
    {
      description: "[TortoiseSVN GUI] Unlock files",
      inputSchema: TortoiseSVNOptionsSchema.shape,
    },
    wrapHandler("tortoise_unlock", handleTortoiseUnlock),
  );

  server.registerTool(
    "tortoise_properties",
    {
      description: "[TortoiseSVN GUI] Show the properties dialog",
      inputSchema: TortoiseSVNOptionsSchema.shape,
    },
    wrapHandler("tortoise_properties", handleTortoiseProperties),
  );

  server.registerTool(
    "tortoise_settings",
    {
      description: "[TortoiseSVN GUI] Open TortoiseSVN Settings dialog",
      inputSchema: SettingsOptionsSchema.shape,
    },
    wrapHandler("tortoise_settings", handleTortoiseSettings),
  );

  server.registerTool(
    "tortoise_sync",
    {
      description: "[TortoiseSVN GUI] Export/import settings",
      inputSchema: TortoiseSVNOptionsSchema.shape,
    },
    wrapHandler("tortoise_sync", handleTortoiseSync),
  );

  server.registerTool(
    "tortoise_conflict_editor",
    {
      description:
        "[TortoiseSVN GUI] Open Conflict Editor for resolving conflicts",
      inputSchema: TortoiseSVNOptionsSchema.shape,
    },
    wrapHandler("tortoise_conflict_editor", handleTortoiseConflictEditor),
  );

  server.registerTool(
    "tortoise_rebuildiconcache",
    {
      description: "[TortoiseSVN GUI] Rebuild the Windows icon cache",
      inputSchema: TortoiseSVNOptionsSchema.shape,
    },
    wrapHandler("tortoise_rebuildiconcache", handleTortoiseRebuildIconCache),
  );

  server.registerTool(
    "tortoise_dropvendor",
    {
      description:
        "[TortoiseSVN GUI] Vendor branch operation - copy folder and update target",
      inputSchema: TortoiseSVNOptionsSchema.shape,
    },
    wrapHandler("tortoise_dropvendor", handleTortoiseDropVendor),
  );

  return server;
}

/**
 * Starts the server with stdio transport
 */
export async function startServer(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();

  logger.info("Starting TortoiseSVN MCP server");
  await server.connect(transport);
  logger.info("Server connected and ready");
}
