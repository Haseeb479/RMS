import { prisma } from '../config/database';

export class BooleanSearchService {
  static async searchResumes(companyId: string, rawQuery: string) {
    if (!rawQuery || !rawQuery.trim()) {
      return { results: [], total: 0, query: '' };
    }

    const queryStr = rawQuery.trim();
    // Parse AND, OR, NOT clauses
    const tokens = queryStr.split(/\s+/);
    const andTerms: string[] = [];
    const notTerms: string[] = [];

    let isNot = false;
    tokens.forEach((token) => {
      const u = token.toUpperCase();
      if (u === 'NOT') {
        isNot = true;
      } else if (u === 'AND' || u === 'OR') {
        // Continue
      } else {
        const clean = token.replace(/[^a-zA-Z0-9.#+-]/g, '');
        if (clean) {
          if (isNot) {
            notTerms.push(clean.toLowerCase());
            isNot = false;
          } else {
            andTerms.push(clean.toLowerCase());
          }
        }
      }
    });

    const candidates = await prisma.candidate.findMany({
      where: { companyId },
      include: {
        resumes: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        applications: {
          include: { job: true },
          take: 1,
        },
      },
    });

    const results: any[] = [];

    candidates.forEach((c) => {
      const resume = c.resumes?.[0];
      const cvText = (resume?.extractedText || '').toLowerCase();
      const searchableText = `${c.firstName} ${c.lastName} ${c.email} ${c.skills || ''} ${c.notes || ''} ${cvText}`.toLowerCase();

      // Check NOT terms
      const hasNotTerm = notTerms.some((term) => searchableText.includes(term));
      if (hasNotTerm) return;

      // Check AND terms
      const matchesAllAnd = andTerms.every((term) => searchableText.includes(term));
      if (!matchesAllAnd && andTerms.length > 0) return;

      // Extract matching text snippet from resume text
      let snippet = '';
      if (resume?.extractedText && andTerms.length > 0) {
        const lowerCv = resume.extractedText.toLowerCase();
        const firstTerm = andTerms[0];
        const matchIdx = lowerCv.indexOf(firstTerm);
        if (matchIdx !== -1) {
          const start = Math.max(0, matchIdx - 60);
          const end = Math.min(resume.extractedText.length, matchIdx + 120);
          snippet = `...${resume.extractedText.slice(start, end).trim()}...`;
        } else {
          snippet = resume.extractedText.slice(0, 150) + '...';
        }
      } else if (resume?.extractedText) {
        snippet = resume.extractedText.slice(0, 150) + '...';
      }

      results.push({
        candidate: c,
        matchedTerms: andTerms,
        snippet,
        resumeFileName: resume?.fileName || null,
        resumeId: resume?.id || null,
      });
    });

    return {
      results,
      total: results.length,
      query: queryStr,
      andTerms,
      notTerms,
    };
  }
}
