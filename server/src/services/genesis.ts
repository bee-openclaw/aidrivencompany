// Genesis Engine — generates a complete company blueprint from a founder's vision

import type Database from 'better-sqlite3';
import { callLLM, extractJSON, type LLMConfig } from './llm.js';
import { createNode, createEdge, getNodes } from '@aidrivencompany/db';

export interface GenesisInput {
  vision: string;
  companyId: string;
}

interface GenesisNode {
  type: string;
  title: string;
  description: string;
  properties: Record<string, unknown>;
  positionX: number;
  positionY: number;
}

interface GenesisEdge {
  sourceIndex: number;
  targetIndex: number;
  type: string;
}

interface GenesisLLMOutput {
  company: { name: string; description: string; mission: string };
  nodes: GenesisNode[];
  edges: GenesisEdge[];
}

export interface GenesisResult {
  company: { name: string; description: string; mission: string };
  nodes: Array<GenesisNode & { id: string }>;
  edges: Array<GenesisEdge & { id: string; sourceNodeId: string; targetNodeId: string }>;
}

const GENESIS_SYSTEM_PROMPT = `You are the Genesis Engine for a Company OS platform. Your job is to analyze a founder's vision and generate a complete company blueprint as a structured graph.

You must return ONLY valid JSON (no markdown, no explanation) with this exact structure:

{
  "company": {
    "name": "Company Name",
    "description": "One-paragraph company description",
    "mission": "One-sentence mission statement"
  },
  "nodes": [
    {
      "type": "idea|icp|feature|pricing|channel|campaign|risk|metric|goal",
      "title": "Node Title",
      "description": "Detailed description of this node",
      "properties": {},
      "positionX": 0,
      "positionY": 0
    }
  ],
  "edges": [
    {
      "sourceIndex": 0,
      "targetIndex": 1,
      "type": "depends_on|impacts|requires|targets|measures|mitigates|belongs_to"
    }
  ]
}

RULES FOR GRAPH GENERATION:

1. NODE TYPES AND REQUIREMENTS:
   - "idea" (1): The core idea/vision. Position: center top (400, 50).
   - "icp" (2): Ideal Customer Profiles. Who are the target users/buyers? Be specific about demographics, pain points, willingness to pay. Position: spread at y=200.
   - "feature" (3-5): Key product features that solve the ICP's problems. Be specific and actionable. Position: spread at y=400.
   - "pricing" (1): Pricing model. Include tiers, price points, and rationale in properties. Position: center at y=400.
   - "channel" (2-3): Distribution/marketing channels. Be specific (not just "social media" — say "LinkedIn thought leadership" or "YouTube tutorials"). Position: spread at y=600.
   - "campaign" (1-2): Specific launch or growth campaigns with clear tactics. Position: spread at y=700.
   - "risk" (1-2): Key business risks with mitigation strategies in description. Position: right side at y=500.
   - "metric" (2-3): Key metrics to track success. Include target values in properties (e.g., {"target": 1000, "unit": "users", "timeframe": "6 months"}). Position: spread at y=800.
   - "goal" (1-2): Strategic goals tied to the vision. Position: center at y=900.

2. EDGE RULES:
   - sourceIndex and targetIndex are 0-based indices into the nodes array.
   - Every node must have at least one edge connecting it to the graph.
   - Use appropriate edge types:
     * "depends_on": feature depends on another feature
     * "impacts": a change to source affects target
     * "requires": source requires target to function
     * "targets": channel/campaign targets an ICP
     * "measures": metric measures a feature/goal
     * "mitigates": a feature/strategy mitigates a risk
     * "belongs_to": feature/channel belongs to the core idea

3. POSITION LAYOUT:
   - Use a top-down flow layout.
   - X coordinates: center around 400, spread items horizontally (200-600 range).
   - Y coordinates: idea at top (50), ICPs (200), features/pricing (400), channels (600), campaigns (700), metrics (800), goals (900).
   - Space items at the same level at least 200px apart horizontally.

4. QUALITY STANDARDS:
   - Be specific and actionable, not generic. Don't say "AI-powered features" — describe what the AI actually does.
   - Pricing should be realistic for the market.
   - Metrics should be measurable with specific targets.
   - Risks should be real business concerns, not platitudes.
   - Each description should be 1-3 sentences, substantive and unique.

5. PROPERTIES EXAMPLES:
   - ICP: {"segment": "...", "painPoints": ["..."], "budget": "..."}
   - Feature: {"priority": "high|medium|low", "complexity": "simple|moderate|complex"}
   - Pricing: {"tiers": [{"name": "Free", "price": 0, "features": ["..."]}, {"name": "Pro", "price": 29, "features": ["..."]}]}
   - Channel: {"platform": "...", "strategy": "..."}
   - Campaign: {"budget": 5000, "duration": "30 days", "kpi": "..."}
   - Metric: {"target": 1000, "unit": "users", "timeframe": "6 months", "current": 0}
   - Risk: {"likelihood": "high|medium|low", "impact": "high|medium|low", "mitigation": "..."}
   - Goal: {"timeframe": "Q1 2026", "keyResults": ["..."]}

Generate a complete, realistic, and well-connected company blueprint. The graph should tell the full story of this company from idea to execution.`;

export function getLLMConfigFromSettings(db: Database.Database): LLMConfig | null {
  const provider = getSettingValue(db, 'llm_provider');
  if (!provider || (provider !== 'anthropic' && provider !== 'openai')) {
    return null;
  }

  const keySettingName = provider === 'anthropic' ? 'anthropic_api_key' : 'openai_api_key';
  const apiKey = getSettingValue(db, keySettingName);
  if (!apiKey) {
    return null;
  }

  const model = getSettingValue(db, 'llm_model') || undefined;

  return { provider, apiKey, model };
}

function getSettingValue(db: Database.Database, key: string): string | null {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as { value: string } | undefined;
  return row?.value ?? null;
}

export async function runGenesis(db: Database.Database, input: GenesisInput): Promise<GenesisResult> {
  const config = getLLMConfigFromSettings(db);
  if (!config) {
    throw new Error(
      'LLM not configured. Please go to Settings and set your LLM provider (anthropic or openai) and API key.',
    );
  }

  // Check if genesis has already been run (company already has nodes)
  const existingNodes = getNodes(db, input.companyId);
  if (existingNodes.length > 0) {
    throw new Error('Genesis has already been run for this company. The company graph already contains nodes.');
  }

  const response = await callLLM(config, [
    { role: 'system', content: GENESIS_SYSTEM_PROMPT },
    {
      role: 'user',
      content: `Here is the founder's vision:\n\n"${input.vision}"\n\nGenerate the complete company blueprint as JSON.`,
    },
  ]);

  const result = extractJSON<GenesisLLMOutput>(response.content);

  // Validate basic structure
  if (!result.company || !result.nodes || !result.edges) {
    throw new Error('LLM returned invalid genesis structure — missing company, nodes, or edges.');
  }

  if (result.nodes.length === 0) {
    throw new Error('LLM returned empty nodes array.');
  }

  // Create all nodes in the database and collect their IDs
  const createdNodes: Array<GenesisNode & { id: string }> = [];
  for (const node of result.nodes) {
    const dbNode = createNode(db, {
      companyId: input.companyId,
      type: node.type,
      title: node.title,
      description: node.description || '',
      properties: node.properties || {},
      positionX: node.positionX || 0,
      positionY: node.positionY || 0,
    });
    createdNodes.push({ ...node, id: dbNode.id });
  }

  // Create all edges
  const createdEdges: Array<GenesisEdge & { id: string; sourceNodeId: string; targetNodeId: string }> = [];
  for (const edge of result.edges) {
    // Validate indices
    if (edge.sourceIndex < 0 || edge.sourceIndex >= createdNodes.length) continue;
    if (edge.targetIndex < 0 || edge.targetIndex >= createdNodes.length) continue;

    const sourceNode = createdNodes[edge.sourceIndex]!;
    const targetNode = createdNodes[edge.targetIndex]!;

    const dbEdge = createEdge(db, {
      companyId: input.companyId,
      sourceNodeId: sourceNode.id,
      targetNodeId: targetNode.id,
      type: edge.type,
    });

    createdEdges.push({
      ...edge,
      id: (dbEdge as { id: string }).id,
      sourceNodeId: sourceNode.id,
      targetNodeId: targetNode.id,
    });
  }

  // Update company name/description/mission if the LLM generated better ones
  if (result.company.name) {
    db.prepare('UPDATE companies SET name = ?, description = ?, mission = ?, updated_at = ? WHERE id = ?').run(
      result.company.name,
      result.company.description || '',
      result.company.mission || '',
      new Date().toISOString(),
      input.companyId,
    );
  }

  return {
    company: result.company,
    nodes: createdNodes,
    edges: createdEdges,
  };
}
