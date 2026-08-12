const GRADE_KEYWORDS = /\b(grade|grades|kg|pre[\s-]?kg|prekg|nursery|fs\d?|year|kindergarten)\b/i;
const LABEL_PREFIX = /^(subjects?|courses?|tests?)\s*:\s*/i;

export interface ParsedGradeField {
  grade?: string;
  subjects: string[];
}

function cleanSubjects(parts: string[]): string[] {
  return parts
    .flatMap((p) => p.split(','))
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => p.replace(LABEL_PREFIX, '').replace(/^and\s+/i, '').trim())
    .filter(Boolean);
}

/**
 * The data team's "Grade" sheet column sometimes mixes a grade range with a
 * subjects/exam-prep list (e.g. "Grade: 6-12; JEE, KEAM, NEET, Foundation Exam",
 * or entirely just subjects with no grade range at all, e.g. "NEET, JEE, IELTS").
 * Splits the two back apart.
 */
export function parseGradeField(raw: string): ParsedGradeField {
  const trimmed = raw.trim();
  if (!trimmed) return { subjects: [] };

  const semiParts = trimmed.split(';').map((s) => s.trim()).filter(Boolean);

  if (semiParts.length > 1) {
    const looksLikeGrade = GRADE_KEYWORDS.test(semiParts[0]) || /\d/.test(semiParts[0]);
    if (looksLikeGrade) {
      return { grade: semiParts[0], subjects: cleanSubjects(semiParts.slice(1)) };
    }
    return { subjects: cleanSubjects(semiParts) };
  }

  const commaParts = trimmed.split(',').map((s) => s.trim()).filter(Boolean);
  if (commaParts.length > 1 && GRADE_KEYWORDS.test(commaParts[0]) && /\d/.test(commaParts[0])) {
    return { grade: commaParts[0], subjects: cleanSubjects(commaParts.slice(1)) };
  }

  if (GRADE_KEYWORDS.test(trimmed) && !/subject/i.test(trimmed)) {
    return { grade: trimmed, subjects: [] };
  }

  return { subjects: cleanSubjects(commaParts) };
}
