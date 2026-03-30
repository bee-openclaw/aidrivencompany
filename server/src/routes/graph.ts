import { Router } from 'express';
import type Database from 'better-sqlite3';
import { getNodes, getNode, createNode, updateNode, getEdges, createEdge } from '@aidrivencompany/db';

export const graphRouter = Router();

// Nodes
graphRouter.get('/companies/:companyId/graph/nodes', (req, res) => {
  const db = req.app.locals.db as Database.Database;
  const nodes = getNodes(db, req.params.companyId);
  res.json({ data: nodes });
});

graphRouter.post('/companies/:companyId/graph/nodes', (req, res) => {
  const db = req.app.locals.db as Database.Database;
  const { type, title, description, properties, status, positionX, positionY } = req.body as {
    type: string;
    title: string;
    description?: string;
    properties?: Record<string, unknown>;
    status?: string;
    positionX?: number;
    positionY?: number;
  };
  if (!type || !title) {
    res.status(400).json({ error: { code: 'VALIDATION', message: 'Type and title are required' } });
    return;
  }
  const node = createNode(db, {
    companyId: req.params.companyId,
    type,
    title,
    description,
    properties,
    status,
    positionX,
    positionY,
  });
  res.status(201).json({ data: node });
});

graphRouter.put('/companies/:companyId/graph/nodes/:id', (req, res) => {
  const db = req.app.locals.db as Database.Database;
  const { title, description, properties, status, positionX, positionY } = req.body as {
    title?: string;
    description?: string;
    properties?: Record<string, unknown>;
    status?: string;
    positionX?: number;
    positionY?: number;
  };
  const node = updateNode(db, req.params.id, { title, description, properties, status, positionX, positionY });
  if (!node) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Node not found' } });
    return;
  }
  res.json({ data: node });
});

// Edges
graphRouter.get('/companies/:companyId/graph/edges', (req, res) => {
  const db = req.app.locals.db as Database.Database;
  const edges = getEdges(db, req.params.companyId);
  res.json({ data: edges });
});

graphRouter.post('/companies/:companyId/graph/edges', (req, res) => {
  const db = req.app.locals.db as Database.Database;
  const { sourceNodeId, targetNodeId, type, weight, metadata } = req.body as {
    sourceNodeId: string;
    targetNodeId: string;
    type: string;
    weight?: number;
    metadata?: Record<string, unknown>;
  };
  if (!sourceNodeId || !targetNodeId || !type) {
    res.status(400).json({ error: { code: 'VALIDATION', message: 'sourceNodeId, targetNodeId, and type are required' } });
    return;
  }
  const edge = createEdge(db, {
    companyId: req.params.companyId,
    sourceNodeId,
    targetNodeId,
    type,
    weight,
    metadata,
  });
  res.status(201).json({ data: edge });
});

// Full graph
graphRouter.get('/companies/:companyId/graph', (req, res) => {
  const db = req.app.locals.db as Database.Database;
  const nodes = getNodes(db, req.params.companyId);
  const edges = getEdges(db, req.params.companyId);
  res.json({ data: { nodes, edges } });
});
