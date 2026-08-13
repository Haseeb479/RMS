import { prisma } from '../config/database';
import * as fs from 'fs';
import * as path from 'path';

// Use lib path to avoid test file issues with pdf-parse
let pdfParse: any;
try {
  pdfParse = require('pdf-parse/lib/pdf-parse');
} catch {
  pdfParse = null;
}

export class ResumeService {
  // Create resume record
  static async create(
    companyId: string,
    candidateId: string | null,
    file: Express.Multer.File,
    extractedText: string
  ) {
    return await prisma.resume.create({
      data: {
        fileName: file.originalname,
        filePath: file.path,
        fileSize: file.size,
        mimeType: file.mimetype,
        extractedText,
        candidateId: candidateId || null,
        companyId,
      },
    });
  }

  // Get resume by ID
  static async getById(resumeId: string, companyId: string) {
    return await prisma.resume.findFirst({
      where: { id: resumeId, companyId },
    });
  }

  // Get candidate resumes
  static async getByCandidate(candidateId: string, companyId: string) {
    return await prisma.resume.findMany({
      where: { candidateId, companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Delete resume
  static async delete(resumeId: string, companyId: string) {
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, companyId },
    });

    if (!resume) {
      throw new Error('Resume not found');
    }

    // Delete file from disk (best-effort)
    try {
      if (fs.existsSync(resume.filePath)) {
        fs.unlinkSync(resume.filePath);
      }
    } catch (err) {
      console.warn('Could not delete file from disk:', err);
    }

    // Delete database record
    return await prisma.resume.delete({
      where: { id: resumeId },
    });
  }

  // Extract text from file
  static async extractTextFromFile(file: Express.Multer.File): Promise<string> {
    try {
      const ext = path.extname(file.originalname).toLowerCase();

      if (ext === '.pdf') {
        return await this.extractTextFromPDF(file.path);
      } else if (ext === '.docx' || ext === '.doc') {
        return await this.extractTextFromDocx(file.path);
      } else if (ext === '.txt') {
        return fs.readFileSync(file.path, 'utf-8');
      }

      return '';
    } catch (error) {
      console.error('Error extracting text:', error);
      return '';
    }
  }

  // Extract text from PDF
  private static async extractTextFromPDF(filePath: string): Promise<string> {
    try {
      if (!pdfParse) return '';
      const fileBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(fileBuffer);
      return data.text || '';
    } catch (error) {
      console.error('Error extracting PDF text:', error);
      return '';
    }
  }

  // Extract text from DOCX
  private static async extractTextFromDocx(_filePath: string): Promise<string> {
    // In production, use: npm install mammoth
    return 'DOCX file uploaded. Text extraction available with mammoth library.';
  }

  // Parse resume for candidate info
  static parseResumeData(text: string): any {
    if (!text) return {};

    const parsed: any = {};

    // Extract email
    const emailMatch = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
    if (emailMatch) {
      parsed.email = emailMatch[1];
    }

    // Extract phone
    const phoneMatch = text.match(/(\+?1?\s*\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})/);
    if (phoneMatch) {
      parsed.phone = phoneMatch[1];
    }

    // Extract years of experience
    const experienceMatch = text.match(/([0-9]+)\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)/i);
    if (experienceMatch) {
      parsed.experience = parseInt(experienceMatch[1]);
    }

    // Extract skills
    const skillsMatch = text.match(/Skills?.*?:\s*([^\n]+)/i);
    if (skillsMatch) {
      parsed.skills = skillsMatch[1].split(/[,;]/).map((s: string) => s.trim()).filter(Boolean);
    }

    // Try to extract name from first non-empty line
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length > 0) {
      const firstLine = lines[0];
      if (firstLine.length > 0 && firstLine.length < 60) {
        const nameParts = firstLine.split(/\s+/);
        if (nameParts.length >= 2) {
          parsed.firstName = nameParts[0];
          parsed.lastName = nameParts.slice(1).join(' ');
        }
      }
    }

    return parsed;
  }
}