import { Router } from 'express';
import type Database from 'better-sqlite3';
import { getCompany, getDashboardStats, getActivity, getMetrics, getDecisions } from '@aidrivencompany/db';

export const dashboardRouter = Router();

dashboardRouter.get('/companies/:companyId/dashboard', (req, res) => {
  const db = req.app.locals.db as Database.Database;
  const company = getCompany(db, req.params.companyId);
  if (!company) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Company not found' } });
    return;
  }

  const stats = getDashboardStats(db, req.params.companyId);
  const recentActivity = getActivity(db, req.params.companyId, 20);
  const metrics = getMetrics(db, req.params.companyId);
  const allDecisions = getDecisions(db, req.params.companyId);
  const pendingDecisions = allDecisions.filter((d) => !d.chosenOption);

  res.json({
    data: {
      company,
      stats,
      recentActivity,
      metrics,
      pendingDecisions,
    },
  });
});
