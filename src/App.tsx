import React, { useState, useEffect, useRef } from 'react';
import { BookInfo, Verse, SearchResult } from './types';
import { CANONICAL_BOOKS, findBookByQuery } from './data/canonicalBooks';
import { getChapterVerses, searchBible, getRandomVerse, TranslationType, TRANSLATIONS } from './data/bibleData';
import { terminalSounds } from './services/soundEffects';
import { TypewriterText, MultiLineTypewriter } from './components/TypewriterText';

type Language = 'en' | 'ukr';

type ScreenState = 
  | { type: 'home' }
  | { type: 'bc'; subCategory?: number }
  | { type: 'sc'; subCategory?: number }
  | { type: 'lc' }
  | { type: 'ac' }
  | { type: 'all' }
  | { type: 'testament'; testament: 'OT' | 'NT' }
  | { type: 'book'; book: BookInfo }
  | { type: 'chapter'; book: BookInfo; chapter: number; verse?: number }
  | { type: 'search'; query: string; results: SearchResult[] }
  | { type: 'help' }
  | { type: 'not_found'; command: string };

interface TerminalCommandLineProps {
  language: Language;
  onSubmit: (cmd: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

const TerminalCommandLine: React.FC<TerminalCommandLineProps> = React.memo(({ language, onSubmit, inputRef }) => {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    const cmd = value;
    setValue('');
    onSubmit(cmd);
  };

  return (
    <form 
      onSubmit={handleSubmit}
      onClick={() => inputRef.current?.focus()}
      className="mt-3 pt-2 border-t border-[#00ff41]/40 flex items-center space-x-2 shrink-0 cursor-text"
    >
      <span className="font-bold text-[#00ff41] select-none">&gt;</span>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={() => terminalSounds.playKeyClick()}
        placeholder={language === 'en' ? "Enter command (e.g. bc, sc, lc, ac, ubio, cuv, 43 3 16)..." : "Введіть команду (напр. bc, sc, lc, ac, ubio, cuv, 43 3 16)..."}
        aria-label="Terminal command input"
        className="flex-1 bg-transparent text-[#00ff41] font-mono text-sm md:text-base focus:outline-none placeholder:text-[#00ff41]/30 caret-[#00ff41]"
        autoComplete="off"
        spellCheck="false"
      />
    </form>
  );
});

const OLD_TESTAMENT = CANONICAL_BOOKS.filter(b => b.testament === 'OT');
const NEW_TESTAMENT = CANONICAL_BOOKS.filter(b => b.testament === 'NT');

export default function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [translation, setTranslation] = useState<TranslationType>('ubio');
  const [screen, setScreen] = useState<ScreenState>({ type: 'home' });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [crtEffect, setCrtEffect] = useState(true);
  const [uiScale, setUiScale] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bible_tui_scale');
      if (saved) {
        const val = parseInt(saved, 10);
        if (!isNaN(val) && val >= 70 && val <= 200) return val;
      }
    }
    return 100;
  });
  const [helpFilter, setHelpFilter] = useState('');
  const [highlightKey, setHighlightKey] = useState<number>(Date.now());
  const [lightState, setLightState] = useState<'fade' | 'on' | 'off'>('fade');
  const [screenHistory, setScreenHistory] = useState<ScreenState[]>([]);
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());

  useEffect(() => {
    try {
      localStorage.setItem('bible_tui_scale', uiScale.toString());
    } catch {}
  }, [uiScale]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  
  const inputRef = useRef<HTMLInputElement | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const navigateTo = (nextScreen: ScreenState) => {
    setScreenHistory(prev => {
      const last = prev[prev.length - 1];
      if (last && JSON.stringify(last) === JSON.stringify(screen)) {
        return prev;
      }
      return [...prev.slice(-40), screen];
    });
    setScreen(nextScreen);
  };

  // Helper to detect mobile / touch devices to prevent annoying virtual keyboard popups
  const isMobileOrTouch = () => {
    if (typeof window === 'undefined') return false;
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia('(max-width: 768px)').matches ||
      window.matchMedia('(pointer: coarse)').matches
    );
  };

  // Auto focus input on desktop screen change
  useEffect(() => {
    if (!isMobileOrTouch()) {
      inputRef.current?.focus();
    }
  }, [screen]);

  useEffect(() => {
    if (!isMobileOrTouch()) {
      inputRef.current?.focus();
    }

    const handleWindowFocus = () => {
      if (!isMobileOrTouch()) {
        inputRef.current?.focus();
      }
    };

    window.addEventListener('focus', handleWindowFocus);

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ignore if mobile / touch device
      if (isMobileOrTouch()) return;
      // Don't intercept shortcut modifier combinations
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'Tab') return;

      if (document.activeElement !== inputRef.current) {
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, []);

  // Scroll to top on screen change
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [screen, highlightKey]);

  const handleCommand = (rawCmd: string) => {
    if (!rawCmd.trim()) return;

    const cmd = rawCmd.trim();
    terminalSounds.playCommandExec();

    const lower = cmd.toLowerCase();

    // Home command
    if (lower === 'home' || lower === 'menu' || lower === 'main' || lower === 'головна' || lower === 'зміст') {
      navigateTo({ type: 'home' });
      return;
    }

    // Language commands: lc / language
    if (lower === 'lc' || lower === 'language' || lower === 'мова' || lower === 'мовні') {
      navigateTo({ type: 'lc' });
      return;
    }

    // All commands: ac / all commands / commands
    if (lower === 'ac' || lower === 'commands' || lower === 'all commands' || lower === 'всі команди' || lower === 'команди') {
      navigateTo({ type: 'ac' });
      return;
    }

    // Translation switch: ubio (Ivan Ohienko Translation)
    if (lower === 'ubio' || lower === 'убіо' || lower === 'ogienko' || lower === 'огієнко') {
      setTranslation('ubio');
      if (screen.type === 'search') {
        const results = searchBible(screen.query, { translation: 'ubio' });
        setScreen({ type: 'search', query: screen.query, results });
      }
      return;
    }

    // Translation switch: cuv (Contemporary Ukrainian Version)
    if (lower === 'cuv' || lower === 'цув' || lower === 'кув' || lower === 'сучасний' || lower === 'contemporary') {
      setTranslation('cuv');
      if (screen.type === 'search') {
        const results = searchBible(screen.query, { translation: 'cuv' });
        setScreen({ type: 'search', query: screen.query, results });
      }
      return;
    }

    // Language switch: eng / en
    if (lower === 'eng' || lower === 'en' || lower === 'english' || lower === 'англ' || lower === 'англійська') {
      setLanguage('en');
      return;
    }

    // Language switch: ukr / uk / ua
    if (lower === 'ukr' || lower === 'uk' || lower === 'ua' || lower === 'ukrainian' || lower === 'укр' || lower === 'українська') {
      setLanguage('ukr');
      return;
    }

    // Selecting language / translation inside lc screen
    if (screen.type === 'lc') {
      if (lower === '1' || lower === '[1]' || lower === 'eng' || lower === 'en') {
        setLanguage('en');
        return;
      }
      if (lower === '2' || lower === '[2]' || lower === 'ukr' || lower === 'uk' || lower === 'ua') {
        setLanguage('ukr');
        return;
      }
      if (lower === '3' || lower === '[3]' || lower === 'ubio' || lower === 'убіо') {
        setTranslation('ubio');
        return;
      }
      if (lower === '4' || lower === '[4]' || lower === 'cuv' || lower === 'цув' || lower === 'кув') {
        setTranslation('cuv');
        return;
      }
    }

    // Back window command: bw / back window / backwindow / b w / prev window / попереднє вікно / вікно назад / пв / back / назад / q
    if (
      lower === 'bw' || lower === 'b w' || lower === 'back window' || lower === 'backwindow' ||
      lower === 'prev window' || lower === 'prevwindow' || lower === 'pw' ||
      lower === 'попереднє вікно' || lower === 'вікно назад' || lower === 'пв' ||
      lower === 'back' || lower === 'назад' || lower === 'q'
    ) {
      if (screenHistory.length > 0) {
        const prevScreen = screenHistory[screenHistory.length - 1];
        setScreenHistory(prev => prev.slice(0, -1));
        setScreen(prevScreen);
      } else {
        if (screen.type === 'chapter') {
          setScreen({ type: 'book', book: screen.book });
        } else if (screen.type === 'book') {
          setScreen({ type: 'all' });
        } else if (screen.type === 'bc' && screen.subCategory) {
          setScreen({ type: 'bc' });
        } else if (screen.type === 'sc' && screen.subCategory) {
          setScreen({ type: 'sc' });
        } else {
          setScreen({ type: 'home' });
        }
      }
      return;
    }

    // Bible commands: bc [1..4]
    const bcMatch = lower.match(/^bc(?:\s*\[?(\d+)\]?)?$/);
    if (bcMatch || lower === 'bible' || lower === 'бк') {
      const sub = bcMatch && bcMatch[1] ? parseInt(bcMatch[1], 10) : undefined;
      navigateTo({ type: 'bc', subCategory: sub && sub >= 1 && sub <= 4 ? sub : undefined });
      return;
    }

    // Settings commands: sc [1..2]
    const scMatch = lower.match(/^sc(?:\s*\[?(\d+)\]?)?$/);
    if (scMatch || lower === 'settings' || lower === 'ск') {
      const sub = scMatch && scMatch[1] ? parseInt(scMatch[1], 10) : undefined;
      navigateTo({ type: 'sc', subCategory: sub && sub >= 1 && sub <= 2 ? sub : undefined });
      return;
    }

    // Selecting result inside search screen: e.g. "1", "[1]", "2", etc.
    if (screen.type === 'search') {
      const numMatch = lower.match(/^\[?(\d+)\]?$/);
      if (numMatch) {
        const idx = parseInt(numMatch[1], 10) - 1;
        if (idx >= 0 && idx < screen.results.length) {
          const matchResult = screen.results[idx];
          const foundBook = CANONICAL_BOOKS.find(b => b.id === matchResult.bookId);
          if (foundBook) {
            setLightState('fade');
            setHighlightKey(Date.now());
            navigateTo({
              type: 'chapter',
              book: foundBook,
              chapter: matchResult.chapter,
              verse: matchResult.verse
            });
            return;
          }
        }
      }
    }

    // Selecting subcategory in bc screen: 1, 2, 3, 4 (or [1], [2], [3], [4])
    if (screen.type === 'bc') {
      const numMatch = lower.match(/^\[?([1-4])\]?$/);
      if (numMatch) {
        navigateTo({ type: 'bc', subCategory: parseInt(numMatch[1], 10) });
        return;
      }
    }

    // Selecting subcategory in sc screen: 1, 2 (or [1], [2])
    if (screen.type === 'sc') {
      const numMatch = lower.match(/^\[?([1-2])\]?$/);
      if (numMatch) {
        navigateTo({ type: 'sc', subCategory: parseInt(numMatch[1], 10) });
        return;
      }
    }

    // All books list: all / books / list / catalogue
    if (lower === 'all' || lower === 'books' || lower === 'list' || lower === 'каталог' || lower === 'книги' || lower === 'всі') {
      navigateTo({ type: 'all' });
      return;
    }

    // Old Testament command: old / ot / сз / старий
    if (lower === 'old' || lower === 'ot' || lower === 'сз' || lower === 'старий' || lower === 'старий заповіт') {
      navigateTo({ type: 'testament', testament: 'OT' });
      return;
    }

    // New Testament command: new / nt / нз / новий
    if (lower === 'new' || lower === 'nt' || lower === 'нз' || lower === 'новий' || lower === 'новий заповіт') {
      navigateTo({ type: 'testament', testament: 'NT' });
      return;
    }

    // Reset terminal: res / reset / cls / clear
    if (lower === 'res' || lower === 'reset' || lower === 'cls' || lower === 'clear' || lower === 'скинути' || lower === 'рестарт') {
      setHelpFilter('');
      setHighlightKey(Date.now());
      setLightState('fade');
      setScreenHistory([]);
      setScreen({ type: 'home' });
      if (contentRef.current) {
        contentRef.current.scrollTop = 0;
      }
      return;
    }

    // Help
    if (lower === 'help' || lower === '?' || lower === 'довідка' || lower === 'man') {
      navigateTo({ type: 'help' });
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

    // UI Scale / Font Size Increase: +, ++, +++, +1, zoom +, scale +, font +, збільшити, більше
    if (/^(\+{1,3}|\+1|\+2|zoom\s*\+|scale\s*\+|font\s*\+|zoom\s*in|zoomin|scale\s*up|scaleup|збільшити|більше)$/i.test(lower)) {
      setUiScale(prev => Math.min(prev + 10, 200));
      return;
    }

    // UI Scale / Font Size Decrease: -, --, ---, -1, zoom -, scale -, font -, зменшити, менше
    if (/^(\-{1,3}|\-1|\-2|zoom\s*\-|scale\s*\-|font\s*\-|zoom\s*out|zoomout|scale\s*down|scaledown|зменшити|менше)$/i.test(lower)) {
      setUiScale(prev => Math.max(prev - 10, 70));
      return;
    }

    // UI Scale Reset: 0, zoom 0, zoom 100, scale 100, zoom reset, scale reset
    if (/^(0|zoom\s*0|zoom\s*100|zoom\s*100%|zoom\s*reset|scale\s*0|scale\s*100|scale\s*reset|font\s*reset|скинути\s*масштаб)$/i.test(lower)) {
      setUiScale(100);
      return;
    }

    // Explicit scale percentage: e.g. "zoom 120", "scale 90"
    const zoomValMatch = lower.match(/^(?:zoom|scale|font|масштаб)\s*(\d{2,3})%?$/i);
    if (zoomValMatch) {
      const val = parseInt(zoomValMatch[1], 10);
      if (val >= 60 && val <= 250) {
        setUiScale(val);
        return;
      }
    }

    // Manual light ON: light on; lighton; lton; lt on; light-on; lt-on; lon
    const isLightOn = /^(?:light\s*on|lighton|lton|lt\s*on|light-on|lt-on|lon|світло\s*(?:увімк|вкл|вмк|он)|підсвітка\s*(?:вкл|увімк)|підсвічування\s*(?:вкл|увімк)|(?:вкл|увімк)\s*світло)$/i.test(lower);

    // Manual light OFF: light off; lightoff; ltoff; lt off; light-off; lt-off; loff
    const isLightOff = /^(?:light\s*off|lightoff|ltoff|lt\s*off|light-off|lt-off|loff|світло\s*(?:вимк|викл|оф)|підсвітка\s*(?:вимк|викл)|підсвічування\s*(?:вимк|викл)|(?:вимк|викл)\s*світло)$/i.test(lower);

    // Light ON with verse: e.g. "light on 16", "lighton 16", "lton 16", "lt on 16"
    const lightOnVerseMatch = lower.match(/^(?:light\s*on|lighton|lton|lt\s*on|light-on|lt-on|lon|світло\s*(?:увімк|вкл|вмк)|підсвітка\s*(?:вкл|увімк))\s+(\d+)$/i);

    // Light OFF with verse: e.g. "light off 16", "ltoff 16"
    const lightOffVerseMatch = lower.match(/^(?:light\s*off|lightoff|ltoff|lt\s*off|light-off|lt-off|loff|світло\s*(?:вимк|викл)|підсвітка\s*(?:вимк|викл))\s+(\d+)$/i);

    if (isLightOn || lightOnVerseMatch) {
      setLightState('on');
      setHighlightKey(Date.now());
      if (screen.type === 'chapter') {
        const targetVerse = lightOnVerseMatch ? parseInt(lightOnVerseMatch[1], 10) : undefined;
        if (targetVerse !== undefined) {
          const currentVerses = getChapterVerses(screen.book, screen.chapter, translation);
          if (targetVerse >= 1 && targetVerse <= currentVerses.length) {
            setScreen({ type: 'chapter', book: screen.book, chapter: screen.chapter, verse: targetVerse });
          }
        } else if (screen.verse === undefined) {
          setScreen({ type: 'chapter', book: screen.book, chapter: screen.chapter, verse: 1 });
        }
      }
      return;
    }

    if (isLightOff || lightOffVerseMatch) {
      setLightState('off');
      setHighlightKey(Date.now());
      return;
    }

    // Light toggle: "light" or "lt" or "світло"
    if (lower === 'light' || lower === 'lt' || lower === 'світло' || lower === 'підсвітка') {
      const nextState = lightState === 'on' ? 'off' : 'on';
      setLightState(nextState);
      setHighlightKey(Date.now());
      if (nextState === 'on' && screen.type === 'chapter' && screen.verse === undefined) {
        setScreen({ type: 'chapter', book: screen.book, chapter: screen.chapter, verse: 1 });
      }
      return;
    }

    // Random verse
    if (lower === 'random' || lower === 'вірш' || lower === 'daily') {
      const rand = getRandomVerse(translation);
      const b = CANONICAL_BOOKS.find(item => item.id === rand.bookId) || CANONICAL_BOOKS[0];
      setLightState('fade');
      setHighlightKey(Date.now());
      navigateTo({ type: 'chapter', book: b, chapter: rand.chapter, verse: rand.verse });
      return;
    }

    // Progressive / context-aware input when already viewing a chapter:
    if (screen.type === 'chapter') {
      // Toggle full chapter reading mode
      if (lower === 'ch' || lower === 'chapter' || lower === 'розділ' || lower === 'глава') {
        if (screen.verse !== undefined) {
          navigateTo({ type: 'chapter', book: screen.book, chapter: screen.chapter });
          return;
        }
      }

      // 1) "ch:v" or "ch v" inside current book
      const chVerseMatch = cmd.match(/^(\d+)[\s:.]+(\d+)$/);
      if (chVerseMatch) {
        const ch = parseInt(chVerseMatch[1], 10);
        const v = parseInt(chVerseMatch[2], 10);
        if (ch >= 1 && ch <= screen.book.chaptersCount) {
          setLightState('fade');
          setHighlightKey(Date.now());
          navigateTo({ type: 'chapter', book: screen.book, chapter: ch, verse: v });
          return;
        }
      }

      // 2) Single number entered while reading chapter:
      // e.g. "16" -> jump to verse 16 of current chapter!
      const singleNum = parseInt(cmd, 10);
      if (!isNaN(singleNum) && cmd.trim() === singleNum.toString()) {
        const currentVerses = getChapterVerses(screen.book, screen.chapter, translation);
        if (singleNum >= 1 && singleNum <= currentVerses.length) {
          setLightState('fade');
          setHighlightKey(Date.now());
          navigateTo({ type: 'chapter', book: screen.book, chapter: screen.chapter, verse: singleNum });
          return;
        }
        // If number exceeds verse count, but matches a chapter in current book:
        if (singleNum >= 1 && singleNum <= screen.book.chaptersCount) {
          navigateTo({ type: 'chapter', book: screen.book, chapter: singleNum });
          return;
        }
      }
    }

    // 1. Pure numeric input: "<book_num> <chapter_num> <verse_num>" (e.g. "43 3 16", "1 1 1", "43:3:16", "43.3.16")
    const numTripleMatch = cmd.match(/^(\d{1,2})[\s:.]+(\d+)[\s:.]+(\d+)$/);
    if (numTripleMatch) {
      const bookNum = parseInt(numTripleMatch[1], 10);
      const chNum = parseInt(numTripleMatch[2], 10);
      const vNum = parseInt(numTripleMatch[3], 10);
      const foundBook = CANONICAL_BOOKS.find(b => b.number === bookNum);
      if (foundBook) {
        const validCh = Math.min(Math.max(1, chNum), foundBook.chaptersCount);
        setLightState('fade');
        setHighlightKey(Date.now());
        navigateTo({ type: 'chapter', book: foundBook, chapter: validCh, verse: vNum });
        return;
      }
    }

    // 2. Two numbers: "<book_num> <chapter_num>" (e.g. "43 3", "1 1", "19 23", "43:3")
    const numDoubleMatch = cmd.match(/^(\d{1,2})[\s:.]+(\d+)$/);
    if (numDoubleMatch) {
      const bookNum = parseInt(numDoubleMatch[1], 10);
      const chNum = parseInt(numDoubleMatch[2], 10);
      const foundBook = CANONICAL_BOOKS.find(b => b.number === bookNum);
      if (foundBook) {
        const validCh = Math.min(Math.max(1, chNum), foundBook.chaptersCount);
        navigateTo({ type: 'chapter', book: foundBook, chapter: validCh });
        return;
      }
    }

    // If currently in a book screen and user entered chapter or chapter + verse (e.g. "3" or "3 16" or "3:16")
    if (screen.type === 'book') {
      const chVerseMatch = cmd.match(/^(\d+)[\s:.]+(\d+)$/);
      if (chVerseMatch) {
        const ch = parseInt(chVerseMatch[1], 10);
        const v = parseInt(chVerseMatch[2], 10);
        if (ch >= 1 && ch <= screen.book.chaptersCount) {
          setLightState('fade');
          setHighlightKey(Date.now());
          navigateTo({ type: 'chapter', book: screen.book, chapter: ch, verse: v });
          return;
        }
      }
      const num = parseInt(cmd, 10);
      if (!isNaN(num) && num >= 1 && num <= screen.book.chaptersCount) {
        navigateTo({ type: 'chapter', book: screen.book, chapter: num });
        return;
      }
    }

    // Next / Prev chapter or verse while reading
    if (screen.type === 'chapter') {
      if (lower === 'next' || lower === 'n' || lower === 'далі') {
        if (screen.verse !== undefined) {
          setLightState('fade');
          setHighlightKey(Date.now());
          const currentVerses = getChapterVerses(screen.book, screen.chapter, translation);
          if (screen.verse < currentVerses.length) {
            navigateTo({ type: 'chapter', book: screen.book, chapter: screen.chapter, verse: screen.verse + 1 });
          } else if (screen.chapter < screen.book.chaptersCount) {
            navigateTo({ type: 'chapter', book: screen.book, chapter: screen.chapter + 1, verse: 1 });
          } else {
            const nextB = CANONICAL_BOOKS.find(b => b.number === screen.book.number + 1);
            if (nextB) navigateTo({ type: 'chapter', book: nextB, chapter: 1, verse: 1 });
          }
          return;
        }

        if (screen.chapter < screen.book.chaptersCount) {
          navigateTo({ type: 'chapter', book: screen.book, chapter: screen.chapter + 1 });
        } else {
          const nextB = CANONICAL_BOOKS.find(b => b.number === screen.book.number + 1);
          if (nextB) navigateTo({ type: 'chapter', book: nextB, chapter: 1 });
        }
        return;
      }
      if (lower === 'prev' || lower === 'p' || lower === 'попередня') {
        if (screen.verse !== undefined) {
          setLightState('fade');
          setHighlightKey(Date.now());
          if (screen.verse > 1) {
            navigateTo({ type: 'chapter', book: screen.book, chapter: screen.chapter, verse: screen.verse - 1 });
          } else if (screen.chapter > 1) {
            const prevChVerses = getChapterVerses(screen.book, screen.chapter - 1, translation);
            navigateTo({ type: 'chapter', book: screen.book, chapter: screen.chapter - 1, verse: prevChVerses.length });
          } else {
            const prevB = CANONICAL_BOOKS.find(b => b.number === screen.book.number - 1);
            if (prevB) {
              const lastChVerses = getChapterVerses(prevB, prevB.chaptersCount, translation);
              navigateTo({ type: 'chapter', book: prevB, chapter: prevB.chaptersCount, verse: lastChVerses.length });
            }
          }
          return;
        }

        if (screen.chapter > 1) {
          navigateTo({ type: 'chapter', book: screen.book, chapter: screen.chapter - 1 });
        } else {
          const prevB = CANONICAL_BOOKS.find(b => b.number === screen.book.number - 1);
          if (prevB) navigateTo({ type: 'chapter', book: prevB, chapter: prevB.chaptersCount });
        }
        return;
      }
    }

    // Search command variants:
    // 1. Standalone search trigger: search, пошук, знайти, find, шукати, шукай, /
    if (/^(?:search|пошук|знайти|find|шукати|шукай|\/)$/i.test(lower)) {
      navigateTo({ type: 'search', query: '', results: [] });
      return;
    }

    // 2. Search with arguments:
    // "search <text>", "пошук <text>", "знайти <text>", "find <text>", "шукати <text>", "/ <text>", "/<text>", "? <text>", "?<text>", "s <text>"
    const searchPrefixMatch = cmd.match(/^(?:search|пошук|знайти|find|шукати|шукай|s)[\s:=]+(.+)$/i) ||
      cmd.match(/^[\/?](.+)$/);
    if (searchPrefixMatch) {
      const q = searchPrefixMatch[1].trim();
      if (q) {
        const results = searchBible(q, { translation });
        navigateTo({ type: 'search', query: q, results });
        return;
      }
    }

    // Direct reference match with book name (e.g. "1 сам 2 3", "Івана 3 16", "Буття 1 1", "John 3:16", "Пс 23:1", "Rom 8:28")
    const match = cmd.match(/^([\d\s\p{L}'-]+?)\s+(\d+)(?:[\s:.]+(\d+))?$/iu);
    if (match) {
      const bQuery = match[1].trim();
      const chNum = parseInt(match[2], 10);
      const vNum = match[3] ? parseInt(match[3], 10) : undefined;
      const foundBook = findBookByQuery(bQuery);
      if (foundBook) {
        const validCh = Math.min(Math.max(1, chNum), foundBook.chaptersCount);
        if (vNum) {
          setLightState('fade');
          setHighlightKey(Date.now());
        }
        navigateTo({ type: 'chapter', book: foundBook, chapter: validCh, verse: vNum });
        return;
      }
    }

    // Book name or book number only match (e.g. "43", "1", "Буття", "Матвія", "Псалми")
    const foundBook = findBookByQuery(cmd);
    if (foundBook) {
      navigateTo({ type: 'book', book: foundBook });
      return;
    }

    // Auto-search fallback:
    // If the input is a word/phrase with at least 2 characters and doesn't match any system command:
    const cleanWord = cmd.trim();
    if (cleanWord.length >= 2 && !/^\d+$/.test(cleanWord)) {
      const results = searchBible(cleanWord, { translation });
      if (results.length > 0) {
        navigateTo({ type: 'search', query: cleanWord, results });
        return;
      }
    }

    // Fallback: Command does not exist
    navigateTo({ type: 'not_found', command: cmd });
  };

  const filteredOT = React.useMemo(() => {
    if (!helpFilter.trim()) return OLD_TESTAMENT;
    const q = helpFilter.trim().toLowerCase();
    return OLD_TESTAMENT.filter(b => 
      b.number.toString() === q ||
      b.nameUkr.toLowerCase().includes(q) ||
      b.nameEng.toLowerCase().includes(q) ||
      b.shortUkr.toLowerCase().includes(q) ||
      b.shortEng.toLowerCase().includes(q) ||
      b.aliases.some(a => a.toLowerCase().includes(q))
    );
  }, [helpFilter]);

  const filteredNT = React.useMemo(() => {
    if (!helpFilter.trim()) return NEW_TESTAMENT;
    const q = helpFilter.trim().toLowerCase();
    return NEW_TESTAMENT.filter(b => 
      b.number.toString() === q ||
      b.nameUkr.toLowerCase().includes(q) ||
      b.nameEng.toLowerCase().includes(q) ||
      b.shortUkr.toLowerCase().includes(q) ||
      b.shortEng.toLowerCase().includes(q) ||
      b.aliases.some(a => a.toLowerCase().includes(q))
    );
  }, [helpFilter]);

  const formatDateTime = (date: Date, lang: Language) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');

    if (lang === 'ukr') {
      return `${dd}.${mm}.${yyyy} ${hh}:${min}:${ss}`;
    }
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
  };

  return (
    <div 
      style={{ fontSize: `${uiScale}%` }}
      className={`h-screen w-screen bg-black text-[#00ff41] font-mono select-none flex flex-col justify-between p-4 md:p-8 overflow-hidden text-sm md:text-base transition-[font-size] duration-150 ${crtEffect ? 'crt-overlay crt-vignette crt-bloom-green' : ''}`}
      onClick={() => {
        if (!isMobileOrTouch()) {
          inputRef.current?.focus();
        }
      }}
    >
      {/* Top Header & Terminal Status Bar (Pure text terminal, no buttons) */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#00ff41]/30 pb-2 mb-3 text-xs md:text-sm shrink-0 gap-2">
        <div className="font-bold tracking-widest uppercase flex items-center space-x-2">
          <span>{language === 'en' ? 'THE HOLY BIBLE' : 'THE HOLY BIBLE // СВЯТА БІБЛІЯ'}</span>
          <span className="text-[10px] opacity-70 border border-[#00ff41]/40 px-1 py-0.5">
            [{language.toUpperCase()} // {translation.toUpperCase()}{uiScale !== 100 ? ` // ${uiScale}%` : ''}]
          </span>
        </div>
        <div className="opacity-90 font-mono text-xs flex items-center space-x-2 tracking-wider">
          <span className="text-[#00ff41]">{formatDateTime(currentTime, language)}</span>
        </div>
      </div>

      {/* Main Terminal Screen Body */}
      <div 
        ref={contentRef}
        className="flex-1 overflow-y-auto pr-2 space-y-4 min-h-0 select-text leading-relaxed"
      >
        {/* ================= SCREEN: COMMAND NOT FOUND ================= */}
        {screen.type === 'not_found' && (
          <div className="py-6 select-text space-y-2">
            <MultiLineTypewriter
              key={`screen-notfound-${screen.command}-${language}`}
              speed={36}
              chunkSize={1}
              lines={[
                {
                  id: 'err-1',
                  text: language === 'en' ? 'This command does not exist.' : 'Ця команда не існує.',
                },
                {
                  id: 'err-2',
                  text: language === 'en' ? 'All Commands: ' : 'Список всіх команд: ',
                  suffix: <span className="font-bold text-[#00ff41]">ac</span>
                },
                {
                  id: 'err-3',
                  text: language === 'en' ? 'Previous Window: ' : 'Попереднє вікно: ',
                  suffix: <span className="font-bold text-[#00ff41]">bw</span>
                }
              ]}
            />
          </div>
        )}

        {/* ================= SCREEN 1: HOME (MINIMALIST 4 LINES WITH TYPEWRITER) ================= */}
        {screen.type === 'home' && (
          <div className="py-6 select-text">
            <MultiLineTypewriter
              key={`screen-home-${language}`}
              speed={40}
              chunkSize={1}
              lines={[
                {
                  id: 'this-page',
                  text: 'This page: ',
                  suffix: <span className="font-bold text-[#00ff41]">home</span>,
                  className: 'pb-4 opacity-75'
                },
                {
                  id: 'bc',
                  text: language === 'en' ? 'Bible Commands: ' : 'Команди для Біблії: ',
                  suffix: <span className="font-bold text-[#00ff41]">bc</span>
                },
                {
                  id: 'sc',
                  text: language === 'en' ? 'Settings Commands: ' : 'Команди для налаштування: ',
                  suffix: <span className="font-bold text-[#00ff41]">sc</span>
                },
                {
                  id: 'lc',
                  text: language === 'en' ? 'Language Commands: ' : 'Команди для мови: ',
                  suffix: <span className="font-bold text-[#00ff41]">lc</span>
                },
                {
                  id: 'ac',
                  text: language === 'en' ? 'All Commands: ' : 'Список всіх команд: ',
                  suffix: <span className="font-bold text-[#00ff41]">ac</span>
                }
              ]}
            />
          </div>
        )}

        {/* ================= SCREEN: LANGUAGE & TRANSLATIONS (lc WITH TYPEWRITER) ================= */}
        {screen.type === 'lc' && (
          <div className="py-6 select-text">
            <MultiLineTypewriter
              key={`screen-lc-${language}-${translation}`}
              speed={36}
              chunkSize={1}
              lines={[
                {
                  id: 'eng',
                  text: language === 'en' ? 'English language: ' : 'Англійська мова: ',
                  suffix: (
                    <span className={`font-bold ${language === 'en' ? 'text-[#00ff41] bg-[#00ff41]/20 px-1' : 'text-[#00ff41]'}`}>
                      eng {language === 'en' ? '[ACTIVE]' : ''}
                    </span>
                  )
                },
                {
                  id: 'ukr',
                  text: language === 'en' ? 'Ukrainian language: ' : 'Українська мова: ',
                  suffix: (
                    <span className={`font-bold ${language === 'ukr' ? 'text-[#00ff41] bg-[#00ff41]/20 px-1' : 'text-[#00ff41]'}`}>
                      ukr {language === 'ukr' ? '[ACTIVE]' : ''}
                    </span>
                  )
                },
                {
                  id: 'ubio',
                  text: language === 'en' ? 'Ukrainian Bible (Ohienko, 1962): ' : 'Переклад Івана Огієнка (1962): ',
                  suffix: (
                    <span className={`font-bold ${translation === 'ubio' ? 'text-[#00ff41] bg-[#00ff41]/20 px-1' : 'text-[#00ff41]'}`}>
                      ubio {translation === 'ubio' ? '[ACTIVE]' : ''}
                    </span>
                  )
                },
                {
                  id: 'cuv',
                  text: language === 'en' ? 'Contemporary Ukrainian Version: ' : 'Сучасний український переклад: ',
                  suffix: (
                    <span className={`font-bold ${translation === 'cuv' ? 'text-[#00ff41] bg-[#00ff41]/20 px-1' : 'text-[#00ff41]'}`}>
                      cuv {translation === 'cuv' ? '[ACTIVE]' : ''}
                    </span>
                  )
                }
              ]}
            />
          </div>
        )}

        {/* ================= SCREEN: ALL COMMANDS (ac WITH TYPEWRITER) ================= */}
        {screen.type === 'ac' && (
          <div className="py-4 space-y-3 select-text font-mono">
            <div className="border-b border-[#00ff41]/30 pb-2 flex items-center justify-between">
              <div className="font-bold text-sm md:text-base uppercase tracking-wider">
                <TypewriterText text={language === 'en' ? "ALL COMMANDS (A-Z)" : "СПИСОК ВСІХ КОМАНД (A-Z)"} speed={32} />
              </div>
              <div className="text-xs opacity-75 font-mono">
                {language === 'en' ? '[type `home` to return]' : '[введіть `home` для повернення]'}
              </div>
            </div>

            <MultiLineTypewriter
              key={`screen-ac-list-${language}`}
              speed={20}
              chunkSize={2}
              lines={language === 'en' ? [
                { id: 'zoom-in', text: '+ - Increase UI terminal interface scale and font size (alias: zoom +, scale +)' },
                { id: 'zoom-out', text: '- - Decrease UI terminal interface scale and font size (alias: zoom -, scale -)' },
                { id: 'zoom-reset', text: '0 - Reset UI terminal scale back to 100% default (alias: zoom 100, scale reset)' },
                { id: 'ac', text: 'ac - View all available terminal commands in alphabetical order' },
                { id: 'all', text: 'all - List all 66 canonical books of the Bible (alias: books)' },
                { id: 'back', text: 'back - Navigate back to the previous screen or menu (alias: q)' },
                { id: 'bc', text: 'bc - View Bible commands and navigation categories ([1]-[4])' },
                { id: 'bc14', text: 'bc <1-4> - Jump directly to Bible commands sub-category (1, 2, 3, 4)' },
                { id: 'bw', text: 'bw - Return to previous window / screen (alias: back, back window, q)' },
                { id: 'ch', text: 'ch - Read full chapter when viewing an individual verse (alias: chapter)' },
                { id: 'cls', text: 'cls - Clear and reset terminal screen (alias: res, reset, clear)' },
                { id: 'crt', text: 'crt - Toggle CRT scanlines and phosphor bloom visual effect' },
                { id: 'cuv', text: 'cuv - Switch Bible translation to Contemporary Ukrainian Version (CUV)' },
                { id: 'eng', text: 'eng - Switch terminal interface language to English (alias: en)' },
                { id: 'help', text: 'help - View complete index of all 66 book numbers, abbreviations and aliases (alias: man)' },
                { id: 'home', text: 'home - Return to the main minimalist home screen (alias: menu)' },
                { id: 'lc', text: 'lc - View interface language and translation selection commands' },
                { id: 'light-on', text: 'light on - Turn ON verse highlight (alias: lighton, lton, lt on)' },
                { id: 'light-off', text: 'light off - Turn OFF verse highlight (alias: lightoff, ltoff, lt off)' },
                { id: 'new', text: 'new - List 27 books of the New Testament (books #40 - #66, alias: nt)' },
                { id: 'next', text: 'next - Read next chapter or next verse (alias: n)' },
                { id: 'old', text: 'old - List 39 books of the Old Testament (books #01 - #39, alias: ot)' },
                { id: 'prev', text: 'prev - Read previous chapter or previous verse (alias: p)' },
                { id: 'random', text: 'random - Fetch a random inspirational Scripture verse (alias: rand)' },
                { id: 'res', text: 'res - Reset terminal screen and clear state' },
                { id: 'sc', text: 'sc - View settings and terminal options categories ([1]-[2])' },
                { id: 'sc12', text: 'sc <1-2> - Jump directly to Settings sub-category (1, 2)' },
                { id: 'search', text: 'search <query> - Search Scripture for text or phrases (alias: search, find, / <query>, or simply type word)' },
                { id: 'sound', text: 'sound - Toggle keyboard typing sound effects on or off' },
                { id: 'ubio', text: 'ubio - Switch Bible translation to Ivan Ohienko (UBIO, 1962)' },
                { id: 'ukr', text: 'ukr - Switch terminal interface language to Ukrainian (alias: ua, uk)' },
                { id: 'num-b', text: '<book#> - Select chapter for book number (e.g. 43 for John, 1 for Genesis)' },
                { id: 'num-bc', text: '<book#> <ch> - Open specific chapter (e.g. 43 3 for John 3, 1 1 for Genesis 1)' },
                { id: 'num-bcv', text: '<book#> <ch> <v> - Direct jump to verse (e.g. 43 3 16, 1 1 1, 19 23 1)' },
                { id: 'prog', text: 'Progressive Jump - Sequential navigation by typing book -> chapter -> verse' },
                { id: 'name-jump', text: '<name> <ch>[:<v>] - Jump by English/Ukrainian book name (e.g. john 3:16, gen 1:1, ps 23:1)' },
              ] : [
                { id: 'zoom-in', text: '+ - Збільшити масштаб інтерфейсу та розмір шрифту (синоніми: zoom +, scale +)' },
                { id: 'zoom-out', text: '- - Зменшити масштаб інтерфейсу та розмір шрифту (синоніми: zoom -, scale -)' },
                { id: 'zoom-reset', text: '0 - Скинути масштаб інтерфейсу до 100% за замовчуванням (синоніми: zoom 100, scale 100)' },
                { id: 'ac', text: 'ac - Список усіх команд терміналу за алфавітом' },
                { id: 'all', text: 'all - Список усіх 66 канонічних книг Біблії (синонім: books)' },
                { id: 'back', text: 'back - Повернутися до попереднього екрана або меню (синонім: q)' },
                { id: 'bc', text: 'bc - Переглянути категорії команд для Біблії ([1]-[4])' },
                { id: 'bc14', text: 'bc <1-4> - Прямий перехід до підкатегорії команд для Біблії (1, 2, 3, 4)' },
                { id: 'bw', text: 'bw - Повернутися до попереднього вікна / екрана (синоніми: back, назад, пв)' },
                { id: 'ch', text: 'ch - Читати всю главу цілком при перегляді окремого вірша (синонім: chapter)' },
                { id: 'cls', text: 'cls - Очистити екран та скинути стан (синоніми: res, reset, clear)' },
                { id: 'crt', text: 'crt - Перемикання CRT ефекту та світіння' },
                { id: 'cuv', text: 'cuv - Перемкнути переклад на Сучасний український (CUV)' },
                { id: 'eng', text: 'eng - Перемкнути мову інтерфейсу на англійську (синонім: en)' },
                { id: 'help', text: 'help - Повний довідник номерів, назв та скорочень 66 книг (синонім: man)' },
                { id: 'home', text: 'home - Повернутися на головний мінімалістичний екран (синонім: menu)' },
                { id: 'lc', text: 'lc - Переглянути команди вибору мови та перекладів' },
                { id: 'light-on', text: 'light on - Увімкнути підсвічування вірша (синоніми: lighton, lton, lt on)' },
                { id: 'light-off', text: 'light off - Вимкнути підсвічування вірша (синоніми: lightoff, ltoff, lt off)' },
                { id: 'new', text: 'new - Список 27 книг Нового Заповіту (книги №40 - №66, синонім: nt)' },
                { id: 'next', text: 'next - Читати наступний розділ або наступний вірш (синонім: n)' },
                { id: 'old', text: 'old - Список 39 книг Старого Заповіту (книги №01 - №39, синонім: ot)' },
                { id: 'prev', text: 'prev - Читати попередній розділ або попередній вірш (синонім: p)' },
                { id: 'random', text: 'random - Випадковий надихаючий вірш з Біблії (синонім: rand)' },
                { id: 'res', text: 'res - Скинути стан термінала до початкового' },
                { id: 'sc', text: 'sc - Переглянути категорії налаштувань термінала ([1]-[2])' },
                { id: 'sc12', text: 'sc <1-2> - Прямий перехід до підкатегорії налаштувань (1, 2)' },
                { id: 'search', text: 'search <запит> - Пошук тексту або слів у Біблії (синоніми: пошук, знайти, / <слово>, або просто ввести слово)' },
                { id: 'sound', text: 'sound - Перемикання звукових ефектів клавіатури' },
                { id: 'ubio', text: 'ubio - Перемкнути переклад на Івана Огієнка (UBIO, 1962)' },
                { id: 'ukr', text: 'ukr - Перемкнути мову інтерфейсу на українську (синоніми: ua, uk)' },
                { id: 'num-b', text: '<номер_книги> - Вибрати главу для книги (напр. 43 для Івана, 1 для Буття)' },
                { id: 'num-bc', text: '<книга#> <гл> - Відкрити конкретну главу (напр. 43 3 для Івана 3, 1 1 для Буття 1)' },
                { id: 'num-bcv', text: '<книга#> <гл> <вірш> - Прямий перехід до вірша (напр. 43 3 16, 1 1 1, 19 23 1)' },
                { id: 'prog', text: 'Поетапний перехід - Послідовна навігація: книга -> глава -> вірш (43 ↵ 3 ↵ 16 ↵)' },
                { id: 'name-jump', text: '<назва> <гл>[:<вірш>] - Перехід за назвою книги (напр. івана 3:16, бут 1:1, ps 23:1)' },
              ]}
            />
          </div>
        )}

        {/* ================= SCREEN: BIBLE COMMANDS (bc WITH TYPEWRITER) ================= */}
        {screen.type === 'bc' && (
          <div className="py-6 select-text">
            {!screen.subCategory ? (
              <MultiLineTypewriter
                key={`screen-bc-main-${language}`}
                speed={36}
                chunkSize={1}
                lines={language === 'en' ? [
                  { id: '1', text: 'Navigation & Progressive Jump: ', suffix: <span className="font-bold text-[#00ff41]">[1]</span> },
                  { id: '2', text: 'Catalogs & Testaments: ', suffix: <span className="font-bold text-[#00ff41]">[2]</span> },
                  { id: '3', text: 'Search & Discovery: ', suffix: <span className="font-bold text-[#00ff41]">[3]</span> },
                  { id: '4', text: 'Reading Navigation & Translations: ', suffix: <span className="font-bold text-[#00ff41]">[4]</span> },
                ] : [
                  { id: '1', text: 'Навігація та швидкий перехід: ', suffix: <span className="font-bold text-[#00ff41]">[1]</span> },
                  { id: '2', text: 'Каталоги та Заповіти: ', suffix: <span className="font-bold text-[#00ff41]">[2]</span> },
                  { id: '3', text: 'Пошук та дослідження: ', suffix: <span className="font-bold text-[#00ff41]">[3]</span> },
                  { id: '4', text: 'Керування читанням та переклади: ', suffix: <span className="font-bold text-[#00ff41]">[4]</span> },
                ]}
              />
            ) : screen.subCategory === 1 ? (
              <div className="space-y-2">
                <div className="font-bold text-[#00ff41] pb-1 border-b border-[#00ff41]/30 mb-2">
                  <TypewriterText 
                    text={language === 'en' ? "Navigation & Progressive Jump: [1]" : "Навігація та швидкий перехід: [1]"} 
                    speed={32} 
                  />
                </div>
                <MultiLineTypewriter
                  key={`screen-bc-1-${language}`}
                  speed={32}
                  chunkSize={1}
                  lines={language === 'en' ? [
                    { id: '1-1', text: '<book#> <ch> <v> : ', suffix: <span className="font-bold text-[#00ff41]">43 3 16 (or 1 1 1)</span> },
                    { id: '1-2', text: '<book#> <ch>     : ', suffix: <span className="font-bold text-[#00ff41]">43 3 (or 1 1)</span> },
                    { id: '1-3', text: '<book#>        : ', suffix: <span className="font-bold text-[#00ff41]">43</span> },
                    { id: '1-4', text: 'Progressive  : ', suffix: <span className="font-bold text-[#00ff41]">43 ↵ 3 ↵ 16 ↵</span> },
                    { id: '1-5', text: 'Name Jump    : ', suffix: <span className="font-bold text-[#00ff41]">john 3:16, gen 1:1, ps 23:1</span> },
                  ] : [
                    { id: '1-1', text: '<книга#> <гл> <вірш> : ', suffix: <span className="font-bold text-[#00ff41]">43 3 16 (або 1 1 1)</span> },
                    { id: '1-2', text: '<книга#> <гл>       : ', suffix: <span className="font-bold text-[#00ff41]">43 3 (або 1 1)</span> },
                    { id: '1-3', text: '<книга#>          : ', suffix: <span className="font-bold text-[#00ff41]">43</span> },
                    { id: '1-4', text: 'Поетапний перехід : ', suffix: <span className="font-bold text-[#00ff41]">43 ↵ 3 ↵ 16 ↵</span> },
                    { id: '1-5', text: 'За назвою книги   : ', suffix: <span className="font-bold text-[#00ff41]">івана 3:16, бут 1:1, ps 23:1</span> },
                  ]}
                />
              </div>
            ) : screen.subCategory === 2 ? (
              <div className="space-y-2">
                <div className="font-bold text-[#00ff41] pb-1 border-b border-[#00ff41]/30 mb-2">
                  <TypewriterText 
                    text={language === 'en' ? "Catalogs & Testaments: [2]" : "Каталоги та Заповіти: [2]"} 
                    speed={32} 
                  />
                </div>
                <MultiLineTypewriter
                  key={`screen-bc-2-${language}`}
                  speed={32}
                  chunkSize={1}
                  lines={language === 'en' ? [
                    { id: '2-1', text: 'all (books)  : ', suffix: <span className="font-bold text-[#00ff41]">All 66 books of the Bible</span> },
                    { id: '2-2', text: 'old (ot)     : ', suffix: <span className="font-bold text-[#00ff41]">Old Testament (39 books)</span> },
                    { id: '2-3', text: 'new (nt)     : ', suffix: <span className="font-bold text-[#00ff41]">New Testament (27 books)</span> },
                  ] : [
                    { id: '2-1', text: 'all (books)  : ', suffix: <span className="font-bold text-[#00ff41]">Всі 66 книг Біблії</span> },
                    { id: '2-2', text: 'old (ot)     : ', suffix: <span className="font-bold text-[#00ff41]">Старий Заповіт (39 книг)</span> },
                    { id: '2-3', text: 'new (nt)     : ', suffix: <span className="font-bold text-[#00ff41]">Новий Заповіт (27 книг)</span> },
                  ]}
                />
              </div>
            ) : screen.subCategory === 3 ? (
              <div className="space-y-2">
                <div className="font-bold text-[#00ff41] pb-1 border-b border-[#00ff41]/30 mb-2">
                  <TypewriterText 
                    text={language === 'en' ? "Search & Discovery: [3]" : "Пошук та дослідження: [3]"} 
                    speed={32} 
                  />
                </div>
                <MultiLineTypewriter
                  key={`screen-bc-3-${language}`}
                  speed={32}
                  chunkSize={1}
                  lines={language === 'en' ? [
                    { id: '3-1', text: 'search <query> (/) : ', suffix: <span className="font-bold text-[#00ff41]">search love, / light</span> },
                    { id: '3-2', text: 'random (rand)      : ', suffix: <span className="font-bold text-[#00ff41]">Random inspirational verse</span> },
                  ] : [
                    { id: '3-1', text: 'search <запит> (/) : ', suffix: <span className="font-bold text-[#00ff41]">search любов, / світло</span> },
                    { id: '3-2', text: 'random (rand)      : ', suffix: <span className="font-bold text-[#00ff41]">Випадковий вірш</span> },
                  ]}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="font-bold text-[#00ff41] pb-1 border-b border-[#00ff41]/30 mb-2">
                  <TypewriterText 
                    text={language === 'en' ? "Reading Navigation & Translations: [4]" : "Керування читанням та переклади: [4]"} 
                    speed={32} 
                  />
                </div>
                <MultiLineTypewriter
                  key={`screen-bc-4-${language}`}
                  speed={32}
                  chunkSize={1}
                  lines={language === 'en' ? [
                    { id: '4-1', text: 'ubio / cuv   : ', suffix: <span className="font-bold text-[#00ff41]">Switch translation (ubio or cuv)</span> },
                    { id: '4-2', text: 'next (n)     : ', suffix: <span className="font-bold text-[#00ff41]">Next chapter or next verse</span> },
                    { id: '4-3', text: 'prev (p)     : ', suffix: <span className="font-bold text-[#00ff41]">Previous chapter or previous verse</span> },
                    { id: '4-4', text: 'bw (back)    : ', suffix: <span className="font-bold text-[#00ff41]">Return to previous window</span> },
                    { id: '4-5', text: 'ch (chapter) : ', suffix: <span className="font-bold text-[#00ff41]">Full chapter reading mode</span> },
                    { id: '4-6', text: 'light on/off : ', suffix: <span className="font-bold text-[#00ff41]">Verse light (lton / ltoff)</span> },
                  ] : [
                    { id: '4-1', text: 'ubio / cuv   : ', suffix: <span className="font-bold text-[#00ff41]">Перемикання перекладів (ubio або cuv)</span> },
                    { id: '4-2', text: 'next (n)     : ', suffix: <span className="font-bold text-[#00ff41]">Наступний розділ або наступний вірш</span> },
                    { id: '4-3', text: 'prev (p)     : ', suffix: <span className="font-bold text-[#00ff41]">Попередній розділ або попередній вірш</span> },
                    { id: '4-4', text: 'bw (назад)   : ', suffix: <span className="font-bold text-[#00ff41]">Повернутися до попереднього вікна</span> },
                    { id: '4-5', text: 'ch (chapter) : ', suffix: <span className="font-bold text-[#00ff41]">Режим читання всієї глави</span> },
                    { id: '4-6', text: 'light on/off : ', suffix: <span className="font-bold text-[#00ff41]">Підсвічування вірша (lton / ltoff)</span> },
                  ]}
                />
              </div>
            )}
          </div>
        )}

        {/* ================= SCREEN: SETTINGS COMMANDS (sc WITH TYPEWRITER) ================= */}
        {screen.type === 'sc' && (
          <div className="py-6 select-text">
            {!screen.subCategory ? (
              <MultiLineTypewriter
                key={`screen-sc-main-${language}`}
                speed={36}
                chunkSize={1}
                lines={language === 'en' ? [
                  { id: '1', text: 'System, Audio & Translations: ', suffix: <span className="font-bold text-[#00ff41]">[1]</span> },
                  { id: '2', text: 'Terminal Control & Manual: ', suffix: <span className="font-bold text-[#00ff41]">[2]</span> },
                ] : [
                  { id: '1', text: 'Система, аудіо та переклади: ', suffix: <span className="font-bold text-[#00ff41]">[1]</span> },
                  { id: '2', text: 'Керування терміналом та довідник: ', suffix: <span className="font-bold text-[#00ff41]">[2]</span> },
                ]}
              />
            ) : screen.subCategory === 1 ? (
              <div className="space-y-2">
                <div className="font-bold text-[#00ff41] pb-1 border-b border-[#00ff41]/30 mb-2">
                  <TypewriterText 
                    text={language === 'en' ? "System, Audio & Translations: [1]" : "Система, аудіо та переклади: [1]"} 
                    speed={32} 
                  />
                </div>
                <MultiLineTypewriter
                  key={`screen-sc-1-${language}`}
                  speed={32}
                  chunkSize={1}
                  lines={language === 'en' ? [
                    { id: '1-1', text: 'ubio  : ', suffix: <span className="font-bold text-[#00ff41]">Switch to Ivan Ohienko translation [{translation === 'ubio' ? 'ACTIVE' : 'READY'}]</span> },
                    { id: '1-2', text: 'cuv   : ', suffix: <span className="font-bold text-[#00ff41]">Switch to Contemporary translation [{translation === 'cuv' ? 'ACTIVE' : 'READY'}]</span> },
                    { id: '1-3', text: '+ / - : ', suffix: <span className="font-bold text-[#00ff41]">Zoom & font scale [{uiScale}%] (+ to zoom in, - to zoom out, 0 to reset)</span> },
                    { id: '1-4', text: 'sound : ', suffix: <span className="font-bold text-[#00ff41]">Toggle keyboard typing sound [{soundEnabled ? 'ON' : 'OFF'}]</span> },
                    { id: '1-5', text: 'crt   : ', suffix: <span className="font-bold text-[#00ff41]">Toggle CRT scanlines & glow [{crtEffect ? 'ON' : 'OFF'}]</span> },
                    { id: '1-6', text: 'light : ', suffix: <span className="font-bold text-[#00ff41]">Verse light [{lightState.toUpperCase()}] (lton / ltoff)</span> },
                  ] : [
                    { id: '1-1', text: 'ubio  : ', suffix: <span className="font-bold text-[#00ff41]">Переклад Івана Огієнка [{translation === 'ubio' ? 'АКТИВНИЙ' : 'ГОТОВИЙ'}]</span> },
                    { id: '1-2', text: 'cuv   : ', suffix: <span className="font-bold text-[#00ff41]">Сучасний український переклад [{translation === 'cuv' ? 'АКТИВНИЙ' : 'ГОТОВИЙ'}]</span> },
                    { id: '1-3', text: '+ / - : ', suffix: <span className="font-bold text-[#00ff41]">Масштаб інтерфейсу [{uiScale}%] (+ збільшити, - зменшити, 0 скинути)</span> },
                    { id: '1-4', text: 'sound : ', suffix: <span className="font-bold text-[#00ff41]">Перемикання звукових ефектів [{soundEnabled ? 'ON' : 'OFF'}]</span> },
                    { id: '1-5', text: 'crt   : ', suffix: <span className="font-bold text-[#00ff41]">Перемикання CRT світіння [{crtEffect ? 'ON' : 'OFF'}]</span> },
                    { id: '1-6', text: 'light : ', suffix: <span className="font-bold text-[#00ff41]">Підсвічування [{lightState.toUpperCase()}] (lton / ltoff)</span> },
                  ]}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="font-bold text-[#00ff41] pb-1 border-b border-[#00ff41]/30 mb-2">
                  <TypewriterText 
                    text={language === 'en' ? "Terminal Control & Manual: [2]" : "Керування терміналом та довідник: [2]"} 
                    speed={32} 
                  />
                </div>
                <MultiLineTypewriter
                  key={`screen-sc-2-${language}`}
                  speed={32}
                  chunkSize={1}
                  lines={language === 'en' ? [
                    { id: '2-1', text: 'res (reset, cls) : ', suffix: <span className="font-bold text-[#00ff41]">Reset terminal screen to home</span> },
                    { id: '2-2', text: 'help (man)       : ', suffix: <span className="font-bold text-[#00ff41]">Complete index of 66 book numbers & abbreviations</span> },
                    { id: '2-3', text: 'bw (back)        : ', suffix: <span className="font-bold text-[#00ff41]">Return to previous window / screen</span> },
                    { id: '2-4', text: 'home             : ', suffix: <span className="font-bold text-[#00ff41]">Return to main home screen</span> },
                  ] : [
                    { id: '2-1', text: 'res (reset, cls) : ', suffix: <span className="font-bold text-[#00ff41]">Скидання стану термінала до головної</span> },
                    { id: '2-2', text: 'help (man)       : ', suffix: <span className="font-bold text-[#00ff41]">Повний довідник скорочень та номерів 66 книг</span> },
                    { id: '2-3', text: 'bw (назад)       : ', suffix: <span className="font-bold text-[#00ff41]">Повернутися до попереднього вікна</span> },
                    { id: '2-4', text: 'home             : ', suffix: <span className="font-bold text-[#00ff41]">Повернутися на головний екран</span> },
                  ]}
                />
              </div>
            )}
          </div>
        )}

        {/* ================= SCREEN: ALL 66 BOOKS ================= */}
        {screen.type === 'all' && (
          <div className="space-y-4">
            <div className="border-b border-[#00ff41]/40 pb-2 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h1 className="text-base md:text-lg font-bold">
                  <TypewriterText 
                    key={`all-books-hdr-${language}`} 
                    text={language === 'en' ? "ALL BOOKS OF THE BIBLE (66 BOOKS)" : "ВСІ КНИГИ БІБЛІЇ (66 КНИГ)"} 
                    speed={16} 
                  />
                </h1>
                <p className="opacity-70 text-xs pt-0.5">
                  {language === 'en'
                    ? 'Enter book number or name in terminal (e.g. 43, 1, 43 3 16, home):'
                    : 'Введіть номер книги або назву в командний рядок (напр. 43, 1, 43 3 16, home):'}
                </p>
              </div>
              <div className="text-xs opacity-75 font-mono">
                [type <code className="text-[#00ff41]">home</code> for commands]
              </div>
            </div>

            {/* Old Testament */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <div className="font-bold tracking-wide text-xs md:text-sm uppercase text-[#00ff41]/90">
                  {language === 'en' ? 'Old Testament (39 books, # 01 — 39):' : 'Старий Заповіт (39 книг, № 01 — 39):'}
                </div>
                <div className="text-xs opacity-60 font-mono">[type `old`]</div>
              </div>
              <div className="columns-1 sm:columns-2 md:columns-3 gap-x-6 pl-2 space-y-1 text-xs md:text-sm">
                {OLD_TESTAMENT.map((b) => (
                  <div
                    key={b.id}
                    className="break-inside-avoid w-full text-left text-[#00ff41] flex items-center gap-2 py-0.5"
                  >
                    <span className="opacity-60 font-mono text-xs shrink-0 tabular-nums">{String(b.number).padStart(2, '0')}.</span>
                    <span className="font-bold">{language === 'en' ? b.nameEng : b.nameUkr}</span>
                    <span className="opacity-50 text-xs">({language === 'en' ? b.shortEng : b.shortUkr})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* New Testament */}
            <div className="space-y-2 pt-4 border-t border-[#00ff41]/20">
              <div className="flex items-center justify-between">
                <div className="font-bold tracking-wide text-xs md:text-sm uppercase text-[#00ff41]/90">
                  {language === 'en' ? 'New Testament (27 books, # 40 — 66):' : 'Новий Заповіт (27 книг, № 40 — 66):'}
                </div>
                <div className="text-xs opacity-60 font-mono">[type `new`]</div>
              </div>
              <div className="columns-1 sm:columns-2 md:columns-3 gap-x-6 pl-2 space-y-1 text-xs md:text-sm">
                {NEW_TESTAMENT.map((b) => (
                  <div
                    key={b.id}
                    className="break-inside-avoid w-full text-left text-[#00ff41] flex items-center gap-2 py-0.5"
                  >
                    <span className="opacity-60 font-mono text-xs shrink-0 tabular-nums">{String(b.number).padStart(2, '0')}.</span>
                    <span className="font-bold">{language === 'en' ? b.nameEng : b.nameUkr}</span>
                    <span className="opacity-50 text-xs">({language === 'en' ? b.shortEng : b.shortUkr})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= SCREEN: TESTAMENT VIEW (OLD / NEW) ================= */}
        {screen.type === 'testament' && (
          <div className="space-y-4">
            <div className="border-b border-[#00ff41]/40 pb-2 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h1 className="text-base md:text-lg font-bold">
                  <TypewriterText
                    key={`testament-${screen.testament}-${language}`}
                    text={language === 'en'
                      ? (screen.testament === 'OT' ? 'OLD TESTAMENT (39 BOOKS)' : 'NEW TESTAMENT (27 BOOKS)')
                      : (screen.testament === 'OT' ? 'СТАРИЙ ЗАПОВІТ (39 КНИГ)' : 'НОВИЙ ЗАПОВІТ (27 КНИГ)')}
                    speed={16}
                  />
                </h1>
                <p className="opacity-70 text-xs pt-0.5">
                  {language === 'en'
                    ? (screen.testament === 'OT' 
                        ? 'Canonical books of Old Testament (# 01 — 39). Enter book number (e.g. `1`) or `home`:'
                        : 'Canonical books of New Testament (# 40 — 66). Enter book number (e.g. `43`) or `home`:')
                    : (screen.testament === 'OT' 
                        ? 'Канонічні книги Старого Заповіту (№ 01 — 39). Введіть номер книги (напр. `1`) або `home`:'
                        : 'Канонічні книги Нового Заповіту (№ 40 — 66). Введіть номер книги (напр. `43`) або `home`:')}
                </p>
              </div>
              <div className="text-xs opacity-75 font-mono">
                [type <code className="text-[#00ff41]">all</code> | <code className="text-[#00ff41]">home</code>]
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-2">
              {(screen.testament === 'OT' ? OLD_TESTAMENT : NEW_TESTAMENT).map((b) => (
                <div
                  key={b.id}
                  className="p-2 border border-[#00ff41]/30 bg-[#00ff41]/5 text-left flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2 truncate">
                    <span className="opacity-60 text-xs font-mono w-6">{String(b.number).padStart(2, '0')}.</span>
                    <span className="font-bold truncate text-xs md:text-sm">{language === 'en' ? b.nameEng : b.nameUkr}</span>
                    <span className="opacity-50 text-xs">({language === 'en' ? b.shortEng : b.shortUkr})</span>
                  </div>
                  <span className="opacity-60 text-xs shrink-0">
                    {language === 'en' ? `${b.chaptersCount} ch.` : `${b.chaptersCount} гл.`}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-4 text-xs border-t border-[#00ff41]/20 opacity-75">
              <span>* Type <code className="text-[#00ff41]">{screen.testament === 'OT' ? 'new' : 'old'}</code> {language === 'en' ? 'to switch testament' : 'для перемикання заповіту'}</span>
              <span>* Type <code className="text-[#00ff41]">home</code> {language === 'en' ? 'for commands list' : 'для списку команд'}</span>
            </div>
          </div>
        )}

        {/* ================= SCREEN 2: BOOK CHAPTERS PICKER ================= */}
        {screen.type === 'book' && (
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="text-base md:text-lg font-bold">
                <TypewriterText
                  key={`book-hdr-${screen.book.id}-${language}`}
                  text={language === 'en'
                    ? `[#${screen.book.number}] ${screen.book.nameEng} (${screen.book.nameUkr})`
                    : `[#${screen.book.number}] ${screen.book.nameUkr} (${screen.book.nameEng})`}
                  speed={16}
                />
              </div>
              <div className="opacity-70 text-xs">
                {language === 'en'
                  ? `${screen.book.category} • Total chapters: ${screen.book.chaptersCount}`
                  : `${screen.book.categoryUkr} • Всього глав: ${screen.book.chaptersCount}`}
              </div>
              <p className="opacity-70 text-xs pt-1">
                {language === 'en'
                  ? `Enter chapter number (e.g. 1 ... ${screen.book.chaptersCount}) or all / home:`
                  : `Введіть номер глави (напр. 1 ... ${screen.book.chaptersCount}) або all / home:`}
              </p>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 pt-2 text-xs">
              {Array.from({ length: screen.book.chaptersCount }, (_, i) => i + 1).map((ch) => (
                <div
                  key={ch}
                  className="p-1.5 border border-[#00ff41]/30 bg-[#00ff41]/5 text-center font-bold"
                >
                  {language === 'en' ? `Ch. ${ch}` : `Гл. ${ch}`}
                </div>
              ))}
            </div>

            <div className="pt-4 text-xs opacity-75 border-t border-[#00ff41]/20">
              * {language === 'en' ? 'Type chapter number (e.g. ' : 'Введіть номер глави (напр. '}
              <code className="text-[#00ff41]">3</code>) {language === 'en' ? 'or ' : 'або '}
              <code className="text-[#00ff41]">back</code> / <code className="text-[#00ff41]">home</code>
            </div>
          </div>
        )}

        {/* ================= SCREEN 3: CHAPTER VERSES READER ================= */}
        {screen.type === 'chapter' && (() => {
          const chapterVerses = getChapterVerses(screen.book, screen.chapter, translation);
          const verseIndex = screen.verse 
            ? chapterVerses.findIndex(v => v.verse === screen.verse)
            : -1;
          const displayedVerses = (screen.verse !== undefined && verseIndex >= 0)
            ? chapterVerses.slice(verseIndex)
            : chapterVerses;

          return (
            <div className="space-y-4">
              <div 
                id="chapter-header"
                className="sticky top-0 bg-black z-20 flex flex-wrap items-center justify-between gap-1 border-b border-[#00ff41]/40 pb-2 pt-0.5"
              >
                <div className="font-bold text-xs sm:text-sm md:text-base text-[#00ff41] leading-tight">
                  <TypewriterText
                    key={`ch-hdr-${screen.book.id}-${screen.chapter}-${screen.verse || 'all'}-${language}-${translation}`}
                    text={language === 'en'
                      ? (screen.verse
                          ? `[#${screen.book.number}] ${screen.book.nameEng} ${screen.chapter}:${screen.verse} — CHAPTER ${screen.chapter} / ${screen.book.chaptersCount} [${translation.toUpperCase()}]`
                          : `[#${screen.book.number}] ${screen.book.nameEng} — CHAPTER ${screen.chapter} / ${screen.book.chaptersCount} [${translation.toUpperCase()}]`)
                      : (screen.verse
                          ? `[#${screen.book.number}] ${screen.book.nameUkr} ${screen.chapter}:${screen.verse} — РОЗДІЛ ${screen.chapter} / ${screen.book.chaptersCount} [${translation.toUpperCase()}]`
                          : `[#${screen.book.number}] ${screen.book.nameUkr} — РОЗДІЛ ${screen.chapter} / ${screen.book.chaptersCount} [${translation.toUpperCase()}]`)}
                    speed={24}
                  />
                </div>
                <div className="flex items-center space-x-2 text-xs opacity-80 font-mono shrink-0 whitespace-nowrap">
                  <span className="text-[10px] px-1 py-0.5 rounded border border-[#00ff41]/40 text-[#00ff41]">
                    {translation.toUpperCase()}
                  </span>
                  <span>[<code className="text-[#00ff41]">p</code> / <code className="text-[#00ff41]">n</code>]</span>
                  {screen.verse && (
                    <span className="text-[10px] px-1 py-0.5 rounded border border-[#00ff41]/30">
                      LT: {lightState.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              {/* Verses List with Typewriter Streaming starting directly at chosen verse */}
              <div className="space-y-2 py-1">
                <MultiLineTypewriter
                  key={`ch-verses-${screen.book.id}-${screen.chapter}-${screen.verse || 0}-${language}-${translation}`}
                  speed={20}
                  chunkSize={2}
                  startLineIndex={0}
                  lines={displayedVerses.map((v: Verse) => {
                    const isSelected = screen.verse === v.verse;
                    let highlightClass = '';
                    if (isSelected && lightState !== 'off') {
                      highlightClass = lightState === 'on' 
                        ? 'verse-highlight-on' 
                        : 'verse-highlight-fade-5s';
                    }

                    return {
                      id: `verse-${v.verse}`,
                      key: isSelected ? `verse-${v.verse}-${highlightKey}` : `verse-${v.verse}`,
                      prefix: (
                        <span className={`font-bold shrink-0 tabular-nums select-none ${isSelected && lightState !== 'off' ? 'text-[#00ff41]' : 'opacity-75'}`}>
                          {v.verse}.
                        </span>
                      ),
                      text: language === 'en' ? (v.textEng || v.textUkr) : v.textUkr,
                      className: `flex items-start gap-2.5 p-2 rounded border border-transparent transition-colors ${highlightClass}`
                    };
                  })}
                />
              </div>

              {/* Chapter bottom navigation info */}
              <div className="pt-4 border-t border-[#00ff41]/30 flex flex-wrap items-center justify-between gap-2 text-xs opacity-75">
                <span>
                  * {language === 'en' ? 'Navigation:' : 'Навігація:'}{' '}
                  <code className="text-[#00ff41]">next</code> (<code className="text-[#00ff41]">n</code>) |{' '}
                  <code className="text-[#00ff41]">prev</code> (<code className="text-[#00ff41]">p</code>) |{' '}
                  <code className="text-[#00ff41]">bw</code> |{' '}
                  <code className="text-[#00ff41]">ubio</code> |{' '}
                  <code className="text-[#00ff41]">cuv</code>
                  {screen.verse && (
                    <>
                      {' | '}<code className="text-[#00ff41]">ch</code>
                      {' | '}<code className="text-[#00ff41]">lton</code>
                      {' | '}<code className="text-[#00ff41]">ltoff</code>
                    </>
                  )}
                </span>
                <span>
                  * {language === 'en' ? 'Jump:' : 'Перехід:'}{' '}
                  <code className="text-[#00ff41]">&lt;verse#&gt;</code> | <code className="text-[#00ff41]">all</code> | <code className="text-[#00ff41]">home</code>
                </span>
              </div>
            </div>
          );
        })()}

        {/* ================= SCREEN 4: SEARCH RESULTS ================= */}
        {screen.type === 'search' && (
          <div className="space-y-4">
            {!screen.query ? (
              <div className="space-y-4 py-2">
                <div className="border-b border-[#00ff41]/30 pb-2">
                  <div className="font-bold text-sm md:text-base">
                    <TypewriterText
                      key={`search-prompt-${language}-${translation}`}
                      text={language === 'en' ? `SCRIPTURE TEXT SEARCH [${translation.toUpperCase()}]` : `ПОШУК СЛІВ ТА ФРАЗ У БІБЛІЇ [${translation.toUpperCase()}]`}
                      speed={16}
                    />
                  </div>
                  <div className="opacity-75 text-xs pt-1">
                    {language === 'en'
                      ? 'Search across all 66 books of the Old and New Testaments:'
                      : 'Швидкий повнотекстовий пошук по всіх 66 книгах Старого та Нового Заповітів:'}
                  </div>
                </div>

                <div className="space-y-3 p-3.5 border border-[#00ff41]/30 bg-[#00ff41]/5 text-xs md:text-sm">
                  <div className="font-bold text-[#00ff41] uppercase tracking-wider text-xs">
                    {language === 'en' ? 'HOW TO SEARCH:' : 'ЯК ШУКАТИ:'}
                  </div>
                  <div className="space-y-2 opacity-90 pl-1 text-xs">
                    <div>
                      <span className="font-bold text-[#00ff41]">1. {language === 'en' ? 'Direct word/phrase:' : 'Пряме слово або фраза:'}</span>
                      <p className="opacity-80 pl-3">{language === 'en' ? 'Simply enter any word (e.g. love, peace, light, God is love)' : 'Просто введіть будь-яке слово (напр. любов, мир, світло, Бог є любов)'}</p>
                    </div>
                    <div>
                      <span className="font-bold text-[#00ff41]">2. {language === 'en' ? 'Command prefixes:' : 'Командні префікси:'}</span>
                      <p className="opacity-80 pl-3">
                        <code className="text-[#00ff41]">search &lt;query&gt;</code>, <code className="text-[#00ff41]">пошук &lt;запит&gt;</code>, <code className="text-[#00ff41]">/&lt;запит&gt;</code>
                      </p>
                    </div>
                    <div>
                      <span className="font-bold text-[#00ff41]">3. {language === 'en' ? 'Quick examples (click to search):' : 'Швидкі приклади (натисніть для пошуку):'}</span>
                      <div className="flex flex-wrap gap-2 pt-1.5 pl-3">
                        {['любов', 'світло', 'віра', 'надія', 'хліб життя', 'благодать', 'мир'].map(sample => (
                          <button
                            key={sample}
                            type="button"
                            onClick={() => handleCommand(`search ${sample}`)}
                            className="px-2 py-0.5 border border-[#00ff41]/40 bg-[#00ff41]/10 hover:bg-[#00ff41]/30 hover:border-[#00ff41] text-[#00ff41] font-mono text-xs rounded transition-colors"
                          >
                            {sample}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="border-b border-[#00ff41]/30 pb-2">
                  <div className="font-bold text-sm md:text-base">
                    <TypewriterText
                      key={`search-query-${screen.query}-${language}-${translation}`}
                      text={language === 'en' ? `SEARCH RESULTS [${translation.toUpperCase()}]: "${screen.query}"` : `РЕЗУЛЬТАТИ ПОШУКУ [${translation.toUpperCase()}]: "${screen.query}"`}
                      speed={16}
                    />
                  </div>
                  <div className="opacity-70 text-xs pt-1">
                    {screen.results.length > 0 && (
                      language === 'en'
                        ? `Matches found: ${screen.results.length} • Type result number (e.g. 1) or click on verse to open:`
                        : `Знайдено збігів: ${screen.results.length} • Введіть номер у списку (напр. 1) або натисніть на вірш:`
                    )}
                  </div>
                </div>

                {screen.results.length === 0 ? (
                  <div className="opacity-70 text-xs py-4 space-y-2">
                    <TypewriterText 
                      text={language === 'en' ? `Nothing found for "${screen.query}" in ${translation.toUpperCase()}.` : `Нічого не знайдено за запитом "${screen.query}" у ${translation.toUpperCase()}.`} 
                      speed={32} 
                    />
                    <p className="opacity-60 text-[11px]">
                      {language === 'en' ? 'Try searching for shorter root words or another translation (ubio / cuv).' : 'Спробуйте спростити пошукове слово або переключити переклад (ubio / cuv).'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <MultiLineTypewriter
                      key={`search-res-${screen.query}-${language}-${translation}`}
                      speed={20}
                      chunkSize={2}
                      lines={screen.results.map((r, idx) => {
                        const b = CANONICAL_BOOKS.find(item => item.id === r.bookId);
                        const bNum = b ? b.number : 1;
                        const bookDisplayName = language === 'en' ? (b?.nameEng || r.bookName) : (b?.nameUkr || r.bookName);
                        const openThisVerse = () => {
                          if (b) {
                            setLightState('fade');
                            setHighlightKey(Date.now());
                            navigateTo({
                              type: 'chapter',
                              book: b,
                              chapter: r.chapter,
                              verse: r.verse
                            });
                          }
                        };
                        return {
                          id: idx,
                          prefix: (
                            <div 
                              onClick={openThisVerse}
                              className="font-bold text-xs flex items-center justify-between pb-1 border-b border-[#00ff41]/20 mb-1 cursor-pointer"
                            >
                              <span className="flex items-center space-x-1.5">
                                <span className="text-[#00ff41] bg-[#00ff41]/20 px-1 py-0.5 rounded font-mono">[{idx + 1}]</span>
                                <span>* {bookDisplayName} {r.chapter}:{r.verse}</span>
                              </span>
                              <code className="text-[#00ff41] opacity-75 font-mono text-[11px]">
                                {language === 'en' ? `type > ${idx + 1} or ${bNum} ${r.chapter} ${r.verse}` : `введіть > ${idx + 1} або ${bNum} ${r.chapter} ${r.verse}`}
                              </code>
                            </div>
                          ),
                          text: language === 'en' ? (r.textEng || r.textUkr) : r.textUkr,
                          className: "p-2.5 border border-[#00ff41]/30 bg-[#00ff41]/5 hover:bg-[#00ff41]/15 hover:border-[#00ff41]/70 transition-colors cursor-pointer rounded space-y-1 text-xs md:text-sm leading-relaxed"
                        };
                      })}
                    />
                  </div>
                )}
              </>
            )}

            <div className="pt-4 text-xs opacity-75 border-t border-[#00ff41]/20 flex flex-wrap items-center justify-between gap-2">
              <span>
                * Type <code className="text-[#00ff41]">home</code> {language === 'en' ? 'to return to main menu' : 'для повернення на головну'}
              </span>
              <span>
                * {language === 'en' ? 'Switch translation:' : 'Змінити переклад:'}{' '}
                <code className="text-[#00ff41]">ubio</code> / <code className="text-[#00ff41]">cuv</code>
              </span>
            </div>
          </div>
        )}

        {/* ================= SCREEN 5: HELP ================= */}
        {screen.type === 'help' && (
          <div className="space-y-5 text-xs md:text-sm">
            <div className="border-b border-[#00ff41]/40 pb-2 flex flex-wrap items-center justify-between gap-2">
              <div className="font-bold text-sm md:text-base tracking-wider uppercase text-[#00ff41]">
                {language === 'en' ? 'TERMINAL MANUAL & COMMAND REFERENCE' : 'ДОВІДНИК ТЕРМІНАЛА ТА КОМАНД ПОШУКУ'}
              </div>
              <div className="text-xs opacity-75 font-mono">
                [type <code className="text-[#00ff41]">home</code> for commands list]
              </div>
            </div>

            {/* Section 1: General Commands */}
            <div className="space-y-3 p-3 border border-[#00ff41]/30 bg-[#00ff41]/5">
              <div className="font-bold text-[#00ff41] tracking-wide uppercase text-xs">
                {language === 'en' ? 'MAIN SYSTEM COMMANDS:' : 'ОСНОВНІ СИСТЕМНІ КОМАНДИ:'}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                <div>
                  <span className="font-bold text-[#00ff41]">&lt;{language === 'en' ? 'Book#' : '№ Книги'}&gt; &lt;{language === 'en' ? 'Chapter' : 'Розділ'}&gt; &lt;{language === 'en' ? 'Verse' : 'Вірш'}&gt;</span>
                  <p className="opacity-75">{language === 'en' ? 'Numeric jump: 1st number = book, 2nd = chapter, 3rd = verse (e.g. 43 3 16, 1 1 1, 19 23 1)' : 'Цифровий перехід: 1-а цифра — книга, 2-а — розділ, 3-я — вірш (напр. 43 3 16, 1 1 1, 19 23 1)'}</p>
                </div>
                <div>
                  <span className="font-bold text-[#00ff41]">&lt;{language === 'en' ? 'Book#' : '№ Книги'}&gt; &lt;{language === 'en' ? 'Chapter' : 'Розділ'}&gt;</span>
                  <p className="opacity-75">{language === 'en' ? 'Open whole chapter by book number (e.g. 43 3 = John 3, 1 1 = Genesis 1, 19 23 = Psalm 23)' : 'Перехід до цілого розділу за номерами (напр. 43 3 = Від Івана 3, 1 1 = Буття 1, 19 23 = Псалом 23)'}</p>
                </div>
                <div>
                  <span className="font-bold text-[#00ff41]">&lt;{language === 'en' ? 'BookName' : 'Книга'}&gt; &lt;{language === 'en' ? 'Chapter' : 'Глава'}&gt;[:&lt;{language === 'en' ? 'Verse' : 'Вірш'}&gt;]</span>
                  <p className="opacity-75">{language === 'en' ? 'Name jump (e.g. John 3:16, Gen 1:1, Ps 23, 1 Sam 2 3)' : 'Текстовий перехід (напр. Буття 1 1, John 3:16, Пс 23, 1 сам 2 3)'}</p>
                </div>
                <div>
                  <span className="font-bold text-[#00ff41]">search &lt;{language === 'en' ? 'query' : 'текст'}&gt;</span> {language === 'en' ? 'or' : 'або'} <span className="font-bold text-[#00ff41]">/ &lt;{language === 'en' ? 'query' : 'текст'}&gt;</span>
                  <p className="opacity-75">{language === 'en' ? 'Full text Scripture search (e.g. search love, / light)' : 'Повнотекстовий пошук (напр. search любов, / світло)'}</p>
                </div>
                <div>
                  <span className="font-bold text-[#00ff41]">next</span> / <span className="font-bold text-[#00ff41]">prev</span> ({language === 'en' ? 'or' : 'або'} <span className="font-bold text-[#00ff41]">n</span> / <span className="font-bold text-[#00ff41]">p</span>)
                  <p className="opacity-75">{language === 'en' ? 'Next or previous chapter while reading' : 'Наступна або попередня глава при читанні'}</p>
                </div>
                <div>
                  <span className="font-bold text-[#00ff41]">random</span> {language === 'en' ? 'or' : 'або'} <span className="font-bold text-[#00ff41]">rand</span>
                  <p className="opacity-75">{language === 'en' ? 'Fetch random Scripture verse' : 'Відкрити випадковий вірш з Біблії'}</p>
                </div>
                <div>
                  <span className="font-bold text-[#00ff41]">old</span> / <span className="font-bold text-[#00ff41]">new</span>
                  <p className="opacity-75">{language === 'en' ? 'List books of Old (39 books) or New (27 books) Testament' : 'Список книг Старого (39 книг) або Нового (27 книг) Заповіту'}</p>
                </div>
                <div>
                  <span className="font-bold text-[#00ff41]">all</span> / <span className="font-bold text-[#00ff41]">books</span>
                  <p className="opacity-75">{language === 'en' ? 'Full list of all 66 books' : 'Повний список усіх 66 книг'}</p>
                </div>
                <div>
                  <span className="font-bold text-[#00ff41]">res</span> ({language === 'en' ? 'or' : 'або'} <span className="font-bold text-[#00ff41]">reset</span> / <span className="font-bold text-[#00ff41]">cls</span>)
                  <p className="opacity-75">{language === 'en' ? 'Reset terminal screen to home screen' : 'Повне скидання (ресет) терміналу та повернення на головний екран'}</p>
                </div>
                <div>
                  <span className="font-bold text-[#00ff41]">+</span> / <span className="font-bold text-[#00ff41]">-</span> / <span className="font-bold text-[#00ff41]">0</span>
                  <p className="opacity-75">{language === 'en' ? 'Zoom & UI scale: + increase, - decrease, 0 reset to 100%' : 'Масштаб інтерфейсу: + збільшити, - зменшити, 0 скинути до 100%'}</p>
                </div>
                <div>
                  <span className="font-bold text-[#00ff41]">sound</span> / <span className="font-bold text-[#00ff41]">crt</span>
                  <p className="opacity-75">{language === 'en' ? 'Toggle keyboard sounds or CRT glow scanlines' : 'Перемикачі звуків клавіш або CRT світіння'}</p>
                </div>
              </div>
            </div>

            {/* Section 2: Book Commands Reference UKR & ENG */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="font-bold text-xs md:text-sm tracking-wide uppercase text-[#00ff41]">
                  {language === 'en' ? 'INDEX OF ALL 66 BOOKS (NAMES & SHORT CODES):' : 'СПИСОК ВСІХ 66 КНИГ (1 ПОВНА ТА 1 СКОРОЧЕНА НАЗВА UKR / ENG):'}
                </div>
                <input
                  type="text"
                  value={helpFilter}
                  onChange={(e) => setHelpFilter(e.target.value)}
                  placeholder={language === 'en' ? "Filter (e.g. sam, mat, gen, 43)..." : "Фільтр (напр. sam, мат, gen, 43)..."}
                  className="bg-black border border-[#00ff41]/50 text-[#00ff41] px-2 py-1 text-xs focus:outline-none focus:border-[#00ff41] placeholder:text-[#00ff41]/40"
                />
              </div>

              {/* Table of Books */}
              <div className="space-y-4">
                {/* Old Testament */}
                {filteredOT.length > 0 && (
                  <div className="space-y-2">
                    <div className="font-bold text-xs uppercase text-[#00ff41]/90 border-b border-[#00ff41]/20 pb-1">
                      {language === 'en' ? `OLD TESTAMENT (${filteredOT.length} books):` : `СТАРИЙ ЗАПОВІТ // OLD TESTAMENT (${filteredOT.length} книг):`}
                    </div>
                    <div className="divide-y divide-[#00ff41]/15 border border-[#00ff41]/30 text-xs">
                      <div className="grid grid-cols-12 gap-2 p-1.5 bg-[#00ff41]/10 font-bold text-xs text-[#00ff41]">
                        <div className="col-span-1">№</div>
                        <div className="col-span-5">{language === 'en' ? 'English Name (Short)' : 'Українська назва (Скорочення)'}</div>
                        <div className="col-span-5">{language === 'en' ? 'Ukrainian Name (Short)' : 'English Name (Short)'}</div>
                        <div className="col-span-1 text-right">{language === 'en' ? 'Ch.' : 'Глав'}</div>
                      </div>
                      {filteredOT.map(b => (
                        <div 
                          key={b.id}
                          className="grid grid-cols-12 gap-2 p-1.5 items-center"
                        >
                          <div className="col-span-1 opacity-70 font-mono">{String(b.number).padStart(2, '0')}</div>
                          <div className="col-span-5 font-bold text-[#00ff41]">
                            {language === 'en' ? b.nameEng : b.nameUkr} <span className="opacity-70 font-normal">({language === 'en' ? b.shortEng : b.shortUkr})</span>
                          </div>
                          <div className="col-span-5 opacity-90">
                            {language === 'en' ? b.nameUkr : b.nameEng} <span className="opacity-70 font-normal">({language === 'en' ? b.shortUkr : b.shortEng})</span>
                          </div>
                          <div className="col-span-1 text-right opacity-75">{b.chaptersCount}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Testament */}
                {filteredNT.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <div className="font-bold text-xs uppercase text-[#00ff41]/90 border-b border-[#00ff41]/20 pb-1">
                      {language === 'en' ? `NEW TESTAMENT (${filteredNT.length} books):` : `НОВИЙ ЗАПОВІТ // NEW TESTAMENT (${filteredNT.length} книг):`}
                    </div>
                    <div className="divide-y divide-[#00ff41]/15 border border-[#00ff41]/30 text-xs">
                      <div className="grid grid-cols-12 gap-2 p-1.5 bg-[#00ff41]/10 font-bold text-xs text-[#00ff41]">
                        <div className="col-span-1">№</div>
                        <div className="col-span-5">{language === 'en' ? 'English Name (Short)' : 'Українська назва (Скорочення)'}</div>
                        <div className="col-span-5">{language === 'en' ? 'Ukrainian Name (Short)' : 'English Name (Short)'}</div>
                        <div className="col-span-1 text-right">{language === 'en' ? 'Ch.' : 'Глав'}</div>
                      </div>
                      {filteredNT.map(b => (
                        <div 
                          key={b.id}
                          className="grid grid-cols-12 gap-2 p-1.5 items-center"
                        >
                          <div className="col-span-1 opacity-70 font-mono">{String(b.number).padStart(2, '0')}</div>
                          <div className="col-span-5 font-bold text-[#00ff41]">
                            {language === 'en' ? b.nameEng : b.nameUkr} <span className="opacity-70 font-normal">({language === 'en' ? b.shortEng : b.shortUkr})</span>
                          </div>
                          <div className="col-span-5 opacity-90">
                            {language === 'en' ? b.nameUkr : b.nameEng} <span className="opacity-70 font-normal">({language === 'en' ? b.shortUkr : b.shortEng})</span>
                          </div>
                          <div className="col-span-1 text-right opacity-75">{b.chaptersCount}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 pb-4 text-xs opacity-75">
              * Type <code className="text-[#00ff41]">home</code> {language === 'en' ? 'to return to main command list' : 'для повернення на головну'}
            </div>
          </div>
        )}
      </div>

      {/* Interactive Bottom Terminal Prompt Line */}
      <TerminalCommandLine 
        language={language}
        onSubmit={handleCommand}
        inputRef={inputRef}
      />
    </div>
  );
}
