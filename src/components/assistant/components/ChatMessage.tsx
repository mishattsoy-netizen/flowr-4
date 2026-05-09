"use client";

import { memo, useState, useRef, useEffect, useMemo } from 'react';
import { Copy, ThumbsUp, ThumbsDown, RotateCcw, Paperclip, CornerUpLeft, ChevronDown, ChevronUp, Brain, CheckCircle2, XCircle, Clock, Sparkles, FileText, ClipboardCopy } from 'lucide-react';
import { useStore, markdownToBlocks } from '@/data/store';
import type { AIMessage, AIAttachment } from '@/data/store';
"use client";

import { memo, useState, useRef, useEffect, useMemo } from 'react';
import { Copy, ThumbsUp, ThumbsDown, RotateCcw, Paperclip, CornerUpLeft, ChevronDown, ChevronUp, Brain, CheckCircle2, XCircle, Clock, Sparkles, FileText, ClipboardCopy } from 'lucide-react';
import { useStore, markdownToBlocks } from '@/data/store';
import type { AIMessage, AIAttachment } from '@/data/store';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Tooltip } from '../../layout/Tooltip';
import { AIAvatar } from './AIAvatar';
import { StatusTyping } from './StatusTyping';
import { ChatImage } from './ChatImage';
import { ChatAudioPlayer } from './ChatAudioPlayer';
import clsx from 'clsx';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { parseMarkdownToBlocks } from '@/lib/utils/markdownToBlocks';

// Pre-compiled regexes
const THINK_TAG_FULL = /<think>[\s\S]*?<\/think>/g;
const THINK_TAG_PARTIAL = /<think>[\s\S]*$/;
const ALL_TOOLS_FULL_REGEX = /(?:!function_call:)?(add_note|add_folder|add_canvas|update_note_content|append_note_content|generate_image|web_search|delete_entity|rename_entity|add_task|delete_task|complete_task|update_task|move_entity|navigate_to|read_note|sort_entities)\s*\{[\s\S]*?\}/g;
const ALL_TOOLS_REGEX = /(add_note|add_folder|add_canvas|update_note_content|append_note_content|generate_image|web_search|delete_entity|rename_entity|add_task|delete_task|complete_task|update_task|move_entity|navigate_to|read_note|sort_entities)\s*\{[\s\S]*$/;

export const sanitizeContent = (content: string, isAILoading: boolean, isLastMessage: boolean) => {
  if (!content) return "";
  let text = content;

  text = text.replace(THINK_TAG_FULL, '');
  if (isAILoading && isLastMessage) {
    text = text.replace(THINK_TAG_PARTIAL, '');
  }

  text = text.replace(ALL_TOOLS_FULL_REGEX, "");

  // Filter out internal reasoning patterns (e.g., *Neutrality:*, *Final version plan:*)
  const reasoningPatterns = [
    /\*Neutrality:\*.*?\n/gi,
    /\*Accuracy:\*.*?\n/gi,
    /\*Factual accuracy:\*.*?\n/gi,
    /\*Completeness:\*.*?\n/gi,
    /\*Directness:\*.*?\n/gi,
    /\*Option [A-Z0-9] \(.*?\):\*.*?\n/gi,
    /\*Final version plan:\*.*?\n/gi,
    /\*Self-Correction.*?:\*.*?\n/gi,
    /\*Refined Final Version:\*.*?\n/gi,
    /\*Perspective \d+:.*?\n/gi,
    /\*Direct Answer:\*.*?\n/gi,
  ];
  reasoningPatterns.forEach(pattern => {
    text = text.replace(pattern, '');
  });

  if (isAILoading && isLastMessage) {
    if (ALL_TOOLS_REGEX.test(text)) {
      text = text.replace(ALL_TOOLS_REGEX, 'Preparing tool...');
    }
  }

  const lowerText = text.toLowerCase();
  const reminderIdx = lowerText.indexOf('(reminder:');
  if (reminderIdx !== -1) {
    const prefix = text.substring(0, reminderIdx);
    const rest = text.substring(reminderIdx);
    const closingIdx = rest.indexOf(')');
    if (closingIdx !== -1) {
      text = prefix + rest.substring(closingIdx + 1);
    } else {
      text = prefix;
    }
  }

  text = text.replace(/```json[\s\S]*?\{[\s\S]*?"(tool_code|action|method)"[\s\S]*?\}[\s\S]*?```/g, '');
  text = text.replace(/\{[\s\n\r]*"(tool_code|action|method)"[\s\S]*?\}/g, '');
  text = text.replace(/(?<!!)(add_note|add_folder|add_canvas|add_task|update_note_content|append_note_content|generate_image)\s*\([\s\S]*?\);?/g, '');

  text = text.trim();

  if (text.startsWith('!function_call:') && text.endsWith('}')) return "";
  if (text === '}' || text === '{' || text === '!function_call:') return "";

  return text;
};

const ApplyNoteCard = ({ content }: { content: string }) => {
  const activeEntityId = useStore(state => state.activeEntityId);
  const updateEntityContent = useStore(state => state.updateEntityContent);
  const [applied, setApplied] = useState(false);

  const handleApply = () => {
    if (!activeEntityId) return;
    const blocks = markdownToBlocks(content);
    updateEntityContent(activeEntityId, blocks);
    setApplied(true);
    setTimeout(() => setApplied(false), 3000);
  };

  return (
    <div className="my-4 p-4 rounded-[17px] bg-emerald-500/5 border border-emerald-500/20 shadow-[0_4px_24px_rgba(16,185,129,0.05)] relative overflow-hidden backdrop-blur-xl group">
      <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-emerald-500/10 rounded-full blur-[60px] pointer-events-none transition-opacity group-hover:opacity-100" />
      <div className="flex flex-col gap-3 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-400/80">Proposed Note Improvement</p>
          </div>
          <button
            onClick={handleApply}
            className={clsx(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-bold uppercase tracking-[0]r transition-all duration-300",
              applied 
                ? "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] scale-[1.02]" 
                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white active:scale-[0.98]"
            )}
          >
            {applied ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Applied Successfully</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>Apply Changes</span>
              </>
            )}
          </button>
        </div>
        <div className="max-h-[140px] overflow-y-auto bg-black/20 p-3 rounded-[12px] text-[12.5px] font-medium leading-[133%] text-bone-60 font-sans border border-white/5 custom-scrollbar">
          <pre className="whitespace-pre-wrap font-sans text-bone-80 leading-[133%] font-medium">{content}</pre>
        </div>
      </div>
    </div>
  );
};

const ApplyCanvasCard = ({ content }: { content: string }) => {
  const blocks = useStore(state => state.blocks);
  const addCanvasBlock = useStore(state => state.addCanvasBlock);
  const updateCanvasBlock = useStore(state => state.updateCanvasBlock);
  const activeEntityId = useStore(state => state.activeEntityId);
  const [applied, setApplied] = useState(false);

  const handleApply = () => {
    try {
      const items = JSON.parse(content);
      if (Array.isArray(items)) {
        items.forEach((item: any) => {
          if (item.id) {
            const exists = blocks.some(b => b.id === item.id);
            if (exists) {
              updateCanvasBlock(item.id, item);
            } else {
              addCanvasBlock({
                id: item.id,
                type: item.type || 'shape',
                shapeKind: item.shapeKind || (item.type === 'connection' ? undefined : 'rect'),
                content: item.content || '',
                x: typeof item.x === 'number' ? item.x : 100,
                y: typeof item.y === 'number' ? item.y : 100,
                width: typeof item.width === 'number' ? item.width : (item.type === 'connection' ? 0 : 180),
                height: typeof item.height === 'number' ? item.height : (item.type === 'connection' ? 0 : 60),
                canvasId: activeEntityId || undefined,
                canvasStyleExt: item.canvasStyleExt || {
                  stroke: '#d38f36',
                  strokeWidth: 1.5,
                  strokeStyle: 'solid',
                  fill: '#d38f36',
                  fillOpacity: 0.1,
                },
                ...item
              });
            }
          }
        });
        setApplied(true);
        setTimeout(() => setApplied(false), 3000);
      }
    } catch (e) {
      console.error("Failed to parse apply-canvas JSON", e);
    }
  };

  return (
    <div className="my-4 p-4 rounded-[17px] bg-accent/5 border border-accent/20 shadow-[0_4px_24px_rgba(var(--accent-rgb),0.05)] relative overflow-hidden backdrop-blur-xl group">
      <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-accent/10 rounded-full blur-[60px] pointer-events-none transition-opacity group-hover:opacity-100" />
      <div className="flex flex-col gap-3 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent/80">Proposed Canvas Update</p>
          </div>
          <button
            onClick={handleApply}
            className={clsx(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-bold uppercase tracking-[0]r transition-all duration-300",
              applied 
                ? "bg-accent text-white shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)] scale-[1.02]" 
                : "bg-accent/10 text-accent border border-accent/20 hover:bg-accent hover:text-white active:scale-[0.98]"
            )}
          >
            {applied ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Applied Successfully</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>Apply Changes</span>
              </>
            )}
          </button>
        </div>
        <div className="max-h-[140px] overflow-y-auto bg-black/20 p-3 rounded-[12px] text-[12.5px] font-mono leading-[133%] text-bone-60 border border-white/5 custom-scrollbar">
          <pre className="whitespace-pre-wrap leading-[133%] font-medium">{content}</pre>
        </div>
      </div>
    </div>
  );
};

export const ChatMessage = memo(({
  msg,
  isAILoading,
  isLast,
  scrollToBottom,
  handleAddImageToWorkspace,
  onRegenerate,
  onReply
}: {
  msg: AIMessage;
  isAILoading: boolean;
  isLast: boolean;
  scrollToBottom: (behavior?: ScrollBehavior) => void;
  handleAddImageToWorkspace: (url: string) => void;
  onRegenerate?: () => void;
  onReply: (msg: AIMessage) => void;
}) => {
  const openModal = useStore(state => state.openModal);
  const thinkingEnabled = useStore(state => state.thinkingEnabled);

  const activeEntityId = useStore(state => state.activeEntityId);
  const createEntity = useStore(state => state.createEntity);
  const getEntityById = useStore(state => state.getEntityById);
  const updateEntityContent = useStore(state => state.updateEntityContent);

  const hasRichFormatting = msg.role === 'assistant' && (
    msg.content.includes('\n### ') || 
    msg.content.includes('\n---') || 
    msg.content.includes('|---|')
  );

  const activeNote = activeEntityId ? getEntityById(activeEntityId) : null;
  const isNoteActive = activeNote?.type === 'note' || activeNote?.type === 'mixed';

  const handleCopyToNote = (asNew: boolean = false) => {
    const blocks = parseMarkdownToBlocks(msg.content);
    if (isNoteActive && !asNew) {
      const newBlocks = [...(activeNote.blocks || []), ...blocks];
      updateEntityContent(activeNote.id, newBlocks);
    } else {
      const titleBlock = blocks.find(b => b.style === 'title' || b.style === 'heading' || b.style === 'subheading');
      const title = titleBlock ? titleBlock.content : 'AI Note - ' + new Date().toLocaleDateString();
      createEntity('note', { title, blocks });
    }
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(msg.content);
  };

  const targetContent = useMemo(() => {
    let content = sanitizeContent(msg.content || '', isAILoading, isLast)
    if (msg.citations && msg.citations.length > 0) {
      msg.citations.forEach((url, i) => {
        const num = i + 1;
        const regex = new RegExp(`\\[${num}\\](?![\\(\\[])`, 'g');
        content = content.replace(regex, `[${num}](${url})`);
      });
    }
    return content;
  }, [msg.content, isAILoading, isLast, msg.citations]);

  const isImageContent = targetContent.startsWith('![');
  const isInitiallyFinished = isImageContent || !isLast || (!isAILoading && targetContent.length > 0);
  const [displayContent, setDisplayContent] = useState(isInitiallyFinished ? targetContent : '');
  const [hasFinishedTyping, setHasFinishedTyping] = useState(isInitiallyFinished);
  const [feedbackState, setFeedbackState] = useState<'like' | 'dislike' | null>(null);
  const [isStepsExpanded, setIsStepsExpanded] = useState(false);

  const thoughtContent = useMemo(() => {
    if (msg.thought) return msg.thought.trim();
    const content = msg.content || '';
    const match = content.match(/<think>([\s\S]*?)(?:<\/think>|$)/);
    return match ? match[1].trim() : '';
  }, [msg.thought, msg.content]);

  const hasThinking = thinkingEnabled && (!!thoughtContent || (!!msg.pipelineSteps && msg.pipelineSteps.length > 0));

  const soundPlayedRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const displayedLenRef = useRef(isInitiallyFinished ? targetContent.length : 0);
  const lastTimeRef = useRef(0);

  const [elapsed, setElapsed] = useState(0)
  const [completionTime, setCompletionTime] = useState<number | null>(null)
  const timerStartRef = useRef<number | null>(null);

  useEffect(() => {
    if (msg.role === 'assistant') {
      if (isAILoading && isLast) {
        if (!timerStartRef.current) {
          timerStartRef.current = Date.now();
        }
        const timer = setInterval(() => {
          if (timerStartRef.current) {
            setElapsed(Date.now() - timerStartRef.current);
          }
        }, 10);
        return () => clearInterval(timer);
      } else if (!isAILoading && elapsed > 0 && !completionTime) {
        setCompletionTime(elapsed);
        timerStartRef.current = null;
        if (msg.logId) {
          fetch('/api/ai/log-duration', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ logId: msg.logId, durationMs: elapsed })
          }).catch(() => { });
        }
      }
    }
  }, [msg.role, isLast, isAILoading, completionTime, msg.logId]);

  useEffect(() => {
    if (msg.role === 'user' || hasFinishedTyping || isImageContent) {
      setDisplayContent(targetContent);
      displayedLenRef.current = targetContent.length;
      return;
    }

    if (targetContent.length - displayedLenRef.current > 2000) {
      setDisplayContent(targetContent);
      displayedLenRef.current = targetContent.length;
      return;
    }

    const MIN_MS = 45;
    const BASE_MS = 80;
    const MAX_LAG = 300;

    const step = (now: number) => {
      const target = targetContent;
      const current = displayedLenRef.current;
      const remaining = target.length - current;

      if (remaining <= 0) {
        if (!isAILoading) {
          setHasFinishedTyping(true);
          if (!soundPlayedRef.current && msg.role === 'assistant') {
            const audio = new Audio('/notification-sound.mp3');
            audio.volume = 0.35;
            audio.play().catch(() => { });
            soundPlayedRef.current = true;
          }
        }
        lastTimeRef.current = 0;
        return;
      }

      let wordsToAdd = 1;
      let currentInterval = BASE_MS + (Math.random() * 20 - 10);

      if (remaining > MAX_LAG) {
        wordsToAdd = 2;
        currentInterval = MIN_MS;
      } else if (remaining > 60) {
        wordsToAdd = 1;
        currentInterval = BASE_MS * 0.8;
      }

      const elapsed = lastTimeRef.current ? (now - lastTimeRef.current) : 1000;
      if (elapsed < currentInterval) {
        rafRef.current = requestAnimationFrame(step);
        return;
      }
      lastTimeRef.current = now;

      let next = current;
      for (let i = 0; i < wordsToAdd; i++) {
        const remainingText = target.substring(next + 1);
        const nextSpace = remainingText.search(/\s/);
        if (nextSpace === -1) {
          next = target.length;
          break;
        }
        next = next + 1 + nextSpace;
      }

      displayedLenRef.current = next;
      setDisplayContent(target.substring(0, next));
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [targetContent, msg.role, isAILoading, hasFinishedTyping, isImageContent]);

  useEffect(() => {
    let unchangedTimeout: NodeJS.Timeout | null = null;
    if (targetContent.length === displayedLenRef.current && isAILoading) {
      unchangedTimeout = setTimeout(() => {
        setHasFinishedTyping(true);
      }, 1500);
    }
    return () => { if (unchangedTimeout) clearTimeout(unchangedTimeout); };
  }, [targetContent, displayContent, isAILoading]);

  const markdownComponents = useMemo(() => {
    const isAtEnd = (node: any) => {
      if (!node?.position?.end?.offset) return false;
      return node.position.end.offset >= displayContent.length;
    };

    return {
      p: ({ node, children }: any) => {
        const isStatus = typeof children === 'string' && (children.includes('Preparing tool') || children.includes('Thinking'));
        const atEnd = isAILoading && !hasFinishedTyping && !isStatus && isAtEnd(node) && !!children;
        const isEmpty = !children || (Array.isArray(children) && children.length === 0) || (typeof children === 'string' && !children.trim());

        return <div className={clsx(isStatus ? "mb-0" : "mb-2 last:mb-0 break-words !max-w-full !w-full", isStatus && "font-sans font-medium opacity-30 text-[14px] tracking-[0] flex items-center")} style={{ fontFamily: '"Crimson Text"', fontWeight: 500, fontSize: '17px' }}>
          {isStatus ? <StatusTyping text={children} /> : <span style={{ fontFamily: '"Crimson Text"', fontWeight: 500, fontSize: '17px' }}>{children}</span>}
          {(atEnd && !isEmpty) && <span className="ai-cursor-inline">█</span>}
        </div>;
      },
      a: ({ href, children }: any) => {
        const isUrlOnly = typeof children === 'string' && (children.startsWith('http://') || children.startsWith('https://'));
        const isCitation = typeof children === 'string' && /^\[\d+\]$/.test(children);

        if (isCitation) {
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-3.5 h-3.5 -mt-2.5 ml-0.5 bg-accent/10 hover:bg-accent/20 rounded-full text-[8.5px] font-bold text-accent no-underline align-super transition-all duration-200 select-none"
            >
              {children.replace(/[\[\]]/g, '')}
            </a>
          );
        }

        const label = isUrlOnly ? new URL(href).hostname.replace('www.', '') : children;
        let faviconUrl = '';
        try {
          if (href && href.startsWith('http')) {
            const urlObj = new URL(href);
            faviconUrl = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`;
          }
        } catch { }

        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 mt-1 mr-1.5 bg-white/5 hover:bg-white/10 rounded-full text-[11px] font-medium text-[var(--bone-30)] hover:text-accent no-underline transition-all duration-200 select-none"
          >
            {faviconUrl && (
              <span className="w-3.5 h-3.5 flex items-center justify-center shrink-0 overflow-hidden bg-white/10 rounded-[4px]">
                <img src={faviconUrl} alt="" className="w-3 h-3 object-contain select-none opacity-80" />
              </span>
            )}
            <span className="max-w-[120px] truncate leading-none font-medium">{label}</span>
          </a>
        );
      },
      strong: ({ node, children }: any) => {
        const atEnd = !hasFinishedTyping && isAtEnd(node);
        return <strong className="font-bold" style={{ fontFamily: '"Crimson Text"', fontWeight: 500 }}>{children}{atEnd && <span className="ai-cursor-inline">█</span>}</strong>;
      },
      ul: ({ children }: any) => <ul className="list-none space-y-2 mb-4 last:mb-0 pl-1">{children}</ul>,
      li: ({ node, children }: any) => {
        const atEnd = !hasFinishedTyping && isAtEnd(node);
        return (
          <li className="flex items-start gap-2.5">
            <span className="text-accent select-none shrink-0 mt-[0.45em] flex items-center justify-center leading-none" aria-hidden="true">•</span>
            <div className="flex-1 min-w-0 leading-[133%] font-medium tracking-[0] break-words !max-w-full !w-full" style={{ fontFamily: '"Crimson Text"', fontWeight: 500, fontSize: '17px' }}>
              {children}
              {atEnd && <span className="ai-cursor-inline">█</span>}
            </div>
          </li>
        );
      },
      code: ({ node, inline, className, children, ...props }: any) => {
        const matchNote = /language-apply-note/.exec(className || '');
        const matchCanvas = /language-apply-canvas/.exec(className || '');
        
        if (!inline && matchNote) {
          return (
            <ApplyNoteCard content={String(children).replace(/\n$/, '')} />
          );
        }
        if (!inline && matchCanvas) {
          return (
            <ApplyCanvasCard content={String(children).replace(/\n$/, '')} />
          );
        }

        const atEnd = !hasFinishedTyping && isAtEnd(node);
        return <code className="bg-white/10 rounded px-1.5 py-0.5 text-[12px] font-mono tracking-[0] font-medium" style={{ fontFamily: '"Crimson Text"', fontWeight: 500 }} {...props}>{children}{atEnd && <span className="ai-cursor-inline">█</span>}</code>;
      },
      hr: () => <hr className="border-inner my-4" />,
      img: ({ src, alt }: any) => src ? <ChatImage src={src} alt={alt || ''} onHeightChange={scrollToBottom} onAddToWorkspace={() => handleAddImageToWorkspace(src)} /> : null,
      table: ({ children }: any) => (
        <div className="overflow-x-auto my-3">
          <table className="w-full text-[12px] border-collapse">{children}</table>
        </div>
      ),
      thead: ({ children }: any) => <thead className="border-b border-white/10">{children}</thead>,
      tbody: ({ children }: any) => <tbody className="divide-y divide-white/[0.05]">{children}</tbody>,
      tr: ({ children }: any) => <tr className="hover:bg-white/[0.02] transition-colors">{children}</tr>,
      th: ({ children }: any) => <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-[0]st text-bone-60 opacity-50">{children}</th>,
      td: ({ children }: any) => <td className="px-3 py-2 text-[12px] text-bone-60 opacity-70 font-mono">{children}</td>,
    };
  }, [scrollToBottom, handleAddImageToWorkspace, hasFinishedTyping, displayContent.length]);

  const isStatusOnly = useMemo(() =>
    msg.role === 'assistant' && isLast && isAILoading && (!displayContent || displayContent === 'Preparing tool...')
    , [msg.role, isLast, isAILoading, displayContent]);

  async function submitFeedback(value: 'like' | 'dislike') {
    if (feedbackState === value) return
    setFeedbackState(value)
    const logId = msg.logId || (msg as any).log_id;
    if (!logId) return
    try {
      const { supabase } = await import('@/lib/supabase')
      const { data: { session } } = await supabase.auth.getSession()
      const authUserId = session?.user?.id || '00000000-0000-0000-0000-000000000000'

      const currentMessages = useStore.getState().aiMessages || [];
      const msgIndex = currentMessages.findIndex(m => m.id === msg.id);
      const priorMessages = msgIndex !== -1 ? currentMessages.slice(0, msgIndex) : currentMessages;
      const priorHistory = priorMessages.map(m => ({
        role: m.role,
        content: m.content
      })).slice(-10);

      await fetch('/api/ai/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message_log_id: logId,
          auth_user_id: authUserId,
          feedback: value,
          context_messages: {
            classify: (msg as any).classification_trace,
            routing: (msg as any).routing_trace,
            history: priorHistory
          }
        })
      })
    } catch { setFeedbackState(null) }
  }

  const isError = msg.role === 'assistant' && (msg.content || '').startsWith('Error:');

  if (msg.role === 'assistant' && !displayContent && !(isAILoading && isLast)) return null;

  if (isError) {
    const errorText = (msg.content || '').replace(/^Error:\s*/, '');
    return (
      <div className="flex flex-col gap-2 mb-2 items-start">
        <div className="flex gap-3 w-full items-start">
          {isLast && (
            <div className="w-8 h-8 shrink-0 flex items-center justify-center mt-1">
              <AIAvatar className="bg-red-400" />
            </div>
          )}
          <div
            className="max-w-[90%] px-5 py-3 text-[13.5px] leading-[133%] rounded-2xl bg-red-500/5 shadow-lg shadow-red-500/5 tracking-[0] break-words"
            style={{ background: 'color-mix(in srgb, var(--color-background) 92%, rgb(239 68 68) 8%)' }}
          >
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-red-400/60 mb-2">System Alert</p>
            <p className="text-foreground/90 font-medium tracking-[0]">{errorText}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx(
      "flex flex-col group",
      msg.role === 'user' ? "items-end mb-4" : "items-start mb-0"
    )}>
      <div className={clsx(
        "flex gap-3 w-full items-start",
        msg.role === 'user' ? "flex-row-reverse" : "flex-row"
      )}>
        <div className={clsx(
          "flex flex-col min-w-0",
          msg.role === 'user' ? "items-end max-w-[90%]" : "items-start max-w-[97%] flex-1"
        )}>
          {msg.role === 'assistant' && isLast && !displayContent ? (
            <div className="flex items-center gap-2.5 h-5 select-none -ml-1 mb-1">
              <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                <AIAvatar isTyping={true} className="w-3.5 h-3.5" />
              </div>
              <div className="flex items-center gap-2">
                <StatusTyping
                  text={(() => {
                    if (msg.pipelineSteps && msg.pipelineSteps.length > 0) {
                      const activeStep = msg.pipelineSteps.find(s => s.status === 'running') || msg.pipelineSteps[msg.pipelineSteps.length - 1];
                      if (activeStep) return activeStep.goal.toLowerCase();
                    }
                    return "thinking";
                  })()}
                  className="font-medium text-[var(--bone-100)]"
                  style={{ fontFamily: '"Crimson Text"', fontWeight: 500, fontSize: '17px' }}
                />
                {elapsed > 0 && (
                  <span className="text-[12px] font-medium text-[var(--bone-30)] font-mono opacity-80 select-none mt-0.5">
                    {((elapsed / 1000).toFixed(1))}s
                  </span>
                )}
              </div>
            </div>
          ) : (
            <>
              {msg.role === 'assistant' && isLast && (
            <div className="w-5 h-5 shrink-0 flex items-center justify-center select-none mb-1 -ml-1">
              <AIAvatar isTyping={!hasFinishedTyping && msg.role === 'assistant'} className="w-3.5 h-3.5" />
            </div>
          )}
              {!displayContent && msg.role === 'assistant' ? null : (
            msg.role === 'user' ? (
              <div className="flex items-center gap-2 justify-end w-full">
                <Tooltip content="Reply">
                  <button
                    onClick={() => onReply(msg)}
                    className="p-1 rounded-md hover:bg-[var(--bone-6)] text-[var(--bone-30)] hover:text-foreground transition-all duration-200 opacity-0 group-hover:opacity-100 shrink-0"
                  >
                    <CornerUpLeft strokeWidth={2} className="w-3.5 h-3.5" />
                  </button>
                </Tooltip>
                <div
                  className="leading-[133%] font-medium text-[17px] px-4 py-2.5 w-fit max-w-full overflow-hidden"
                  style={{ background: 'var(--bone-6)', borderRadius: '17px 17px 4px 17px', fontFamily: 'DM Sans', fontWeight: 500, fontSize: '14.5px' }}
                >
                  <div className="flex flex-col gap-3">
                    <div className="whitespace-pre-wrap break-all font-medium" style={{ fontFamily: 'DM Sans', fontWeight: 500, fontSize: '14.5px' }}>{targetContent}</div>
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {msg.attachments.map((att: AIAttachment, i: number) => (
                          <div
                            key={`${msg.id}-att-${i}`}
                            className="rounded-[var(--radius-small)] overflow-hidden bg-[var(--black-overlay)] group relative cursor-pointer transition-colors"
                            onClick={() => {
                              if (att.type === 'image') {
                                openModal({ kind: 'mediaViewer', url: att.url, mediaType: 'image' });
                              } else {
                                window.open(att.url, '_blank');
                              }
                            }}
                          >
                            {att.type === 'image' ? (
                              <img src={att.url} alt={att.name} className="max-w-[200px] max-h-[150px] object-cover group-hover:opacity-90" />
                            ) : att.type === 'audio' ? (
                              <ChatAudioPlayer url={att.url} name={att.name} />
                            ) : (
                              <div className="px-3 py-2 text-[10px] flex items-center gap-2 group-hover:text-accent font-medium">
                                <Paperclip strokeWidth={2} className="w-3 h-3 text-accent" />
                                <span className="max-w-[120px] truncate">{att.name}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full">
                {hasThinking && (
                  <div className="mb-3 w-full">
                    <button
                      onClick={() => setIsStepsExpanded(!isStepsExpanded)}
                      className="flex items-center gap-1.5 py-1 px-2 -ml-2 rounded-lg hover:bg-white/5 text-[13px] font-sans font-medium text-bone-60 hover:text-foreground transition-all duration-200 cursor-pointer select-none"
                    >
                      <Brain className={clsx("w-3.5 h-3.5 text-accent/80", isAILoading && isLast && "animate-pulse")} />
                      <span className="font-sans text-[13px] font-medium leading-none">
                        {isStepsExpanded ? 'Hide thinking' : 'Show thinking'}
                      </span>
                      {isStepsExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 opacity-60" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                      )}
                    </button>

                    {isStepsExpanded && (
                      <div className="mt-2 pl-3 ml-2 border-l border-white/10 space-y-3 w-full max-w-full overflow-hidden transition-all duration-300">
                        {thoughtContent ? (
                          <div className="text-[13px] leading-[133%] font-sans italic whitespace-pre-wrap" style={{ fontFamily: '"Crimson Text"', fontWeight: 500 }}>
                            {thoughtContent}
                          </div>
                        ) : (
                          msg.pipelineSteps?.map((step, idx) => {
                            const title = step.goal
                              ? step.goal.charAt(0).toUpperCase() + step.goal.slice(1)
                              : step.chain.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

                            return (
                              <div key={idx} className="group/step">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={clsx(
                                    "text-[13px] font-sans font-semibold tracking-[0]",
                                    step.status === 'running' ? "text-accent animate-pulse" : "text-bone-100"
                                  )}>
                                    {title}
                                  </span>
                                  {step.status === 'running' && (
                                    <span className="flex h-1.5 w-1.5 relative">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent"></span>
                                    </span>
                                  )}
                                </div>
                                {step.output && (
<div className="text-[13px] leading-[133%] font-sans italic whitespace-pre-wrap" style={{ fontFamily: '"Crimson Text"', fontWeight: 500 }}>
            )}>
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2 pt-3 border-t border-white/5 w-full">
                  <div className="w-full flex items-center gap-2 mb-1">
                    <Paperclip strokeWidth={2} className="w-3 h-3 text-[var(--bone-40)]" />
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--bone-40)]">Sources</p>
                  </div>
                  {msg.citations.slice(0, 8).map((url, i) => {
                    let domain = '';
                    try { domain = new URL(url).hostname.replace('www.', ''); } catch { }
                    let faviconUrl = '';
                    try { faviconUrl = `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32`; } catch { }

                    return (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-2 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[11px] font-medium text-[var(--bone-60)] hover:text-accent transition-all duration-200 max-w-[160px] truncate"
                      >
                        <span className="w-3.5 h-3.5 flex items-center justify-center bg-white/5 rounded text-[8px] font-bold shrink-0 opacity-40">{i + 1}</span>
                        {faviconUrl && (
                          <img src={faviconUrl} alt="" className="w-3 h-3 object-contain opacity-60" />
                        )}
                        <span className="truncate">{domain || 'Source'}</span>
                      </a>
                    );
                  })}
                </div>
              )}

              <div className="flex items-center gap-1">
                {hasFinishedTyping && (
                  <>
                    <Tooltip content="Copy">
                      <button
                        onClick={() => navigator.clipboard.writeText(displayContent)}
                        className="p-0.5 rounded-md hover:bg-[var(--bone-6)] text-[var(--bone-30)] hover:text-[var(--bone-30)] transition-colors"
                      >
                        <Copy strokeWidth={2} className="w-3 h-3" />
                      </button>
                    </Tooltip>
                    <Tooltip content="Good response">
                      <button
                        onClick={() => submitFeedback('like')}
                        className={clsx("p-0.5 rounded-md hover:bg-[var(--bone-6)] transition-colors", feedbackState === 'like' ? "text-green-400" : "text-[var(--bone-30)] hover:text-[var(--bone-30)]")}
                      >
                        <ThumbsUp strokeWidth={2} className="w-3 h-3" />
                      </button>
                    </Tooltip>
                    <Tooltip content="Bad response">
                      <button
                        onClick={() => submitFeedback('dislike')}
                        className={clsx("p-0.5 rounded-md hover:bg-[var(--bone-6)] transition-colors", feedbackState === 'dislike' ? "text-red-400" : "text-[var(--bone-30)] hover:text-[var(--bone-30)]")}
                      >
                        <ThumbsDown strokeWidth={2} className="w-3 h-3" />
                      </button>
                    </Tooltip>
                    {isLast && onRegenerate && (
                      <Tooltip content="Regenerate">
                        <button
                          onClick={onRegenerate}
                          className="p-0.5 rounded-md hover:bg-[var(--bone-6)] text-[var(--bone-30)] hover:text-[var(--bone-30)] transition-colors"
                        >
                          <RotateCcw strokeWidth={2} className="w-3 h-3" />
                        </button>
                      </Tooltip>
                    )}
                    <Tooltip content="Reply">
                      <button
                        onClick={() => onReply(msg)}
                        className="p-0.5 rounded-md hover:bg-[var(--bone-6)] text-[var(--bone-30)] hover:text-[var(--bone-30)] transition-colors"
                      >
                        <CornerUpLeft strokeWidth={2} className="w-3.5 h-3.5" />
                      </button>
                    </Tooltip>
                  </>
                )}

                {msg.model && (
                  <div className={clsx(
                    "flex items-center px-2 py-0.5 rounded-full bg-[var(--bone-6)] opacity-40 hover:opacity-100 transition-all duration-300",
                    hasFinishedTyping ? "ml-1" : "ml-0"
                  )}>
                    <span className="text-[8px] font-bold uppercase tracking-[0.05em] text-[var(--bone-40)]">
                      {msg.model.split('/').pop()?.replace(/-/g, ' ')}
                      {completionTime ? ` ${(completionTime / 1000).toFixed(1)}s` : ''}
                      {msg.tokens_used ? ` · ${msg.tokens_used} tokens` : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
});
ChatMessage.displayName = 'ChatMessage';
