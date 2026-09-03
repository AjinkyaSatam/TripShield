'use client';

import React, { useState } from 'react';
import { GraphNode, GraphEdge, ImpactAnalysisResult } from '@/lib/graph/types';
import { Plane, Hotel, Car, Calendar, Ticket, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { formatINR } from '@/lib/format';

interface ItineraryGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  impact?: ImpactAnalysisResult | null;
  onSelectNode?: (node: GraphNode) => void;
  onSimulateDisruption?: (bookingId: string) => void;
}

export function ItineraryGraph({
  nodes,
  edges,
  impact,
  onSelectNode,
  onSimulateDisruption,
}: ItineraryGraphProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  const getIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'FLIGHT':
        return Plane;
      case 'HOTEL':
        return Hotel;
      case 'TRANSFER':
        return Car;
      case 'EVENT':
        return Calendar;
      case 'ACTIVITY':
      default:
        return Ticket;
    }
  };

  const nodeWidth = 200;
  const nodeHeight = 90;
  const horizontalGap = 100;
  const verticalGap = 110;
  const columnsPerRow = 4;

  const nodePositions = new Map<string, { x: number; y: number; row: number; col: number }>();
  
  nodes.forEach((node, index) => {
    const row = Math.floor(index / columnsPerRow);
    const colInRow = index % columnsPerRow;
    const col = row % 2 === 0 ? colInRow : columnsPerRow - 1 - colInRow;

    const x = 40 + col * (nodeWidth + horizontalGap);
    const y = 50 + row * (nodeHeight + verticalGap);
    nodePositions.set(node.id, { x, y, row, col });
  });

  const totalWidth = 40 + columnsPerRow * (nodeWidth + horizontalGap) + 40;
  const totalRows = Math.ceil(nodes.length / columnsPerRow);
  const totalHeight = 60 + totalRows * (nodeHeight + verticalGap) + 40;

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  return (
    <div className="w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-md relative overflow-hidden">
      {/* Top Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="h-3 w-3 rounded-full bg-red-600 animate-ping" />
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Itinerary Dependency Topology</h2>
            <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-red-50 text-red-600 border border-red-200 font-mono uppercase tracking-wider">
              Connected Graph
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dynamic DAG with automated edge buffer slack inference and live ripple impact highlighting.
          </p>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1 text-slate-600">
            <button
              onClick={() => setZoom((z) => Math.max(0.7, z - 0.1))}
              className="p-1.5 hover:text-slate-900 hover:bg-white rounded-lg transition-colors"
              title="Zoom Out"
            >
              <ZoomOut size={16} />
            </button>
            <span className="text-xs px-2.5 font-mono text-slate-900 font-bold">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(1.4, z + 0.1))}
              className="p-1.5 hover:text-slate-900 hover:bg-white rounded-lg transition-colors"
              title="Zoom In"
            >
              <ZoomIn size={16} />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-1.5 ml-1 hover:text-slate-900 hover:bg-white rounded-lg transition-colors"
              title="Reset View"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="w-full overflow-x-auto overflow-y-auto max-h-[600px] py-4 select-none bg-slate-50/50 rounded-2xl">
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
            width: totalWidth,
            height: totalHeight,
            minWidth: totalWidth,
            minHeight: totalHeight,
            position: 'relative',
          }}
        >
          <svg width={totalWidth} height={totalHeight} className="absolute inset-0 pointer-events-auto">
            <defs>
              <marker id="arr-normal" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#008cff" />
              </marker>
              <marker id="arr-disrupted" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#e41d2d" />
              </marker>
              <marker id="arr-at-risk" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f59e0b" />
              </marker>
            </defs>

            {/* Directed Edges */}
            {edges.map((edge) => {
              const fromPos = nodePositions.get(edge.fromBookingId);
              const toPos = nodePositions.get(edge.toBookingId);
              if (!fromPos || !toPos) return null;

              const toNode = nodes.find((n) => n.id === edge.toBookingId);

              const isEdgeDisrupted =
                toNode?.status === 'disrupted' || edge.bufferMinutes < edge.minRequiredBufferMinutes;
              const isEdgeAtRisk =
                toNode?.status === 'at_risk' ||
                (!isEdgeDisrupted && edge.bufferMinutes - edge.minRequiredBufferMinutes <= 20);

              const startX = fromPos.x + nodeWidth;
              const startY = fromPos.y + nodeHeight / 2;
              const endX = toPos.x;
              const endY = toPos.y + nodeHeight / 2;

              let stroke = '#008cff';
              let markerId = 'arr-normal';
              let strokeWidth = 2.5;

              if (isEdgeDisrupted) {
                stroke = '#e41d2d';
                markerId = 'arr-disrupted';
                strokeWidth = 3.5;
              } else if (isEdgeAtRisk) {
                stroke = '#f59e0b';
                markerId = 'arr-at-risk';
                strokeWidth = 3;
              }

              let pathD = '';
              if (fromPos.row === toPos.row) {
                const midX = (startX + endX) / 2;
                pathD = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
              } else {
                const c1X = startX + 40;
                const c1Y = startY;
                const c2X = endX - 40;
                const c2Y = endY;
                pathD = `M ${startX} ${startY} C ${c1X} ${c1Y}, ${c2X} ${c2Y}, ${endX} ${endY}`;
              }

              const midPointX = (startX + endX) / 2;
              const midPointY = (startY + endY) / 2;

              return (
                <g key={edge.id} className="transition-all duration-300">
                  <path
                    d={pathD}
                    fill="none"
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    strokeDasharray={isEdgeDisrupted ? '6,4' : undefined}
                    markerEnd={`url(#${markerId})`}
                    className={isEdgeDisrupted ? 'animate-pulse' : ''}
                  />

                  {/* Buffer Slack Indicator Pill */}
                  <g transform={`translate(${midPointX - 40}, ${midPointY - 12})`}>
                    <rect
                      width="80"
                      height="24"
                      rx="12"
                      fill="#ffffff"
                      stroke={isEdgeDisrupted ? '#e41d2d' : isEdgeAtRisk ? '#f59e0b' : '#008cff'}
                      strokeWidth="1.5"
                      className="shadow-sm"
                    />
                    <text
                      x="40"
                      y="16"
                      textAnchor="middle"
                      fill={isEdgeDisrupted ? '#e41d2d' : isEdgeAtRisk ? '#b45309' : '#008cff'}
                      fontSize="10"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {edge.bufferMinutes}m slack
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>

          {/* HTML Nodes positioned over SVG */}
          {nodes.map((node, index) => {
            const pos = nodePositions.get(node.id);
            if (!pos) return null;

            const Icon = getIcon(node.type);
            const isDisrupted = node.status === 'disrupted';
            const isAtRisk = node.status === 'at_risk';
            const isRebooked = node.status === 'rebooked';
            const isSelected = selectedNodeId === node.id;

            let cardBg = 'bg-white border-slate-200 shadow-xs';
            let glow = '';

            if (isDisrupted) {
              cardBg = 'bg-red-50 border-red-500 shadow-lg shadow-red-100';
              glow = 'ring-2 ring-red-500/50 animate-pulse';
            } else if (isAtRisk) {
              cardBg = 'bg-amber-50 border-amber-500 shadow-md shadow-amber-100';
              glow = 'ring-2 ring-amber-500/50';
            } else if (isRebooked) {
              cardBg = 'bg-blue-50 border-blue-500 shadow-md shadow-blue-100';
              glow = 'ring-2 ring-blue-500/50';
            } else if (isSelected) {
              cardBg = 'bg-red-50 border-red-600';
              glow = 'ring-2 ring-red-600/40';
            }

            const startTimeStr = new Date(node.startTime).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            });

            return (
              <div
                key={node.id}
                onClick={() => {
                  setSelectedNodeId(node.id);
                  onSelectNode?.(node);
                }}
                style={{
                  position: 'absolute',
                  left: pos.x,
                  top: pos.y,
                  width: nodeWidth,
                  height: nodeHeight,
                }}
                className={`rounded-2xl border p-3 cursor-pointer transition-all duration-200 ${cardBg} ${glow} hover:scale-105 hover:z-20`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className={`p-1 rounded-lg ${
                      isDisrupted
                        ? 'bg-red-100 text-red-600'
                        : isAtRisk
                        ? 'bg-amber-100 text-amber-700'
                        : isRebooked
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-red-50 text-red-600'
                    }`}>
                      <Icon size={14} />
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 font-bold uppercase truncate">
                      Leg #{index + 1}
                    </span>
                  </div>

                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase font-mono ${
                    isDisrupted
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : isAtRisk
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : isRebooked
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  }`}>
                    {node.status}
                  </span>
                </div>

                <div className="font-bold text-xs text-slate-900 truncate mt-1" title={node.title}>
                  {node.title}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5 font-mono">
                  <span>{startTimeStr}</span>
                  <span className="text-slate-900 font-bold">{formatINR(node.cost)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Graph Footer Legend */}
      <div className="mt-5 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-4 flex-wrap text-slate-600">
          <span className="font-bold text-slate-900">Topology Status:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Confirmed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Tight Headroom (&lt;20m)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
            <span>Disrupted</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>Rebooked via AI</span>
          </div>
        </div>

        {selectedNode && (
          <div className="flex items-center gap-2.5 ml-auto">
            <span className="text-slate-900 font-bold truncate max-w-[220px]">
              {selectedNode.title}
            </span>
            {onSimulateDisruption && selectedNode.status !== 'disrupted' && (
              <button
                onClick={() => onSimulateDisruption(selectedNode.id)}
                className="text-xs px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-colors cursor-pointer shadow-xs"
              >
                Simulate Disruption
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
