/**
 * email.scheduler.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Cron-based email scheduler that runs every minute and sends:
 *   • 24-hour reminder before each interview  (fires when 23h 30m – 24h 30m away)
 *   • 1-hour  reminder before each interview  (fires when  30m –  1h 30m away)
 *
 * Each reminder is sent only once — tracked via `reminder24hSent` / `reminder1hSent`
 * boolean columns on the Interview model.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import cron from 'node-cron';
import { prisma } from '../config/database';
import {
  sendInterviewReminderEmail,
  InterviewEmailData,
} from './email.service';

// ─── Window constants (ms) ────────────────────────────────────────────────
const HOUR = 60 * 60 * 1000;
const MINUTE = 60 * 1000;

// The cron runs every minute.  We fire a reminder when the interview is
// within ±30 minutes of the target window to avoid race conditions.
const WINDOW_24H_LOWER = 23 * HOUR + 30 * MINUTE;
const WINDOW_24H_UPPER = 24 * HOUR + 30 * MINUTE;
const WINDOW_1H_LOWER  = 30 * MINUTE;
const WINDOW_1H_UPPER  = 1 * HOUR + 30 * MINUTE;

// ─── Helper: build InterviewEmailData from a DB row ───────────────────────
function toEmailData(interview: any): InterviewEmailData {
  return {
    candidateName: `${interview.candidate.firstName} ${interview.candidate.lastName}`,
    candidateEmail: interview.candidate.email,
    jobTitle: interview.job?.title,
    interviewTitle: interview.title,
    interviewType: interview.type,
    scheduledAt: interview.scheduledAt,
    duration: interview.duration,
    location: interview.location,
    interviewerName: interview.interviewerName,
    interviewerEmail: interview.interviewerEmail,
  };
}

// ─── Main tick function ───────────────────────────────────────────────────
async function runSchedulerTick(): Promise<void> {
  const now = Date.now();

  try {
    // ── Fetch all upcoming, non-cancelled interviews ──────────────────────
    // Only fetch interviews scheduled in the future + within 25 hours
    const upperBound = new Date(now + WINDOW_24H_UPPER + MINUTE);
    const lowerBound = new Date(now); // don't process past interviews

    const interviews = await prisma.interview.findMany({
      where: {
        scheduledAt: { gte: lowerBound, lte: upperBound },
        status: { notIn: ['cancelled'] },
        // Only fetch rows where at least one reminder is still needed
        OR: [
          { reminder24hSent: false },
          { reminder1hSent: false },
        ],
      },
      include: {
        candidate: true,
        job: true,
      },
    });

    if (interviews.length === 0) return;

    console.log(`[Scheduler] ⏱ Tick — checking ${interviews.length} upcoming interview(s)…`);

    for (const interview of interviews) {
      const msUntil = new Date(interview.scheduledAt).getTime() - now;

      // ── 24-hour reminder ────────────────────────────────────────────────
      if (
        !interview.reminder24hSent &&
        msUntil >= WINDOW_24H_LOWER &&
        msUntil <= WINDOW_24H_UPPER
      ) {
        try {
          console.log(`[Scheduler] Sending 24h reminder → ${interview.candidate.email} for "${interview.title}"`);
          await sendInterviewReminderEmail(toEmailData(interview), 24);
          await prisma.interview.update({
            where: { id: interview.id },
            data: { reminder24hSent: true },
          });
          console.log(`[Scheduler] ✅ 24h reminder sent for interview ${interview.id}`);
        } catch (err: any) {
          console.error(`[Scheduler] ❌ 24h reminder failed for ${interview.id}:`, err.message);
        }
      }

      // ── 1-hour reminder ─────────────────────────────────────────────────
      if (
        !interview.reminder1hSent &&
        msUntil >= WINDOW_1H_LOWER &&
        msUntil <= WINDOW_1H_UPPER
      ) {
        try {
          console.log(`[Scheduler] Sending 1h reminder → ${interview.candidate.email} for "${interview.title}"`);
          await sendInterviewReminderEmail(toEmailData(interview), 1);
          await prisma.interview.update({
            where: { id: interview.id },
            data: { reminder1hSent: true },
          });
          console.log(`[Scheduler] ✅ 1h reminder sent for interview ${interview.id}`);
        } catch (err: any) {
          console.error(`[Scheduler] ❌ 1h reminder failed for ${interview.id}:`, err.message);
        }
      }
    }
  } catch (err: any) {
    console.error('[Scheduler] ❌ Scheduler tick failed:', err.message);
  }
}

// ─── Start the scheduler ──────────────────────────────────────────────────
export function startEmailScheduler(): void {
  // Runs every minute: "* * * * *"
  cron.schedule('* * * * *', () => {
    runSchedulerTick().catch((err) =>
      console.error('[Scheduler] Unhandled tick error:', err)
    );
  });

  console.log('[Scheduler] ✅ Email reminder scheduler started (runs every minute).');
  console.log('[Scheduler]    • 24h reminder: fires 23h 30m – 24h 30m before interview');
  console.log('[Scheduler]    • 1h  reminder: fires    30m –  1h 30m before interview');
}
