'use client';

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { ReactGridLayout as GridLayout, WidthProvider } from 'react-grid-layout/legacy';
import type { LayoutItem } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import { Settings2, Check } from 'lucide-react';
import clsx from 'clsx';
import gsap from 'gsap';
import { useBentoLayout } from '@/hooks/useBentoLayout';
import { widgetRegistry } from './registry';
import { BentoWidget } from './BentoWidget';
import { WidgetPicker } from './WidgetPicker';

const SizedGridLayout = WidthProvider(GridLayout);

interface BentoDashboardProps {
  contextId: string;
  title?: React.ReactNode;
  actions?: React.ReactNode;
}

export function BentoDashboard({ contextId, title, actions }: BentoDashboardProps) {
  const { layout, editMode, isLoading, toggleEditMode, handleLayoutChange, addWidget, removeWidget, updateWidgetData, resetLayout } = useBentoLayout(contextId);
  const [reallyLoading, setReallyLoading] = useState(true);
  const [droppingType, setDroppingType] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setReallyLoading(false), 200);
      return () => clearTimeout(timer);
    } else {
      setReallyLoading(true);
    }
  }, [isLoading]);

  // Settle animation when exiting edit mode
  const prevEditMode = useRef(editMode);
  useEffect(() => {
    if (prevEditMode.current && !editMode && gridRef.current) {
      const widgets = gridRef.current.querySelectorAll<HTMLElement>('.react-grid-item');
      gsap.fromTo(widgets, { scale: 1.02 }, { scale: 1, duration: 0.15, ease: 'power2.out', stagger: 0.02 });
    }
    prevEditMode.current = editMode;
  }, [editMode]);

  const handleDrop = useCallback((_layout: readonly LayoutItem[], item: LayoutItem | undefined, _e: Event) => {
    if (!droppingType || !item) return;
    addWidget(droppingType, item.x, item.y);
    setDroppingType(null);
  }, [droppingType, addWidget]);

  const droppingItem: LayoutItem | undefined = droppingType
    ? { i: '__dropping__', x: 0, y: 0, w: widgetRegistry[droppingType]?.defaultW ?? 1, h: widgetRegistry[droppingType]?.defaultH ?? 2 }
    : undefined;

  const memoizedLayout = useMemo(() => {
    return layout.map(item => ({ ...item, minW: 2 }));
  }, [layout]);

  return (
    <div className="flex-1 flex flex-row overflow-hidden h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="px-10 py-8 max-w-6xl mx-auto">
          <header className="flex items-end justify-between mb-4">
            <div className="flex-1">{title}</div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 mr-1">
                {editMode && (
                  <button
                    onClick={resetLayout}
                    className="btn-bento-danger"
                  >
                    Reset to Default
                  </button>
                )}
                <button
                  onClick={toggleEditMode}
                  className={editMode ? 'btn-bento-active' : 'btn-bento'}
                >
                  {editMode ? (
                    <><Check /> Done</>
                  ) : (
                    <><Settings2 /> Edit Layout</>
                  )}
                </button>
              </div>

              {actions}
            </div>
          </header>

          {editMode && (
            <div className="mb-4 px-3 py-2 rounded-lg border border-dashed border-border text-xs text-muted-foreground text-center">
              Drag widgets to rearrange · Resize from the corner · Drop from panel to place
            </div>
          )}

          <div ref={gridRef} className={clsx(reallyLoading && 'bento-no-transitions', '-mx-2')}>
            <SizedGridLayout
              layout={memoizedLayout}
              cols={6}
              rowHeight={200}
              margin={[10, 10]}
              isDraggable={editMode}
              isResizable={editMode}
              isDroppable={editMode}
              droppingItem={droppingItem}
              measureBeforeMount={true}
              onLayoutChange={(l) => handleLayoutChange([...l])}
              onDrop={handleDrop}
              resizeHandles={['se']}
              className={clsx(
                editMode && 'bento-edit-mode'
              )}
              useCSSTransforms={true}
            >
              {layout.map(item => (
                <div key={item.i}>
                  <BentoWidget
                    item={item}
                    contextId={contextId}
                    editMode={editMode}
                    isLoading={isLoading}
                    onUpdateData={(newData) => updateWidgetData(item.i, newData)}
                    onRemove={() => removeWidget(item.i)}
                  />
                </div>
              ))}
            </SizedGridLayout>
          </div>
        </div>
      </div>

      <WidgetPicker
        open={editMode}
        onAdd={addWidget}
        onDragStart={setDroppingType}
        onDragEnd={() => setDroppingType(null)}
        contextId={contextId}
      />
    </div>
  );
}
