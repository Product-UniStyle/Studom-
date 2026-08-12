import * as XLSX from 'xlsx';
import University from '../models/University';
import Contributor from '../models/Contributor';
import { ImportReport } from './mainSheetImport';

interface PocSheetRow {
  ID?: string;
  Name?: string;
  Address?: string;
  Area?: string;
  ' Contributor Name'?: string;
  ' Contributor Course of Study '?: string;
  ' Contributor present year of study'?: string;
  'POC Name'?: string;
  'POC Contact email'?: string;
  'POC Contact phone number'?: string;
  'POC Contact FAX'?: string;
}

export function readPocSheetRows(buffer: Buffer): PocSheetRow[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheet = workbook.Sheets['POC'];
  if (!sheet) throw new Error('No "POC" sheet found in the uploaded file');
  return XLSX.utils.sheet_to_json<PocSheetRow>(sheet, { defval: null });
}

interface ValidRow {
  rowNum: number;
  sourceId: string;
  name?: string;
  contributorName?: string;
  courseOfStudy?: string;
  yearOfStudy?: string;
  pocUpdate: Record<string, unknown>;
}

export async function importPocSheet(buffer: Buffer, opts: { write: boolean }): Promise<ImportReport> {
  const rows = readPocSheetRows(buffer);
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
    const name = typeof row.Name === 'string' ? row.Name.trim() : undefined;

    if (!sourceId) {
      report.skipped++;
      report.rows.push({ row: rowNum, name, action: 'skip', reason: 'Missing ID' });
      continue;
    }

    validRows.push({
      rowNum,
      sourceId,
      name,
      contributorName: typeof row[' Contributor Name'] === 'string' ? row[' Contributor Name']!.trim() || undefined : undefined,
      courseOfStudy: row[' Contributor Course of Study ']?.trim() || undefined,
      yearOfStudy: row[' Contributor present year of study']?.trim() || undefined,
      pocUpdate: {
        area: row.Area || undefined,
        'detail.poc.name': row['POC Name'] || undefined,
        'detail.poc.address': row.Address || undefined,
        'detail.poc.email': row['POC Contact email'] || undefined,
        'detail.poc.phone': row['POC Contact phone number'] || undefined,
        'detail.poc.fax': row['POC Contact FAX'] || undefined,
      },
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
    report.rows.push({ row: r.rowNum, sourceId: r.sourceId, name: r.name, action: 'skip', reason: `No university found with sourceId "${r.sourceId}"` });
  }

  if (opts.write && matchedRows.length > 0) {
    const universityOps = matchedRows.map((r) => ({
      updateOne: {
        filter: { _id: universityIdBySourceId.get(r.sourceId) },
        update: { $set: r.pocUpdate },
      },
    }));
    await University.bulkWrite(universityOps, { ordered: false });

    const contributorRows = matchedRows.filter((r) => r.contributorName);
    if (contributorRows.length > 0) {
      const contributorOps = contributorRows.map((r) => ({
        updateOne: {
          filter: { universityId: universityIdBySourceId.get(r.sourceId), name: r.contributorName },
          update: { $set: { courseOfStudy: r.courseOfStudy, yearOfStudy: r.yearOfStudy } },
          upsert: true,
        },
      }));
      await Contributor.bulkWrite(contributorOps, { ordered: false });
    }
  }

  for (const r of matchedRows) {
    report.updated++;
    report.rows.push({ row: r.rowNum, sourceId: r.sourceId, name: r.name, action: 'update' });
  }

  report.rows.sort((a, b) => a.row - b.row);
  return report;
}
