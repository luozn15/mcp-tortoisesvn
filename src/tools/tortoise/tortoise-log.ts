import {
  executeTortoiseProc,
  buildRevisionArg,
} from "../../utils/command-helpers.js";
import { z } from "zod";
import { RevisionSchema } from "../../types/index.js";
import type { TortoiseSVNOptions } from "../../types/index.js";

export const TortoiseLogOptionsSchema = z.object({
  path: z.string(),
  startRev: RevisionSchema.optional(),
  endRev: RevisionSchema.optional(),
  strict: z.boolean().optional(),
  merge: z.boolean().optional(),
  dateMin: z.string().optional(),
  dateMax: z.string().optional(),
  findString: z.string().optional(),
  findText: z.boolean().optional(),
  findRegex: z.boolean().optional(),
  findType: z.number().optional(),
  outfile: z.string().optional(),
  closeOnEnd: z.enum(["0", "1", "2", "3", "4", "5", "6", "7"]).optional(),
});

function formatSVNDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `{${year}-${month}-${day}}`;
}

export async function handleTortoiseLog(args: unknown): Promise<unknown> {
  const options = TortoiseLogOptionsSchema.parse(args);

  const params: Record<string, string> = {
    path: options.path,
  };

  const tortoiseOptions: TortoiseSVNOptions = {};

  if (options.startRev) {
    params.startrev = buildRevisionArg(options.startRev);
  }
  if (options.endRev) {
    params.endrev = buildRevisionArg(options.endRev);
  }
  if (options.strict) {
    params.strict = "";
  }
  if (options.merge) {
    params.merge = "";
  }

  // Default date range: 1970-01-01 to today
  params.datemin = options.dateMin ?? formatSVNDate(new Date(1970, 0, 1));
  params.datemax = options.dateMax ?? formatSVNDate(new Date());

  if (options.findString) {
    params.findstring = options.findString;
  }
  if (options.findText) {
    params.findtext = "";
  }
  if (options.findRegex) {
    params.findregex = "";
  }
  if (options.findType !== undefined) {
    params.findtype = String(options.findType);
  }
  if (options.outfile) {
    params.outfile = options.outfile;
  }
  if (options.closeOnEnd) {
    tortoiseOptions.closeOnEnd = options.closeOnEnd;
  }

  const result = await executeTortoiseProc("log", params, tortoiseOptions);

  return {
    success: result.success,
    message: "Log dialog opened",
    stdout: result.stdout,
  };
}
