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

    const university = await University.findOne({ sourceId }).select('_id');
    if (!university) {
      report.skipped++;
      report.rows.push({ row: rowNum, sourceId, name, action: 'skip', reason: `No university found with sourceId "${sourceId}"` });
      continue;
    }

    const contributorName = typeof row[' Contributor Name'] === 'string' ? row[' Contributor Name']!.trim() : undefined;

    if (opts.write) {
      await University.updateOne(
        { _id: university._id },
        {
          $set: {
            area: row.Area || undefined,
            'detail.poc.name': row['POC Name'] || undefined,
            'detail.poc.address': row.Address || undefined,
            'detail.poc.email': row['POC Contact email'] || undefined,
            'detail.poc.phone': row['POC Contact phone number'] || undefined,
            'detail.poc.fax': row['POC Contact FAX'] || undefined,
          },
        }
      );

      if (contributorName) {
        await Contributor.findOneAndUpdate(
          { universityId: university._id, name: contributorName },
          {
            $set: {
              courseOfStudy: row[' Contributor Course of Study ']?.trim() || undefined,
              yearOfStudy: row[' Contributor present year of study']?.trim() || undefined,
            },
          },
          { upsert: true, setDefaultsOnInsert: true }
        );
      }
    }

    report.updated++;
    report.rows.push({ row: rowNum, sourceId, name, action: 'update' });
  }

  return report;
}
