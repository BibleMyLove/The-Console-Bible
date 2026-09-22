import React, { useState, useEffect, useRef } from 'react';
import { BookInfo, Verse, SearchResult } from './types';
import { CANONICAL_BOOKS, findBookByQuery } from './data/canonicalBooks';
import { getChapterVerses, searchBible, getRandomVerse } from './data/bibleData';
import { terminalSounds } from './services/soundEffects';

type ScreenState = 
  | { type: 'home' }
  | { type: 'book'; book: BookInfo }
  | { type: 'chapter'; book: BookInfo; chapter: number; verse?: number }
  | { type: 'search'; query: string; results: SearchResult[] }
  | { type: 'help' };

export default function App() {
  const [screen, setScreen] = useState<ScreenState>({ type: 'home' });
  const [commandInput, setCommandInput] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [crtEffect, setCrtEffect] = useState(true);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Auto focus input on click anywhere, screen change, or any keypress
  useEffect(() => {
    inputRef.current?.focus();
  }, [screen]);

  useEffect(() => {
    const focusInput = () => {
      inputRef.current?.focus();
    };

    // Initial focus on mount
    focusInput();
    window.addEventListener('focus', focusInput);

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't intercept shortcut modifier combinations
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'Tab') return;

      if (document.activeElement !== inputRef.current) {
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('focus', focusInput);
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, []);

  // Scroll to top on screen change
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [screen]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;

    const cmd = commandInput.trim();
    terminalSounds.playCommandExec();
    setCommandInput('');

    const lower = cmd.toLowerCase();

    // Navigation back / home
    if (lower === 'back' || lower === 'назад' || lower === 'home' || lower === 'зміст' || lower === 'list' || lower === 'books' || lower === 'menu' || lower === 'q') {
      setScreen({ type: 'home' });
      return;
    }

    // Help
    if (lower === 'help' || lower === '?' || lower === 'довідка' || lower === 'man') {
      setScreen({ type: 'help' });
      return;
    }

    // Sound toggle
    if (lower === 'sound' || lower === 'звук') {
      const next = !soundEnabled;
      setSoundEnabled(next);
      terminalSounds.enabled = next;
      return;
    }

    // CRT toggle
    if (lower === 'crt') {
      setCrtEffect(prev => !prev);
      return;
    }

    // Random verse
    if (lower === 'random' || lower === 'вірш' || lower === 'daily') {
      const rand = getRandomVerse();
      const b = CANONICAL_BOOKS.find(item => item.id === rand.bookId) || CANONICAL_BOOKS[0];
      setScreen({ type: 'chapter', book: b, chapter: rand.chapter, verse: rand.verse });
      return;
    }

    // If currently in a book screen and user entered a chapter number
    if (screen.type === 'book') {
      const num = parseInt(cmd, 10);
      if (!isNaN(num) && num >= 1 && num <= screen.book.chaptersCount) {
        setScreen({ type: 'chapter', book: screen.book, chapter: num });
        return;
      }
    }

    // Next / Prev chapter while reading
    if (screen.type === 'chapter') {
      if (lower === 'next' || lower === 'n' || lower === 'далі') {
        if (screen.chapter < screen.book.chaptersCount) {
          setScreen({ type: 'chapter', book: screen.book, chapter: screen.chapter + 1 });
        } else {
          const nextB = CANONICAL_BOOKS.find(b => b.number === screen.book.number + 1);
          if (nextB) setScreen({ type: 'chapter', book: nextB, chapter: 1 });
        }
        return;
      }
      if (lower === 'prev' || lower === 'p' || lower === 'попередня') {
        if (screen.chapter > 1) {
          setScreen({ type: 'chapter', book: screen.book, chapter: screen.chapter - 1 });
        } else {
          const prevB = CANONICAL_BOOKS.find(b => b.number === screen.book.number - 1);
          if (prevB) setScreen({ type: 'chapter', book: prevB, chapter: prevB.chaptersCount });
        }
        return;
      }
    }

    // Search command: "search <text>" or "знайти <text>" or "/ <text>"
    if (lower.startsWith('search ') || lower.startsWith('знайти ') || lower.startsWith('/')) {
      const q = cmd.replace(/^(search|знайти|\/)\s*/i, '').trim();
      if (q) {
        const results = searchBible(q);
        setScreen({ type: 'search', query: q, results });
        return;
      }
    }

    // Direct reference match (e.g. "Івана 3:16", "Буття 1", "Пс 23", "Мат 5", "Римлян 8:28")
    const match = cmd.match(/^([\d\s\p{L}'-]+?)\s+(\d+)(?::(\d+))?$/iu);
    if (match) {
      const bQuery = match[1].trim();
      const chNum = parseInt(match[2], 10);
      const vNum = match[3] ? parseInt(match[3], 10) : undefined;
      const foundBook = findBookByQuery(bQuery);
      if (foundBook) {
        const validCh = Math.min(Math.max(1, chNum), foundBook.chaptersCount);
        setScreen({ type: 'chapter', book: foundBook, chapter: validCh, verse: vNum });
        return;
      }
    }

    // Book name only match (e.g. "Буття", "Матвія", "Псалми")
    const foundBook = findBookByQuery(cmd);
    if (foundBook) {
      setScreen({ type: 'book', book: foundBook });
      return;
    }

    // Fallback: Perform text search
    const results = searchBible(cmd);
    setScreen({ type: 'search', query: cmd, results });
  };

  const oldTestament = CANONICAL_BOOKS.filter(b => b.testament === 'OT');
  const newTestament = CANONICAL_BOOKS.filter(b => b.testament === 'NT');

  return (
    <div 
      className={`h-screen w-screen bg-black text-[#00ff41] font-mono select-none flex flex-col justify-between p-4 md:p-8 overflow-hidden text-sm md:text-base ${crtEffect ? 'crt-overlay crt-vignette crt-bloom-green' : ''}`}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Top Header & Fast Shortcut */}
      <div className="flex items-center justify-between border-b border-[#00ff41]/40 pb-2 mb-3 text-xs md:text-sm shrink-0">
        <div className="font-bold tracking-widest uppercase">
          БІБЛІЯ // ТЕРМІНАЛ
        </div>
        <div className="opacity-75 flex items-center space-x-3">
          <button 
            onClick={() => {
              terminalSounds.playKeyClick();
              setScreen({ type: 'home' });
            }}
            className="hover:underline hover:opacity-100"
          >
            ГОЛОВНА
          </button>
          <button 
            onClick={() => {
              terminalSounds.playKeyClick();
              setScreen({ type: 'help' });
            }}
            className="hover:underline hover:opacity-100"
          >
            ДОВІДКА
          </button>
        </div>
      </div>

      {/* Main Terminal Screen Body */}
      <div 
        ref={contentRef}
        className="flex-1 overflow-y-auto pr-2 space-y-4 min-h-0 select-text leading-relaxed"
      >
        {/* ================= SCREEN 1: HOME (ЗМІСТ) ================= */}
        {screen.type === 'home' && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h1 className="text-base md:text-lg font-bold">Біблія</h1>
              <p className="opacity-70 text-xs">
                Оберіть книгу зі списку нижче або введіть команду в терміналі, напр. <code>Буття 1</code>, <code>search любов</code>:
              </p>
            </div>

            {/* Old Testament */}
            <div className="space-y-2 pt-2">
              <div className="font-bold tracking-wide text-xs md:text-sm uppercase text-[#00ff41]/90">
                Старий Заповіт:
              </div>
              <div className="columns-1 sm:columns-2 md:columns-3 gap-x-6 pl-2 space-y-1 text-xs md:text-sm">
                {oldTestament.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      terminalSounds.playKeyClick();
                      setScreen({ type: 'book', book: b });
                    }}
                    className="break-inside-avoid w-full text-left hover:underline hover:text-white transition flex items-center space-x-2 py-0.5"
                  >
                    <span className="text-[#00ff41] select-none">*</span>
                    <span>{b.nameUkr}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* New Testament */}
            <div className="space-y-2 pt-4 border-t border-[#00ff41]/20">
              <div className="font-bold tracking-wide text-xs md:text-sm uppercase text-[#00ff41]/90">
                Новий Заповіт:
              </div>
              <div className="columns-1 sm:columns-2 md:columns-3 gap-x-6 pl-2 space-y-1 text-xs md:text-sm">
                {newTestament.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      terminalSounds.playKeyClick();
                      setScreen({ type: 'book', book: b });
                    }}
                    className="break-inside-avoid w-full text-left hover:underline hover:text-white transition flex items-center space-x-2 py-0.5"
                  >
                    <span className="text-[#00ff41] select-none">*</span>
                    <span>{b.nameUkr}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= SCREEN 2: BOOK CHAPTERS PICKER ================= */}
        {screen.type === 'book' && (
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="text-base md:text-lg font-bold">
                {screen.book.nameUkr}
              </div>
              <div className="opacity-70 text-xs">
                {screen.book.categoryUkr} • Глав: {screen.book.chaptersCount}
              </div>
              <p className="opacity-70 text-xs pt-1">
                Оберіть розділ зі списку або введіть номер:
              </p>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 pt-2">
              {Array.from({ length: screen.book.chaptersCount }, (_, i) => i + 1).map((ch) => (
                <button
                  key={ch}
                  onClick={() => {
                    terminalSounds.playPageTurn();
                    setScreen({ type: 'chapter', book: screen.book, chapter: ch });
                  }}
                  className="p-2 border border-[#00ff41]/40 hover:border-[#00ff41] hover:bg-[#00ff41]/10 text-center transition font-bold"
                >
                  * Глава {ch}
                </button>
              ))}
            </div>

            <div className="pt-4">
              <button
                onClick={() => {
                  terminalSounds.playKeyClick();
                  setScreen({ type: 'home' });
                }}
                className="hover:underline opacity-80 hover:opacity-100 text-xs"
              >
                * Назад до списку книг
              </button>
            </div>
          </div>
        )}

        {/* ================= SCREEN 3: CHAPTER VERSES READER ================= */}
        {screen.type === 'chapter' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#00ff41]/30 pb-2">
              <div className="font-bold text-sm md:text-base">
                {screen.book.nameUkr} — РОЗДІЛ {screen.chapter}
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <button
                  onClick={() => {
                    terminalSounds.playPageTurn();
                    if (screen.chapter > 1) {
                      setScreen({ type: 'chapter', book: screen.book, chapter: screen.chapter - 1 });
                    } else {
                      const prevB = CANONICAL_BOOKS.find(b => b.number === screen.book.number - 1);
                      if (prevB) setScreen({ type: 'chapter', book: prevB, chapter: prevB.chaptersCount });
                    }
                  }}
                  className="hover:underline"
                >
                  &lt; Попередня
                </button>
                <button
                  onClick={() => {
                    terminalSounds.playPageTurn();
                    if (screen.chapter < screen.book.chaptersCount) {
                      setScreen({ type: 'chapter', book: screen.book, chapter: screen.chapter + 1 });
                    } else {
                      const nextB = CANONICAL_BOOKS.find(b => b.number === screen.book.number + 1);
                      if (nextB) setScreen({ type: 'chapter', book: nextB, chapter: 1 });
                    }
                  }}
                  className="hover:underline"
                >
                  Наступна &gt;
                </button>
              </div>
            </div>

            {/* Verses List */}
            <div className="space-y-3 py-2">
              {getChapterVerses(screen.book, screen.chapter).map((v: Verse) => {
                const isSelected = screen.verse === v.verse;
                return (
                  <div 
                    key={v.verse} 
                    className={`flex items-start space-x-2 p-1 rounded ${isSelected ? 'bg-[#00ff41]/20 ring-1 ring-[#00ff41]' : ''}`}
                  >
                    <span className="font-bold shrink-0 opacity-75 w-6">
                      {v.verse}.
                    </span>
                    <p className="flex-1 leading-relaxed">
                      {v.textUkr}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Chapter bottom navigation */}
            <div className="pt-4 border-t border-[#00ff41]/30 flex flex-wrap items-center justify-between gap-2 text-xs">
              <button
                onClick={() => {
                  terminalSounds.playKeyClick();
                  setScreen({ type: 'book', book: screen.book });
                }}
                className="hover:underline opacity-80"
              >
                * Всі глави {screen.book.nameUkr}
              </button>
              <button
                onClick={() => {
                  terminalSounds.playKeyClick();
                  setScreen({ type: 'home' });
                }}
                className="hover:underline opacity-80"
              >
                * Головний зміст
              </button>
            </div>
          </div>
        )}

        {/* ================= SCREEN 4: SEARCH RESULTS ================= */}
        {screen.type === 'search' && (
          <div className="space-y-4">
            <div className="border-b border-[#00ff41]/30 pb-2">
              <div className="font-bold text-sm md:text-base">
                РЕЗУЛЬТАТИ ПОШУКУ: &quot;{screen.query}&quot;
              </div>
              <div className="opacity-70 text-xs">
                Знайдено збігів: {screen.results.length}
              </div>
            </div>

            {screen.results.length === 0 ? (
              <div className="opacity-70 text-xs py-4">
                Нічого не знайдено за запитом &quot;{screen.query}&quot;.
              </div>
            ) : (
              <div className="space-y-3">
                {screen.results.map((r, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      terminalSounds.playKeyClick();
                      const b = CANONICAL_BOOKS.find(item => item.id === r.bookId) || CANONICAL_BOOKS[0];
                      setScreen({ type: 'chapter', book: b, chapter: r.chapter, verse: r.verse });
                    }}
                    className="p-2 border border-[#00ff41]/30 hover:border-[#00ff41] hover:bg-[#00ff41]/10 cursor-pointer transition space-y-1"
                  >
                    <div className="font-bold text-xs">
                      * {r.bookName} {r.chapter}:{r.verse}
                    </div>
                    <p className="text-xs md:text-sm leading-relaxed opacity-90">
                      {r.textUkr}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-4">
              <button
                onClick={() => {
                  terminalSounds.playKeyClick();
                  setScreen({ type: 'home' });
                }}
                className="hover:underline opacity-80 text-xs"
              >
                * Повернутися до змісту
              </button>
            </div>
          </div>
        )}

        {/* ================= SCREEN 5: HELP ================= */}
        {screen.type === 'help' && (
          <div className="space-y-4 text-xs md:text-sm">
            <div className="font-bold text-base border-b border-[#00ff41]/30 pb-2">
              ДОВІДКА ТЕРМІНАЛА
            </div>

            <div className="space-y-2">
              <div className="font-bold text-[#00ff41]">КОМАНДИ:</div>
              <div className="pl-3 space-y-1 text-xs">
                <div>• <code>Буття</code> або <code>Івана</code> — відкрити розділи книги</div>
                <div>• <code>Івана 3:16</code> або <code>Буття 1</code> або <code>Пс 23</code> — відкрити главу чи вірш</div>
                <div>• <code>search &lt;слово&gt;</code> або <code>/ &lt;слово&gt;</code> — пошук по тексту, напр. <code>search любов</code></div>
                <div>• <code>next</code> або <code>prev</code> — наступна або попередня глава</div>
                <div>• <code>random</code> — випадковий вірш</div>
                <div>• <code>back</code> або <code>home</code> — повернутися до змісту</div>
                <div>• <code>sound</code> — перемикач звуку клавіш</div>
                <div>• <code>crt</code> — перемикач CRT ефекту</div>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => {
                  terminalSounds.playKeyClick();
                  setScreen({ type: 'home' });
                }}
                className="hover:underline opacity-80"
              >
                * Повернутися до змісту
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Bottom Terminal Prompt Line */}
      <form 
        onSubmit={handleCommand}
        onClick={() => inputRef.current?.focus()}
        className="mt-3 pt-2 border-t border-[#00ff41]/40 flex items-center space-x-2 shrink-0 cursor-text"
      >
        <span className="font-bold text-[#00ff41] select-none">&gt;</span>
        <input
          ref={inputRef}
          type="text"
          value={commandInput}
          onChange={(e) => setCommandInput(e.target.value)}
          onKeyDown={() => terminalSounds.playKeyClick()}
          placeholder="Введіть команду або назву книги, напр. Буття 1, Івана 3:16, search любов..."
          aria-label="Введення термінальної команди"
          autoFocus
          className="flex-1 bg-transparent text-[#00ff41] font-mono text-sm md:text-base focus:outline-none placeholder:text-[#00ff41]/30 caret-[#00ff41]"
          autoComplete="off"
          spellCheck="false"
        />
      </form>
    </div>
  );
}
