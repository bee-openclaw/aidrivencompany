import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  type Node,
  type Edge,
  type NodeTypes,
  type NodeProps,
  Handle,
  Position,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { GraphNode, NodeType } from '@aidrivencompany/shared';
import { useCompany } from '@/context/CompanyContext';
import { fetchGraph } from '@/api/graph';
import { NodeBadge } from '@/components/NodeBadge';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const NODE_HEADER_COLORS: Record<NodeType, string> = {
  idea: 'bg-purple-500',
  icp: 'bg-amber-500',
  feature: 'bg-blue-500',
  pricing: 'bg-emerald-500',
  channel: 'bg-pink-500',
  campaign: 'bg-orange-500',
  proof: 'bg-cyan-500',
  metric: 'bg-indigo-500',
  risk: 'bg-red-500',
  decision: 'bg-lime-500',
  workflow: 'bg-slate-500',
  agent: 'bg-teal-500',
  goal: 'bg-purple-500',
  milestone: 'bg-sky-500',
};

type GraphNodeData = {
  label: string;
  description: string;
  nodeType: NodeType;
  raw: GraphNode;
};

function CustomNode({ data }: NodeProps<Node<GraphNodeData>>) {
  return (
    <div className="w-56 overflow-hidden rounded-lg border border-gray-700 bg-gray-900 shadow-lg">
      <Handle type="target" position={Position.Top} className="!bg-gray-500" />
      <div className={cn('px-3 py-1.5', NODE_HEADER_COLORS[data.nodeType])}>
        <span className="text-xs font-semibold uppercase tracking-wide text-white">
          {data.nodeType}
        </span>
      </div>
      <div className="p-3">
        <p className="text-sm font-medium text-gray-100">{data.label}</p>
        {data.description && (
          <p className="mt-1 line-clamp-2 text-xs text-gray-400">{data.description}</p>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-gray-500" />
    </div>
  );
}

const nodeTypes: NodeTypes = { custom: CustomNode };

export function CompanyGraph() {
  const { company } = useCompany();
  const [graphNodes, setGraphNodes] = useState<GraphNode[]>([]);
  const [graphEdges, setGraphEdges] = useState<{ id: string; sourceNodeId: string; targetNodeId: string; type: string }[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!company) return;
    setLoading(true);
    fetchGraph(company.id)
      .then((data) => {
        setGraphNodes(data.nodes);
        setGraphEdges(data.edges);
      })
      .catch((err) => console.error('Graph fetch failed:', err))
      .finally(() => setLoading(false));
  }, [company?.id]);

  const nodes: Node<GraphNodeData>[] = useMemo(
    () =>
      graphNodes.map((n) => ({
        id: n.id,
        type: 'custom',
        position: { x: n.positionX, y: n.positionY },
        data: {
          label: n.title,
          description: n.description,
          nodeType: n.type,
          raw: n,
        },
      })),
    [graphNodes],
  );

  const edges: Edge[] = useMemo(
    () =>
      graphEdges.map((e) => ({
        id: e.id,
        source: e.sourceNodeId,
        target: e.targetNodeId,
        label: e.type.replace('_', ' '),
        animated: true,
        style: { stroke: '#4B5563' },
        labelStyle: { fill: '#9CA3AF', fontSize: 10 },
        labelBgStyle: { fill: '#111827', fillOpacity: 0.8 },
      })),
    [graphEdges],
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const raw = graphNodes.find((n) => n.id === node.id);
      if (raw) setSelectedNode(raw);
    },
    [graphNodes],
  );

  if (!company) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500">
        No company selected
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500">Loading graph...</div>
    );
  }

  const connectedNodes = selectedNode
    ? graphEdges
        .filter(
          (e) =>
            e.sourceNodeId === selectedNode.id || e.targetNodeId === selectedNode.id,
        )
        .map((e) => {
          const otherId =
            e.sourceNodeId === selectedNode.id ? e.targetNodeId : e.sourceNodeId;
          const other = graphNodes.find((n) => n.id === otherId);
          return { edge: e, node: other };
        })
    : [];

  return (
    <div className="relative h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        fitView
        minZoom={0.2}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} color="#1F2937" gap={24} size={1} />
        <Controls
          className="!border-gray-700 !bg-gray-900 [&>button]:!border-gray-700 [&>button]:!bg-gray-900 [&>button]:!fill-gray-400 [&>button:hover]:!bg-gray-800"
        />
        <MiniMap
          nodeColor="#4B5563"
          maskColor="rgba(0,0,0,0.7)"
          className="!border-gray-700 !bg-gray-950"
        />
      </ReactFlow>

      {selectedNode && (
        <div className="absolute right-0 top-0 z-10 h-full w-80 overflow-auto border-l border-gray-800 bg-gray-950 p-6">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <NodeBadge type={selectedNode.type} className="mb-2" />
              <h3 className="text-lg font-semibold text-gray-100">{selectedNode.title}</h3>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="rounded p-1 text-gray-400 hover:bg-gray-800 hover:text-gray-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="mb-4 text-sm text-gray-400">{selectedNode.description}</p>

          {Object.keys(selectedNode.properties).length > 0 && (
            <div className="mb-4">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Properties
              </h4>
              <dl className="space-y-1">
                {Object.entries(selectedNode.properties).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <dt className="text-gray-400">{key}</dt>
                    <dd className="font-medium text-gray-200">{String(value)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {connectedNodes.length > 0 && (
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Connected Nodes
              </h4>
              <ul className="space-y-2">
                {connectedNodes.map(({ edge, node }) =>
                  node ? (
                    <li
                      key={edge.id}
                      className="rounded-lg border border-gray-800 bg-gray-900 p-3"
                    >
                      <div className="flex items-center gap-2">
                        <NodeBadge type={node.type} />
                        <span className="text-sm font-medium text-gray-200">{node.title}</span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        {edge.type.replace('_', ' ')}
                      </p>
                    </li>
                  ) : null,
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
