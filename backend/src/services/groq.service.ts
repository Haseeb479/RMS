import axios from 'axios';

export interface GeneratedEmailResponse {
  subject: string;
  body: string;
}

export interface AtsEvaluationResult {
  atsScore: number; // 0 - 100
  tier: 'top' | 'moderate' | 'low'; // top: 80-100, moderate: 60-79, low: <60
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  concerns: string[];
  recommendationReason: string;
}

export class GroqService {
  private static getApiKey(): string {
    const key = process.env.GROQ_API_KEY;
    if (!key) throw new Error('GROQ_API_KEY environment variable is not set.');
    return key;
  }

  private static getModel(): string {
    return process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
  }

  /**
   * Universal Chat Completion with Groq AI (Llama 3.3 70B)
   */
  static async chat(messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>, jsonMode: boolean = false): Promise<string> {
    const apiKey = this.getApiKey();
    try {
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: this.getModel(),
          messages,
          temperature: 0.3,
          max_tokens: 1200,
          response_format: jsonMode ? { type: 'json_object' } : undefined,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 20000,
        }
      );

      return response.data?.choices?.[0]?.message?.content || '';
    } catch (err: any) {
      console.error('[Groq AI Error]', err.response?.data || err.message);
      // If Groq API fails or times out, throw or fallback gracefully
      throw new Error(`Groq AI request failed: ${err.response?.data?.error?.message || err.message}`);
    }
  }

  /**
   * Deep ATS Resume & Job Requirement Evaluation
   */
  static async evaluateResumeAts(
    candidateData: {
      name?: string;
      email?: string;
      skills?: string[];
      experience?: number;
      resumeText?: string;
    },
    jobData: {
      title: string;
      description?: string;
      requirements?: string;
      salary?: string;
      type?: string;
    }
  ): Promise<AtsEvaluationResult> {
    const systemPrompt = `You are an expert Enterprise ATS (Applicant Tracking System) AI scoring engine.
Your task is to analyze candidate resume information against a job vacancy and return a strictly valid JSON object.
JSON format:
{
  "atsScore": number between 0 and 100,
  "tier": "top" (if score >= 80) | "moderate" (if score 60-79) | "low" (if score < 60),
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": ["missingSkill1"],
  "strengths": ["Key strength 1", "Key strength 2"],
  "concerns": ["Area of growth 1"],
  "recommendationReason": "Brief executive summary of why this candidate is or isn't a strong match."
}`;

    const userPrompt = `Evaluate this candidate for the following Job Position:
JOB POSITION:
- Title: ${jobData.title}
- Requirements: ${jobData.requirements || 'Standard industry requirements'}
- Description: ${jobData.description || 'Not specified'}

CANDIDATE INFORMATION:
- Name: ${candidateData.name || 'Candidate'}
- Skills: ${JSON.stringify(candidateData.skills || [])}
- Experience (Years): ${candidateData.experience || 'Not specified'}
- Resume Summary Text:
${(candidateData.resumeText || '').slice(0, 1500)}

Perform strict keyword, domain proficiency, experience depth, and tech stack matching. Return JSON only.`;

    try {
      const rawJson = await this.chat(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        true
      );

      const parsed = JSON.parse(rawJson);
      const score = Math.max(0, Math.min(100, Math.round(Number(parsed.atsScore) || 75)));
      const tier: 'top' | 'moderate' | 'low' = score >= 80 ? 'top' : score >= 60 ? 'moderate' : 'low';

      return {
        atsScore: score,
        tier,
        matchedSkills: Array.isArray(parsed.matchedSkills) ? parsed.matchedSkills : (candidateData.skills || []).slice(0, 4),
        missingSkills: Array.isArray(parsed.missingSkills) ? parsed.missingSkills : [],
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : ['Relevant background and technical experience'],
        concerns: Array.isArray(parsed.concerns) ? parsed.concerns : [],
        recommendationReason: parsed.recommendationReason || `${candidateData.name || 'Candidate'} demonstrates good alignment with the ${jobData.title} role.`,
      };
    } catch (err: any) {
      console.warn('[Groq ATS Fallback]', err.message);
      // Fallback algorithmic scoring if API is unreachable
      const reqKeywords = (jobData.title + ' ' + (jobData.requirements || '')).toLowerCase();
      const empSkills = candidateData.skills || [];
      const matched = empSkills.filter(s => reqKeywords.includes(s.toLowerCase()));
      const missing = ['Advanced Domain Frameworks'];
      const score = Math.min(95, Math.max(35, Math.round((matched.length / Math.max(empSkills.length, 1)) * 50 + (candidateData.experience || 2) * 8 + 30)));
      const tier = score >= 80 ? 'top' : score >= 60 ? 'moderate' : 'low';

      return {
        atsScore: score,
        tier,
        matchedSkills: matched.length > 0 ? matched : empSkills.slice(0, 3),
        missingSkills: missing,
        strengths: [`Demonstrated proficiency in ${matched.slice(0, 2).join(', ') || 'core skills'}`],
        concerns: ['Needs verification during technical screening'],
        recommendationReason: `Algorithmic match evaluated candidate with ${score}% alignment for ${jobData.title}.`,
      };
    }
  }

  /**
   * AI Email Drafter for Recruiter Outreach & Confirmation
   */
  static async generatePersonalizedEmail(
    type: 'interview_invitation' | 'rejection' | 'application_ack' | 'offer_announcement' | 'custom',
    candidate: { name: string; email: string; skills?: string[]; experience?: number; atsScore?: number },
    job: { title: string; companyName?: string; location?: string },
    customPrompt?: string
  ): Promise<GeneratedEmailResponse> {
    const systemPrompt = `You are an elite Executive Recruiter AI assistant working at ${job.companyName || 'RMS Enterprise'}.
Your task is to write warm, highly professional, polished recruitment emails.
Return your response ONLY as a JSON object:
{
  "subject": "Compelling subject line",
  "body": "Complete email body formatted in clean paragraphs with signoff."
}`;

    let instruction = '';
    if (type === 'interview_invitation') {
      instruction = `Write an exciting, personalized Interview Invitation email to ${candidate.name} for the position of "${job.title}".
Highlight why their specific experience and background (ATS Score: ${candidate.atsScore || 85}%) impressed our hiring team.
Invite them to a 45-minute video interview, offering flexibility and next steps to confirm their availability.`;
    } else if (type === 'rejection') {
      instruction = `Write an empathetic, courteous, professional Rejection email to ${candidate.name} for the position of "${job.title}".
Thank them sincerely for their time, compliment their strong qualifications, and let them know we will keep their profile in our talent pool for future openings.`;
    } else if (type === 'offer_announcement') {
      instruction = `Write an enthusiastic, congratulatory Job Offer announcement email to ${candidate.name} for the "${job.title}" role.`;
    } else {
      instruction = customPrompt || `Write a professional recruitment outreach email to ${candidate.name} for the "${job.title}" position.`;
    }

    try {
      const rawJson = await this.chat(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: instruction },
        ],
        true
      );

      const parsed = JSON.parse(rawJson);
      return {
        subject: parsed.subject || `Interview Invitation: ${job.title} at ${job.companyName || 'RMS'}`,
        body: parsed.body || `Dear ${candidate.name},\n\nThank you for your interest in the ${job.title} role. We were very impressed by your background and would love to invite you for an interview.\n\nBest regards,\nRecruitment Team`,
      };
    } catch (err: any) {
      console.warn('[Groq Email Fallback]', err.message);
      // Fallback template
      return {
        subject: `Interview Invitation: ${job.title} at ${job.companyName || 'RMS'}`,
        body: `Dear ${candidate.name},\n\nThank you for applying for the ${job.title} position at ${job.companyName || 'our company'}. Our hiring team reviewed your resume and credentials (ATS Match Score: ${candidate.atsScore || 88}%), and we are very impressed with your background.\n\nWe would love to invite you for a 45-minute technical and introductory interview to discuss the role and learn more about your experience.\n\nPlease reply to this email with your preferred dates and times over the next few days, or let us know if you have any questions in the meantime.\n\nWe look forward to speaking with you!\n\nWarm regards,\nTalent Acquisition Team\n${job.companyName || 'RMS Enterprise'}`,
      };
    }
  }
}
