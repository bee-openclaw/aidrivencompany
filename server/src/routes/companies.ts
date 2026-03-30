import { Router } from 'express';
import type Database from 'better-sqlite3';
import { getCompanies, getCompany, createCompany } from '@aidrivencompany/db';
import { runGenesis } from '../services/genesis.js';

export const companiesRouter = Router();

companiesRouter.get('/companies', (req, res) => {
  const db = req.app.locals.db as Database.Database;
  const companies = getCompanies(db);
  res.json({ data: companies });
});

companiesRouter.get('/companies/:id', (req, res) => {
  const db = req.app.locals.db as Database.Database;
  const company = getCompany(db, req.params.id);
  if (!company) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Company not found' } });
    return;
  }
  res.json({ data: company });
});

companiesRouter.post('/companies', async (req, res) => {
  const db = req.app.locals.db as Database.Database;
  const { name, description, mission, logoUrl, vision } = req.body as {
    name: string;
    description: string;
    mission?: string;
    logoUrl?: string;
    vision?: string;
  };
  if (!name) {
    res.status(400).json({ error: { code: 'VALIDATION', message: 'Name is required' } });
    return;
  }
  const company = createCompany(db, { name, description: description ?? '', mission, logoUrl });

  // If vision is provided, automatically run genesis
  if (vision && vision.trim().length > 0) {
    try {
      const genesisResult = await runGenesis(db, { vision, companyId: company.id });
      // Re-fetch company since genesis may have updated name/description/mission
      const updatedCompany = getCompany(db, company.id);
      res.status(201).json({ data: { company: updatedCompany, genesis: genesisResult } });
      return;
    } catch (err) {
      // Genesis failed — still return the created company, but include the error
      const message = err instanceof Error ? err.message : 'Genesis failed';
      res.status(201).json({
        data: { company },
        warning: { code: 'GENESIS_FAILED', message },
      });
      return;
    }
  }

  res.status(201).json({ data: company });
});
