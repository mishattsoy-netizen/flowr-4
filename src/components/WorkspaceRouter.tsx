"use client";

import { useStore } from '@/data/store';
import { Dashboard } from './dashboard/Dashboard';
import { NotePage } from './editor/NotePage';
import { CanvasPage } from './canvas/CanvasPage';
import { MixedPage } from './editor/MixedPage';
import { FolderView } from './folder/FolderView';
import { WorkspacePage } from './workspace/WorkspacePage';
import { TrackerPage } from './tracker/TrackerPage';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

import { memo } from 'react';

export const WorkspaceRouter = memo(function WorkspaceRouter() {
  const activeEntityId = useStore(state => state.activeEntityId);
  const entities = useStore(state => state.entities);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      if (activeEntityId === 'tracker') {
        gsap.set(containerRef.current, { autoAlpha: 1, y: 0, x: 0, clearProps: 'transform' });
      } else {
        gsap.set(containerRef.current, { autoAlpha: 1, y: 0 });
      }
    }
  }, [activeEntityId]);

  const renderContent = () => {


    if (activeEntityId === 'dashboard') {
      return <Dashboard />;
    }

    if (activeEntityId === 'tracker') {
      return <TrackerPage />;
    }

    const activeEntity = entities.find(e => e.id === activeEntityId);

    if (!activeEntity) {
      return (
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
          Select an item from the sidebar.
        </div>
      );
    }

    switch (activeEntity.type) {
      case 'note':
        return <NotePage entity={activeEntity} />;
      case 'canvas':
        return <CanvasPage entity={activeEntity} />;
      case 'mixed':
        return <MixedPage entity={activeEntity} />;
      case 'collection':
      case 'workspace':
        return <WorkspacePage entity={activeEntity} />;
      case 'folder':
        return <FolderView entity={activeEntity} />;
      default:
        return (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            Unsupported view.
          </div>
        );
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="flex-1 flex flex-col min-h-0 relative"
    >
      {renderContent()}
    </div>
  );
});

