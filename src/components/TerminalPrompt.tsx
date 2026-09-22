import React, { useState, useRef, useEffect } from 'react';
import { TerminalTheme } from '../types';
import { THEMES } from '../utils/themeStyles';
import { CANONICAL_BOOKS } from '../data/canonicalBooks';
import { Send, CornerDownLeft, Sparkles, HelpCircle, BookOpen, Search, Shuffle, BarChart2 } from 'lucide-react';
import { terminalSounds } from '../services/soundEffects';

interface TerminalPromptProps {
  theme: TerminalTheme;
  onExecute: (command: string) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

const COMMON_COMMANDS = [
  'help',
  'read Буття 1',
  'read Івана 3:16',
  'read Псалми 23',
  'read Матвія 5',
  'read 1co 13',
  'read Римлян 8:28',
  'search любов',
  'search світло',
  'search Бог',
  'books',
  'books ot',
  'books nt',
  'random',
  'stats',
  'theme amber',
  'theme matrix',
  'theme nord',
  'translation parallel',
  'plan',
  'quiz',
  'crt on',
  'crt off',
  'clear',
  'man',
  'neofetch'
];

export const TerminalPrompt: React.FC<TerminalPromptProps> = ({
  theme,
  onExecute,
  inputRef: externalInputRef
}) => {
  const currentTheme = THEMES[theme];
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionIndex, setSuggestionIndex] = useState<number>(0);

  const internalInputRef = useRef<HTMLInputElement>(null);
  const activeInputRef = externalInputRef || internalInputRef;

  // Auto-complete computation
  useEffect(() => {
    if (!inputVal.trim()) {
      setSuggestions([]);
      return;
    }

    const q = inputVal.trim().toLowerCase();
    const matches: string[] = [];

    // Check matching commands
    for (const cmd of COMMON_COMMANDS) {
      if (cmd.toLowerCase().startsWith(q) && cmd.toLowerCase() !== q) {
        matches.push(cmd);
      }
    }

    // Check matching book names for `read <book>` or `goto <book>`
    if (q.startsWith('read ') || q.startsWith('goto ')) {
      const prefix = q.startsWith('read ') ? 'read ' : 'goto ';
      const bookQuery = q.replace(prefix, '');
      if (bookQuery) {
        for (const book of CANONICAL_BOOKS) {
          if (book.nameUkr.toLowerCase().startsWith(bookQuery) || book.aliases.some(a => a.startsWith(bookQuery))) {
            matches.push(`${prefix}${book.nameUkr} 1`);
          }
        }
      }
    }

    setSuggestions(matches.slice(0, 6));
    setSuggestionIndex(0);
  }, [inputVal]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    terminalSounds.playKeyClick();

    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputVal.trim()) {
        const cmd = inputVal.trim();
        setHistory(prev => [cmd, ...prev.filter(c => c !== cmd)].slice(0, 50));
        setHistoryIndex(-1);
        setInputVal('');
        setSuggestions([]);
        terminalSounds.playCommandExec();
        onExecute(cmd);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const nextIdx = Math.min(historyIndex + 1, history.length - 1);
        setHistoryIndex(nextIdx);
        setInputVal(history[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const prevIdx = historyIndex - 1;
        setHistoryIndex(prevIdx);
        setInputVal(history[prevIdx]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputVal('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (suggestions.length > 0) {
        setInputVal(suggestions[suggestionIndex]);
        setSuggestions([]);
      }
    } else if (e.key === 'Escape') {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (sug: string) => {
    terminalSounds.playKeyClick();
    setInputVal(sug);
    setSuggestions([]);
    if (activeInputRef.current) {
      activeInputRef.current.focus();
    }
  };

  const runQuickAction = (cmd: string) => {
    terminalSounds.playKeyClick();
    terminalSounds.playCommandExec();
    onExecute(cmd);
  };

  return (
    <div id="terminal-prompt-container" className={`relative border-t ${currentTheme.border} ${currentTheme.bgSecondary} p-2.5 font-mono text-sm`}>
      {/* Suggestions Autocomplete Dropdown */}
      {suggestions.length > 0 && (
        <div className={`absolute bottom-full left-0 right-0 max-w-xl mx-2 mb-1 p-1.5 rounded border ${currentTheme.borderActive} ${currentTheme.bg} shadow-2xl z-30 flex flex-col space-y-1`}>
          <div className="text-[10px] uppercase tracking-wider px-2 py-0.5 opacity-60 flex items-center justify-between">
            <span>Автодоповнення (Натисніть Tab):</span>
            <span>Esc для скасування</span>
          </div>
          {suggestions.map((sug, i) => (
            <button
              key={sug}
              onClick={() => handleSuggestionClick(sug)}
              className={`text-left px-2.5 py-1 rounded text-xs flex items-center justify-between ${i === suggestionIndex ? `${currentTheme.accentBg} text-white font-bold` : 'hover:bg-white/5 opacity-80'}`}
            >
              <span>{sug}</span>
              <CornerDownLeft className="w-3 h-3 opacity-60" />
            </button>
          ))}
        </div>
      )}

      {/* Main Input Line */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1 select-none font-bold text-xs md:text-sm">
          <span className={currentTheme.promptUser}>bible</span>
          <span className={currentTheme.textMuted}>@</span>
          <span className={currentTheme.promptHost}>cli</span>
          <span className="text-cyan-400">:$</span>
        </div>

        <div className="relative flex-1 flex items-center">
          <input
            id="terminal-cli-input"
            ref={activeInputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Введіть команду або розділ (наприклад: read Івана 3:16, search любов, books, help)..."
            aria-label="Введення термінальної команди"
            className={`w-full bg-black/40 border ${currentTheme.border} rounded px-3 py-1.5 text-xs md:text-sm ${currentTheme.textBright} font-mono focus:outline-none focus:border-current transition placeholder:opacity-40`}
            autoComplete="off"
            spellCheck="false"
          />
        </div>

        <button
          id="btn-submit-command"
          onClick={() => {
            if (inputVal.trim()) {
              const cmd = inputVal.trim();
              setHistory(prev => [cmd, ...prev.filter(c => c !== cmd)].slice(0, 50));
              setHistoryIndex(-1);
              setInputVal('');
              terminalSounds.playCommandExec();
              onExecute(cmd);
            }
          }}
          className={`px-3 py-1.5 rounded border ${currentTheme.border} ${currentTheme.accentBg} hover:border-current hover:brightness-125 transition flex items-center space-x-1.5 text-xs font-semibold`}
        >
          <span className="hidden sm:inline">Виконати</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Quick Action Chips */}
      <div className="flex flex-wrap items-center gap-1.5 mt-2 pt-1 text-[11px] select-none border-t border-current/10">
        <span className="opacity-50 text-[10px] uppercase font-mono mr-1">Швидкі команди:</span>
        <button
          onClick={() => runQuickAction('help')}
          className="px-2 py-0.5 rounded bg-black/30 border border-current/20 hover:border-current hover:bg-white/10 transition flex items-center space-x-1"
        >
          <HelpCircle className="w-3 h-3 opacity-70" />
          <span>help</span>
        </button>
        <button
          onClick={() => runQuickAction('books')}
          className="px-2 py-0.5 rounded bg-black/30 border border-current/20 hover:border-current hover:bg-white/10 transition flex items-center space-x-1"
        >
          <BookOpen className="w-3 h-3 opacity-70" />
          <span>books</span>
        </button>
        <button
          onClick={() => runQuickAction('read Івана 3:16')}
          className="px-2 py-0.5 rounded bg-black/30 border border-current/20 hover:border-current hover:bg-white/10 transition flex items-center space-x-1"
        >
          <span>Івана 3:16</span>
        </button>
        <button
          onClick={() => runQuickAction('read Псалми 23')}
          className="px-2 py-0.5 rounded bg-black/30 border border-current/20 hover:border-current hover:bg-white/10 transition flex items-center space-x-1"
        >
          <span>Пс 23</span>
        </button>
        <button
          onClick={() => runQuickAction('read Буття 1')}
          className="px-2 py-0.5 rounded bg-black/30 border border-current/20 hover:border-current hover:bg-white/10 transition flex items-center space-x-1"
        >
          <span>Бут 1</span>
        </button>
        <button
          onClick={() => runQuickAction('search любов')}
          className="px-2 py-0.5 rounded bg-black/30 border border-current/20 hover:border-current hover:bg-white/10 transition flex items-center space-x-1"
        >
          <Search className="w-3 h-3 opacity-70" />
          <span>search &quot;любов&quot;</span>
        </button>
        <button
          onClick={() => runQuickAction('random')}
          className="px-2 py-0.5 rounded bg-black/30 border border-current/20 hover:border-current hover:bg-white/10 transition flex items-center space-x-1"
        >
          <Shuffle className="w-3 h-3 opacity-70" />
          <span>random</span>
        </button>
        <button
          onClick={() => runQuickAction('stats')}
          className="px-2 py-0.5 rounded bg-black/30 border border-current/20 hover:border-current hover:bg-white/10 transition flex items-center space-x-1"
        >
          <BarChart2 className="w-3 h-3 opacity-70" />
          <span>stats</span>
        </button>
        <button
          onClick={() => runQuickAction('plan')}
          className="px-2 py-0.5 rounded bg-black/30 border border-current/20 hover:border-current hover:bg-white/10 transition flex items-center space-x-1"
        >
          <Sparkles className="w-3 h-3 opacity-70" />
          <span>plan</span>
        </button>
      </div>
    </div>
  );
};
