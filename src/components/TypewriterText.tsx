import React, { useState, useEffect, useRef, memo } from 'react';

interface TypewriterTextProps {
  text: string;
  speed?: number; // ms per char
  delay?: number;
  className?: string;
  showCursor?: boolean;
  onComplete?: () => void;
  playSound?: boolean;
}

const TypewriterTextComponent: React.FC<TypewriterTextProps> = ({
  text,
  speed = 40,
  delay = 0,
  className = '',
  showCursor = true,
  onComplete
}) => {
  const [displayedLength, setDisplayedLength] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    setDisplayedLength(0);
    setIsTyping(false);

    let charIndex = 0;
    let timer: NodeJS.Timeout | null = null;
    
    const startTimer = setTimeout(() => {
      setIsTyping(true);
      timer = setInterval(() => {
        charIndex += 1;
        setDisplayedLength(charIndex);
        if (charIndex >= text.length) {
          if (timer) clearInterval(timer);
          setIsTyping(false);
          onCompleteRef.current?.();
        }
      }, speed);
    }, delay);

    return () => {
      clearTimeout(startTimer);
      if (timer) clearInterval(timer);
    };
  }, [text, speed, delay]);

  const displayedText = text.slice(0, displayedLength);

  return (
    <span className={className}>
      {displayedText}
      {showCursor && isTyping && (
        <span className="inline-block w-2 bg-[#00ff41] animate-pulse ml-0.5">_</span>
      )}
    </span>
  );
};

export const TypewriterText = memo(TypewriterTextComponent, (prev, next) => {
  return (
    prev.text === next.text &&
    prev.speed === next.speed &&
    prev.delay === next.delay &&
    prev.className === next.className &&
    prev.showCursor === next.showCursor
  );
});

export interface TypewriterLineItem {
  id?: string | number;
  key?: string | number;
  prefix?: React.ReactNode;
  text: string;
  suffix?: React.ReactNode;
  className?: string;
}

interface MultiLineTypewriterProps {
  lines: TypewriterLineItem[];
  startLineIndex?: number; // Which line starts typing; lines before are shown immediately
  speed?: number; // ms per char
  chunkSize?: number; // chars per tick
  lineDelay?: number; // pause between lines in ms (0 for continuous)
  showCursor?: boolean;
  playSound?: boolean;
  onComplete?: () => void;
}

const MultiLineTypewriterComponent: React.FC<MultiLineTypewriterProps> = ({
  lines,
  startLineIndex = 0,
  speed = 36,
  chunkSize = 1,
  lineDelay = 0,
  showCursor = true,
  onComplete,
}) => {
  const safeStartIndex = Math.max(0, Math.min(startLineIndex, Math.max(0, lines.length - 1)));
  const [currentLineIndex, setCurrentLineIndex] = useState(safeStartIndex);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Stable signature to prevent re-animating on parent re-renders when user types in the terminal input
  const linesSignature = `${startLineIndex}::` + lines.map((l, i) => `${l.id ?? i}:${l.text}`).join('||');
  const linesRef = useRef(lines);
  linesRef.current = lines;

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const startIndex = Math.max(0, Math.min(startLineIndex, linesRef.current.length - 1));
    setCurrentLineIndex(startIndex);
    setCurrentCharIndex(0);
    setIsFinished(false);

    const currentLines = linesRef.current;
    if (currentLines.length === 0) {
      setIsFinished(true);
      onCompleteRef.current?.();
      return;
    }

    let lineIdx = startIndex;
    let charIdx = 0;
    let interval: NodeJS.Timeout | null = null;
    let pauseTimeout: NodeJS.Timeout | null = null;

    const startTypingNextLine = () => {
      const activeLines = linesRef.current;
      if (lineIdx >= activeLines.length) {
        setIsFinished(true);
        onCompleteRef.current?.();
        return;
      }

      const targetText = activeLines[lineIdx].text;
      
      interval = setInterval(() => {
        if (charIdx < targetText.length) {
          charIdx = Math.min(targetText.length, charIdx + chunkSize);
          setCurrentCharIndex(charIdx);
        } else {
          // Finished current line
          if (interval) clearInterval(interval);
          interval = null;
          
          lineIdx += 1;
          charIdx = 0;
          
          if (lineIdx >= linesRef.current.length) {
            setIsFinished(true);
            onCompleteRef.current?.();
          } else {
            setCurrentLineIndex(lineIdx);
            setCurrentCharIndex(0);
            if (lineDelay > 0) {
              pauseTimeout = setTimeout(() => {
                startTypingNextLine();
              }, lineDelay);
            } else {
              // Continuous without pause
              startTypingNextLine();
            }
          }
        }
      }, speed);
    };

    startTypingNextLine();

    return () => {
      if (interval) clearInterval(interval);
      if (pauseTimeout) clearTimeout(pauseTimeout);
    };
  }, [linesSignature, startLineIndex, speed, chunkSize, lineDelay]);

  return (
    <div className="space-y-1.5 select-text font-mono">
      {lines.map((line, idx) => {
        if (idx > currentLineIndex) return null;

        const isCurrent = idx === currentLineIndex && !isFinished;
        const visibleText = isCurrent 
          ? line.text.slice(0, currentCharIndex)
          : line.text;

        return (
          <div 
            key={line.key ?? line.id ?? idx} 
            id={line.id ? String(line.id) : undefined}
            className={line.className || ''}
          >
            {line.prefix}
            <span>{visibleText}</span>
            {showCursor && isCurrent && (
              <span className="inline-block w-2 bg-[#00ff41] animate-pulse ml-0.5">_</span>
            )}
            {(!isCurrent || visibleText === line.text) && line.suffix}
          </div>
        );
      })}
    </div>
  );
};

export const MultiLineTypewriter = memo(MultiLineTypewriterComponent, (prev, next) => {
  if (prev.lines.length !== next.lines.length) return false;
  if (prev.startLineIndex !== next.startLineIndex) return false;
  if (prev.speed !== next.speed) return false;
  if (prev.chunkSize !== next.chunkSize) return false;
  if (prev.lineDelay !== next.lineDelay) return false;
  if (prev.showCursor !== next.showCursor) return false;

  for (let i = 0; i < prev.lines.length; i++) {
    if (
      prev.lines[i].id !== next.lines[i].id || 
      prev.lines[i].key !== next.lines[i].key ||
      prev.lines[i].text !== next.lines[i].text ||
      prev.lines[i].className !== next.lines[i].className
    ) {
      return false;
    }
  }

  return true;
});
