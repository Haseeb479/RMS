import nodemailer, { Transporter } from 'nodemailer';

// ─── Singleton transporter ─────────────────────────────────────────────────
let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!user || !pass) {
      throw new Error('Email not configured. Please set SMTP_USER and SMTP_PASS in your .env file.');
    }

    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for other ports
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
    });
  }
  return transporter;
}

// ─── Check if SMTP is configured ───────────────────────────────────────────
function isSmtpConfigured(): boolean {
  return !!(
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.SMTP_USER !== 'your-email@gmail.com' &&
    process.env.SMTP_PASS !== 'your-app-password-here'
  );
}

// ─── Verify SMTP connection on startup (non-blocking) ─────────────────────
export async function verifyEmailConnection(): Promise<boolean> {
  try {
    if (!isSmtpConfigured()) {
      console.warn('[Email] SMTP credentials not configured — email sending disabled.');
      return false;
    }
    await getTransporter().verify();
    console.log('[Email] ✅ SMTP connection verified. Email service ready.');
    return true;
  } catch (err: any) {
    console.warn('[Email] ⚠️ SMTP connection failed:', err.message);
    return false;
  }
}

// ─── Shared send helper ─────────────────────────────────────────────────────
async function sendMail(to: string, toName: string, subject: string, html: string): Promise<void> {
  const fromName = process.env.EMAIL_FROM_NAME || 'RMS Recruitment';
  const fromEmail = process.env.EMAIL_FROM || process.env.SMTP_USER;
  const info = await getTransporter().sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: `"${toName}" <${to}>`,
    subject,
    html,
  });
  console.log(`[Email] ✅ Sent to ${to} | subject: "${subject}" | msgId: ${info.messageId}`);
}

// ─── Base layout wrapper ────────────────────────────────────────────────────
function baseLayout(title: string, content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#0f1117;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f1117;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1,#4f46e5);border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
              <div style="font-size:32px;margin-bottom:8px;">📋</div>
              <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0;letter-spacing:-0.5px;">
                RMS Recruitment
              </h1>
              <p style="color:rgba(255,255,255,0.7);font-size:13px;margin:6px 0 0 0;">
                Recruitment Management System
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="background:#1e293b;padding:40px;border-left:1px solid rgba(255,255,255,0.08);border-right:1px solid rgba(255,255,255,0.08);">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#0f172a;border-radius:0 0 16px 16px;padding:24px 40px;text-align:center;border:1px solid rgba(255,255,255,0.06);">
              <p style="color:#475569;font-size:12px;margin:0;line-height:1.6;">
                This email was sent by RMS Recruitment Management System.<br />
                If you have any questions, please contact your recruiter directly.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

// ─── Shared Types ──────────────────────────────────────────────────────────

export interface InterviewEmailData {
  candidateName: string;
  candidateEmail: string;
  jobTitle?: string;
  interviewTitle: string;
  interviewType: string;
  scheduledAt: Date;
  duration: number;
  location?: string | null;
  interviewerName?: string | null;
  interviewerEmail?: string | null;
  companyName?: string;
}

// ─── Utility Helpers ───────────────────────────────────────────────────────

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function capitalizeType(type: string): string {
  const map: Record<string, string> = {
    screening: 'Screening Call',
    technical: 'Technical Interview',
    behavioral: 'Behavioral Interview',
    hr: 'HR Round',
    culture_fit: 'Culture Fit Interview',
    final: 'Final Round',
  };
  return map[type] || type.charAt(0).toUpperCase() + type.slice(1);
}

function buildDetailsCard(data: InterviewEmailData): string {
  const dateStr = formatDate(data.scheduledAt);
  const timeStr = formatTime(data.scheduledAt);
  const isLink = data.location?.startsWith('http');
  const locationHtml = data.location
    ? isLink
      ? `<a href="${data.location}" style="color:#818cf8;text-decoration:underline;">${data.location}</a>`
      : data.location
    : 'To be communicated';

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.25);border-radius:12px;margin-bottom:28px;">
      <tr>
        <td style="padding:24px;">
          <h3 style="color:#818cf8;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 20px 0;">
            Interview Details
          </h3>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
                <span style="color:#64748b;font-size:13px;display:block;">📋 Title</span>
                <span style="color:#f8fafc;font-size:15px;font-weight:600;">${data.interviewTitle}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
                <span style="color:#64748b;font-size:13px;display:block;">🔖 Type</span>
                <span style="color:#f8fafc;font-size:15px;font-weight:600;">${capitalizeType(data.interviewType)}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
                <span style="color:#64748b;font-size:13px;display:block;">🗓 Date</span>
                <span style="color:#f8fafc;font-size:15px;font-weight:600;">${dateStr}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
                <span style="color:#64748b;font-size:13px;display:block;">⏰ Time</span>
                <span style="color:#f8fafc;font-size:15px;font-weight:600;">${timeStr}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
                <span style="color:#64748b;font-size:13px;display:block;">⏱ Duration</span>
                <span style="color:#f8fafc;font-size:15px;font-weight:600;">${data.duration} minutes</span>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
                <span style="color:#64748b;font-size:13px;display:block;">🔗 Location / Meeting Link</span>
                <span style="color:#f8fafc;font-size:15px;font-weight:600;">${locationHtml}</span>
              </td>
            </tr>
            ${data.interviewerName ? `
            <tr>
              <td style="padding:8px 0;">
                <span style="color:#64748b;font-size:13px;display:block;">🎙 Interviewer</span>
                <span style="color:#f8fafc;font-size:15px;font-weight:600;">${data.interviewerName}${data.interviewerEmail ? ` &lt;<a href="mailto:${data.interviewerEmail}" style="color:#818cf8;">${data.interviewerEmail}</a>&gt;` : ''}</span>
              </td>
            </tr>
            ` : ''}
          </table>
        </td>
      </tr>
    </table>
    ${data.location?.startsWith('http') ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td align="center">
          <a href="${data.location}"
            style="display:inline-block;background:linear-gradient(135deg,#6366f1,#4f46e5);color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:10px;box-shadow:0 4px 14px rgba(99,102,241,0.4);">
            🎥 Join Interview
          </a>
        </td>
      </tr>
    </table>
    ` : ''}
  `;
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── TEMPLATE 1: Interview Scheduled (Instant Invite) ─────────────────────
// ═══════════════════════════════════════════════════════════════════════════

function buildInterviewScheduledEmail(data: InterviewEmailData): string {
  const content = `
    <h2 style="color:#f8fafc;font-size:22px;font-weight:700;margin:0 0 8px 0;">
      You've been invited for an interview! 🎉
    </h2>
    <p style="color:#94a3b8;font-size:15px;margin:0 0 28px 0;line-height:1.6;">
      Hi <strong style="color:#e2e8f0;">${data.candidateName}</strong>, congratulations! 
      You have been shortlisted and we would like to invite you for a 
      <strong style="color:#818cf8;">${capitalizeType(data.interviewType)}</strong>${data.jobTitle ? ` for the <strong style="color:#818cf8;">${data.jobTitle}</strong> position` : ''}.
    </p>

    ${buildDetailsCard(data)}

    <!-- Tips Section -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);border-radius:12px;margin-bottom:28px;">
      <tr>
        <td style="padding:20px 24px;">
          <h3 style="color:#34d399;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 12px 0;">
            ✅ Quick Preparation Tips
          </h3>
          <ul style="color:#94a3b8;font-size:14px;margin:0;padding-left:20px;line-height:1.8;">
            <li>Join 5 minutes early to test your connection</li>
            <li>Keep your resume and portfolio ready</li>
            <li>Be in a quiet, well-lit environment</li>
            <li>Prepare questions to ask the interviewer</li>
          </ul>
        </td>
      </tr>
    </table>

    <p style="color:#64748b;font-size:13px;margin:0;line-height:1.6;text-align:center;">
      We look forward to speaking with you. Best of luck! 🌟
    </p>
  `;

  return baseLayout(`Interview Invitation – ${data.interviewTitle}`, content);
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── TEMPLATE 2: 24-Hour Reminder ─────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

function buildInterviewReminderEmail(data: InterviewEmailData, hoursUntil: 24 | 1): string {
  const isOneHour = hoursUntil === 1;
  const urgencyColor = isOneHour ? '#f59e0b' : '#818cf8';
  const urgencyBg = isOneHour ? 'rgba(245,158,11,0.08)' : 'rgba(99,102,241,0.08)';
  const urgencyBorder = isOneHour ? 'rgba(245,158,11,0.3)' : 'rgba(99,102,241,0.3)';
  const urgencyEmoji = isOneHour ? '⚡' : '⏰';
  const urgencyText = isOneHour
    ? 'Your interview starts in <strong style="color:#f59e0b;">1 hour</strong>. Make sure you\'re ready!'
    : 'Your interview is <strong style="color:#818cf8;">tomorrow</strong>. Here\'s everything you need.';

  const content = `
    <!-- Urgency Banner -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:${urgencyBg};border:1px solid ${urgencyBorder};border-radius:12px;margin-bottom:28px;">
      <tr>
        <td style="padding:16px 24px;text-align:center;">
          <span style="font-size:28px;">${urgencyEmoji}</span>
          <p style="color:${urgencyColor};font-size:16px;font-weight:700;margin:8px 0 4px 0;">
            ${isOneHour ? '1-Hour Reminder' : '24-Hour Reminder'}
          </p>
          <p style="color:#94a3b8;font-size:14px;margin:0;line-height:1.6;">
            ${urgencyText}
          </p>
        </td>
      </tr>
    </table>

    <h2 style="color:#f8fafc;font-size:20px;font-weight:700;margin:0 0 8px 0;">
      Interview Reminder: ${data.interviewTitle}
    </h2>
    <p style="color:#94a3b8;font-size:15px;margin:0 0 28px 0;line-height:1.6;">
      Hi <strong style="color:#e2e8f0;">${data.candidateName}</strong>, this is a friendly reminder about your upcoming 
      <strong style="color:#818cf8;">${capitalizeType(data.interviewType)}</strong>${data.jobTitle ? ` for <strong style="color:#818cf8;">${data.jobTitle}</strong>` : ''}.
    </p>

    ${buildDetailsCard(data)}

    <!-- Checklist -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);border-radius:12px;margin-bottom:28px;">
      <tr>
        <td style="padding:20px 24px;">
          <h3 style="color:#34d399;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 12px 0;">
            ✅ ${isOneHour ? 'Last-Minute Checklist' : 'Preparation Checklist'}
          </h3>
          <ul style="color:#94a3b8;font-size:14px;margin:0;padding-left:20px;line-height:1.8;">
            ${isOneHour ? `
            <li>Open your meeting link now to test it</li>
            <li>Check your audio and camera settings</li>
            <li>Have your resume open and ready to share</li>
            <li>Get to a quiet, distraction-free location</li>
            ` : `
            <li>Review the job description and requirements</li>
            <li>Prepare your key accomplishments and examples</li>
            <li>Test your meeting link and equipment</li>
            <li>Prepare thoughtful questions to ask</li>
            <li>Get a good night's sleep — you've got this!</li>
            `}
          </ul>
        </td>
      </tr>
    </table>

    <p style="color:#64748b;font-size:13px;margin:0;line-height:1.6;text-align:center;">
      ${isOneHour ? 'You\'re almost there. Give it your best! 💪' : 'We look forward to speaking with you tomorrow. Good luck! 🌟'}
    </p>
  `;

  return baseLayout(`Reminder: ${data.interviewTitle} – ${isOneHour ? 'Starting in 1 Hour' : 'Tomorrow'}`, content);
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── TEMPLATE 3: Cancellation Email ───────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

function buildInterviewCancelledEmail(data: InterviewEmailData): string {
  const content = `
    <!-- Cancellation Banner -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.3);border-radius:12px;margin-bottom:28px;">
      <tr>
        <td style="padding:16px 24px;text-align:center;">
          <span style="font-size:28px;">❌</span>
          <p style="color:#f87171;font-size:16px;font-weight:700;margin:8px 0 4px 0;">
            Interview Cancelled
          </p>
          <p style="color:#94a3b8;font-size:14px;margin:0;line-height:1.6;">
            Your scheduled interview has been cancelled.
          </p>
        </td>
      </tr>
    </table>

    <h2 style="color:#f8fafc;font-size:20px;font-weight:700;margin:0 0 8px 0;">
      Interview Cancelled: ${data.interviewTitle}
    </h2>
    <p style="color:#94a3b8;font-size:15px;margin:0 0 28px 0;line-height:1.6;">
      Hi <strong style="color:#e2e8f0;">${data.candidateName}</strong>, we regret to inform you that your 
      <strong style="color:#818cf8;">${capitalizeType(data.interviewType)}</strong>${data.jobTitle ? ` for the <strong style="color:#818cf8;">${data.jobTitle}</strong> position` : ''} 
      has been <strong style="color:#f87171;">cancelled</strong>.
    </p>

    <!-- Cancelled Details -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(239,68,68,0.05);border:1px solid rgba(239,68,68,0.15);border-radius:12px;margin-bottom:28px;">
      <tr>
        <td style="padding:24px;">
          <h3 style="color:#f87171;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 16px 0;">
            Cancelled Interview Details
          </h3>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:6px 0;">
                <span style="color:#64748b;font-size:13px;">📋 Title:</span>
                <span style="color:#94a3b8;font-size:14px;margin-left:8px;">${data.interviewTitle}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:6px 0;">
                <span style="color:#64748b;font-size:13px;">🗓 Was Scheduled For:</span>
                <span style="color:#94a3b8;font-size:14px;margin-left:8px;">${formatDate(data.scheduledAt)} at ${formatTime(data.scheduledAt)}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- What to expect -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(99,102,241,0.06);border:1px solid rgba(99,102,241,0.15);border-radius:12px;margin-bottom:28px;">
      <tr>
        <td style="padding:20px 24px;">
          <h3 style="color:#818cf8;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 12px 0;">
            💬 What Happens Next?
          </h3>
          <p style="color:#94a3b8;font-size:14px;margin:0;line-height:1.8;">
            Our recruitment team will reach out to you soon to discuss next steps. 
            We apologize for any inconvenience caused and appreciate your understanding.
          </p>
        </td>
      </tr>
    </table>

    <p style="color:#64748b;font-size:13px;margin:0;line-height:1.6;text-align:center;">
      Thank you for your time and interest. We hope to connect with you soon.
    </p>
  `;

  return baseLayout(`Interview Cancelled – ${data.interviewTitle}`, content);
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── TEMPLATE 4: Rescheduled Email ────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

function buildInterviewRescheduledEmail(data: InterviewEmailData, oldDate?: Date): string {
  const content = `
    <!-- Reschedule Banner -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.3);border-radius:12px;margin-bottom:28px;">
      <tr>
        <td style="padding:16px 24px;text-align:center;">
          <span style="font-size:28px;">🔄</span>
          <p style="color:#fbbf24;font-size:16px;font-weight:700;margin:8px 0 4px 0;">
            Interview Rescheduled
          </p>
          <p style="color:#94a3b8;font-size:14px;margin:0;line-height:1.6;">
            Your interview has been moved to a new date and time.
          </p>
        </td>
      </tr>
    </table>

    <h2 style="color:#f8fafc;font-size:20px;font-weight:700;margin:0 0 8px 0;">
      Updated: ${data.interviewTitle}
    </h2>
    <p style="color:#94a3b8;font-size:15px;margin:0 0 28px 0;line-height:1.6;">
      Hi <strong style="color:#e2e8f0;">${data.candidateName}</strong>, your 
      <strong style="color:#818cf8;">${capitalizeType(data.interviewType)}</strong>${data.jobTitle ? ` for the <strong style="color:#818cf8;">${data.jobTitle}</strong> position` : ''}
      has been <strong style="color:#fbbf24;">rescheduled</strong>. Please find the updated details below.
    </p>

    ${oldDate ? `
    <!-- Old Date -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(239,68,68,0.05);border:1px solid rgba(239,68,68,0.15);border-radius:12px;margin-bottom:12px;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="color:#94a3b8;font-size:13px;margin:0;">
            <span style="color:#64748b;">❌ Previous Date:</span>
            <span style="text-decoration:line-through;margin-left:8px;">${formatDate(oldDate)} at ${formatTime(oldDate)}</span>
          </p>
        </td>
      </tr>
    </table>
    ` : ''}

    <!-- New Details -->
    <p style="color:#fbbf24;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 8px 0;">✅ New Schedule</p>
    ${buildDetailsCard(data)}

    <!-- Tips -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);border-radius:12px;margin-bottom:28px;">
      <tr>
        <td style="padding:20px 24px;">
          <h3 style="color:#34d399;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 12px 0;">
            ✅ Preparation Tips
          </h3>
          <ul style="color:#94a3b8;font-size:14px;margin:0;padding-left:20px;line-height:1.8;">
            <li>Update your calendar with the new date and time</li>
            <li>Re-check the meeting link or location details</li>
            <li>Continue your preparation — you're doing great!</li>
          </ul>
        </td>
      </tr>
    </table>

    <p style="color:#64748b;font-size:13px;margin:0;line-height:1.6;text-align:center;">
      We apologize for any inconvenience. Looking forward to connecting with you! 🌟
    </p>
  `;

  return baseLayout(`Interview Rescheduled – ${data.interviewTitle}`, content);
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── PUBLIC SEND FUNCTIONS ─────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

// 1. Send instant invite when interview is first created
export async function sendInterviewScheduledEmail(data: InterviewEmailData): Promise<void> {
  if (!isSmtpConfigured()) {
    console.log('[Email] Skipped (not configured) — would have sent invite to:', data.candidateEmail);
    return;
  }
  const html = buildInterviewScheduledEmail(data);
  await sendMail(
    data.candidateEmail,
    data.candidateName,
    `🎉 Interview Invitation: ${data.interviewTitle}${data.jobTitle ? ` – ${data.jobTitle}` : ''}`,
    html,
  );
}

// 2. Send scheduled reminder (24h or 1h before)
export async function sendInterviewReminderEmail(
  data: InterviewEmailData,
  hoursUntil: 24 | 1,
): Promise<void> {
  if (!isSmtpConfigured()) {
    console.log(`[Email] Skipped (not configured) — would have sent ${hoursUntil}h reminder to:`, data.candidateEmail);
    return;
  }
  const html = buildInterviewReminderEmail(data, hoursUntil);
  const label = hoursUntil === 1 ? 'Starting in 1 Hour' : 'Tomorrow';
  await sendMail(
    data.candidateEmail,
    data.candidateName,
    `⏰ Reminder: ${data.interviewTitle} – ${label}`,
    html,
  );
}

// 3. Send cancellation email
export async function sendInterviewCancelledEmail(data: InterviewEmailData): Promise<void> {
  if (!isSmtpConfigured()) {
    console.log('[Email] Skipped (not configured) — would have sent cancellation to:', data.candidateEmail);
    return;
  }
  const html = buildInterviewCancelledEmail(data);
  await sendMail(
    data.candidateEmail,
    data.candidateName,
    `❌ Interview Cancelled: ${data.interviewTitle}`,
    html,
  );
}

// 4. Send reschedule email
export async function sendInterviewRescheduledEmail(
  data: InterviewEmailData,
  oldDate?: Date,
): Promise<void> {
  if (!isSmtpConfigured()) {
    console.log('[Email] Skipped (not configured) — would have sent reschedule notice to:', data.candidateEmail);
    return;
  }
  const html = buildInterviewRescheduledEmail(data, oldDate);
  await sendMail(
    data.candidateEmail,
    data.candidateName,
    `🔄 Interview Rescheduled: ${data.interviewTitle}`,
    html,
  );
}
