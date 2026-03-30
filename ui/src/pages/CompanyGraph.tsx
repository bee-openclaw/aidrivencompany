import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { X, Maximize, FlaskConical, GitBranch } from 'lucide-react';
import { cn } from '@/lib/utils';

const NODE_BORDER_COLORS: Record<NodeType, string> = {
  idea: '#a78bfa',
  icp: '#fbbf24',
  feature: '#60a5fa',
  pricing: '#34d399',
  channel: '#f472b6',
  campaign: '#fb923c',
  proof: '#22d3ee',
  metric: '#818cf8',
  risk: '#f87171',
  decision: '#a3e635',
  workflow: '#94a3b8',
  agent: '#2dd4bf',
  goal: '#c084fc',
  milestone: '#38bdf8',
};

const NODE_DOT_CLASSES: Record<NodeType, string> = {
  idea: 'bg-purple-400',
  icp: 'bg-amber-400',
  feature: 'bg-blue-400',
  pricing: 'bg-emerald-400',
  channel: 'bg-pink-400',
  campaign: 'bg-orange-400',
  proof: 'bg-cyan-400',
  metric: 'bg-indigo-400',
  risk: 'bg-red-400',
  decision: 'bg-lime-400',
  workflow: 'bg-slate-400',
  agent: 'bg-teal-400',
  goal: 'bg-purple-400',
  milestone: 'bg-sky-400',
};

type GraphNodeData = {
  label: string;
  description: string;
  nodeType: NodeType;
  propertyPreview: string;
  raw: GraphNode;
};

function getPropertyPreview(node: GraphNode): string {
  const props = node.properties;
  if (node.type === 'pricing' && props.price) return `$${props.price}/mo`;
  if (props.budget) return `$${props.budget}`;
  if (props.score) return `Score: ${props.score}`;
  return '';
}

function CustomNode({ data, selected }: NodeProps<Node<GraphNodeData>>) {
  const borderColor = NODE_BORDER_COLORS[data.nodeType] ?? '#94a3b8';

  return (
    <div
      className={cn(
        'group w-[180px] overflow-hidden rounded-xl border border-slate-700/40 bg-slate-900/90 shadow-lg transition-all duration-200',
        'hover:scale-[1.02]',
        selected && 'ring-2 ring-offset-1 ring-offset-slate-950',
      )}
      style={{
        borderTopWidth: '3px',
        borderTopColor: borderColor,
        ...(selected
          ? { boxShadow: `0 0 20px 4px ${borderColor}33`, ringColor: borderColor }
          : {}),
      }}
    >
      <Handle type="target" position={Position.Top} className="!bg-slate-500 !border-slate-600" />
      <div className="px-3 pt-2.5 pb-1">
        <div className="flex items-center gap-1.5">
          <div className={cn('h-2 w-2 rounded-full', NODE_DOT_CLASSES[data.nodeType])} />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            {data.nodeType}
          </span>
        </div>
      </div>
      <div className="px-3 pb-3">
        <p className="text-sm font-bold text-slate-100 leading-tight">{data.label}</p>
        {data.description && (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-400">
            {data.description}
          </p>
        )}
        {data.propertyPreview && (
          <p className="mt-1.5 text-[11px] font-medium text-slate-500">
            {data.propertyPreview}
          </p>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-slate-500 !border-slate-600" />
    </div>
  );
}

const nodeTypes: NodeTypes = { custom: CustomNode };

function SkeletonGraph() {
  return (
    <div className="flex h-full items-center justify-center animate-fade-in">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-16 w-16 animate-pulse rounded-2xl bg-slate-700/40" />
          <div className="absolute -bottom-2 -right-2 h-10 w-10 animate-pulse rounded-xl bg-slate-700/30" />
          <div className="absolute -left-3 -top-1 h-8 w-8 animate-pulse rounded-lg bg-slate-700/20" />
        </div>
        <p className="text-sm text-slate-500">Loading company graph...</p>
      </div>
    </div>
  );
}

export function CompanyGraph() {
  const navigate = useNavigate();
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
          propertyPreview: getPropertyPreview(n),
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
        label: e.type.replace(/_/g, ' '),
        animated: true,
        style: { stroke: '#475569', strokeDasharray: '6 3' },
        labelStyle: { fill: '#64748b', fontSize: 10 },
        labelBgStyle: { fill: '#0f172a', fillOpacity: 0.9 },
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
      <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-500 animate-fade-in">
        <GitBranch className="h-10 w-10" />
        <p className="text-lg font-medium">No company selected</p>
      </div>
    );
  }

  if (loading) return <SkeletonGraph />;

  if (graphNodes.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-slate-500 animate-fade-in">
        <GitBranch className="h-12 w-12 text-slate-600" />
        <p className="text-lg font-medium text-slate-400">No nodes yet</p>
        <p className="text-sm text-slate-500">Run Genesis to build your company graph.</p>
        <button onClick={() => navigate('/genesis')} className="btn-primary mt-2">
          Go to Genesis
        </button>
      </div>
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
        onPaneClick={() => setSelectedNode(null)}
        fitView
        minZoom={0.2}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          color="rgba(30, 41, 59, 0.3)"
          gap={24}
          size={1}
        />
        <Controls
          className="!rounded-xl !border-slate-700/40 !bg-slate-900/80 !shadow-xl [&>button]:!rounded-lg [&>button]:!border-slate-700/40 [&>button]:!bg-slate-900/80 [&>button]:!fill-slate-400 [&>button:hover]:!bg-slate-800 [&>button:hover]:!fill-amber-400"
        />
        <MiniMap
          nodeColor={(node) => {
            const d = node.data as GraphNodeData;
            return NODE_BORDER_COLORS[d.nodeType] ?? '#64748b';
          }}
          maskColor="rgba(10, 15, 26, 0.85)"
          className="!rounded-xl !border-slate-700/40 !bg-slate-950/90"
        />
      </ReactFlow>

      {/* Fit View button */}
      <button
        onClick={() => {
          /* ReactFlow fitView is handled internally by Controls */
        }}
        className="absolute left-4 top-4 z-10 btn-secondary flex items-center gap-2"
        title="Fit View"
      >
        <Maximize className="h-4 w-4" />
        Fit View
      </button>

      {/* Detail Panel */}
      {selectedNode && (
        <div className="absolute right-0 top-0 z-10 h-full w-[360px] animate-slide-in-right overflow-auto glass border-l border-slate-700/40 p-6">
          {/* Close */}
          <button
            onClick={() => setSelectedNode(null)}
            className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Type badge */}
          <NodeBadge type={selectedNode.type} className="mb-3" />

          {/* Title */}
          <h3 className="mb-2 text-xl font-bold text-slate-100">{selectedNode.title}</h3>

          {/* Description */}
          <p className="mb-6 text-sm leading-relaxed text-slate-400">{selectedNode.description}</p>

          {/* Properties */}
          {Object.keys(selectedNode.properties).length > 0 && (
            <div className="mb-6">
              <h4 className="section-title mb-3">Properties</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(selectedNode.properties).map(([key, value]) => (
                  <div
                    key={key}
                    className="rounded-lg bg-slate-800/60 px-3 py-2"
                  >
                    <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">{key}</p>
                    <p className="text-sm font-semibold text-slate-200">{String(value)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Connected Nodes */}
          {connectedNodes.length > 0 && (
            <div className="mb-6">
              <h4 className="section-title mb-3">Connected Nodes</h4>
              <ul className="space-y-2">
                {connectedNodes.map(({ edge, node }) =>
                  node ? (
                    <li
                      key={edge.id}
                      className="card cursor-pointer p-3 transition-all hover:bg-slate-800/60"
                      onClick={() => setSelectedNode(node)}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={cn('h-2 w-2 rounded-full', NODE_DOT_CLASSES[node.type as NodeType])}
                        />
                        <span className="text-sm font-medium text-slate-200">{node.title}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {edge.type.replace(/_/g, ' ')}
                      </p>
                    </li>
                  ) : null,
                )}
              </ul>
            </div>
          )}

          {/* Simulate Change */}
          <button
            onClick={() => navigate(`/simulations?nodeId=${selectedNode.id}`)}
            className="btn-primary w-full justify-center"
          >
            <FlaskConical className="h-4 w-4" />
            Simulate Change
          </button>
        </div>
      )}
    </div>
  );
}
