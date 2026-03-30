import { Router } from 'express';
import type Database from 'better-sqlite3';
import { getSimulations, createSimulation, updateSimulationStatus, getNode, getEdges } from '@aidrivencompany/db';

export const simulationsRouter = Router();

simulationsRouter.get('/companies/:companyId/simulations', (req, res) => {
  const db = req.app.locals.db as Database.Database;
  const simulations = getSimulations(db, req.params.companyId);
  res.json({ data: simulations });
});

simulationsRouter.post('/companies/:companyId/simulations', (req, res) => {
  const db = req.app.locals.db as Database.Database;
  const { title, description, triggerNodeId, triggerChange } = req.body as {
    title: string;
    description?: string;
    triggerNodeId: string;
    triggerChange: Record<string, unknown>;
  };

  if (!title || !triggerNodeId || !triggerChange) {
    res.status(400).json({ error: { code: 'VALIDATION', message: 'title, triggerNodeId, and triggerChange are required' } });
    return;
  }

  const triggerNode = getNode(db, triggerNodeId);
  if (!triggerNode) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Trigger node not found' } });
    return;
  }

  // Generate mock impact report by finding connected nodes
  const allEdges = getEdges(db, req.params.companyId);
  const connectedEdges = allEdges.filter((e) => e.sourceNodeId === triggerNodeId || e.targetNodeId === triggerNodeId);

  const severities = ['low', 'medium', 'high', 'critical'] as const;
  const impactReport = connectedEdges.map((edge) => {
    const connectedNodeId = edge.sourceNodeId === triggerNodeId ? edge.targetNodeId : edge.sourceNodeId;
    const connectedNode = getNode(db, connectedNodeId);
    if (!connectedNode) return null;

    const severity = severities[Math.floor(Math.random() * 3)]; // mostly low-high
    return {
      nodeId: connectedNode.id,
      nodeTitle: connectedNode.title,
      nodeType: connectedNode.type,
      impactType: edge.sourceNodeId === triggerNodeId ? 'direct' : 'indirect',
      severity,
      description: `Change to "${triggerNode.title}" would affect "${connectedNode.title}" (${connectedNode.type}) via ${edge.type} relationship.`,
      recommendation: `Review ${connectedNode.type} "${connectedNode.title}" for compatibility with proposed changes.`,
    };
  }).filter(Boolean);

  const simulation = createSimulation(db, {
    companyId: req.params.companyId,
    title,
    description,
    triggerNodeId,
    triggerChange,
    impactReport,
    status: 'completed',
  });

  res.status(201).json({ data: simulation });
});

simulationsRouter.put('/companies/:companyId/simulations/:id/apply', (req, res) => {
  const db = req.app.locals.db as Database.Database;
  const simulation = updateSimulationStatus(db, req.params.id, 'applied');
  if (!simulation) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Simulation not found' } });
    return;
  }
  res.json({ data: simulation });
});

simulationsRouter.put('/companies/:companyId/simulations/:id/reject', (req, res) => {
  const db = req.app.locals.db as Database.Database;
  const simulation = updateSimulationStatus(db, req.params.id, 'rejected');
  if (!simulation) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Simulation not found' } });
    return;
  }
  res.json({ data: simulation });
});
