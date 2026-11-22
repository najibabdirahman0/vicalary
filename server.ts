import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express, { type Request, type Response } from 'express';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PLATFORM_EMAIL = 'vicalaryii@gmail.com';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

interface ContactBody {
  name?: unknown;
  email?: unknown;
  message?: unknown;
}

function sanitizeHeaderValue(value: string): string {
  return value.replace(/[\r\n\0]+/g, ' ').trim();
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function persistContactToSupabase(payload: {
  name: string;
  email: string;
  message: string;
  deliveryStatus: 'pending' | 'sent' | 'failed';
  deliveryProvider: string;
}): Promise<boolean> {
  const supabaseUrl = process.env.VITE_SUPABASE_URL?.trim();
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!supabaseUrl || !supabaseKey) {
    return false;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error } = await supabase.from('contact_messages').insert({
      name: payload.name,
      email: payload.email,
      message: payload.message,
      recipient: PLATFORM_EMAIL,
      delivery_status: payload.deliveryStatus,
      delivery_provider: payload.deliveryProvider,
    });
    return !error;
  } catch {
    return false;
  }
}

async function sendViaSmtp(payload: {
  name: string;
  email: string;
  message: string;
}): Promise<{ delivered: boolean; missingUser?: boolean; error?: string }> {
  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPass = process.env.SMTP_PASS?.trim();
  if (!smtpPass) {
    return { delivered: false };
  }
  if (!smtpUser) {
    return {
      delivered: false,
      missingUser: true,
      error:
        'Brevo SMTP key is set, but SMTP_USER (your Brevo SMTP login, e.g. xxxxxx@smtp-brevo.com) is missing.',
    };
  }

  const host = process.env.SMTP_HOST?.trim() || 'smtp-relay.brevo.com';
  const port = Number(process.env.SMTP_PORT) || 587;
  const rawFrom = process.env.SMTP_FROM?.trim() || PLATFORM_EMAIL;
  const senderEmail = EMAIL_REGEX.test(rawFrom)
    ? sanitizeHeaderValue(rawFrom)
    : PLATFORM_EMAIL;

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      connectionTimeout: 10000,
    });

    await transporter.sendMail({
      from: `"VICALARY Contact" <${senderEmail}>`,
      to: PLATFORM_EMAIL,
      replyTo: payload.email,
      subject: `New VICALARY Message from ${payload.name}`,
      text: `Name: ${payload.name}\nEmail: ${payload.email}\n\nMessage:\n${payload.message}`,
      html: [
        '<div style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;color:#0D2F4F;">',
        '<h2 style="margin:0 0 12px;">New VICALARY Message</h2>',
        `<p><strong>Name:</strong> ${escapeHtml(payload.name)}</p>`,
        `<p><strong>Email:</strong> ${escapeHtml(payload.email)}</p>`,
        '<p><strong>Message:</strong></p>',
        `<pre style="white-space:pre-wrap;font-family:inherit;background:#F3F7F3;padding:12px;border-radius:8px;">${escapeHtml(
          payload.message
        )}</pre>`,
        '</div>',
      ].join(''),
    });

    return { delivered: true };
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'SMTP delivery failed';
    return { delivered: false, error: detail };
  }
}

async function sendViaFormSubmitRelay(
  payload: { name: string; email: string; message: string },
  req: Request
): Promise<{ delivered: boolean; needsActivation?: boolean; error?: string }> {
  const originHeader =
    process.env.APP_URL?.trim() ||
    (typeof req.headers.origin === 'string' && req.headers.origin) ||
    `http://${req.headers.host || 'localhost:3000'}`;

  try {
    const response = await fetch(`https://formsubmit.co/ajax/${PLATFORM_EMAIL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Origin: originHeader,
        Referer: `${originHeader.replace(/\/$/, '')}/contact`,
        'User-Agent': 'VICALARY-Contact-Backend/1.0',
      },
      body: JSON.stringify({
        name: payload.name,
        email: payload.email,
        message: payload.message,
        _subject: `New VICALARY Message from ${payload.name}`,
        _replyto: payload.email,
        _template: 'table',
      }),
      signal: AbortSignal.timeout(12000),
    });

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return {
        delivered: false,
        error: `Mail relay returned HTTP ${response.status} (non-JSON response).`,
      };
    }

    const data = (await response.json()) as {
      success?: boolean | string;
      message?: string;
    };

    const isSuccess =
      response.ok && (data.success === true || data.success === 'true');
    if (isSuccess) {
      return { delivered: true };
    }

    const relayMsg = typeof data.message === 'string' ? data.message : '';
    const needsActivation = /activat/i.test(relayMsg);
    return {
      delivered: false,
      needsActivation,
      error:
        relayMsg ||
        `Mail relay returned HTTP ${response.status} without confirmation.`,
    };
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'Network error';
    return { delivered: false, error: detail };
  }
}

async function startServer(): Promise<void> {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '64kb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  app.post('/api/contact', async (req: Request, res: Response) => {
    const body = (req.body ?? {}) as ContactBody;

    const rawName = typeof body.name === 'string' ? sanitizeHeaderValue(body.name) : '';
    const rawEmail = typeof body.email === 'string' ? sanitizeHeaderValue(body.email) : '';
    const rawMessage = typeof body.message === 'string' ? body.message.trim() : '';

    if (!rawName || rawName.length > 120) {
      res.status(400).json({
        ok: false,
        error: 'Please enter a valid name (1-120 characters).',
      });
      return;
    }

    if (!rawEmail || rawEmail.length > 254 || !EMAIL_REGEX.test(rawEmail)) {
      res.status(400).json({
        ok: false,
        error: 'Please enter a valid email address.',
      });
      return;
    }

    if (!rawMessage || rawMessage.length > 5000) {
      res.status(400).json({
        ok: false,
        error: 'Please enter a message (1-5000 characters).',
      });
      return;
    }

    const payload = {
      name: rawName,
      email: rawEmail,
      message: rawMessage,
    };

    // 1. Prefer direct Brevo/SMTP delivery when configured.
    const smtpResult = await sendViaSmtp(payload);
    if (smtpResult.delivered) {
      const savedToSupabase = await persistContactToSupabase({
        ...payload,
        deliveryStatus: 'sent',
        deliveryProvider: 'brevo-smtp',
      });
      res.json({
        ok: true,
        deliveredVia: 'brevo-smtp',
        savedToSupabase,
      });
      return;
    }

    // 2. Otherwise relay server-to-server via FormSubmit.
    const relayResult = await sendViaFormSubmitRelay(payload, req);
    if (relayResult.delivered) {
      const savedToSupabase = await persistContactToSupabase({
        ...payload,
        deliveryStatus: 'sent',
        deliveryProvider: 'formsubmit-relay',
      });
      res.json({
        ok: true,
        deliveredVia: 'formsubmit-relay',
        savedToSupabase,
      });
      return;
    }

    const savedToSupabase = await persistContactToSupabase({
      ...payload,
      deliveryStatus: 'failed',
      deliveryProvider: smtpResult.missingUser ? 'brevo-pending-login' : 'none',
    });

    const combinedError = smtpResult.missingUser
      ? `Add SMTP_USER (your Brevo SMTP login, e.g. xxxxxx@smtp-brevo.com from Brevo > SMTP & API > SMTP) in .env to complete Brevo email delivery to ${PLATFORM_EMAIL}.`
      : relayResult.needsActivation
        ? `One-time activation is pending in ${PLATFORM_EMAIL} (check inbox/spam for the FormSubmit link) or verify your Brevo SMTP_USER login in .env.`
        : smtpResult.error ||
          relayResult.error ||
          `Could not deliver to ${PLATFORM_EMAIL} right now.`;

    res.status(502).json({
      ok: false,
      needsActivation: Boolean(relayResult.needsActivation),
      savedToSupabase,
      error: combinedError,
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    const indexPath = path.join(distDir, 'index.html');
    app.use(express.static(distDir));
    app.get(/^\/(?!api\/).*/, (_req: Request, res: Response) => {
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Build output not found.');
      }
    });
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`VICALARY server listening on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start VICALARY server:', err);
  process.exit(1);
});
