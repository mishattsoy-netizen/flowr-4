"use client";

import { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';

export const StatusTyping = ({ text, className, style }: { text: string; className?: string; style?: React.CSSProperties }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setDisplayedText('');
    setIsTyping(true);
    
    let currentIdx = 0;
    intervalRef.current = setInterval(() => {
      if (currentIdx < text.length) {
        setDisplayedText(text.substring(0, currentIdx + 1));
        currentIdx++;
      } else {
        setIsTyping(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }, 40); // Faster typing for better feel

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text]);

  return (
    <span 
      className={clsx(
        "inline-flex items-center transition-all duration-500",
        isTyping 
          ? "bg-white/5 px-2.5 py-0.5 rounded-[8px] border border-white/5 animate-pulse" 
          : "bg-transparent px-0 py-0 border-transparent",
        className
      )} 
      style={style}
    >
      <span className="inline-block overflow-hidden whitespace-nowrap">
        {displayedText}
      </span>
    </span>
  );
};


