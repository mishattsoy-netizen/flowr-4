"use client";

import { useRef, useEffect } from 'react';
import clsx from 'clsx';

export const StatusTyping = ({ text, className, style }: { text: string; className?: string; style?: React.CSSProperties }) => {
  const elRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (elRef.current) {
      elRef.current.style.width = 'auto';
      elRef.current.style.opacity = '1';
    }
  }, [text]);

  return (
    <span className={clsx("flex items-center gap-1", className)} style={style}>
      <span className="inline-block overflow-hidden whitespace-nowrap" ref={elRef}>
        {text}
      </span>
      <span className="flex gap-0.5 ml-1">
        <span className="w-1 h-1 rounded-full bg-accent animate-[bounce_1.4s_infinite_0ms]" />
        <span className="w-1 h-1 rounded-full bg-accent animate-[bounce_1.4s_infinite_200ms]" />
        <span className="w-1 h-1 rounded-full bg-accent animate-[bounce_1.4s_infinite_400ms]" />
      </span>
    </span>
  );
};
