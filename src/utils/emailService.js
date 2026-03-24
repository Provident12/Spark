/**
 * Email notification service for Spark — powered by Resend.
 *
 * Mock mode  → logs to console + stores in session array (no real emails)
 * Production → POST to /api/email/send which calls Resend on the server
 *
 * Set VITE_RESEND_ENABLED=true in .env to enable real email sending.
 * The Resend API key (RESEND_API_KEY) lives server-side only — never in the browser.
 */

const IS_MOCK = import.meta.env.VITE_MOCK_MODE === 'true';
const RESEND_ENABLED = import.meta.env.VITE_RESEND_ENABLED === 'true';
const FROM_EMAIL = import.meta.env.VITE_EMAIL_FROM || 'Spark <notifications@spark.hk>';

// Session-level log visible via devtools
const sentEmails = [];

// ── helpers ──────────────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-HK', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });
}

// ── transport ────────────────────────────────────────────────────────

async function send({ to, subject, body }) {
  const email = { to, from: FROM_EMAIL, subject, body, sentAt: new Date().toISOString() };

  if (IS_MOCK && !RESEND_ENABLED) {
    // Dev only: log to console
    console.log(
      `%c📧 EMAIL → ${to}%c\n${subject}\n\n${body}`,
      'color:#e53e3e;font-weight:bold', 'color:inherit',
    );
    sentEmails.push(email);
    return email;
  }

  // Call server-side Resend endpoint
  try {
    const res = await fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, text: body, from: FROM_EMAIL }),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error('Email send failed:', data);
    }
    sentEmails.push({ ...email, resendId: data.id, status: res.ok ? 'sent' : 'failed' });
  } catch (err) {
    console.error('Email send error:', err);
    sentEmails.push({ ...email, status: 'error', error: err.message });
  }

  return email;
}

// ── public API: typed email senders ──────────────────────────────────

/** Org receives: a student just applied */
export function emailNewApplication({ orgEmail, orgName, studentName, opportunityTitle }) {
  return send({
    to: orgEmail,
    subject: `New Application: ${studentName} applied for "${opportunityTitle}"`,
    body:
`Hi ${orgName || 'there'},

${studentName} has submitted an application for your listing "${opportunityTitle}" on Spark.

Log in to your Spark dashboard to review the application and take the next step.

— The Spark Team`,
  });
}

/** Student receives: application confirmation */
export function emailApplicationConfirmation({ studentEmail, studentName, opportunityTitle, organizationName }) {
  return send({
    to: studentEmail,
    subject: `Application Submitted: ${opportunityTitle}`,
    body:
`Hi ${studentName},

Your application for "${opportunityTitle}" at ${organizationName} has been submitted successfully.

You will be notified by email and in-app when the organisation reviews your application. In the meantime you can check your application status anytime from the Applications page.

Good luck!
— The Spark Team`,
  });
}

/** Student receives: interview invitation with time slots */
export function emailInterviewScheduled({ studentEmail, studentName, opportunityTitle, organizationName, slots }) {
  const slotLines = (slots || []).map(
    s => `  • ${formatDate(s.date)}  ${s.start_time} – ${s.end_time}  (${s.location || 'TBC'})`
  ).join('\n');

  return send({
    to: studentEmail,
    subject: `Interview Invitation: ${opportunityTitle}`,
    body:
`Hi ${studentName},

Great news! ${organizationName} has invited you to an interview for "${opportunityTitle}".

Available time slots:
${slotLines || '  (see your Spark dashboard for details)'}

Please log in to Spark and select the time that works best for you.

— The Spark Team`,
  });
}

/** Org receives: student selected a time slot */
export function emailInterviewSlotSelected({ orgEmail, orgName, studentName, opportunityTitle, date, startTime, endTime, location }) {
  return send({
    to: orgEmail,
    subject: `Interview Confirmed: ${studentName} for "${opportunityTitle}"`,
    body:
`Hi ${orgName || 'there'},

${studentName} has confirmed their interview time for "${opportunityTitle}":

  Date: ${formatDate(date)}
  Time: ${startTime} – ${endTime}
  Location: ${location || 'TBC'}

You can download the .ics calendar file from your Spark dashboard.

— The Spark Team`,
  });
}

/** Student receives: hired / accepted */
export function emailApplicationHired({ studentEmail, studentName, opportunityTitle, organizationName }) {
  return send({
    to: studentEmail,
    subject: `Congratulations! You've been selected for "${opportunityTitle}"`,
    body:
`Hi ${studentName},

Congratulations! ${organizationName} has selected you for "${opportunityTitle}".

The organisation will be in touch with you shortly regarding next steps. You can also reach out to them via the in-app messaging feature on Spark.

Well done!
— The Spark Team`,
  });
}

/** Student receives: application rejected */
export function emailApplicationRejected({ studentEmail, studentName, opportunityTitle, organizationName, reason }) {
  return send({
    to: studentEmail,
    subject: `Application Update: ${opportunityTitle}`,
    body:
`Hi ${studentName},

Thank you for your interest in "${opportunityTitle}" at ${organizationName}.

Unfortunately, the organisation has decided not to proceed with your application at this time.${reason ? `\n\nFeedback: ${reason}` : ''}

Don't be discouraged — there are many more opportunities on Spark. Keep exploring!

— The Spark Team`,
  });
}

/** Parent receives: notification that their child applied (for under-18 with parent email) */
export function emailParentNotification({ parentEmail, parentName, studentName, opportunityTitle, organizationName }) {
  return send({
    to: parentEmail,
    subject: `Parental Notice: ${studentName} applied for "${opportunityTitle}"`,
    body:
`Dear ${parentName || 'Parent/Guardian'},

This is to inform you that ${studentName} has submitted an application for "${opportunityTitle}" at ${organizationName} through the Spark platform.

Spark is a platform connecting Hong Kong students aged 13–19 with internship and volunteering opportunities. As ${studentName} is under 18, we are notifying you as their registered parent/guardian.

If you have any concerns or wish to request access, correction, or deletion of your child's data, please contact us at privacy@spark.hk.

— The Spark Team`,
  });
}

/** Recipient receives: new in-app message notification */
export function emailNewMessage({ recipientEmail, recipientName, senderName, messagePreview }) {
  return send({
    to: recipientEmail,
    subject: `New message from ${senderName} on Spark`,
    body:
`Hi ${recipientName || 'there'},

${senderName} sent you a message on Spark:

"${messagePreview}${messagePreview.length >= 120 ? '...' : ''}"

Log in to Spark to view the full message and reply.

— The Spark Team`,
  });
}

// ── dev utilities ────────────────────────────────────────────────────

/** Returns all emails sent during this session */
export function getSentEmails() {
  return [...sentEmails];
}

/** Clears the session log */
export function clearSentEmails() {
  sentEmails.length = 0;
}
