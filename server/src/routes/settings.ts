import { Router } from 'express';
import type Database from 'better-sqlite3';

export const settingsRouter = Router();

const ALLOWED_KEYS = ['llm_provider', 'anthropic_api_key', 'openai_api_key', 'llm_model'];
const SECRET_KEYS = ['anthropic_api_key', 'openai_api_key'];

function redactValue(key: string, value: string): string {
  if (SECRET_KEYS.includes(key) && value.length > 4) {
    return '****' + value.slice(-4);
  }
  return value;
}

settingsRouter.get('/settings', (req, res) => {
  const db = req.app.locals.db as Database.Database;
  const rows = db.prepare('SELECT key, value FROM settings').all() as Array<{ key: string; value: string }>;

  const settings: Record<string, string> = {};
  for (const row of rows) {
    settings[row.key] = redactValue(row.key, row.value);
  }

  res.json({ data: settings });
});

settingsRouter.put('/settings', (req, res) => {
  const db = req.app.locals.db as Database.Database;
  const { key, value } = req.body as { key: string; value: string };

  if (!key || value === undefined || value === null) {
    res.status(400).json({ error: { code: 'VALIDATION', message: 'key and value are required' } });
    return;
  }

  if (!ALLOWED_KEYS.includes(key)) {
    res.status(400).json({
      error: { code: 'VALIDATION', message: `Invalid setting key. Allowed: ${ALLOWED_KEYS.join(', ')}` },
    });
    return;
  }

  if (key === 'llm_provider' && value !== 'anthropic' && value !== 'openai') {
    res.status(400).json({
      error: { code: 'VALIDATION', message: 'llm_provider must be "anthropic" or "openai"' },
    });
    return;
  }

  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
  ).run(key, value, now);

  res.json({ data: { key, value: redactValue(key, value) } });
});
