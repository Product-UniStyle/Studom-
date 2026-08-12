import * as XLSX from 'xlsx';
import { Model } from 'mongoose';
import { ImportReport } from './mainSheetImport';
import { IArticleSection } from '../models/NewsArticle';

interface ArticleSheetRow {
  Link?: string;
  'Main Image URL'?: string;
  'Main Title'?: string;
  'Main Content'?: string;
  Author?: string;
  Source?: string;
  Date?: Date;
  Destination?: string;
  Type?: string;
  [key: string]: unknown; // Section N Image/Title/Content, N = 1..20
}

/**
 * The data team's News/Blogs sheets have been observed with an inconsistent
 * header row position (News has a blank banner row before the headers,
 * Blogs doesn't) — detect the real header row instead of assuming a fixed
 * offset, so a future formatting shift doesn't silently break this.
 */
function findHeaderRowIndex(ws: XLSX.WorkSheet): number {
  const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: null, blankrows: true });
  for (let i = 0; i < Math.min(10, rows.length); i++) {
    if (rows[i]?.[0] === 'S. No') return i;
  }
  return 0;
}

export function readArticleSheetRows(buffer: Buffer, sheetName: string): ArticleSheetRow[] {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) throw new Error(`No "${sheetName}" sheet found in the uploaded file`);
  const headerRow = findHeaderRowIndex(sheet);
  return XLSX.utils.sheet_to_json<ArticleSheetRow>(sheet, { defval: null, range: headerRow });
}

function extractSections(row: ArticleSheetRow): IArticleSection[] {
  const sections: IArticleSection[] = [];
  for (let n = 1; n <= 20; n++) {
    const content = row[`Section ${n} Content`];
    if (typeof content !== 'string' || !content.trim()) continue;
    const title = row[`Section ${n} Title`];
    const image = row[`Section ${n} Image`];
    sections.push({
      order: n,
      content: content.trim(),
      title: typeof title === 'string' && title.trim() ? title.trim() : undefined,
      image: typeof image === 'string' && image.trim() ? image.trim() : undefined,
    });
  }
  return sections;
}

interface ValidRow {
  rowNum: number;
  sourceLink: string;
  title: string;
  payload: Record<string, unknown>;
}

export async function importArticleSheet(
  model: Model<any>, // eslint-disable-line @typescript-eslint/no-explicit-any
  sheetName: string,
  buffer: Buffer,
  opts: { write: boolean }
): Promise<ImportReport> {
  const rows = readArticleSheetRows(buffer, sheetName);
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
    const rowNum = i + 2;
    const row = rows[i];
    const title = typeof row['Main Title'] === 'string' ? row['Main Title'].trim() : undefined;
    const sourceLink = typeof row.Link === 'string' ? row.Link.trim() : undefined;

    if (!title || !sourceLink) {
      report.skipped++;
      report.rows.push({ row: rowNum, name: title, action: 'skip', reason: 'Missing Main Title or Link' });
      continue;
    }

    validRows.push({
      rowNum,
      sourceLink,
      title,
      payload: {
        title,
        content: typeof row['Main Content'] === 'string' ? row['Main Content'].trim() : '',
        coverImage: row['Main Image URL'] || undefined,
        sourceLink,
        author: row.Author || undefined,
        source: row.Source || undefined,
        publishedDate: row.Date instanceof Date ? row.Date : undefined,
        destination: row.Destination || undefined,
        type: row.Type || undefined,
        sections: extractSections(row),
      },
    });
  }

  if (validRows.length === 0) return report;

  const existingDocs = await model
    .find({ sourceLink: { $in: validRows.map((r) => r.sourceLink) } })
    .select('sourceLink')
    .lean();
  const existingSet = new Set(existingDocs.map((d) => (d as unknown as { sourceLink: string }).sourceLink));

  if (opts.write) {
    const ops = validRows.map((r) => ({
      updateOne: {
        filter: { sourceLink: r.sourceLink },
        update: { $set: r.payload },
        upsert: true,
      },
    }));
    await model.bulkWrite(ops, { ordered: false });
  }

  for (const r of validRows) {
    if (existingSet.has(r.sourceLink)) {
      report.updated++;
      report.rows.push({ row: r.rowNum, name: r.title, action: 'update' });
    } else {
      report.created++;
      report.rows.push({ row: r.rowNum, name: r.title, action: 'create' });
    }
  }

  return report;
}
