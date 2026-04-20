"use client";

import { useStore } from '@/data/store';
import { X, ExternalLink, Download, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import clsx from 'clsx';

export function MediaViewerModal() {
  const { modal, closeModal } = useStore();
  const [isZoomed, setIsZoomed] = useState(false);

  if (!modal || modal.kind !== 'mediaViewer') return null;

  const { url, mediaType } = modal;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `flowr-file-${Date.now()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenOriginal = () => {
    window.open(url, '_blank');
  };

  return (
    <div 
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 backdrop-blur-xl animate-in fade-in duration-300" 
      onClick={closeModal}
    >
      <div className="absolute top-6 left-6 flex items-center gap-3 z-[1010]">
        <div className="flex flex-col">
            <h2 className="text-white text-[13px] font-bold tracking-tight">Attachment Preview</h2>
            <p className="text-white/40 text-[10px] font-medium uppercase tracking-widest">{mediaType}</p>
        </div>
      </div>

      <div className="absolute top-6 right-6 flex items-center gap-3 z-[1010]">
        <button 
          onClick={(e) => { e.stopPropagation(); handleOpenOriginal(); }}
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all"
          title="Open in new tab"
        >
          <ExternalLink className="w-4.5 h-4.5" />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); handleDownload(); }}
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all"
          title="Download"
        >
          <Download className="w-4.5 h-4.5" />
        </button>
        <div className="w-px h-6 bg-white/10 mx-1" />
        <button 
          onClick={closeModal} 
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div 
        className="relative max-w-[90vw] max-h-[85vh] flex items-center justify-center"
        onClick={e => e.stopPropagation()}
      >
        {mediaType === 'image' ? (
          <img
            src={url}
            alt="Preview"
            className={clsx(
                "rounded-xl shadow-2xl transition-all duration-300 select-none",
                isZoomed ? "cursor-zoom-out max-w-none scale-150" : "cursor-zoom-in object-contain max-h-[80vh] w-auto border border-white/10"
            )}
            onClick={() => setIsZoomed(!isZoomed)}
          />
        ) : (
          <div className="bg-white/5 border border-white/10 p-12 rounded-[2.5rem] flex flex-col items-center gap-6 shadow-2xl">
            <div className="w-24 h-24 rounded-3xl bg-accent flex items-center justify-center shadow-2xl shadow-accent/20">
              <FileText className="w-12 h-12 text-white" />
            </div>
            <div className="text-center space-y-2">
                <p className="text-white font-bold text-lg">Document Attachment</p>
                <p className="text-white/40 text-xs">This file format requires browser viewing or downloading.</p>
            </div>
            <button 
                onClick={handleOpenOriginal}
                className="mt-4 px-8 py-3 bg-white text-black font-bold text-sm rounded-full hover:bg-white/90 transition-all active:scale-95"
            >
                Open in Browser
            </button>
          </div>
        )}
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/20 text-[10px] font-medium tracking-tight pointer-events-none">
        Click anywhere to close preview
      </div>
    </div>
  );
}
