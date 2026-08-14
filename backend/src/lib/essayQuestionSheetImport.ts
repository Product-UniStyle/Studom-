import * as XLSX from 'xlsx';
import University from '../models/University';
import { ImportReport } from './mainSheetImport';

interface EssayQuestionSheetRow {
  ID?: string;
  'Question ID'?: string;
  Question?: string;
}

export function readEssayQuestionSheetRows(buffer: Buffer): EssayQuestionSheetRow[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheet = workbook.Sheets['Essay Questions'];
  if (!sheet) throw new Error('No "Essay Questions" sheet found in the uploaded file');
  return XLSX.utils.sheet_to_json<EssayQuestionSheetRow>(sheet, { defval: null });
}

interface ValidRow {
  rowNum: number;
  sourceId: string;
  questionId: string;
  question: string;
}

// Essay questions are embedded directly on University.essayQuestions (a
// simple array field, not their own collection — see the embed-vs-collection
// project rule), so unlike Reviews (one row = one document) this importer
// has to group many sheet rows per sourceId into that one array. Each sheet
// row's own "Question ID" is stored as sourceRowId on the subdocument, so a
// re-import only replaces the subset of a university's questions that came
// from the sheet — any question an admin added manually (no sourceRowId) is
// left completely untouched, never silently deleted by a re-upload.
export async function importEssayQuestionsSheet(buffer: Buffer, opts: { write: boolean }): Promise<ImportReport> {
  const rows = readEssayQuestionSheetRows(buffer);
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
    const questionId = typeof row['Question ID'] === 'string' ? row['Question ID'].trim() : undefined;
    const question = typeof row.Question === 'string' ? row.Question.trim() : undefined;

    if (!sourceId || !questionId || !question) {
      report.skipped++;
      report.rows.push({ row: rowNum, sourceId, action: 'skip', reason: 'Missing ID, Question ID, or Question' });
      continue;
    }

    validRows.push({ rowNum, sourceId, questionId, question });
  }

  if (validRows.length === 0) return report;

  const sourceIds = [...new Set(validRows.map((r) => r.sourceId))];
  const universities = await University.find({ sourceId: { $in: sourceIds } })
    .select('sourceId name essayQuestions')
    .lean();
  const universityBySourceId = new Map(universities.map((u) => [u.sourceId as string, u]));

  const rowsBySourceId = new Map<string, ValidRow[]>();
  for (const r of validRows) {
    if (!universityBySourceId.has(r.sourceId)) {
      report.skipped++;
      report.rows.push({ row: r.rowNum, sourceId: r.sourceId, action: 'skip', reason: `No university found with sourceId "${r.sourceId}"` });
      continue;
    }
    const existing = rowsBySourceId.get(r.sourceId);
    if (existing) existing.push(r);
    else rowsBySourceId.set(r.sourceId, [r]);
  }

  if (opts.write && rowsBySourceId.size > 0) {
    const ops = [...rowsBySourceId.entries()].map(([sourceId, group]) => {
      const university = universityBySourceId.get(sourceId)!;
      const manualQuestions = (university.essayQuestions || []).filter((q) => !q.sourceRowId);
      const sheetQuestions = group.map((g) => ({ question: g.question, sourceRowId: g.questionId }));
      return {
        updateOne: {
          filter: { sourceId },
          update: { $set: { essayQuestions: [...manualQuestions, ...sheetQuestions] } },
        },
      };
    });
    await University.bulkWrite(ops, { ordered: false });
  }

  for (const [sourceId, group] of rowsBySourceId) {
    const university = universityBySourceId.get(sourceId)!;
    const existingSheetIds = new Set(
      (university.essayQuestions || []).filter((q) => q.sourceRowId).map((q) => q.sourceRowId)
    );
    for (const r of group) {
      if (existingSheetIds.has(r.questionId)) {
        report.updated++;
        report.rows.push({ row: r.rowNum, sourceId, name: university.name, action: 'update' });
      } else {
        report.created++;
        report.rows.push({ row: r.rowNum, sourceId, name: university.name, action: 'create' });
      }
    }
  }

  report.rows.sort((a, b) => a.row - b.row);
  return report;
}
