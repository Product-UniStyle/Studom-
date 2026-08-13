import * as XLSX from 'xlsx';
import University, { UNIVERSITY_TYPE_VALUES, UniversityType } from '../models/University';
import { resolveInclusionIdsMap } from './inclusions';
import { parseGradeField } from './parseGradeField';
import { uniqueSlug } from './slugify';

interface MainSheetRow {
  ID?: string;
  Name?: string;
  'Institute Origin'?: string;
  'Fields of Study'?: string;
  Locality?: string;
  Mode?: string;
  Board?: string;
  Grade?: string;
  Subjects?: string;
  Performance?: string;
  'UAE Rank'?: number;
  'UAE Score'?: number;
  'QS Rank'?: number;
  'Overall Scores'?: number;
  Website?: string;
  Country?: string;
  City?: string;
  About?: string;
  latitude?: number;
  longitude?: number;
  'Google map'?: string;
  Ratings?: number;
  'Total Reviews'?: number;
  Inclusions?: string;
  Type?: string;
}

export interface ImportRowResult {
  row: number;
  sourceId?: string;
  name?: string;
  action: 'create' | 'update' | 'skip';
  reason?: string;
}

export interface ImportReport {
  totalRows: number;
  created: number;
  updated: number;
  skipped: number;
  warnings: string[];
  rows: ImportRowResult[];
}

function toNumber(v: unknown): number | undefined {
  if (v === null || v === undefined || v === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function splitList(v: unknown): string[] {
  if (typeof v !== 'string' || !v.trim()) return [];
  return v
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function splitParagraphs(v: unknown): string[] {
  if (typeof v !== 'string' || !v.trim()) return [];
  return v
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function normalizeType(v: unknown): UniversityType | undefined {
  if (typeof v !== 'string') return undefined;
  const trimmed = v.trim();
  return (UNIVERSITY_TYPE_VALUES as string[]).includes(trimmed) ? (trimmed as UniversityType) : undefined;
}

export function readMainSheetRows(buffer: Buffer): MainSheetRow[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheet = workbook.Sheets['MAIN'];
  if (!sheet) throw new Error('No "MAIN" sheet found in the uploaded file');
  return XLSX.utils.sheet_to_json<MainSheetRow>(sheet, { defval: null });
}

interface ValidRow {
  rowNum: number;
  sourceId: string;
  name: string;
  inclusionLabels: string[];
  payload: Record<string, unknown>;
}

export async function importMainSheet(buffer: Buffer, opts: { write: boolean }): Promise<ImportReport> {
  const rows = readMainSheetRows(buffer);
  const report: ImportReport = {
    totalRows: rows.length,
    created: 0,
    updated: 0,
    skipped: 0,
    warnings: [],
    rows: [],
  };

  const validRows: ValidRow[] = [];

  for (let i = 0; i < rows.length; i++) {
    const rowNum = i + 2; // +1 for 0-index, +1 for header row
    const row = rows[i];
    const sourceId = typeof row.ID === 'string' ? row.ID.trim() : undefined;
    const name = typeof row.Name === 'string' ? row.Name.trim() : undefined;
    const type = normalizeType(row.Type);

    if (!sourceId || !name) {
      report.skipped++;
      report.rows.push({ row: rowNum, sourceId, name, action: 'skip', reason: 'Missing ID or Name' });
      continue;
    }
    if (!type) {
      report.skipped++;
      report.rows.push({ row: rowNum, sourceId, name, action: 'skip', reason: `Unrecognized Type "${row.Type}"` });
      continue;
    }
    if (!row.City || !row.Country) {
      report.warnings.push(`Row ${rowNum} (${name}): missing City or Country`);
    }

    const inclusionLabels = splitList(row.Inclusions);
    const { grade, subjects: subjectsFromGrade } = typeof row.Grade === 'string' ? parseGradeField(row.Grade) : { grade: undefined, subjects: [] };
    const subjectsFromColumn = splitList(row.Subjects);
    const subjects = [...new Set([...subjectsFromColumn, ...subjectsFromGrade])];

    // Dot-notation keys so this only ever touches these specific detail
    // subfields — a plain `detail: {...}` would replace the whole nested
    // object on $set and wipe out `detail.poc`, which is owned by the
    // separate POC-sheet importer and may already be set. `logo` and
    // `detail.gallery` are deliberately never set here — those are
    // uploaded to S3 through the admin UI only, never from the sheet.
    const payload = {
      sourceId,
      name,
      origin: row['Institute Origin'] || undefined,
      city: typeof row.City === 'string' ? row.City.trim() : undefined,
      country: typeof row.Country === 'string' ? row.Country.trim() : undefined,
      type,
      qsRank: toNumber(row['QS Rank']),
      uaeRank: toNumber(row['UAE Rank']),
      uaeScore: toNumber(row['UAE Score']),
      overallScore: toNumber(row['Overall Scores']),
      latitude: toNumber(row.latitude),
      longitude: toNumber(row.longitude),
      googleMapLink: row['Google map'] || undefined,
      aggregateRating: toNumber(row.Ratings),
      aggregateReviewCount: toNumber(row['Total Reviews']),
      'detail.about': splitParagraphs(row.About),
      'detail.website': row.Website || undefined,
      fieldsOfStudy: splitList(row['Fields of Study']),
      board: row.Board || undefined,
      grade,
      subjects,
      performance: row.Performance || undefined,
      locality: row.Locality || undefined,
      mode: row.Mode || undefined,
    };

    validRows.push({ rowNum, sourceId, name, inclusionLabels, payload });
  }

  if (validRows.length === 0) return report;

  // One query to know which sourceIds already exist, instead of one findOne per row.
  const existingDocs = await University.find({ sourceId: { $in: validRows.map((r) => r.sourceId) } })
    .select('sourceId')
    .lean();
  const existingSet = new Set(existingDocs.map((d) => d.sourceId));

  if (opts.write) {
    // Resolve every distinct inclusion label across the whole batch in one
    // pass instead of one round-trip per label per row.
    const allLabels = validRows.flatMap((r) => r.inclusionLabels);
    const inclusionMap = await resolveInclusionIdsMap(allLabels);
    const takenSlugs = new Set(
      (await University.distinct('slug')).filter((s): s is string => Boolean(s))
    );

    const ops = validRows.map((r) => {
      const update: Record<string, unknown> = {
        $set: {
          ...r.payload,
          inclusions: r.inclusionLabels
            .map((l) => inclusionMap.get(l.toLowerCase()))
            .filter((id): id is NonNullable<typeof id> => Boolean(id)),
        },
      };
      if (!existingSet.has(r.sourceId)) {
        update.$setOnInsert = { slug: uniqueSlug(r.name, takenSlugs) };
      }
      return {
        updateOne: {
          filter: { sourceId: r.sourceId },
          update,
          upsert: true,
        },
      };
    });

    await University.bulkWrite(ops, { ordered: false });
  }

  for (const r of validRows) {
    if (existingSet.has(r.sourceId)) {
      report.updated++;
      report.rows.push({ row: r.rowNum, sourceId: r.sourceId, name: r.name, action: 'update' });
    } else {
      report.created++;
      report.rows.push({ row: r.rowNum, sourceId: r.sourceId, name: r.name, action: 'create' });
    }
  }

  return report;
}
