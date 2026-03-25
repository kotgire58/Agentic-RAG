import { useCallback, useState } from 'react'
import ForceGraph2D from 'react-force-graph-2d'

export type GraphNode = {
  id: string
  label: string
  type?: string
}

export type GraphEdge = {
  source: string
  target: string
  type?: string
}

type GraphVisualizationProps = {
  nodes: GraphNode[]
  edges: GraphEdge[]
  width?: number
  height?: number
  onClose?: () => void
}

/**
 * Transforms raw nodes and edges into the format expected by react-force-graph-2d.
 *
 * Args:
 *   nodes (GraphNode[]): Array of graph node objects.
 *   edges (GraphEdge[]): Array of graph edge objects.
 *
 * Returns:
 *   object: Graph data with nodes array and links array.
 */
function buildGraphData(nodes: GraphNode[], edges: GraphEdge[]) {
  const nodeMap = new Map(nodes.map((n) => [n.id, { ...n }]))
  const links = edges
    .filter((e) => nodeMap.has(e.source) && nodeMap.has(e.target))
    .map((e) => ({
      source: e.source,
      target: e.target,
      type: e.type ?? 'RELATES_TO',
    }))
  return {
    nodes: Array.from(nodeMap.values()),
    links,
  }
}

export function GraphVisualization({
  nodes,
  edges,
  width = 600,
  height = 400,
  onClose,
}: GraphVisualizationProps) {
  const [highlightNodes, setHighlightNodes] = useState<Set<string>>(new Set())
  const [highlightLinks, setHighlightLinks] = useState<Set<string>>(new Set())

  const graphData = buildGraphData(nodes, edges)

  const handleNodeHover = useCallback(
    (node: { id?: string } | null) => {
      setHighlightNodes(new Set((node?.id && [node.id]) || []))
      setHighlightLinks(new Set())
    },
    [],
  )

  const handleLinkHover = useCallback(
    (
      link: { source: { id?: string }; target: { id?: string } } | null,
    ) => {
      setHighlightNodes(
        new Set(
          link
            ? [
                (link.source as { id?: string }).id,
                (link.target as { id?: string }).id,
              ].filter(Boolean) as string[]
            : [],
        ),
      )
      setHighlightLinks(
        new Set(
          link
            ? [
                `${(link.source as { id?: string }).id}-${(link.target as { id?: string }).id}`,
                `${(link.target as { id?: string }).id}-${(link.source as { id?: string }).id}`,
              ]
            : [],
        ),
      )
    },
    [],
  )

  const paintNode = useCallback(
    (
      node: { id?: string; label?: string; x?: number; y?: number },
      ctx: CanvasRenderingContext2D,
      globalScale: number,
    ) => {
      const label = node.label ?? node.id ?? '?'
      const fontSize = 12 / globalScale
      ctx.font = `${fontSize}px Sans-Serif`

      const isHighlight = highlightNodes.has(String(node.id))
      ctx.fillStyle = isHighlight ? '#a78bfa' : '#64748b'
      ctx.beginPath()
      ctx.arc(node.x ?? 0, node.y ?? 0, isHighlight ? 8 : 5, 0, 2 * Math.PI)
      ctx.fill()

      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = '#e2e8f0'
      ctx.fillText(label, node.x ?? 0, (node.y ?? 0) + 12)
    },
    [highlightNodes],
  )

  const paintLink = useCallback(
    (
      link: { source: { id?: string }; target: { id?: string } },
      ctx: CanvasRenderingContext2D,
    ) => {
      const key1 = `${(link.source as { id?: string }).id}-${(link.target as { id?: string }).id}`
      const key2 = `${(link.target as { id?: string }).id}-${(link.source as { id?: string }).id}`
      const isHighlight = highlightLinks.has(key1) || highlightLinks.has(key2)

      const src = link.source as { x?: number; y?: number }
      const tgt = link.target as { x?: number; y?: number }
      ctx.beginPath()
      ctx.moveTo(src.x ?? 0, src.y ?? 0)
      ctx.lineTo(tgt.x ?? 0, tgt.y ?? 0)
      ctx.strokeStyle = isHighlight ? '#a78bfa' : '#475569'
      ctx.lineWidth = isHighlight ? 2 : 1
      ctx.stroke()
    },
    [highlightLinks],
  )

  if (nodes.length === 0 && edges.length === 0) {
    return (
      <div
        className="flex h-[300px] items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/40 text-sm text-zinc-400"
        role="status"
        aria-label="No graph data available"
      >
        No graph data to visualize
      </div>
    )
  }

  return (
    <div
      className="relative rounded-xl border border-zinc-800 bg-zinc-950/60"
      role="img"
      aria-label={`Knowledge graph visualization with ${nodes.length} nodes and ${edges.length} edges`}
    >
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute right-2 top-2 z-10 rounded-lg border border-zinc-800 bg-zinc-900/80 px-2 py-1 text-xs text-zinc-300 transition-colors hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
          aria-label="Close graph visualization"
        >
          Close
        </button>
      )}
      <ForceGraph2D
        graphData={graphData}
        nodeId="id"
        nodeLabel="label"
        nodeCanvasObject={paintNode}
        linkCanvasObject={paintLink}
        onNodeHover={handleNodeHover}
        onLinkHover={handleLinkHover}
        width={width}
        height={height}
        backgroundColor="rgba(9, 9, 11, 0.8)"
        linkDirectionalArrowLength={4}
        linkDirectionalArrowRelPos={1}
        cooldownTicks={100}
      />
      {/* Accessible summary for screen readers */}
      <div className="sr-only" role="status">
        Graph contains {nodes.length} nodes and {edges.length} connections.
        {nodes.length > 0 && ` Nodes: ${nodes.map((n) => n.label).join(', ')}.`}
      </div>
    </div>
  )
}
