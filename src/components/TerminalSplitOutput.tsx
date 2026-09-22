import React, { useRef, useEffect } from 'react';
import { CommandHistoryItem, TerminalTheme, BookInfo } from '../types';
import { THEMES } from '../utils/themeStyles';
import { CornerDownRight, CheckCircle, AlertTriangle, Info, Terminal, BookOpen } from 'lucide-react';
import { terminalSounds } from '../services/soundEffects';

interface TerminalSplitOutputProps {
  history: CommandHistoryItem[];
  theme: TerminalTheme;
  onNavigateToRef: (book: BookInfo, chapter: number, verse?: number) => void;
}

export const TerminalSplitOutput: React.FC<TerminalSplitOutputProps> = ({
  history,
  theme,
  onNavigateToRef
}) => {
  const currentTheme = THEMES[theme];
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [history]);

  return (
    <div 
      ref={containerRef}
      id="terminal-output-stream"
      className="flex-1 overflow-y-auto p-3 space-y-3 font-mono text-xs md:text-sm min-h-0 select-text"
    >
      {/* Welcome Banner if history is empty */}
      {history.length === 0 && (
        <div className="p-3 border border-dashed border-current/20 rounded bg-black/20 space-y-2">
          <div className="flex items-center space-x-2 text-cyan-400 font-bold">
            <Terminal className="w-4 h-4" />
            <span>HOLY SCRIPTURES CLI v2.4 (Ukrainian / English Canon)</span>
          </div>
          <p className="opacity-80 text-xs">
            Ласкаво просимо до консольного термінала Біблії. Використовуйте поле вводу внизу або гарячі клавіші для навігації.
          </p>
          <div className="text-xs opacity-70 font-mono space-y-0.5 pt-1">
            <div>• <code className="text-yellow-300">read Івана 3:16</code> — перейти до вірша</div>
            <div>• <code className="text-yellow-300">search любов</code> — повнотекстовий пошук</div>
            <div>• <code className="text-yellow-300">books</code> — каталог 66 книг Святого Письма</div>
            <div>• <code className="text-yellow-300">help</code> — повна довідка команд</div>
          </div>
        </div>
      )}

      {/* Render Command Stream */}
      {history.map((item) => (
        <div key={item.id} className="space-y-1.5 pb-2 border-b border-current/10">
          {/* User Prompt Line */}
          {item.command && (
            <div className="flex items-center space-x-2 opacity-90 select-none">
              <span className={currentTheme.promptUser}>bible@cli</span>
              <span className="opacity-40">:~$</span>
              <span className="font-bold text-white">{item.command}</span>
              <span className="text-[10px] opacity-40 ml-auto font-mono">{item.timestamp}</span>
            </div>
          )}

          {/* Output Content Based on Type */}
          <div className="pl-3 border-l-2 border-current/20 space-y-2">
            {/* 1. Error */}
            {item.outputType === 'error' && (
              <div className="flex items-start space-x-2 text-red-400 bg-red-950/20 p-2 rounded border border-red-900/50">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="text-xs whitespace-pre-wrap">{item.content}</div>
              </div>
            )}

            {/* 2. Success */}
            {item.outputType === 'success' && (
              <div className="flex items-center space-x-2 text-emerald-400 font-medium">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{item.content}</span>
              </div>
            )}

            {/* 3. Info / Raw Text */}
            {(item.outputType === 'info' || item.outputType === 'text') && typeof item.content === 'string' && (
              <div className="whitespace-pre-wrap leading-relaxed opacity-90 text-xs font-mono">
                {item.content}
              </div>
            )}

            {/* 4. Verses Display Output */}
            {item.outputType === 'verses' && item.content && (
              <div className="p-2.5 rounded bg-black/30 border border-current/20 space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-current/10 font-bold text-xs">
                  <div className="flex items-center space-x-1.5 text-cyan-300">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>
                      {item.content.book.nameUkr} {item.content.chapter}
                      {item.content.verse ? `:${item.content.verse}` : ''}
                      {item.content.endVerse ? `-${item.content.endVerse}` : ''}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      terminalSounds.playKeyClick();
                      onNavigateToRef(item.content.book, item.content.chapter, item.content.verse);
                    }}
                    className="px-2 py-0.5 rounded text-[11px] bg-white/10 hover:bg-white/20 transition flex items-center space-x-1"
                  >
                    <span>Відкрити в рідері</span>
                    <CornerDownRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  {item.content.verses.map((v: any) => (
                    <div key={v.verse} className="flex items-start space-x-2 text-xs">
                      <span className="font-bold text-cyan-400 w-6 shrink-0 text-right">{v.verse}.</span>
                      <p className="flex-1 text-white/90">{v.textUkr}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Random Verse */}
            {item.outputType === 'verse' && item.content && (
              <div className="p-3 rounded bg-amber-950/20 border border-amber-500/40 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-amber-400">
                  <span>✨ {item.content.ref}</span>
                  <span className="text-[10px] opacity-60">Святе Письмо</span>
                </div>
                <p className="text-sm font-serif italic text-amber-100">
                  &ldquo;{item.content.text}&rdquo;
                </p>
              </div>
            )}

            {/* 6. Table (Search results or Books list) */}
            {item.outputType === 'table' && item.content && (
              <div className="p-2 rounded bg-black/40 border border-current/20 space-y-2">
                <div className="font-bold text-xs text-yellow-400 pb-1 border-b border-current/10 flex items-center justify-between">
                  <span>{item.content.title}</span>
                </div>

                {/* Books List format */}
                {item.content.books && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 max-h-64 overflow-y-auto text-xs p-1">
                    {item.content.books.map((b: BookInfo) => (
                      <button
                        key={b.id}
                        onClick={() => {
                          terminalSounds.playKeyClick();
                          onNavigateToRef(b, 1);
                        }}
                        className="text-left px-2 py-1 rounded bg-white/5 hover:bg-white/15 transition flex items-center justify-between truncate"
                      >
                        <span className="truncate">{b.number}. {b.nameUkr}</span>
                        <span className="text-[10px] opacity-50 shrink-0 font-mono ml-1">{b.chaptersCount}гл</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Search results format */}
                {item.content.results && (
                  <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                    {item.content.results.length === 0 ? (
                      <div className="text-xs opacity-60 p-2 text-center">Збігів не знайдено.</div>
                    ) : (
                      item.content.results.map((res: any, idx: number) => (
                        <div
                          key={idx}
                          onClick={() => {
                            terminalSounds.playKeyClick();
                            const b = { id: res.bookId, nameUkr: res.bookName } as any;
                            onNavigateToRef(b, res.chapter, res.verse);
                          }}
                          className="p-2 rounded bg-white/5 hover:bg-white/15 cursor-pointer transition space-y-1 text-xs"
                        >
                          <div className="flex items-center justify-between font-bold text-cyan-300">
                            <span>{res.bookName} {res.chapter}:{res.verse}</span>
                            <span className="text-[10px] opacity-50 uppercase">{res.testament === 'OT' ? 'Старий Заповіт' : 'Новий Заповіт'}</span>
                          </div>
                          <p className="text-white/90 line-clamp-2">
                            {res.textUkr}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 7. Help Commands list */}
            {item.outputType === 'help' && item.content && (
              <div className="p-2.5 rounded bg-black/40 border border-current/20 space-y-2">
                <div className="font-bold text-xs text-yellow-300 pb-1 border-b border-current/10">
                  {item.content.title}
                </div>
                <div className="space-y-1.5 text-xs">
                  {item.content.commands.map((c: any, i: number) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-baseline gap-1 py-0.5 border-b border-current/5">
                      <code className="text-cyan-300 font-bold shrink-0 sm:w-56">{c.cmd}</code>
                      <span className="opacity-80 text-xs">{c.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 8. Neofetch / About */}
            {item.outputType === 'neofetch' && item.content && (
              <div className="p-3 rounded bg-black/50 border border-cyan-500/30 flex flex-col md:flex-row items-center md:items-start space-y-2 md:space-y-0 md:space-x-4">
                <pre className="text-cyan-400 font-mono text-[10px] leading-tight select-none">
                  {item.content.ascii}
                </pre>
                <div className="text-xs space-y-1 font-mono">
                  <div className="font-bold text-white">bible@holy-scriptures CLI OS</div>
                  <div className="opacity-50">----------------------------</div>
                  <div><span className="text-cyan-300">OS:</span> Bible Terminal v2.4</div>
                  <div><span className="text-cyan-300">Canon:</span> 66 Canonical Books (39 OT / 27 NT)</div>
                  <div><span className="text-cyan-300">Translations:</span> Ivan Ohienko (UKR), KJV (ENG)</div>
                  <div><span className="text-cyan-300">Shell:</span> TypeScript CLI Engine + Web Audio</div>
                  <div><span className="text-cyan-300">Theme:</span> {currentTheme.name}</div>
                  <div><span className="text-cyan-300">Navigation:</span> Vim keys (j,k,h,l), CLI prompt, TUI directory</div>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
