import { Router } from 'express';
import type Database from 'better-sqlite3';
import { getCompanies, getCompany, createCompany } from '@aidrivencompany/db';

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

companiesRouter.post('/companies', (req, res) => {
  const db = req.app.locals.db as Database.Database;
  const { name, description, mission, logoUrl } = req.body as {
    name: string;
    description: string;
    mission?: string;
    logoUrl?: string;
  };
  if (!name) {
    res.status(400).json({ error: { code: 'VALIDATION', message: 'Name is required' } });
    return;
  }
  const company = createCompany(db, { name, description: description ?? '', mission, logoUrl });
  res.status(201).json({ data: company });
});
