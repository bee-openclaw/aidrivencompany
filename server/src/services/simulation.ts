// Real Simulation Engine — uses LLM to analyze impact of changes

import type Database from 'better-sqlite3';
import { callLLM, extractJSON } from './llm.js';
import { getLLMConfigFromSettings } from './genesis.js';
import { getNode, getNodes, getEdges } from '@aidrivencompany/db';

interface SimulationImpact {
  nodeId: string;
  nodeTitle: string;
  nodeType: string;
  impactType: 'direct' | 'indirect';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendation: string;
}

interface SimulationLLMOutput {
  impacts: Array<{
    nodeTitle: string;
    nodeType: string;
    impactType: 'direct' | 'indirect';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    recommendation: string;
  }>;
  summary: string;
}

const SIMULATION_SYSTEM_PROMPT = `You are the Simulation Engine for a Company OS platform. You analyze proposed changes to a company graph and predict their cascading impact on connected nodes.

You must return ONLY valid JSON (no markdown, no explanation) with this exact structure:

{
  "impacts": [
    {
      "nodeTitle": "Exact title of the affected node",
      "nodeType": "type of the affected node",
      "impactType": "direct|indirect",
      "severity": "low|medium|high|critical",
      "description": "Specific description of how this node is affected",
      "recommendation": "Actionable recommendation for handling this impact"
    }
  ],
  "summary": "One-paragraph executive summary of the overall impact"
}

ANALYSIS RULES:

1. DIRECT IMPACTS: Nodes directly connected to the trigger node via edges. Analyze how the proposed change specifically affects each one.

2. INDIRECT IMPACTS: Nodes connected to the directly-connected nodes (2nd degree). These typically have lower severity unless the change is fundamental.

3. SEVERITY CRITERIA:
   - "low": Minor adjustment needed, no blocking issues
   - "medium": Noticeable impact, requires planning and some rework
   - "high": Significant impact, may require major rework or strategy change
   - "critical": Fundamental conflict or breaking change, must be addressed before proceeding

4. Be specific — don't say "may affect revenue." Say "Switching from freemium to paid-only will reduce sign-up volume by an estimated 60-80%, requiring higher conversion rates from paid channels."

5. Recommendations should be actionable: "Consider A/B testing the pricing change with 10% of traffic before full rollout" rather than "Monitor the situation."

6. Every directly connected node MUST have an impact entry. Indirect nodes should only be included if the impact is meaningful.`;

export async function runSimulation(
  db: Database.Database,
  companyId: string,
  triggerNodeId: string,
  triggerChange: Record<string, unknown>,
): Promise<{ impactReport: SimulationImpact[]; summary: string } | null> {
  const config = getLLMConfigFromSettings(db);

  // If no LLM configured, fall back to mock simulation
  if (!config) {
    return null;
  }

  const triggerNode = getNode(db, triggerNodeId);
  if (!triggerNode) return null;

  const allNodes = getNodes(db, companyId);
  const allEdges = getEdges(db, companyId);

  // Find directly connected nodes
  const directEdges = allEdges.filter(
    (e) => e.sourceNodeId === triggerNodeId || e.targetNodeId === triggerNodeId,
  );

  const directNodeIds = new Set<string>();
  for (const edge of directEdges) {
    const connectedId = edge.sourceNodeId === triggerNodeId ? edge.targetNodeId : edge.sourceNodeId;
    directNodeIds.add(connectedId);
  }

  // Find indirect nodes (2nd degree connections)
  const indirectNodeIds = new Set<string>();
  for (const directId of directNodeIds) {
    const secondEdges = allEdges.filter(
      (e) => e.sourceNodeId === directId || e.targetNodeId === directId,
    );
    for (const edge of secondEdges) {
      const connectedId = edge.sourceNodeId === directId ? edge.targetNodeId : edge.sourceNodeId;
      if (connectedId !== triggerNodeId && !directNodeIds.has(connectedId)) {
        indirectNodeIds.add(connectedId);
      }
    }
  }

  // Build context about the graph for the LLM
  const nodeMap = new Map(allNodes.map((n) => [n.id, n]));

  const directNodesInfo = [...directNodeIds]
    .map((id) => {
      const node = nodeMap.get(id);
      if (!node) return null;
      const edgeToTrigger = directEdges.find(
        (e) => (e.sourceNodeId === id && e.targetNodeId === triggerNodeId) ||
               (e.targetNodeId === id && e.sourceNodeId === triggerNodeId),
      );
      return {
        title: node.title,
        type: node.type,
        description: node.description,
        relationship: edgeToTrigger?.type || 'connected',
      };
    })
    .filter(Boolean);

  const indirectNodesInfo = [...indirectNodeIds]
    .map((id) => {
      const node = nodeMap.get(id);
      if (!node) return null;
      return { title: node.title, type: node.type, description: node.description };
    })
    .filter(Boolean);

  const userPrompt = `TRIGGER NODE:
- Title: "${triggerNode.title}"
- Type: ${triggerNode.type}
- Description: ${triggerNode.description}

PROPOSED CHANGE:
${JSON.stringify(triggerChange, null, 2)}

DIRECTLY CONNECTED NODES:
${directNodesInfo.map((n, i) => `${i + 1}. [${n!.type}] "${n!.title}" (relationship: ${n!.relationship})\n   ${n!.description}`).join('\n')}

INDIRECTLY CONNECTED NODES (2nd degree):
${indirectNodesInfo.length > 0 ? indirectNodesInfo.map((n, i) => `${i + 1}. [${n!.type}] "${n!.title}"\n   ${n!.description}`).join('\n') : 'None'}

Analyze the impact of this proposed change on all connected nodes.`;

  const response = await callLLM(config, [
    { role: 'system', content: SIMULATION_SYSTEM_PROMPT },
    { role: 'user', content: userPrompt },
  ]);

  const result = extractJSON<SimulationLLMOutput>(response.content);

  // Map LLM output back to node IDs
  const impactReport: SimulationImpact[] = [];
  for (const impact of result.impacts) {
    // Find the node by title match
    const matchedNode = allNodes.find(
      (n) => n.title.toLowerCase() === impact.nodeTitle.toLowerCase(),
    );

    impactReport.push({
      nodeId: matchedNode?.id || '',
      nodeTitle: impact.nodeTitle,
      nodeType: impact.nodeType,
      impactType: impact.impactType,
      severity: impact.severity,
      description: impact.description,
      recommendation: impact.recommendation,
    });
  }

  return { impactReport, summary: result.summary };
}
