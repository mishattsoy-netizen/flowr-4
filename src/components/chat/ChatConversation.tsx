"use client";

import { useStore } from '@/data/store';
import { ChatMessage } from '@/components/assistant/components/ChatMessage';
import { AIAvatar } from '@/components/assistant/components/AIAvatar';
import { useRef, useEffect, useCallback } from 'react';

const SUGGESTED_PROMPTS = [
  'Deep-search the web for [topic] and summarize',
  'Analyze my current workspace and find action items',
  'Draft a technical outline for a new project',
  'Brainstorm 5 innovative solutions for [problem]',
];

export function ChatConversation() {
  const aiMessages = useStore(s => s.aiMessages);
  const isAILoading = useStore(s => s.isAILoading);
  const sendAIMessage = useStore(s => s.sendAIMessage);
  const setAssistantInput = useStore(s => s.setAssistantInput);
  const setReplyMessage = useStore(s => s.setReplyMessage);
  const messages = aiMessages;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' });
  }, []);

  useEffect(() => {
    scrollToBottom('auto');
  }, [messages.length]);

  const handleAddImageToWorkspace = () => { };

  const displayMessages = messages.filter(m => m.role === 'user' || m.role === 'assistant');

  return (
    <div className="flex-1 flex flex-col h-full min-w-0">
      {/* Message list */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden px-6 pt-10 pb-36 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/30"
        style={{ overflowAnchor: 'auto' }}
      >
        <div className="max-w-3xl mx-auto space-y-0.5">
          {displayMessages.length === 0 && !isAILoading ? (
            <div className="flex-1 flex flex-col items-center justify-center h-[50vh] text-center gap-6 pt-24">
              <AIAvatar className="w-12 h-12 opacity-100" />
              <p className="text-[26px] font-normal text-[var(--bone-100)] leading-tight tracking-tight font-display">
                How can I help you today?
              </p>
              <div className="flex flex-wrap gap-2 justify-center max-w-md mx-auto">
                {SUGGESTED_PROMPTS.map(prompt => (
                  <button
                    key={prompt}
                    onClick={() => setAssistantInput(prompt)}
                    className="px-4 py-2 rounded-full bg-white/5 border border-[var(--bone-12)] text-[13px] text-bone-70 hover:bg-white/10 hover:text-bone-100 transition-all active:scale-[0.98] whitespace-nowrap"

                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {displayMessages.map((msg, idx) => (
                <div key={msg.id || `msg-${idx}`} className="w-full">
                  <ChatMessage
                    msg={msg}
                    isAILoading={idx === displayMessages.length - 1 ? isAILoading : false}
                    isLast={idx === displayMessages.length - 1}
                    scrollToBottom={scrollToBottom}
                    handleAddImageToWorkspace={handleAddImageToWorkspace}
                    onRegenerate={() => {
                      const lastUser = [...displayMessages.slice(0, idx + 1)].reverse().find(m => m.role === 'user');
                      if (lastUser) sendAIMessage(lastUser.content ?? '', lastUser.attachments);
                    }}
                    onReply={setReplyMessage}
                  />
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
