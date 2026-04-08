import { onRequest } from 'firebase-functions/v2/https';
import { defineString } from 'firebase-functions/params';
import { Resend } from 'resend';

// Environment variables — set via: firebase functions:config:set resend.api_key="re_xxx"
// Or for v2 params: firebase functions:secrets:set RESEND_API_KEY
const resendApiKey = defineString('RESEND_API_KEY');

export const sendEmail = onRequest({ cors: true }, async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = resendApiKey.value();
  if (!apiKey) {
    console.log('Resend not configured — skipping email');
    res.json({ id: 'skipped_' + Date.now(), status: 'skipped' });
    return;
  }

  try {
    const { to, subject, text, from } = req.body;
    const resend = new Resend(apiKey);

    const result = await resend.emails.send({
      from: from || 'Spark <notifications@spark.hk>',
      to: [to],
      subject,
      text,
    });

    if (result.error) {
      console.error('Resend error:', result.error);
      res.status(400).json({ error: result.error.message });
    } else {
      console.log(`Email sent → ${to} (${result.data.id})`);
      res.json({ id: result.data.id, status: 'sent' });
    }
  } catch (err) {
    console.error('Email function error:', err);
    res.status(500).json({ error: err.message });
  }
});
