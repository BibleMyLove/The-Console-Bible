import React, { useState } from 'react';
import { Bookmark, TerminalTheme, BookInfo } from '../types';
import { CANONICAL_BOOKS } from '../data/canonicalBooks';
import { THEMES } from '../utils/themeStyles';
import { Bookmark as BookmarkIcon, X, Trash2, Copy, Download, ArrowRight, Check } from 'lucide-react';
import { terminalSounds } from '../services/soundEffects';

interface BookmarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarks: Bookmark[];
  onRemoveBookmark: (id: string) => void;
  onSelectBookmark: (book: BookInfo, chapter: number, verse: number) => void;
  theme: TerminalTheme;
}

export const BookmarksModal: React.FC<BookmarksModalProps> = ({
  isOpen,
  onClose,
  bookmarks,
  onRemoveBookmark,
  onSelectBookmark,
  theme
}) => {
  const currentTheme = THEMES[theme];
  const [filter, setFilter] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const filtered = bookmarks.filter(b => 
    b.bookName.toLowerCase().includes(filter.toLowerCase()) ||
    b.textUkr.toLowerCase().includes(filter.toLowerCase()) ||
    (b.note && b.note.toLowerCase().includes(filter.toLowerCase()))
  );

  const handleExportText = () => {
    terminalSounds.playKeyClick();
    const content = bookmarks.map(b => `[${b.bookName} ${b.chapter}:${b.verse}]\n${b.textUkr}\n${b.note ? `Нотатка: ${b.note}\n` : ''}`).join('\n---\n\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bible_bookmarks_${new Date().toISOString().slice(0,10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyAll = () => {
    terminalSounds.playKeyClick();
    const content = bookmarks.map(b => `${b.bookName} ${b.chapter}:${b.verse} — ${b.textUkr}`).join('\n');
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      id="modal-bookmarks"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-sm font-mono select-text"
      onClick={onClose}
    >
      <div 
        className={`w-full max-w-3xl h-[80vh] flex flex-col rounded-lg border-2 ${currentTheme.borderActive} ${currentTheme.bg} shadow-2xl overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-4 py-3 border-b ${currentTheme.border} ${currentTheme.bgSecondary} flex items-center justify-between select-none`}>
          <div className="flex items-center space-x-2 font-bold text-sm">
            <BookmarkIcon className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className={currentTheme.textBright}>ЗБЕРЕЖЕНІ ЗАКЛАДКИ ТА ВІРШІ ({bookmarks.length})</span>
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

        {/* Action Toolbar */}
        <div className="p-3 border-b border-current/10 flex flex-wrap items-center justify-between gap-2 bg-black/20 text-xs">
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Пошук серед закладок..."
            aria-label="Пошук закладок"
            className={`px-3 py-1.5 bg-black/40 border ${currentTheme.border} rounded text-xs focus:outline-none focus:border-current flex-1 max-w-xs`}
          />

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyAll}
              disabled={bookmarks.length === 0}
              className={`px-2.5 py-1.5 rounded border ${currentTheme.border} hover:bg-white/10 transition flex items-center space-x-1 disabled:opacity-30`}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Скопіювати всі</span>
            </button>
            <button
              onClick={handleExportText}
              disabled={bookmarks.length === 0}
              className={`px-2.5 py-1.5 rounded border ${currentTheme.border} hover:bg-white/10 transition flex items-center space-x-1 disabled:opacity-30`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Експорт у .TXT</span>
            </button>
          </div>
        </div>

        {/* Bookmarks List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
          {bookmarks.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-60 p-6 space-y-2">
              <BookmarkIcon className="w-8 h-8 opacity-40" />
              <p className="text-sm">У вас ще немає збережених закладок.</p>
              <p className="text-xs">Натискайте іконку закладки біля вірша або команду `bookmark add` у терміналі.</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center opacity-60 p-4 text-xs">Нічого не знайдено за фільтром &ldquo;{filter}&rdquo;</div>
          ) : (
            filtered.map((bm) => {
              const book = CANONICAL_BOOKS.find(b => b.id === bm.bookId) || {
                id: bm.bookId,
                nameUkr: bm.bookName,
                nameEng: bm.bookName,
                number: 1,
                shortUkr: bm.bookName.substring(0, 3),
                shortEng: bm.bookName.substring(0, 3),
                aliases: [],
                testament: 'NT',
                category: 'gospels',
                categoryUkr: 'Книги',
                chaptersCount: 50,
                totalVersesApprox: 1000
              } as BookInfo;

              return (
                <div
                  key={bm.id}
                  className={`p-3 rounded border ${currentTheme.border} bg-white/5 hover:bg-white/10 transition space-y-2 group`}
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <div 
                      onClick={() => {
                        terminalSounds.playKeyClick();
                        onSelectBookmark(book, bm.chapter, bm.verse);
                        onClose();
                      }}
                      className="flex items-center space-x-2 text-amber-400 hover:underline cursor-pointer"
                    >
                      <BookmarkIcon className="w-3.5 h-3.5 fill-current" />
                      <span>{bm.bookName} {bm.chapter}:{bm.verse}</span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => {
                          terminalSounds.playKeyClick();
                          onSelectBookmark(book, bm.chapter, bm.verse);
                          onClose();
                        }}
                        className="px-2 py-0.5 rounded text-[11px] bg-white/10 hover:bg-white/20 transition flex items-center space-x-1 text-cyan-300"
                        title="Перейти до глави"
                      >
                        <span>Читати</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => {
                          terminalSounds.playKeyClick();
                          onRemoveBookmark(bm.id);
                        }}
                        className="p-1 rounded text-red-400 hover:bg-red-950/40 transition"
                        title="Видалити закладку"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs md:text-sm text-white/90 leading-relaxed">
                    {bm.textUkr}
                  </p>

                  <div className="text-[10px] opacity-40 font-mono">
                    Збережено: {new Date(bm.createdAt).toLocaleDateString('uk-UA')}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
