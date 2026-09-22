import React, { useState, useEffect, useRef } from 'react';
import { Testament, TerminalTheme, SearchResult, BookInfo } from '../types';
import { CANONICAL_BOOKS } from '../data/canonicalBooks';
import { searchBible } from '../data/bibleData';
import { THEMES } from '../utils/themeStyles';
import { Search, X, BookOpen, ArrowRight } from 'lucide-react';
import { terminalSounds } from '../services/soundEffects';

interface BibleSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (book: BookInfo, chapter: number, verse: number) => void;
  theme: TerminalTheme;
  initialQuery?: string;
}

export const BibleSearchModal: React.FC<BibleSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectResult,
  theme,
  initialQuery = ''
}) => {
  const currentTheme = THEMES[theme];
  const [query, setQuery] = useState(initialQuery);
  const [testament, setTestament] = useState<Testament | 'ALL'>('ALL');
  const [selectedBookId, setSelectedBookId] = useState<string>('ALL');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialQuery) setQuery(initialQuery);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, initialQuery]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      const res = searchBible(query, {
        testament: testament === 'ALL' ? undefined : testament,
        bookId: selectedBookId === 'ALL' ? undefined : selectedBookId
      });
      setResults(res);
      setIsSearching(false);
    }, 120);

    return () => clearTimeout(timer);
  }, [query, testament, selectedBookId]);

  if (!isOpen) return null;

  const handleResultClick = (res: SearchResult) => {
    terminalSounds.playKeyClick();
    const targetBook = CANONICAL_BOOKS.find(b => b.id === res.bookId) || {
      id: res.bookId,
      number: 1,
      nameUkr: res.bookName,
      nameEng: res.bookName,
      shortUkr: res.bookName.substring(0, 3),
      shortEng: res.bookName.substring(0, 3),
      aliases: [],
      testament: res.testament,
      category: 'gospels',
      categoryUkr: 'Книги',
      chaptersCount: 50,
      totalVersesApprox: 1000
    } as BookInfo;

    onSelectResult(targetBook, res.chapter, res.verse);
    onClose();
  };

  const highlightMatches = (text: string, q: string) => {
    if (!q.trim()) return text;
    const parts = text.split(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === q.toLowerCase() ? (
            <span key={i} className="bg-yellow-400 text-black px-0.5 rounded font-bold">
              {part}
            </span>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <div 
      id="modal-bible-search"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-sm font-mono animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className={`w-full max-w-3xl h-[85vh] max-h-[700px] flex flex-col rounded-lg border-2 ${currentTheme.borderActive} ${currentTheme.bg} shadow-2xl overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className={`px-4 py-3 border-b ${currentTheme.border} ${currentTheme.bgSecondary} flex items-center justify-between`}>
          <div className="flex items-center space-x-2 font-bold text-sm">
            <Search className="w-4 h-4 text-cyan-400" />
            <span className={currentTheme.textBright}>ПОШУКОВИЙ МОДУЛЬ СВЯТОГО ПИСЬМА</span>
          </div>
          <button 
            onClick={() => {
              terminalSounds.playKeyClick();
              onClose();
            }}
            className="p-1 hover:bg-white/10 rounded transition"
            title="Закрити (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Controls */}
        <div className="p-3 md:p-4 border-b border-current/10 space-y-3 bg-black/20">
          {/* Main Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 opacity-50" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Введіть пошукове слово або фразу (наприклад: 'любов', 'світло', 'пастир', 'віра')..."
              aria-label="Введіть пошуковий запит"
              className={`w-full pl-9 pr-4 py-2 text-sm bg-black/50 border ${currentTheme.border} rounded font-mono ${currentTheme.textBright} focus:outline-none focus:border-cyan-400`}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-2.5 opacity-50 hover:opacity-100 text-xs"
              >
                Очистити
              </button>
            )}
          </div>

          {/* Quick Filters: Testament & Books */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="opacity-60 text-[11px] uppercase tracking-wider">Фільтр:</span>
            
            {/* Testament Filter */}
            <div className="flex rounded border border-current/20 p-0.5 bg-black/30">
              <button
                onClick={() => setTestament('ALL')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${testament === 'ALL' ? `${currentTheme.accentBg} text-white` : 'opacity-60 hover:opacity-100'}`}
              >
                Всі
              </button>
              <button
                onClick={() => setTestament('OT')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${testament === 'OT' ? `${currentTheme.accentBg} text-white` : 'opacity-60 hover:opacity-100'}`}
              >
                Старий Заповіт
              </button>
              <button
                onClick={() => setTestament('NT')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${testament === 'NT' ? `${currentTheme.accentBg} text-white` : 'opacity-60 hover:opacity-100'}`}
              >
                Новий Заповіт
              </button>
            </div>

            {/* Book Selector Dropdown */}
            <select
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(e.target.value)}
              aria-label="Фільтр за конкретною книгою"
              className={`bg-black/40 border ${currentTheme.border} rounded px-2 py-1 text-xs focus:outline-none`}
            >
              <option value="ALL">Всі книги (66)</option>
              {CANONICAL_BOOKS.filter(b => testament === 'ALL' || b.testament === testament).map(b => (
                <option key={b.id} value={b.id}>{b.nameUkr}</option>
              ))}
            </select>

            <span className="ml-auto text-[11px] opacity-60">
              {isSearching ? 'Пошук...' : `Знайдено: ${results.length} збігів`}
            </span>
          </div>
        </div>

        {/* Search Results List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
          {!query.trim() ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-60 p-6 space-y-2">
              <BookOpen className="w-8 h-8 stroke-1 opacity-50" />
              <p className="text-sm">Введіть ключове слово для швидкого пошуку по всьому тексту Біблії.</p>
              <div className="text-xs opacity-75">Популярні запити: <code>любов</code>, <code>світло</code>, <code>правда</code>, <code>життя</code>, <code>віра</code></div>
            </div>
          ) : results.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-60 p-6 space-y-1">
              <p className="text-sm font-bold">Нічого не знайдено за запитом &ldquo;{query}&rdquo;</p>
              <p className="text-xs">Спробуйте змінити фільтри заповіту або ввести інше ключове слово.</p>
            </div>
          ) : (
            results.map((res, index) => (
              <div
                key={`${res.bookId}-${res.chapter}-${res.verse}-${index}`}
                onClick={() => handleResultClick(res)}
                className={`p-3 rounded border ${currentTheme.border} bg-white/5 hover:bg-white/15 hover:border-current cursor-pointer transition-all space-y-1 group`}
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center space-x-2 text-cyan-300">
                    <span className="group-hover:underline">
                      {res.bookName} {res.chapter}:{res.verse}
                    </span>
                    <span className="text-[10px] opacity-50 font-normal">
                      ({res.testament === 'OT' ? 'Старий Заповіт' : 'Новий Заповіт'})
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition text-[11px] text-cyan-400">
                    <span>Читати</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                <p className="text-xs md:text-sm text-white/90 leading-relaxed">
                  {highlightMatches(res.textUkr, query)}
                </p>

                {res.textEng && (
                  <p className="text-xs text-cyan-200/70 italic line-clamp-1 border-t border-white/5 pt-1">
                    [KJV] {res.textEng}
                  </p>
                )}
              </div>
            ))
          )}
        </div>

        {/* Modal Footer with quick instructions */}
        <div className={`px-4 py-2 border-t ${currentTheme.border} ${currentTheme.bgSecondary} flex items-center justify-between text-[11px] opacity-70`}>
          <span>Натисніть на результат для миттєвого переходу</span>
          <kbd className="px-1.5 py-0.5 bg-black/40 border border-current/20 rounded font-mono">Esc для виходу</kbd>
        </div>
      </div>
    </div>
  );
};
