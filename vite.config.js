import base44 from "@base44/vite-plugin"
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

// Load .env.development so server-side vars (RESEND_API_KEY, etc.) are available
dotenv.config({ path: '.env.development' })

// Shared mock data server — stores entity data in a JSON file so all browsers share the same data
function mockDataServerPlugin() {
  const dataFile = path.resolve('mock-data.json');

  function readData() {
    try {
      return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    } catch {
      return { store: {}, nextId: 1000 };
    }
  }

  function writeData(data) {
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
  }

  return {
    name: 'mock-data-server',
    configureServer(server) {
      server.middlewares.use('/mock-api/data', (req, res) => {
        res.setHeader('Content-Type', 'application/json');

        if (req.method === 'GET') {
          res.end(JSON.stringify(readData()));
          return;
        }

        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => body += chunk);
          req.on('end', () => {
            try {
              writeData(JSON.parse(body));
              res.end(JSON.stringify({ success: true }));
            } catch (e) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: e.message }));
            }
          });
          return;
        }

        if (req.method === 'DELETE') {
          writeData({ store: {}, nextId: 1000 });
          res.end(JSON.stringify({ success: true }));
          return;
        }

        res.statusCode = 405;
        res.end(JSON.stringify({ error: 'Method not allowed' }));
      });
    }
  };
}

// Resend email API middleware — handles POST /api/email/send
function resendEmailPlugin() {
  return {
    name: 'resend-email',
    configureServer(server) {
      server.middlewares.use('/api/email/send', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
          res.setHeader('Content-Type', 'application/json');

          const apiKey = process.env.RESEND_API_KEY;
          if (!apiKey) {
            // No API key — log and return success so frontend doesn't error
            const payload = JSON.parse(body);
            console.log(`\n📧 [Resend not configured] Would send to: ${payload.to}\n   Subject: ${payload.subject}\n`);
            res.end(JSON.stringify({ id: 'mock_' + Date.now(), status: 'skipped' }));
            return;
          }

          try {
            const payload = JSON.parse(body);
            const { Resend } = await import('resend');
            const resend = new Resend(apiKey);

            const replyTo = process.env.VITE_EMAIL_REPLY_TO;
            const devOverride = process.env.RESEND_DEV_OVERRIDE_TO;
            const actualTo = devOverride || payload.to;

            const result = await resend.emails.send({
              from: payload.from || 'Spark <notifications@spark.hk>',
              to: [actualTo],
              subject: devOverride
                ? `[To: ${payload.to}] ${payload.subject}`
                : payload.subject,
              text: devOverride
                ? `[DEV: This email would go to ${payload.to} in production]\n\n${payload.text}`
                : payload.text,
              ...(replyTo ? { reply_to: replyTo } : {}),
            });

            if (result.error) {
              console.error('Resend error:', result.error);
              res.statusCode = 400;
              res.end(JSON.stringify({ error: result.error.message }));
            } else {
              console.log(`📧 Email sent via Resend → ${actualTo}${devOverride ? ` (original: ${payload.to})` : ''} (${result.data.id})`);
              res.end(JSON.stringify({ id: result.data.id, status: 'sent' }));
            }
          } catch (err) {
            console.error('Email endpoint error:', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          }
        });
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  logLevel: 'error', // Suppress warnings, only show errors
  server: {
    host: true, // Expose on local network for phone testing
  },
  plugins: [
    mockDataServerPlugin(),
    resendEmailPlugin(),
    base44({
      // Support for legacy code that imports the base44 SDK with @/integrations, @/entities, etc.
      // can be removed if the code has been updated to use the new SDK imports from @base44/sdk
      legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === 'true',
      hmrNotifier: true,
      navigationNotifier: true,
      visualEditAgent: true
    }),
    react(),
  ]
});