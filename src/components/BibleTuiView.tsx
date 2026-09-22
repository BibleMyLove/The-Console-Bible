import React, { useState, useEffect, useRef } from 'react';
import { BookInfo, Testament, TerminalTheme, TranslationMode, Verse } from '../types';
import { CANONICAL_BOOKS } from '../data/canonicalBooks';
import { getChapterVerses } from '../data/bibleData';
import { THEMES } from '../utils/themeStyles';
import { 
  ChevronRight, 
  ChevronLeft, 
  Bookmark, 
  Copy, 
  Volume2, 
  Check, 
  BookMarked,
  Layers,
  Search,
  Hash,
  Share2
} from 'lucide-react';
import { terminalSounds } from '../services/soundEffects';

interface BibleTuiViewProps {
  currentBook: BookInfo;
  currentChapter: number;
  currentVerse?: number;
  onSelectBookAndChapter: (book: BookInfo, chapter: number, verse?: number) => void;
  theme: TerminalTheme;
  translation: TranslationMode;
  onAddBookmark: (bookId: string, bookName: string, chapter: number, verse: number, text: string) => void;
  bookmarkedVerses: Set<string>; // "bookId:chapter:verse"
}

export const BibleTuiView: React.FC<BibleTuiViewProps> = ({
  currentBook,
  currentChapter,
  currentVerse,
  onSelectBookAndChapter,
  theme,
  translation,
  onAddBookmark,
  bookmarkedVerses
}) => {
  const currentTheme = THEMES[theme];
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedTestament, setSelectedTestament] = useState<Testament | 'ALL'>('ALL');
  const [bookFilter, setBookFilter] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [readingVerseIdx, setReadingVerseIdx] = useState<number | null>(null);
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');

  const versesContainerRef = useRef<HTMLDivElement>(null);
  const targetVerseRef = useRef<HTMLDivElement>(null);

  const verses: Verse[] = getChapterVerses(currentBook, currentChapter);

  // Auto-scroll to selected verse if specified
  useEffect(() => {
    if (currentVerse && targetVerseRef.current) {
      targetVerseRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (versesContainerRef.current) {
      versesContainerRef.current.scrollTop = 0;
    }
  }, [currentBook, currentChapter, currentVerse]);

  // Handle TTS
  const speakVerse = (text: string, index: number) => {
    terminalSounds.playKeyClick();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      if (readingVerseIdx === index) {
        setReadingVerseIdx(null);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = translation === 'eng' ? 'en-US' : 'uk-UA';
      utterance.rate = 0.95;
      utterance.onend = () => setReadingVerseIdx(null);
      utterance.onerror = () => setReadingVerseIdx(null);
      
      setReadingVerseIdx(index);
      window.speechSynthesis.speak(utterance);
    }
  };

  const copyVerse = (v: Verse, index: number) => {
    terminalSounds.playKeyClick();
    const textToCopy = `${v.bookName} ${v.chapter}:${v.verse} — ${v.textUkr}${v.textEng ? `\n[KJV] ${v.textEng}` : ''}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const filteredBooks = CANONICAL_BOOKS.filter(b => {
    if (selectedTestament !== 'ALL' && b.testament !== selectedTestament) return false;
    if (!bookFilter.trim()) return true;
    const q = bookFilter.trim().toLowerCase();
    return b.nameUkr.toLowerCase().includes(q) || 
           b.nameEng.toLowerCase().includes(q) || 
           b.shortUkr.toLowerCase().includes(q) ||
           b.aliases.some(a => a.toLowerCase().includes(q));
  });

  const nextChapter = () => {
    terminalSounds.playPageTurn();
    if (currentChapter < currentBook.chaptersCount) {
      onSelectBookAndChapter(currentBook, currentChapter + 1);
    } else {
      const nextNum = currentBook.number + 1;
      if (nextNum <= 66) {
        const nb = CANONICAL_BOOKS.find(b => b.number === nextNum)!;
        onSelectBookAndChapter(nb, 1);
      }
    }
  };

  const prevChapter = () => {
    terminalSounds.playPageTurn();
    if (currentChapter > 1) {
      onSelectBookAndChapter(currentBook, currentChapter - 1);
    } else {
      const prevNum = currentBook.number - 1;
      if (prevNum >= 1) {
        const pb = CANONICAL_BOOKS.find(b => b.number === prevNum)!;
        onSelectBookAndChapter(pb, pb.chaptersCount);
      }
    }
  };

  const fontSizeClasses = {
    sm: 'text-xs md:text-sm leading-relaxed',
    md: 'text-sm md:text-base leading-relaxed',
    lg: 'text-base md:text-lg leading-loose',
    xl: 'text-lg md:text-xl leading-loose',
  };

  return (
    <div id="bible-tui-container" className="flex-1 flex flex-col md:flex-row h-full min-h-0 overflow-hidden font-mono select-text">
      {/* Left Sidebar: Canonical Books & Chapter Directory */}
      <div 
        className={`${sidebarOpen ? 'w-full md:w-72 lg:w-80' : 'w-0 hidden md:flex md:w-12'} flex flex-col border-r ${currentTheme.border} ${currentTheme.bgSecondary} transition-all duration-200 min-h-0 shrink-0`}
      >
        {sidebarOpen ? (
          <div className="flex flex-col h-full min-h-0 p-2.5">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between pb-2 border-b border-current/10">
              <div className="flex items-center space-x-1.5 font-bold text-xs uppercase tracking-wider">
                <BookMarked className="w-3.5 h-3.5" />
                <span>КАТАЛОГ КНИГ ({CANONICAL_BOOKS.length})</span>
              </div>
              <button 
                onClick={() => {
                  terminalSounds.playKeyClick();
                  setSidebarOpen(false);
                }}
                className="p-1 hover:bg-black/30 rounded"
                title="Згорнути дерево книг"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Testament Switcher */}
            <div className="grid grid-cols-3 gap-1 my-2 text-[11px]">
              <button
                onClick={() => {
                  terminalSounds.playKeyClick();
                  setSelectedTestament('ALL');
                }}
                className={`py-1 rounded border text-center font-bold ${selectedTestament === 'ALL' ? `${currentTheme.accentBg} ${currentTheme.borderActive}` : 'border-current/10 hover:border-current/40'}`}
              >
                Всі (66)
              </button>
              <button
                onClick={() => {
                  terminalSounds.playKeyClick();
                  setSelectedTestament('OT');
                }}
                className={`py-1 rounded border text-center font-bold ${selectedTestament === 'OT' ? `${currentTheme.accentBg} ${currentTheme.borderActive}` : 'border-current/10 hover:border-current/40'}`}
              >
                Старий (39)
              </button>
              <button
                onClick={() => {
                  terminalSounds.playKeyClick();
                  setSelectedTestament('NT');
                }}
                className={`py-1 rounded border text-center font-bold ${selectedTestament === 'NT' ? `${currentTheme.accentBg} ${currentTheme.borderActive}` : 'border-current/10 hover:border-current/40'}`}
              >
                Новий (27)
              </button>
            </div>

            {/* Book search filter */}
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 absolute left-2 top-2 opacity-50" />
              <input
                type="text"
                value={bookFilter}
                onChange={(e) => setBookFilter(e.target.value)}
                placeholder="Фільтр (напр. Мат, Пс, 1io)..."
                aria-label="Фільтр списку книг"
                className={`w-full pl-7 pr-2 py-1 text-xs bg-black/40 border ${currentTheme.border} rounded focus:outline-none focus:border-current`}
              />
            </div>

            {/* Books List Tree */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-1 text-xs">
              {filteredBooks.map((book) => {
                const isActive = book.id === currentBook.id;
                return (
                  <div key={book.id} className="space-y-1">
                    <button
                      onClick={() => {
                        terminalSounds.playKeyClick();
                        onSelectBookAndChapter(book, 1);
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded flex items-center justify-between transition ${isActive ? `${currentTheme.accentBg} ${currentTheme.textBright} font-bold border ${currentTheme.borderActive}` : 'hover:bg-black/20 opacity-80 hover:opacity-100'}`}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <span className="opacity-50 text-[10px] w-5 text-right font-mono">{book.number}.</span>
                        <span className="truncate">{book.nameUkr}</span>
                      </div>
                      <span className="text-[10px] opacity-60 font-mono shrink-0 ml-1">
                        {book.chaptersCount}гл
                      </span>
                    </button>

                    {/* If Active Book, show chapter picker matrix */}
                    {isActive && (
                      <div className="p-2 bg-black/40 rounded border border-current/20 space-y-1.5 my-1">
                        <div className="text-[10px] uppercase opacity-70 tracking-wider flex items-center justify-between">
                          <span>Розділи ({book.chaptersCount}):</span>
                          <span className="text-[9px] opacity-60">{book.categoryUkr}</span>
                        </div>
                        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-6 gap-1 max-h-36 overflow-y-auto p-0.5">
                          {Array.from({ length: book.chaptersCount }, (_, i) => i + 1).map((ch) => {
                            const isChActive = ch === currentChapter;
                            return (
                              <button
                                key={ch}
                                onClick={() => {
                                  terminalSounds.playPageTurn();
                                  onSelectBookAndChapter(book, ch);
                                }}
                                className={`py-1 text-center text-xs rounded font-mono transition ${isChActive ? `${currentTheme.accentBg} font-bold text-white ring-1 ring-white/50` : 'bg-white/5 hover:bg-white/15'}`}
                              >
                                {ch}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center py-3 space-y-3">
            <button
              onClick={() => {
                terminalSounds.playKeyClick();
                setSidebarOpen(true);
              }}
              className="p-1.5 hover:bg-black/30 rounded"
              title="Розгорнути дерево книг"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="writing-mode-vertical text-xs uppercase tracking-widest opacity-60 font-bold rotate-180 py-4">
              {currentBook.nameUkr}
            </div>
          </div>
        )}
      </div>

      {/* Main Scripture Reader View */}
      <div className="flex-1 flex flex-col h-full min-h-0 bg-black/10">
        {/* Navigation Bar / Chapter Header */}
        <div className={`px-3 py-2 border-b ${currentTheme.border} ${currentTheme.bgSecondary} flex flex-wrap items-center justify-between gap-2`}>
          <div className="flex items-center space-x-2">
            {!sidebarOpen && (
              <button
                onClick={() => {
                  terminalSounds.playKeyClick();
                  setSidebarOpen(true);
                }}
                className="p-1 hover:bg-black/30 rounded text-xs flex items-center space-x-1 border border-current/20"
                title="Відкрити список книг"
              >
                <BookMarked className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Книги</span>
              </button>
            )}

            <div className="flex items-center space-x-1 font-bold text-sm md:text-base">
              <span className={currentTheme.textBright}>{currentBook.nameUkr}</span>
              <span className="text-cyan-400">Розділ {currentChapter}</span>
              <span className="text-xs opacity-50 font-normal">({currentBook.nameEng} {currentChapter})</span>
            </div>
          </div>

          {/* Chapter Pager Controls + Font Size */}
          <div className="flex items-center space-x-2">
            {/* Font size picker */}
            <div className="hidden sm:flex items-center space-x-1 text-xs border border-current/20 rounded p-0.5 bg-black/20">
              <button
                onClick={() => setFontSize('sm')}
                className={`px-1.5 py-0.5 rounded text-[10px] ${fontSize === 'sm' ? 'bg-white/20 font-bold' : 'opacity-60'}`}
                title="Малий шрифт"
              >
                A-
              </button>
              <button
                onClick={() => setFontSize('md')}
                className={`px-1.5 py-0.5 rounded text-[10px] ${fontSize === 'md' ? 'bg-white/20 font-bold' : 'opacity-60'}`}
                title="Середній шрифт"
              >
                A
              </button>
              <button
                onClick={() => setFontSize('lg')}
                className={`px-1.5 py-0.5 rounded text-[10px] ${fontSize === 'lg' ? 'bg-white/20 font-bold' : 'opacity-60'}`}
                title="Великий шрифт"
              >
                A+
              </button>
            </div>

            {/* Prev Chapter */}
            <button
              id="btn-prev-chapter"
              onClick={prevChapter}
              className={`px-2.5 py-1 rounded text-xs flex items-center space-x-1 border ${currentTheme.border} hover:border-current hover:${currentTheme.accentBg} transition`}
              title="Попередня глава (h / p / ←)"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Назад</span>
            </button>

            {/* Next Chapter */}
            <button
              id="btn-next-chapter"
              onClick={nextChapter}
              className={`px-2.5 py-1 rounded text-xs flex items-center space-x-1 border ${currentTheme.border} hover:border-current hover:${currentTheme.accentBg} transition`}
              title="Наступна глава (l / n / →)"
            >
              <span className="hidden sm:inline">Далі</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Verses Scrollable Buffer */}
        <div 
          ref={versesContainerRef}
          id="verses-scroll-viewport"
          className="flex-1 overflow-y-auto p-3 md:p-6 space-y-3 md:space-y-4 min-h-0"
        >
          {/* Chapter Title Banner in Terminal Style */}
          <div className="pb-3 mb-2 border-b border-current/15 text-center font-mono select-none">
            <div className="text-[11px] uppercase tracking-widest opacity-60">
              {currentBook.testament === 'OT' ? 'СТАРИЙ ЗАПОВІТ' : 'НОВИЙ ЗАПОВІТ'} • {currentBook.categoryUkr}
            </div>
            <div className="text-lg md:text-2xl font-bold tracking-tight my-1 text-white">
              {currentBook.nameUkr} — РОЗДІЛ {currentChapter}
            </div>
            <div className="text-xs opacity-50">
              Переклад: {translation === 'ukr' ? 'Івана Огієнка (UKR)' : translation === 'eng' ? 'King James Version (ENG)' : 'Паралельний Огієнка / KJV'}
            </div>
          </div>

          {/* Verses List */}
          {verses.map((v, index) => {
            const isTarget = currentVerse === v.verse;
            const isBookmarked = bookmarkedVerses.has(`${v.bookId}:${v.chapter}:${v.verse}`);
            const isReading = readingVerseIdx === index;

            return (
              <div
                key={v.verse}
                ref={isTarget ? targetVerseRef : null}
                id={`verse-${v.verse}`}
                className={`group relative p-2.5 md:p-3 rounded border transition-all duration-150 ${
                  isTarget 
                    ? `border-cyan-400 bg-cyan-950/30 ring-1 ring-cyan-400/50` 
                    : isBookmarked 
                    ? `border-amber-500/50 bg-amber-950/20` 
                    : `border-transparent hover:border-current/20 hover:bg-white/5`
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* Line Number / Verse Index */}
                  <div className="flex flex-col items-center shrink-0 w-8 pt-0.5 select-none font-mono">
                    <span className={`text-xs md:text-sm font-bold ${isTarget ? 'text-cyan-300' : isBookmarked ? 'text-amber-400' : currentTheme.verseNum}`}>
                      {String(v.verse).padStart(2, '0')}
                    </span>
                    {isBookmarked && (
                      <Bookmark className="w-3 h-3 text-amber-400 fill-amber-400 mt-1" />
                    )}
                  </div>

                  {/* Verse Text (Single or Parallel Mode) */}
                  <div className="flex-1 space-y-1.5">
                    {/* Ukrainian Text */}
                    {(translation === 'ukr' || translation === 'parallel') && (
                      <p className={`${fontSizeClasses[fontSize]} ${currentTheme.textBright} text-justify`}>
                        {v.textUkr}
                      </p>
                    )}

                    {/* English Parallel Text */}
                    {(translation === 'eng' || translation === 'parallel') && v.textEng && (
                      <p className={`${fontSizeClasses[fontSize]} ${translation === 'parallel' ? 'text-cyan-300/80 italic text-sm pt-1 border-t border-current/10' : currentTheme.textBright}`}>
                        {translation === 'parallel' && <span className="not-italic text-[10px] font-bold opacity-60 mr-1.5">[KJV]</span>}
                        {v.textEng}
                      </p>
                    )}
                  </div>

                  {/* Hover Quick Actions (Copy, Bookmark, TTS) */}
                  <div className="hidden group-hover:flex items-center space-x-1 shrink-0 select-none opacity-90 pl-2">
                    {/* TTS Button */}
                    <button
                      onClick={() => speakVerse(translation === 'eng' && v.textEng ? v.textEng : v.textUkr, index)}
                      className={`p-1.5 rounded border border-current/20 hover:bg-white/10 ${isReading ? 'text-cyan-400 animate-pulse' : 'opacity-70 hover:opacity-100'}`}
                      title="Озвучити вірш"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Bookmark Button */}
                    <button
                      onClick={() => {
                        terminalSounds.playKeyClick();
                        onAddBookmark(v.bookId, v.bookName, v.chapter, v.verse, v.textUkr);
                      }}
                      className={`p-1.5 rounded border border-current/20 hover:bg-white/10 ${isBookmarked ? 'text-amber-400' : 'opacity-70 hover:opacity-100'}`}
                      title={isBookmarked ? "Видалити закладку" : "Додати в закладки"}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                    </button>

                    {/* Copy Button */}
                    <button
                      onClick={() => copyVerse(v, index)}
                      className="p-1.5 rounded border border-current/20 hover:bg-white/10 opacity-70 hover:opacity-100"
                      title="Скопіювати вірш з посиланням"
                    >
                      {copiedIndex === index ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Chapter Footer Navigation */}
          <div className="pt-8 pb-4 flex flex-col sm:flex-row items-center justify-between border-t border-current/15 gap-3 font-mono text-xs select-none">
            <button
              onClick={prevChapter}
              className={`px-4 py-2 rounded border ${currentTheme.border} hover:border-current hover:${currentTheme.accentBg} transition flex items-center space-x-2`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Попередня глава ({currentChapter > 1 ? `${currentBook.shortUkr} ${currentChapter - 1}` : 'Попередня книга'})</span>
            </button>

            <span className="opacity-50 text-center">
              Кінець розділу {currentChapter} з {currentBook.chaptersCount}
            </span>

            <button
              onClick={nextChapter}
              className={`px-4 py-2 rounded border ${currentTheme.border} hover:border-current hover:${currentTheme.accentBg} transition flex items-center space-x-2`}
            >
              <span>Наступна глава ({currentChapter < currentBook.chaptersCount ? `${currentBook.shortUkr} ${currentChapter + 1}` : 'Наступна книга'})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
