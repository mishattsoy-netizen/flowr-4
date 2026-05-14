"use client";

import { useStore } from '@/data/store';
import { ChatConversation } from './ChatConversation';
import { AIAssistant } from '@/components/assistant/AIAssistant';

export default function ChatPage() {
  const activeChatId = useStore(s => s.activeChatId);
  const chatConversations = useStore(s => s.chatConversations);
  const isTempChat = useStore(s => s.isTempChat);
  const activeConv = chatConversations.find(c => c.id === activeChatId);
  const title = isTempChat ? 'Temporary Chat' : (activeConv?.title || 'New Chat');

  return (
    <div className="flex h-full w-full bg-background">
      <div className="flex-1 min-w-0 relative h-full">

        {/* Scroll area fills entire parent — bar floats over it */}
        <ChatConversation />

        {/* Top fade + title */}
        <div
          className="absolute top-0 left-0 right-0 h-16 pointer-events-none flex items-start px-6 pt-3 gap-3"
          style={{ zIndex: 40, background: 'linear-gradient(to bottom, #141413 0%, transparent 100%)' }}
        >
          <h2 className="text-sm font-medium truncate text-[var(--bone-100)] tracking-wide">
            {title}
          </h2>
          {isTempChat && (
            <button
              onClick={() => useStore.getState().saveTempChat()}
              className="pointer-events-auto text-[10px] font-bold px-2.5 py-1 rounded-[8px] bg-accent/10 text-accent hover:bg-accent/20 transition-colors shrink-0"
            >
              Save Chat
            </button>
          )}
        </div>

        {/* Fade behind bar — same height as bar+gap, z-index below bar */}
        <div
          className="absolute left-0 right-0 bottom-0 pointer-events-none"
          style={{ zIndex: 38, height: '140px', background: 'linear-gradient(to bottom, transparent 0%, #141413 55%)' }}
        />

        {/* Floating glass bar */}
        <div
          className="absolute left-0 right-0 bottom-0 pb-8 pt-2 flex justify-center"
          style={{ zIndex: 40 }}
        >
          <div className="w-full max-w-4xl mx-auto px-6">
            <AIAssistant chatPageMode={true} />
          </div>
        </div>

      </div>
    </div>
  );
}
