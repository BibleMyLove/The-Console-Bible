import React from 'react';
import { BookInfo, TerminalLayout, TerminalTheme, TranslationMode } from '../types';
import { THEMES } from '../utils/themeStyles';
import { 
  Terminal, 
  BookOpen, 
  Search, 
  Volume2, 
  VolumeX, 
  Tv, 
  HelpCircle, 
  Bookmark as BookmarkIcon, 
  Sparkles,
  Columns,
  Monitor,
  Calendar,
  Layers
} from 'lucide-react';
import { terminalSounds } from '../services/soundEffects';

interface TerminalHeaderProps {
  currentBook: BookInfo;
  currentChapter: number;
  currentVerse?: number;
  theme: TerminalTheme;
  setTheme: (t: TerminalTheme) => void;
  layout: TerminalLayout;
  setLayout: (l: TerminalLayout) => void;
  translation: TranslationMode;
  setTranslation: (tr: TranslationMode) => void;
  crtEffect: boolean;
  setCrtEffect: React.Dispatch<React.SetStateAction<boolean>>;
  soundEnabled: boolean;
  setSoundEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  onOpenSearch: () => void;
  onOpenHelp: () => void;
  onOpenBookmarks: () => void;
  onOpenPlan: () => void;
  onOpenQuiz: () => void;
}

export const TerminalHeader: React.FC<TerminalHeaderProps> = ({
  currentBook,
  currentChapter,
  currentVerse,
  theme,
  setTheme,
  layout,
  setLayout,
  translation,
  setTranslation,
  crtEffect,
  setCrtEffect,
  soundEnabled,
  setSoundEnabled,
  onOpenSearch,
  onOpenHelp,
  onOpenBookmarks,
  onOpenPlan,
  onOpenQuiz
}) => {
  const currentTheme = THEMES[theme];

  const handleSoundToggle = () => {
    setSoundEnabled(prev => {
      const next = !prev;
      terminalSounds.enabled = next;
      if (next) terminalSounds.playKeyClick();
      return next;
    });
  };

  const handleCrtToggle = () => {
    terminalSounds.playKeyClick();
    setCrtEffect(prev => !prev);
  };

  const nextTheme = () => {
    terminalSounds.playKeyClick();
    const themesList: TerminalTheme[] = ['matrix', 'amber', 'nord', 'cyberpunk', 'dos', 'paper', 'dracula', 'solarized'];
    const idx = themesList.indexOf(theme);
    const next = themesList[(idx + 1) % themesList.length];
    setTheme(next);
  };

  return (
    <header 
      id="terminal-header-bar" 
      className={`border-b ${currentTheme.border} ${currentTheme.bgSecondary} px-3 py-2 flex flex-wrap items-center justify-between text-xs select-none gap-2 z-20`}
    >
      {/* Window Controls & Terminal Prompt Identifier */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1.5 opacity-80">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block"></span>
        </div>

        <div className="flex items-center space-x-2 font-mono">
          <Terminal className="w-4 h-4 opacity-75" />
          <span className={currentTheme.promptUser}>bible</span>
          <span className={currentTheme.textMuted}>@</span>
          <span className={currentTheme.promptHost}>holy-scriptures</span>
          <span className={currentTheme.textMuted}>:</span>
          <span className="text-cyan-400">~</span>
          <span className={currentTheme.textMuted}>$</span>
        </div>

        {/* Current Active Scripture Coordinate */}
        <div className={`hidden md:flex items-center space-x-1.5 px-2.5 py-0.5 rounded border ${currentTheme.border} ${currentTheme.accentBg}`}>
          <BookOpen className="w-3.5 h-3.5" />
          <span className="font-semibold text-white">
            {currentBook.nameUkr} {currentChapter}{currentVerse ? `:${currentVerse}` : ''}
          </span>
          <span className="opacity-60 text-[10px]">({currentBook.nameEng})</span>
        </div>
      </div>

      {/* Center Action Toolbar / Quick Navigation Controls */}
      <div className="flex items-center space-x-1.5">
        {/* Search button */}
        <button
          id="btn-nav-search"
          onClick={() => {
            terminalSounds.playKeyClick();
            onOpenSearch();
          }}
          className={`px-2 py-1 rounded flex items-center space-x-1 border ${currentTheme.border} hover:border-current hover:${currentTheme.accentBg} transition`}
          title="Пошук по Біблії (/ або search)"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Пошук</span>
          <kbd className="hidden md:inline px-1 bg-black/40 text-[10px] rounded font-mono border border-current/20">/</kbd>
        </button>

        {/* Bookmarks */}
        <button
          id="btn-nav-bookmarks"
          onClick={() => {
            terminalSounds.playKeyClick();
            onOpenBookmarks();
          }}
          className={`px-2 py-1 rounded flex items-center space-x-1 border ${currentTheme.border} hover:border-current hover:${currentTheme.accentBg} transition`}
          title="Закладки та Нотатки"
        >
          <BookmarkIcon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Закладки</span>
        </button>

        {/* Reading Plan */}
        <button
          id="btn-nav-plan"
          onClick={() => {
            terminalSounds.playKeyClick();
            onOpenPlan();
          }}
          className={`px-2 py-1 rounded flex items-center space-x-1 border ${currentTheme.border} hover:border-current hover:${currentTheme.accentBg} transition`}
          title="Річний план читання"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">План</span>
        </button>

        {/* Quiz / Memory */}
        <button
          id="btn-nav-quiz"
          onClick={() => {
            terminalSounds.playKeyClick();
            onOpenQuiz();
          }}
          className={`px-2 py-1 rounded flex items-center space-x-1 border ${currentTheme.border} hover:border-current hover:${currentTheme.accentBg} transition`}
          title="Вікторина та запам'ятовування"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Вікторина</span>
        </button>
      </div>

      {/* Right System Settings (Theme, Translation, Layout, CRT, Sound, Help) */}
      <div className="flex items-center space-x-1.5">
        {/* Layout Switcher */}
        <div className="flex items-center rounded border border-current/20 p-0.5 bg-black/20">
          <button
            onClick={() => {
              terminalSounds.playKeyClick();
              setLayout('tui');
            }}
            className={`px-1.5 py-0.5 rounded text-[11px] flex items-center space-x-1 ${layout === 'tui' ? `${currentTheme.accentBg} font-bold text-white` : 'opacity-60 hover:opacity-100'}`}
            title="TUI Рідер + Каталог"
          >
            <Columns className="w-3 h-3" />
            <span className="hidden xl:inline">TUI</span>
          </button>
          <button
            onClick={() => {
              terminalSounds.playKeyClick();
              setLayout('split');
            }}
            className={`px-1.5 py-0.5 rounded text-[11px] flex items-center space-x-1 ${layout === 'split' ? `${currentTheme.accentBg} font-bold text-white` : 'opacity-60 hover:opacity-100'}`}
            title="Розділений екран (Рідер + CLI консоль)"
          >
            <Layers className="w-3 h-3" />
            <span className="hidden xl:inline">SPLIT</span>
          </button>
          <button
            onClick={() => {
              terminalSounds.playKeyClick();
              setLayout('cli');
            }}
            className={`px-1.5 py-0.5 rounded text-[11px] flex items-center space-x-1 ${layout === 'cli' ? `${currentTheme.accentBg} font-bold text-white` : 'opacity-60 hover:opacity-100'}`}
            title="Тільки термінальна консоль"
          >
            <Monitor className="w-3 h-3" />
            <span className="hidden xl:inline">CLI</span>
          </button>
        </div>

        {/* Translation Switcher */}
        <select
          id="select-translation"
          value={translation}
          onChange={(e) => {
            terminalSounds.playKeyClick();
            setTranslation(e.target.value as TranslationMode);
          }}
          aria-label="Вибір перекладу Біблії"
          className={`bg-black/40 border ${currentTheme.border} rounded px-1.5 py-1 text-[11px] font-mono focus:outline-none focus:border-current cursor-pointer`}
        >
          <option value="ukr">🇺🇦 Огієнка (UKR)</option>
          <option value="eng">🇬🇧 KJV (ENG)</option>
          <option value="parallel">⚖️ Паралельно</option>
        </select>

        {/* Theme badge button */}
        <button
          id="btn-toggle-theme"
          onClick={nextTheme}
          className={`px-2 py-1 rounded border ${currentTheme.border} hover:border-current hover:${currentTheme.accentBg} transition flex items-center space-x-1 font-mono text-[11px]`}
          title="Змінити тему термінала"
        >
          <span>🎨</span>
          <span className="hidden sm:inline">{currentTheme.badge}</span>
        </button>

        {/* CRT toggle */}
        <button
          id="btn-toggle-crt"
          onClick={handleCrtToggle}
          className={`p-1 rounded border ${currentTheme.border} ${crtEffect ? currentTheme.accentBg : 'opacity-50'} hover:opacity-100 transition`}
          title={crtEffect ? "Вимкнути CRT scanlines" : "Увімкнути CRT scanlines"}
        >
          <Tv className="w-3.5 h-3.5" />
        </button>

        {/* Sound toggle */}
        <button
          id="btn-toggle-sound"
          onClick={handleSoundToggle}
          className={`p-1 rounded border ${currentTheme.border} ${soundEnabled ? currentTheme.accentBg : 'opacity-50'} hover:opacity-100 transition`}
          title={soundEnabled ? "Вимкнути звук клацання" : "Увімкнути звук клацання"}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>

        {/* Help button */}
        <button
          id="btn-header-help"
          onClick={() => {
            terminalSounds.playKeyClick();
            onOpenHelp();
          }}
          className={`p-1 rounded border ${currentTheme.border} hover:border-current hover:${currentTheme.accentBg} transition`}
          title="Довідка та гарячі клавіші (F1 / help)"
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
