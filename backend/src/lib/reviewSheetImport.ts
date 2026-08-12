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

interface ValidRow {
  rowNum: number;
  sourceId: string;
  reviewerName: string;
  text: string;
  sourceHash: string;
  rating?: number;
  platform?: string;
  link?: string;
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

  const validRows: ValidRow[] = [];

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

    validRows.push({
      rowNum,
      sourceId,
      reviewerName,
      text,
      sourceHash: hashReview(sourceId, reviewerName, text),
      rating: toNumber(row.Rating),
      platform: row.Platform || undefined,
      link: row['Review Link'] || undefined,
    });
  }

  if (validRows.length === 0) return report;

  // One query for every matching university instead of one findOne per row.
  const universities = await University.find({ sourceId: { $in: validRows.map((r) => r.sourceId) } })
    .select('sourceId')
    .lean();
  const universityIdBySourceId = new Map(universities.map((u) => [u.sourceId as string, u._id]));

  const matchedRows = validRows.filter((r) => universityIdBySourceId.has(r.sourceId));
  const unmatchedRows = validRows.filter((r) => !universityIdBySourceId.has(r.sourceId));

  for (const r of unmatchedRows) {
    report.skipped++;
    report.rows.push({ row: r.rowNum, sourceId: r.sourceId, name: r.reviewerName, action: 'skip', reason: `No university found with sourceId "${r.sourceId}"` });
  }

  // One query for every already-imported review instead of one findOne per row.
  const existingReviews = await Review.find({ sourceHash: { $in: matchedRows.map((r) => r.sourceHash) } })
    .select('sourceHash')
    .lean();
  const existingHashes = new Set(existingReviews.map((r) => r.sourceHash));

  if (opts.write && matchedRows.length > 0) {
    const ops = matchedRows.map((r) => ({
      updateOne: {
        filter: { sourceHash: r.sourceHash },
        update: {
          $set: {
            universityId: universityIdBySourceId.get(r.sourceId),
            reviewerName: r.reviewerName,
            text: r.text,
            rating: r.rating,
            platform: r.platform,
            link: r.link,
          },
        },
        upsert: true,
      },
    }));
    await Review.bulkWrite(ops, { ordered: false });
  }

  for (const r of matchedRows) {
    if (existingHashes.has(r.sourceHash)) {
      report.updated++;
      report.rows.push({ row: r.rowNum, sourceId: r.sourceId, name: r.reviewerName, action: 'update' });
    } else {
      report.created++;
      report.rows.push({ row: r.rowNum, sourceId: r.sourceId, name: r.reviewerName, action: 'create' });
    }
  }

  report.rows.sort((a, b) => a.row - b.row);
  return report;
}
