import * as XLSX from 'xlsx';
import { importMainSheet, ImportReport } from './mainSheetImport';
import { importPocSheet } from './pocSheetImport';
import { importReviewsSheet } from './reviewSheetImport';

export interface CombinedImportReport {
  sheetsFound: string[];
  main: ImportReport | null;
  poc: ImportReport | null;
  reviews: ImportReport | null;
}

/**
 * Runs whichever of MAIN/POC/Reviews tabs are present in the uploaded
 * workbook, in that order — POC and Reviews FK-match against universities
 * by sourceId, so MAIN must be imported first for a fresh dataset to have
 * anything to match against.
 */
export async function importAllSheets(buffer: Buffer, opts: { write: boolean }): Promise<CombinedImportReport> {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetsFound = workbook.SheetNames;

  const result: CombinedImportReport = { sheetsFound, main: null, poc: null, reviews: null };

  if (sheetsFound.includes('MAIN')) {
    result.main = await importMainSheet(buffer, opts);
  }
  if (sheetsFound.includes('POC')) {
    result.poc = await importPocSheet(buffer, opts);
  }
  if (sheetsFound.includes('Reviews')) {
    result.reviews = await importReviewsSheet(buffer, opts);
  }

  return result;
}
