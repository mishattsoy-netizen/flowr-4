"use client";

import { Entity, useStore } from '@/data/store';
import { CanvasBlock } from './CanvasBlock';
import { CanvasToolbar, CanvasTool } from './CanvasToolbar';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { LayersPanel } from './LayersPanel';
import { generateId } from '@/data/store';
import { CanvasConnections } from './CanvasConnections';
import { MediaUploadPopover } from './MediaUploadPopover';

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 4.0;
const ZOOM_STEP = 0.1;

export function CanvasPage({ entity }: { entity: Entity }) {
  const [activeTool, setActiveTool] = useState<CanvasTool>('select');
  const [showLayers, setShowLayers] = useState(true);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [pendingConnection, setPendingConnection] = useState<{ fromId: string; fromSide: string; x: number; y: number; x2: number; y2: number } | null>(null);
  const [mediaPopover, setMediaPopover] = useState<{ x: number; y: number; canvasX: number; canvasY: number } | null>(null);

  // Viewport (pan/zoom)
  const [viewport, setViewport] = useState({ x: 0, y: 0, scale: 1 });
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0, vx: 0, vy: 0 });
  const spaceHeldRef = useRef(false);

  const blocks = useStore(state => state.blocks);
  const editingEntity = useStore(state => state.editingEntity);
  const setEditingEntityId = useStore(state => state.setEditingEntityId);
  const renameEntity = useStore(state => state.renameEntity);
  const addCanvasBlock = useStore(state => state.addCanvasBlock);
  const pageBlocks = useMemo(() => blocks.filter(b => b.canvasId === entity.id), [blocks, entity.id]);
  const [tempTitle, setTempTitle] = useState(entity.title);
  const tempTitleRef = useRef(entity.title);

  const isEditing = editingEntity?.id === entity.id && editingEntity.source === 'view';
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing) {
      setTempTitle(entity.title);
      tempTitleRef.current = entity.title;
    }
  }, [isEditing, entity.title]);

  // --- Keyboard shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't override if we're in an input/textarea
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable) return;

      switch (e.key.toLowerCase()) {
        case 'v': case 'escape': setActiveTool('select'); break;
        case 'h': setActiveTool('move'); break;
        case 't': setActiveTool('add_text'); break;
        case 'm': setActiveTool('add_media'); break;
        case 'f': setActiveTool('section'); break;
        case 'c': setActiveTool('connect'); break;
        case 'o': setActiveTool('comment'); break;
        case ' ':
          if (!spaceHeldRef.current) {
            spaceHeldRef.current = true;
          }
          e.preventDefault();
          break;
        case 'delete': case 'backspace':
          if (selectedBlockId) {
            const deleteCanvasBlock = useStore.getState().deleteCanvasBlock;
            deleteCanvasBlock(selectedBlockId);
            setSelectedBlockId(null);
          }
          break;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        spaceHeldRef.current = false;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedBlockId]);

  // --- Zoom via wheel ---
  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      const isZoom = e.ctrlKey || e.altKey || e.metaKey;
      if (isZoom) {
        e.preventDefault();
        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        setViewport(prev => {
          const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
          const newScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev.scale + delta));
          const ratio = newScale / prev.scale;

          // Zoom toward mouse position
          const newX = mouseX - ratio * (mouseX - prev.x);
          const newY = mouseY - ratio * (mouseY - prev.y);

          return { x: newX, y: newY, scale: newScale };
        });
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  // --- Connection tracking ---
  useEffect(() => {
    const handleGlobalMove = (e: PointerEvent) => {
      if (pendingConnection) {
        const rect = canvasContainerRef.current?.getBoundingClientRect();
        if (rect) {
          const cx = (e.clientX - rect.left - viewport.x) / viewport.scale;
          const cy = (e.clientY - rect.top - viewport.y) / viewport.scale;
          setPendingConnection(prev => prev ? { ...prev, x2: cx, y2: cy } : null);
        }
      }
    };
    document.addEventListener('pointermove', handleGlobalMove);
    return () => document.removeEventListener('pointermove', handleGlobalMove);
  }, [pendingConnection, viewport]);

  const handleRename = () => {
    if (tempTitle.trim() && tempTitle !== entity.title) {
      renameEntity(entity.id, tempTitle.trim());
    } else {
      setEditingEntityId(null);
      setTempTitle(entity.title);
    }
  };

  // Screen → Canvas coordinate conversion
  const screenToCanvas = useCallback((clientX: number, clientY: number) => {
    const rect = canvasContainerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (clientX - rect.left - viewport.x) / viewport.scale,
      y: (clientY - rect.top - viewport.y) / viewport.scale,
    };
  }, [viewport]);

  // --- Pan ---
  const handleBgPointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (target.id !== 'canvas-bg' && !target.closest('#canvas-bg')) return;

    // Click to deselect
    setSelectedBlockId(null);

    // Close media popover
    if (mediaPopover) {
      setMediaPopover(null);
      return;
    }

    if (pendingConnection) {
      setPendingConnection(null);
      return;
    }

    // Pan with space held, move tool, or middle mouse
    const shouldPan = spaceHeldRef.current || activeTool === 'move' || e.button === 1;
    if (shouldPan) {
      e.preventDefault();
      isPanningRef.current = true;
      panStartRef.current = { x: e.clientX, y: e.clientY, vx: viewport.x, vy: viewport.y };

      const handlePanMove = (moveEvent: PointerEvent) => {
        if (!isPanningRef.current) return;
        const dx = moveEvent.clientX - panStartRef.current.x;
        const dy = moveEvent.clientY - panStartRef.current.y;
        setViewport(prev => ({ ...prev, x: panStartRef.current.vx + dx, y: panStartRef.current.vy + dy }));
      };

      const handlePanUp = () => {
        isPanningRef.current = false;
        document.removeEventListener('pointermove', handlePanMove);
        document.removeEventListener('pointerup', handlePanUp);
      };

      document.addEventListener('pointermove', handlePanMove);
      document.addEventListener('pointerup', handlePanUp);
      return;
    }

    // Tool actions
    const { x, y } = screenToCanvas(e.clientX, e.clientY);

    if (activeTool === 'add_text') {
      addCanvasBlock({ id: generateId(), type: 'text', content: 'New Block', x, y, canvasId: entity.id });
      setActiveTool('select');
    } else if (activeTool === 'add_media') {
      setMediaPopover({ x: e.clientX, y: e.clientY, canvasX: x, canvasY: y });
    } else if (activeTool === 'section') {
      addCanvasBlock({ id: generateId(), type: 'section', content: 'New Section', x, y, width: 300, height: 200, canvasId: entity.id });
      setActiveTool('select');
    } else if (activeTool === 'comment') {
      addCanvasBlock({ id: generateId(), type: 'comment', content: '', x, y, canvasId: entity.id });
      setActiveTool('select');
    }
  };

  const handleMediaConfirm = (url: string) => {
    if (mediaPopover) {
      addCanvasBlock({
        id: generateId(),
        type: 'image',
        content: '',
        mediaUrl: url,
        x: mediaPopover.canvasX,
        y: mediaPopover.canvasY,
        width: 300,
        height: 200,
        canvasId: entity.id,
      });
      setMediaPopover(null);
      setActiveTool('select');
    }
  };

  const handleZoomIn = () => {
    setViewport(prev => ({ ...prev, scale: Math.min(MAX_ZOOM, prev.scale + ZOOM_STEP) }));
  };
  const handleZoomOut = () => {
    setViewport(prev => ({ ...prev, scale: Math.max(MIN_ZOOM, prev.scale - ZOOM_STEP) }));
  };

  return (
    <div className="flex-1 bg-panel relative overflow-hidden text-foreground flex">
      {showLayers && (
        <LayersPanel
          canvasId={entity.id}
          selectedBlockId={selectedBlockId}
          onSelect={setSelectedBlockId}
        />
      )}

      <div ref={canvasContainerRef} className="flex-1 relative overflow-hidden" style={{ cursor: activeTool === 'move' || spaceHeldRef.current ? 'grab' : undefined }}>
        {/* Title overlay */}
        <div className="absolute top-8 left-8 z-10 w-64 bg-background border border-border p-4 rounded-xl pointer-events-auto">
          {isEditing ? (
            <input
              autoFocus
              type="text"
              defaultValue={tempTitle}
              onChange={(e) => {
                setTempTitle(e.target.value);
                tempTitleRef.current = e.target.value;
              }}
              onBlur={handleRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename();
                if (e.key === 'Escape') {
                  setEditingEntityId(null);
                  setTempTitle(entity.title);
                }
              }}
              className="font-bold text-lg mb-1 bg-transparent border-none outline-none w-full text-foreground"
            />
          ) : (
            <h2
              onDoubleClick={() => setEditingEntityId(entity.id, 'view')}
              className="font-bold text-lg mb-1 cursor-text select-text"
            >
              {entity.title}
            </h2>
          )}
        </div>

        {/* Canvas background (pan target) */}
        <div
          id="canvas-bg"
          onPointerDown={handleBgPointerDown}
          className="w-full h-full relative"
          style={{
            backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.01) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.01) 1px, transparent 1px)',
            backgroundSize: `${20 * viewport.scale}px ${20 * viewport.scale}px`,
            backgroundPosition: `${viewport.x}px ${viewport.y}px`
          }}
        >
          {/* Viewport-transformed layer */}
          <div
            id="canvas-viewport"
            style={{
              transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`,
              transformOrigin: '0 0',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
            }}
          >
            <div style={{ pointerEvents: 'auto' }}>
              <CanvasConnections canvasId={entity.id} />

              {pendingConnection && (
                <svg className="absolute inset-0 pointer-events-none w-full h-full overflow-visible z-[5000]">
                  <line
                    x1={pendingConnection.x}
                    y1={pendingConnection.y}
                    x2={pendingConnection.x2}
                    y2={pendingConnection.y2}
                    stroke="var(--accent)"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />
                </svg>
              )}

              {pageBlocks.map(b => (
                <CanvasBlock
                  key={b.id}
                  block={b}
                  activeTool={activeTool}
                  viewport={viewport}
                  isSelected={selectedBlockId === b.id}
                  onSelect={setSelectedBlockId}
                  onConnectStart={(side, x, y) => {
                    if (activeTool !== 'connect') return;

                    if (!pendingConnection) {
                      setPendingConnection({ fromId: b.id, fromSide: side, x, y, x2: x, y2: y });
                    } else if (pendingConnection.fromId !== b.id) {
                      addCanvasBlock({
                        id: generateId(),
                        type: 'connection',
                        content: '',
                        canvasId: entity.id,
                        fromId: pendingConnection.fromId,
                        fromSide: pendingConnection.fromSide as any,
                        toId: b.id,
                        toSide: side as any,
                        x: 0, y: 0
                      });
                      setPendingConnection(null);
                      setActiveTool('select');
                    }
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Media upload popover */}
        {mediaPopover && (
          <MediaUploadPopover
            position={{ x: mediaPopover.x, y: mediaPopover.y }}
            onConfirm={handleMediaConfirm}
            onClose={() => setMediaPopover(null)}
          />
        )}

        <CanvasToolbar
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          showLayers={showLayers}
          setShowLayers={setShowLayers}
          zoom={viewport.scale}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
        />
      </div>
    </div>
  );
}

