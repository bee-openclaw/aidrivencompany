import { Router } from 'express';
import type Database from 'better-sqlite3';
import { getCampaigns, createCampaign } from '@aidrivencompany/db';

export const campaignsRouter = Router();

campaignsRouter.get('/companies/:companyId/campaigns', (req, res) => {
  const db = req.app.locals.db as Database.Database;
  const campaigns = getCampaigns(db, req.params.companyId);
  res.json({ data: campaigns });
});

campaignsRouter.post('/companies/:companyId/campaigns', (req, res) => {
  const db = req.app.locals.db as Database.Database;
  const { nodeId, channel, name, audience, content, budget, status } = req.body as {
    nodeId?: string;
    channel: string;
    name: string;
    audience?: Record<string, unknown>;
    content?: Record<string, unknown>;
    budget?: number;
    status?: string;
  };
  if (!channel || !name) {
    res.status(400).json({ error: { code: 'VALIDATION', message: 'Channel and name are required' } });
    return;
  }
  const campaign = createCampaign(db, {
    companyId: req.params.companyId,
    nodeId,
    channel,
    name,
    audience,
    content,
    budget,
    status,
  });
  res.status(201).json({ data: campaign });
});
