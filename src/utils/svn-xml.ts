import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { SVNError } from '../errors/index.js';
import type { CommandResult } from '../types/index.js';

const parser = new XMLParser({
  ignoreAttributes: false,
  parseTagValue: false,
  parseAttributeValue: false,
  trimValues: false,
});

export interface SVNInfoEntry {
  path: string;
  url: string;
  repositoryRoot: string;
  uuid: string;
  revision: number;
  nodeKind: string;
  schedule?: string;
  lastChangedRevision?: number;
  lastChangedDate?: string;
  lastChangedAuthor?: string;
}

export interface SVNChangedPath {
  action: string;
  path: string;
  kind?: string;
  copyFromPath?: string;
  copyFromRevision?: number;
}

export interface SVNLogEntry {
  revision: number;
  author: string;
  date: string;
  message: string;
  paths?: SVNChangedPath[];
  children?: SVNLogEntry[];
}

export interface SVNStatusEntry {
  path: string;
  status: string;
  props: string;
  revision?: number;
  repositoryStatus?: string;
  repositoryProps?: string;
}

export interface SVNStatusTarget {
  path: string;
  checkedRevision?: number;
}

export interface SVNStatusResult {
  entries: SVNStatusEntry[];
  targets: SVNStatusTarget[];
}

interface SVNQueryResult<Entry> {
  success: boolean;
  entries: Entry[];
  stdout?: string;
  stderr?: string;
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function asArray(value: unknown): unknown[] {
  return value === undefined ? [] : Array.isArray(value) ? value : [value];
}

function text(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function number(value: unknown): number | undefined {
  const raw = text(value);
  return /^\d+$/.test(raw) ? Number(raw) : undefined;
}

function parseDocument(xml: string): Record<string, unknown> {
  // Wrapping also supports the rootless fragments from svn log --incremental.
  const content = xml.replace(/^\uFEFF?\s*<\?xml[^?]*\?>/, '');
  if (/<!DOCTYPE/i.test(content)) {
    throw new SVNError('Unexpected document type in SVN XML output', 1);
  }
  const wrapped = `<svn-output>${content}</svn-output>`;
  const validation = XMLValidator.validate(wrapped);
  if (validation !== true) {
    throw new SVNError(`Invalid SVN XML output: ${validation.err.msg}`, 1);
  }
  const document: unknown = parser.parse(wrapped);
  return asRecord(asRecord(document)['svn-output']);
}

export function parseInfoXml(xml: string): SVNInfoEntry[] {
  const document = parseDocument(xml);
  return asArray(asRecord(document.info).entry).map((value) => {
    const entry = asRecord(value);
    const repository = asRecord(entry.repository);
    const commit = asRecord(entry.commit);
    return {
      path: text(entry['@_path']),
      url: text(entry.url),
      repositoryRoot: text(repository.root),
      uuid: text(repository.uuid),
      revision: number(entry['@_revision']) ?? 0,
      nodeKind: text(entry['@_kind']),
      schedule: text(asRecord(entry['wc-info']).schedule) || undefined,
      lastChangedRevision: number(commit['@_revision']),
      lastChangedAuthor: text(commit.author) || undefined,
      lastChangedDate: text(commit.date) || undefined,
    };
  });
}

function parseLogEntries(value: unknown): SVNLogEntry[] {
  return asArray(value).map((item) => {
    const entry = asRecord(item);
    const result: SVNLogEntry = {
      revision: number(entry['@_revision']) ?? 0,
      author: text(entry.author),
      date: text(entry.date),
      message: text(entry.msg),
    };
    if (entry.paths !== undefined) {
      result.paths = asArray(asRecord(entry.paths).path).map((value) => {
        const changedPath = asRecord(value);
        return {
          action: text(changedPath['@_action']),
          path: text(changedPath['#text']),
          kind: text(changedPath['@_kind']) || undefined,
          copyFromPath: text(changedPath['@_copyfrom-path']) || undefined,
          copyFromRevision: number(changedPath['@_copyfrom-rev']),
        };
      });
    }
    if (entry.logentry !== undefined) {
      result.children = parseLogEntries(entry.logentry);
    }
    return result;
  });
}

export function parseLogXml(xml: string): SVNLogEntry[] {
  const document = parseDocument(xml);
  // Keep SVN's order, including explicitly requested ascending ranges.
  return parseLogEntries(asRecord(document.log).logentry ?? document.logentry);
}

export function parseStatusXml(xml: string): SVNStatusEntry[] {
  return parseStatusResultXml(xml).entries;
}

export function parseStatusResultXml(xml: string): SVNStatusResult {
  const status = asRecord(parseDocument(xml).status);
  const entries: SVNStatusEntry[] = [];
  const targets = asArray(status.target).map(asRecord);
  const groups = [...targets, ...asArray(status.changelist)];
  for (const group of groups) {
    for (const value of asArray(asRecord(group).entry)) {
      const entry = asRecord(value);
      const workingCopyStatus = asRecord(entry['wc-status']);
      const repositoryStatus = asRecord(entry['repos-status']);
      entries.push({
        path: text(entry['@_path']),
        status: text(workingCopyStatus['@_item']),
        props: text(workingCopyStatus['@_props']),
        revision: number(workingCopyStatus['@_revision']),
        repositoryStatus: text(repositoryStatus['@_item']) || undefined,
        repositoryProps: text(repositoryStatus['@_props']) || undefined,
      });
    }
  }
  return {
    entries,
    // Retain each target's check revision even when it has no status entries.
    targets: targets.map((target) => ({
      path: text(target['@_path']),
      checkedRevision: number(asRecord(target.against)['@_revision']),
    })),
  };
}

export function buildQueryResult<Entry>(
  result: CommandResult,
  entries: Entry[],
  includeRaw = false,
): SVNQueryResult<Entry> {
  return {
    success: result.success,
    entries,
    ...(includeRaw ? { stdout: result.stdout } : {}),
    ...(result.stderr ? { stderr: result.stderr } : {}),
  };
}
