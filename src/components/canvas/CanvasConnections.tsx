"use client";

import { useStore, EditorBlock } from "@/data/store";
import { useMemo } from "react";

interface CanvasConnectionsProps {
  canvasId: string;
}

export function CanvasConnections({ canvasId }: CanvasConnectionsProps) {
  const allBlocks = useStore(state => state.blocks);
  const blocks = useMemo(() => allBlocks.filter(b => b.canvasId === canvasId), [allBlocks, canvasId]);
  const connections = useMemo(() => blocks.filter(b => b.type === 'connection' && b.fromId && b.toId), [blocks]);

  const getBlockData = (blockId: string) => {
    const b = blocks.find(x => x.id === blockId);
    if (!b) return null;
    return {
      x: b.x || 0,
      y: b.y || 0,
      w: b.width || 280,
      h: b.height || 100
    };
  };

  const getPointPosition = (blockId: string, side: string) => {
    const data = getBlockData(blockId);
    if (!data) return { x: 0, y: 0 };

    const { x, y, w, h } = data;

    switch(side) {
      case 'top': return { x: x + w / 2, y: y };
      case 'right': return { x: x + w, y: y + h / 2 };
      case 'bottom': return { x: x + w / 2, y: y + h };
      case 'left': return { x: x, y: y + h / 2 };
      default: return { x: x + w / 2, y: y + h / 2 };
    }
  };

  const calculatePath = (
    p1: { x: number, y: number }, 
    p2: { x: number, y: number }, 
    s1: string, 
    s2: string,
    b1: any,
    b2: any
  ) => {
    const buffer = 30;

    const getEscapePoint = (p: { x: number, y: number }, side: string) => {
      if (side === 'top') return { x: p.x, y: p.y - buffer };
      if (side === 'bottom') return { x: p.x, y: p.y + buffer };
      if (side === 'left') return { x: p.x - buffer, y: p.y };
      if (side === 'right') return { x: p.x + buffer, y: p.y };
      return p;
    };

    const e1 = getEscapePoint(p1, s1);
    const e2 = getEscapePoint(p2, s2);

    const points = [p1, e1];

    const isRectBlocked = (r: any, x: number, y: number) => {
      return x >= r.x - 5 && x <= r.x + r.w + 5 && y >= r.y - 5 && y <= r.y + r.h + 5;
    };

    // Helper to determine if a vertical/horizontal segment is safe
    const isPathSafe = (pA: any, pB: any) => {
      // Check middle point
      const mid = { x: (pA.x + pB.x) / 2, y: (pA.y + pB.y) / 2 };
      return !isRectBlocked(b1, mid.x, mid.y) && !isRectBlocked(b2, mid.x, mid.y);
    };

    if (s1 === 'top' || s1 === 'bottom') {
      if (s2 === 'left' || s2 === 'right') {
        const corner = { x: e1.x, y: e2.y };
        if (isPathSafe(e1, corner) && isPathSafe(corner, e2)) {
          points.push(corner);
        } else {
          // Alternative corner
          const altCorner = { x: e2.x, y: e1.y };
          if (isPathSafe(e1, altCorner) && isPathSafe(altCorner, e2)) {
            points.push(altCorner);
          } else {
            // Z-shape around
            const midY = (e1.y + e2.y) / 2;
            points.push({ x: e1.x, y: midY });
            points.push({ x: e2.x, y: midY });
          }
        }
      } else {
        // Vertical to Vertical
        const midY = (e1.y + e2.y) / 2;
        // Check if midY intersects either block
        if (!isRectBlocked(b1, e1.x, midY) && !isRectBlocked(b2, e2.x, midY)) {
          points.push({ x: e1.x, y: midY });
          points.push({ x: e2.x, y: midY });
        } else {
          // Go outside both
          const safeY = Math.max(b1.y + b1.h, b2.y + b2.h) + buffer;
          points.push({ x: e1.x, y: safeY });
          points.push({ x: e2.x, y: safeY });
        }
      }
    } else {
      // Horizontal start
      if (s2 === 'top' || s2 === 'bottom') {
        const corner = { x: e2.x, y: e1.y };
        if (isPathSafe(e1, corner) && isPathSafe(corner, e2)) {
          points.push(corner);
        } else {
          const altCorner = { x: e1.x, y: e2.y };
          if (isPathSafe(e1, altCorner) && isPathSafe(altCorner, e2)) {
            points.push(altCorner);
          } else {
            const midX = (e1.x + e2.x) / 2;
            points.push({ x: midX, y: e1.y });
            points.push({ x: midX, y: e2.y });
          }
        }
      } else {
        // Horizontal to Horizontal
        const midX = (e1.x + e2.x) / 2;
        if (!isRectBlocked(b1, midX, e1.y) && !isRectBlocked(b2, midX, e2.y)) {
          points.push({ x: midX, y: e1.y });
          points.push({ x: midX, y: e2.y });
        } else {
          const safeX = Math.max(b1.x + b1.w, b2.x + b2.w) + buffer;
          points.push({ x: safeX, y: e1.y });
          points.push({ x: safeX, y: e2.y });
        }
      }
    }

    points.push(e2);
    points.push(p2);

    return `M ${points[0].x} ${points[0].y} ` + 
           points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
  };

  return (
    <svg className="absolute inset-0 pointer-events-none w-full h-full overflow-visible z-[5]">
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="var(--accent)" />
        </marker>
      </defs>

      {connections.map(conn => {
        const p1 = getPointPosition(conn.fromId!, conn.fromSide || 'bottom');
        const p2 = getPointPosition(conn.toId!, conn.toSide || 'top');
        const b1 = getBlockData(conn.fromId!);
        const b2 = getBlockData(conn.toId!);
        
        if (!b1 || !b2) return null;

        const d = calculatePath(p1, p2, conn.fromSide || 'bottom', conn.toSide || 'top', b1, b2);

        return (
          <g key={conn.id}>
            <path
              d={d}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2"
              opacity="0.3"
              strokeDasharray="4 4"
              className="animate-pulse"
            />
            <path
              d={d}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2"
              markerEnd="url(#arrowhead)"
              className=""
            />
          </g>
        );
      })}
    </svg>
  );
}

