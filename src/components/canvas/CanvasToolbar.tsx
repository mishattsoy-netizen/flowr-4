"use client";

import React from 'react';
import {
  MousePointer2, Hand, Type, Image,
  Frame, Waypoints, MessageSquarePlus, Layers,
  Plus, Minus
} from 'lucide-react';
import clsx from 'clsx';
import { Tooltip } from '../layout/Tooltip';

export type CanvasTool = 'select' | 'move' | 'add_text' | 'add_media' | 'section' | 'connect' | 'comment';

interface CanvasToolbarProps {
  activeTool: CanvasTool;
  setActiveTool: (tool: CanvasTool) => void;
  showLayers: boolean;
  setShowLayers: (show: boolean) => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

const TOOLS: { id: CanvasTool; icon: React.ReactNode; label: string; shortcut: string }[] = [
  { id: 'select',    icon: <MousePointer2 className="w-4 h-4" />, label: 'Select',       shortcut: 'V' },
  { id: 'move',      icon: <Hand className="w-4 h-4" />,          label: 'Pan',           shortcut: 'H' },
  { id: 'add_text',  icon: <Type className="w-4 h-4" />,          label: 'Add Text',      shortcut: 'T' },
  { id: 'add_media', icon: <Image className="w-4 h-4" />,         label: 'Add Media',     shortcut: 'M' },
  { id: 'section',   icon: <Frame className="w-4 h-4" />,         label: 'Section Frame', shortcut: 'F' },
  { id: 'connect',   icon: <Waypoints className="w-4 h-4" />,     label: 'Connect',       shortcut: 'C' },
  { id: 'comment',   icon: <MessageSquarePlus className="w-4 h-4" />, label: 'Comment',   shortcut: 'O' },
];

export function CanvasToolbar({
  activeTool,
  setActiveTool,
  showLayers,
  setShowLayers,
  zoom,
  onZoomIn,
  onZoomOut,
}: CanvasToolbarProps) {
  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[2000] flex items-center gap-0.5 bg-sidebar/90 border border-border/70 backdrop-blur-md select-none rounded-[var(--radius-medium)] px-2 py-1.5 ">
      {/* Layers toggle */}
      <Tooltip content="Toggle Layers Sidebar">
        <button
          onClick={() => setShowLayers(!showLayers)}
          className={clsx(
            "flex items-center justify-center w-8 h-8 rounded-[var(--radius-medium)] ",
            showLayers ? "bg-accent/15 text-accent" : "text-muted-foreground hover:bg-hover hover:text-foreground"
          )}
        >
          <Layers className="w-4 h-4" />
        </button>
      </Tooltip>

      <div className="w-px h-5 bg-border/50 mx-1" />

      {/* Tool buttons */}
      {TOOLS.map((tool, i) => (
        <React.Fragment key={tool.id}>
          <Tooltip content={`${tool.label} (${tool.shortcut})`}>
            <button
              id={`canvas-tool-${tool.id}`}
              onClick={() => setActiveTool(tool.id)}
              className={clsx(
                "flex items-center justify-center w-8 h-8 rounded-[var(--radius-medium)] ",
                activeTool === tool.id ? "bg-accent/15 text-accent" : "text-muted-foreground hover:bg-hover hover:text-foreground"
              )}
            >
              {tool.icon}
            </button>
          </Tooltip>
          {/* Dividers after select, add_media, and connect */}
          {(tool.id === 'select' || tool.id === 'add_media' || tool.id === 'connect') && (
            <div className="w-px h-5 bg-border/50 mx-1" />
          )}
        </React.Fragment>
      ))}

      <div className="w-px h-5 bg-border/50 mx-1" />

      {/* Zoom controls */}
      <Tooltip content="Zoom Out">
        <button
          onClick={onZoomOut}
          className="flex items-center justify-center w-7 h-7 rounded-[var(--radius-small)] text-muted-foreground hover:bg-hover hover:text-foreground "
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
      </Tooltip>
      <span className="text-[10px] font-bold text-muted-foreground min-w-[36px] text-center tabular-nums">
        {Math.round(zoom * 100)}%
      </span>
      <Tooltip content="Zoom In">
        <button
          onClick={onZoomIn}
          className="flex items-center justify-center w-7 h-7 rounded-[var(--radius-small)] text-muted-foreground hover:bg-hover hover:text-foreground "
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </Tooltip>
    </div>
  );
}

