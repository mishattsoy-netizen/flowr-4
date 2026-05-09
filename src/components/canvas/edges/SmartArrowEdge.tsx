"use client";

import React, { useEffect, useRef } from 'react';
import { BaseEdge, EdgeProps, getBezierPath } from 'reactflow';
import gsap from 'gsap';

import { calculateCatmullRomPath } from '@/lib/geometry/splines';

export const SmartArrowEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  pathPoints,
  source,
  target,
  selected,
  onSelect,
  canvasStyleExt,
}: EdgeProps & { 
  pathPoints?: [number, number][];
  selected?: boolean;
  onSelect?: (id: string, addToSelection: boolean) => void;
  canvasStyleExt?: any;
}) => {
  const pathRef = useRef<SVGPathElement>(null);
  const hitBoxRef = useRef<SVGPathElement>(null);

  // Calculate path: Catmull-Rom spline if pathPoints exist, otherwise organic Bezier
  let edgePath = "";
  let finalPoints = pathPoints ? pathPoints.map(p => [...p] as [number, number]) : null;
  if (finalPoints && finalPoints.length >= 2) {
    if (sourceX !== undefined && sourceY !== undefined && source) {
      finalPoints[0] = [sourceX, sourceY];
    }
    if (targetX !== undefined && targetY !== undefined && target) {
      finalPoints[finalPoints.length - 1] = [targetX, targetY];
    }
    edgePath = calculateCatmullRomPath(finalPoints);
  } else {
    const [bezier] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });
    edgePath = bezier;
  }

  // Implement Path Gap: Shorten the path so it stops 6px before the target
  const applyPathGap = (path: string) => {
    if (!path) return path;

    const parts = path.split(' ');
    if (parts.length < 4) return path;

    // Bezier curves end with the final coordinate pair.
    // We pull the final point back slightly along the tangent of the curve.
    const lastX = parseFloat(parts[parts.length - 1]);
    const lastY = parseFloat(parts[parts.length - 2]);
    const prevX = parseFloat(parts[parts.length - 3]);
    const prevY = parseFloat(parts[parts.length - 4]);

    const dx = lastX - prevX;
    const dy = lastY - prevY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return path;

    const gap = 6;
    const ratio = (distance - gap) / distance;

    const newX = prevX + dx * ratio;
    const newY = prevY + dy * ratio;

    const newParts = [...parts];
    newParts[newParts.length - 2] = newX.toFixed(2);
    newParts[newParts.length - 1] = newY.toFixed(2);

    return newParts.join(' ');
  };

  const path = applyPathGap(edgePath);

  useEffect(() => {
    if (pathRef.current) {
      const length = pathRef.current.getTotalLength();

      // GSAP Draw-in animation
      gsap.fromTo(
        pathRef.current,
        {
          strokeDasharray: length,
          strokeDashoffset: length
        },
        {
          strokeDashoffset: 0,
          duration: 0.6,
          ease: "power2.out"
        }
      );
    }
  }, [id]); // Trigger when a new edge is added (new ID)

  // Style calculations based on custom properties & selection state
  const strokeColor = selected
    ? 'var(--brand-blue)'
    : (canvasStyleExt?.stroke || 'var(--accent)');

  const strokeWidth = selected
    ? 3
    : (canvasStyleExt?.strokeWidth || 2);

  const strokeStyle = canvasStyleExt?.strokeStyle || 'solid';
  const strokeDasharray = strokeStyle === 'dashed'
    ? '6 4'
    : strokeStyle === 'dotted'
      ? '2 3'
      : undefined;

  // Determine which arrowhead marker to use based on color/selection
  let markerId = "arrowhead";
  if (selected) {
    markerId = "arrowhead-selected";
  } else if (canvasStyleExt?.stroke) {
    const stroke = canvasStyleExt.stroke;
    if (stroke === '#d38f36') markerId = "arrowhead-accent";
    else if (stroke === '#5b9cf6') markerId = "arrowhead-blue";
    else if (stroke === '#a78bfa') markerId = "arrowhead-purple";
    else if (stroke === '#4ade80') markerId = "arrowhead-green";
    else if (stroke === '#f87171') markerId = "arrowhead-red";
    else if (stroke === '#E9E9E2' || stroke.toLowerCase() === 'var(--bone-100)' || stroke === '#e9e9e2') markerId = "arrowhead-bone";
  }

  return (
    <>
      {/* Transparent Hitbox for easy selection */}
      <path
        ref={hitBoxRef}
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        className="cursor-pointer pointer-events-auto"
        style={{ pointerEvents: 'auto' }}
        onPointerDown={(e) => {
          e.stopPropagation();
          onSelect?.(id, e.shiftKey);
        }}
      />

      {/* Main Visual Path */}
      <BaseEdge
        id={id}
        path={path}
        style={{
          ...style,
          stroke: strokeColor,
          strokeWidth: strokeWidth,
          strokeDasharray: strokeDasharray,
          transition: 'stroke 0.2s ease, stroke-width 0.2s ease'
        }}
      />

      {/* Custom Arrowhead marker is defined in the parent SVG defs */}
      <path
        ref={pathRef}
        d={path}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
        markerEnd={`url(#${markerId})`}
        style={{ pointerEvents: 'none' }}
      />
    </>
  );
};
