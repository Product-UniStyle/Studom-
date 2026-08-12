import * as XLSX from 'xlsx';
import { createHash } from 'crypto';
import University from '../models/University';
import Review from '../models/Review';
import { ImportReport } from './mainSheetImport';

interface ReviewSheetRow {
  ID?: string;
  'Reviewer Name'?: string;
  Rating?: number;
  'Review Text'?: string;
  Platform?: string;
  'Review Link'?: string;
}

function toNumber(v: unknown): number | undefined {
  if (v === null || v === undefined || v === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function hashReview(sourceId: string, reviewerName: string, text: string): string {
  return createHash('sha1').update(`${sourceId}::${reviewerName}::${text}`).digest('hex');
}

export function readReviewsSheetRows(buffer: Buffer): ReviewSheetRow[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheet = workbook.Sheets['Reviews'];
  if (!sheet) throw new Error('No "Reviews" sheet found in the uploaded file');
  return XLSX.utils.sheet_to_json<ReviewSheetRow>(sheet, { defval: null });
}

export async function importReviewsSheet(buffer: Buffer, opts: { write: boolean }): Promise<ImportReport> {
  const rows = readReviewsSheetRows(buffer);
  const report: ImportReport = {
    totalRows: rows.length,
    created: 0,
    updated: 0,
    skipped: 0,
    warnings: [],
    rows: [],
  };

  for (let i = 0; i < rows.length; i++) {
    const rowNum = i + 2;
    const row = rows[i];
    const sourceId = typeof row.ID === 'string' ? row.ID.trim() : undefined;
    const reviewerName = typeof row['Reviewer Name'] === 'string' ? row['Reviewer Name'].trim() : undefined;
    const text = typeof row['Review Text'] === 'string' ? row['Review Text'].trim() : undefined;

    if (!sourceId || !reviewerName || !text) {
      report.skipped++;
      report.rows.push({ row: rowNum, sourceId, name: reviewerName, action: 'skip', reason: 'Missing ID, Reviewer Name, or Review Text' });
      continue;
    }

    const university = await University.findOne({ sourceId }).select('_id');
    if (!university) {
      report.skipped++;
      report.rows.push({ row: rowNum, sourceId, name: reviewerName, action: 'skip', reason: `No university found with sourceId "${sourceId}"` });
      continue;
    }

    const sourceHash = hashReview(sourceId, reviewerName, text);
    const existing = await Review.findOne({ sourceHash }).select('_id').lean();

    if (opts.write) {
      await Review.findOneAndUpdate(
        { sourceHash },
        {
          $set: {
            universityId: university._id,
            reviewerName,
            text,
            rating: toNumber(row.Rating),
            platform: row.Platform || undefined,
            link: row['Review Link'] || undefined,
          },
        },
        { upsert: true, setDefaultsOnInsert: true }
      );
    }

    if (existing) {
      report.updated++;
      report.rows.push({ row: rowNum, sourceId, name: reviewerName, action: 'update' });
    } else {
      report.created++;
      report.rows.push({ row: rowNum, sourceId, name: reviewerName, action: 'create' });
    }
  }

  return report;
}
