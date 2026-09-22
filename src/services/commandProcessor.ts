import { BookInfo, CommandHistoryItem, TerminalTheme, TranslationMode } from '../types';
import { CANONICAL_BOOKS, findBookByQuery } from '../data/canonicalBooks';
import { getChapterVerses, searchBible, getRandomVerse } from '../data/bibleData';

export interface CommandContext {
  currentBook: BookInfo;
  currentChapter: number;
  currentVerse?: number;
  setCurrentBook: (b: BookInfo) => void;
  setCurrentChapter: (ch: number) => void;
  setCurrentVerse: (v?: number) => void;
  setTheme: (t: TerminalTheme) => void;
  theme: TerminalTheme;
  setCrtEffect: (enabled: boolean | ((prev: boolean) => boolean)) => void;
  crtEffect: boolean;
  setSoundEnabled: (enabled: boolean | ((prev: boolean) => boolean)) => void;
  soundEnabled: boolean;
  setTranslation: (tr: TranslationMode) => void;
  translation: TranslationMode;
  setLayout: (l: any) => void;
  addBookmark: (bookId: string, bookName: string, chapter: number, verse: number, text: string) => void;
  openSearchModal: (initialQuery?: string) => void;
  openManModal: () => void;
  openQuizModal: () => void;
  openPlanModal: () => void;
  openBookmarksModal: () => void;
  history: CommandHistoryItem[];
  setHistory: React.Dispatch<React.SetStateAction<CommandHistoryItem[]>>;
  clearTerminal: () => void;
}

export function parseReference(input: string): { book?: BookInfo; chapter?: number; verse?: number; endVerse?: number } | null {
  if (!input) return null;
  const trimmed = input.trim();

  // Examples: "Івана 3:16", "Бут 1", "Пс 23:1-6", "John 1:1", "1co 13:13", "Матвія 5", "gen 1"
  const colonMatch = trimmed.match(/^([\d\s\p{L}'-]+?)\s+(\d+)(?::(\d+)(?:-(\d+))?)?$/iu);
  if (colonMatch) {
    const bookNameOrAlias = colonMatch[1].trim();
    const ch = parseInt(colonMatch[2], 10);
    const v = colonMatch[3] ? parseInt(colonMatch[3], 10) : undefined;
    const endV = colonMatch[4] ? parseInt(colonMatch[4], 10) : undefined;

    const book = findBookByQuery(bookNameOrAlias);
    if (book) {
      return { book, chapter: Math.min(Math.max(1, ch), book.chaptersCount), verse: v, endVerse: endV };
    }
  }

  // Check if it's just a book name
  const bookOnly = findBookByQuery(trimmed);
  if (bookOnly) {
    return { book: bookOnly, chapter: 1 };
  }

  return null;
}

export function executeCommand(rawCommand: string, ctx: CommandContext): CommandHistoryItem {
  const cmdLine = rawCommand.trim();
  const id = Math.random().toString(36).substring(2, 9);
  const timestamp = new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  if (!cmdLine) {
    return { id, command: '', timestamp, outputType: 'text', content: '' };
  }

  const parts = cmdLine.split(/\s+/);
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);
  const argsString = args.join(' ');

  switch (command) {
    case 'help':
    case '?': {
      return {
        id,
        command: cmdLine,
        timestamp,
        outputType: 'help',
        content: {
          title: 'CLI BIBLE — ДОВІДКА КОМАНД',
          commands: [
            { cmd: 'read <книга> <глава> [вірш]', desc: 'Читати главу або вірш (напр. `read Івана 3:16`, `read Бут 1`)' },
            { cmd: 'search <текст> [-b книга]', desc: 'Пошук по всьому тексту Біблії (напр. `search любов`, `search світло`)' },
            { cmd: 'books [ot|nt|закон|євангелії]', desc: 'Список усіх 66 канонічних книг з розділами' },
            { cmd: 'goto <посилання>', desc: 'Швидкий перехід (напр. `goto Пс 23`, `goto Рим 8:28`)' },
            { cmd: 'next / prev (або n / p)', desc: 'Перейти до наступної / попередньої глави' },
            { cmd: 'random / daily', desc: 'Випадковий вірш або вірш дня' },
            { cmd: 'bookmark [add|list|del]', desc: 'Керування закладками та збереженими віршами' },
            { cmd: 'theme <matrix|amber|nord|dos|paper|dracula>', desc: 'Зміна стилю/теми терміналу' },
            { cmd: 'translation <ukr|eng|parallel>', desc: 'Переклад: Огієнка (ukr), KJV (eng) або паралельний' },
            { cmd: 'crt <on|off>', desc: 'Увімкнути/вимкнути ефект ретро CRT-монітора' },
            { cmd: 'sound <on|off>', desc: 'Увімкнути/вимкнути звуки термінала' },
            { cmd: 'layout <tui|split|cli|reader>', desc: 'Змінити режим інтерфейсу' },
            { cmd: 'stats', desc: 'Статистика канону Біблії та прогрес читання' },
            { cmd: 'plan', desc: 'Річний план читання Біблії' },
            { cmd: 'quiz', desc: 'Термінальна вікторина на знання віршів' },
            { cmd: 'man', desc: 'Повна сторінка посібника UNIX (man bible)' },
            { cmd: 'neofetch / about', desc: 'Інформація про систему CLI Bible' },
            { cmd: 'clear / cls', desc: 'Очистити екран термінала' }
          ]
        }
      };
    }

    case 'clear':
    case 'cls': {
      ctx.clearTerminal();
      return { id, command: cmdLine, timestamp, outputType: 'text', content: 'Terminal cleared.' };
    }

    case 'man': {
      ctx.openManModal();
      return {
        id,
        command: cmdLine,
        timestamp,
        outputType: 'info',
        content: 'Відкрито сторінку посібника man bible(1)...'
      };
    }

    case 'read':
    case 'cat':
    case 'open':
    case 'goto': {
      if (!argsString) {
        return {
          id,
          command: cmdLine,
          timestamp,
          outputType: 'error',
          content: 'Помилка: Вкажіть книгу та розділ. Приклад: `read Івана 3` або `goto Бут 1:1`'
        };
      }

      const parsed = parseReference(argsString);
      if (parsed?.book && parsed.chapter) {
        ctx.setCurrentBook(parsed.book);
        ctx.setCurrentChapter(parsed.chapter);
        if (parsed.verse) {
          ctx.setCurrentVerse(parsed.verse);
        } else {
          ctx.setCurrentVerse(undefined);
        }

        const verses = getChapterVerses(parsed.book, parsed.chapter);
        const filteredVerses = parsed.verse
          ? verses.filter(v => v.verse >= parsed.verse! && (!parsed.endVerse || v.verse <= parsed.endVerse))
          : verses;

        return {
          id,
          command: cmdLine,
          timestamp,
          outputType: 'verses',
          content: {
            book: parsed.book,
            chapter: parsed.chapter,
            verse: parsed.verse,
            endVerse: parsed.endVerse,
            verses: filteredVerses
          }
        };
      }

      return {
        id,
        command: cmdLine,
        timestamp,
        outputType: 'error',
        content: `Не знайдено книгу або посилання "${argsString}". Спробуйте: "read Буття 1", "read Івана 3:16", "read Пс 23". Для списку введіть "books".`
      };
    }

    case 'next':
    case 'n': {
      let nextCh = ctx.currentChapter + 1;
      let nextBook = ctx.currentBook;
      if (nextCh > ctx.currentBook.chaptersCount) {
        const nextNum = ctx.currentBook.number + 1;
        if (nextNum <= 66) {
          nextBook = CANONICAL_BOOKS.find(b => b.number === nextNum)!;
          nextCh = 1;
        } else {
          nextCh = ctx.currentBook.chaptersCount;
        }
      }
      ctx.setCurrentBook(nextBook);
      ctx.setCurrentChapter(nextCh);
      ctx.setCurrentVerse(undefined);
      return {
        id,
        command: cmdLine,
        timestamp,
        outputType: 'info',
        content: `→ Перехід до: ${nextBook.nameUkr} ${nextCh}`
      };
    }

    case 'prev':
    case 'p': {
      let prevCh = ctx.currentChapter - 1;
      let prevBook = ctx.currentBook;
      if (prevCh < 1) {
        const prevNum = ctx.currentBook.number - 1;
        if (prevNum >= 1) {
          prevBook = CANONICAL_BOOKS.find(b => b.number === prevNum)!;
          prevCh = prevBook.chaptersCount;
        } else {
          prevCh = 1;
        }
      }
      ctx.setCurrentBook(prevBook);
      ctx.setCurrentChapter(prevCh);
      ctx.setCurrentVerse(undefined);
      return {
        id,
        command: cmdLine,
        timestamp,
        outputType: 'info',
        content: `← Перехід до: ${prevBook.nameUkr} ${prevCh}`
      };
    }

    case 'search':
    case 'find':
    case 'grep': {
      if (!argsString) {
        ctx.openSearchModal();
        return {
          id,
          command: cmdLine,
          timestamp,
          outputType: 'info',
          content: 'Відкрито інтерактивний термінальний пошуковий модуль.'
        };
      }

      // Check for flags like -b <book> or -ot / -nt
      let searchQuery = argsString;
      let targetBookId: string | undefined;
      let targetTestament: 'OT' | 'NT' | undefined;

      if (argsString.includes('-ot')) {
        targetTestament = 'OT';
        searchQuery = searchQuery.replace('-ot', '').trim();
      } else if (argsString.includes('-nt')) {
        targetTestament = 'NT';
        searchQuery = searchQuery.replace('-nt', '').trim();
      }

      const bookFlagMatch = searchQuery.match(/-b\s+([^\s]+)/i);
      if (bookFlagMatch) {
        const b = findBookByQuery(bookFlagMatch[1]);
        if (b) targetBookId = b.id;
        searchQuery = searchQuery.replace(bookFlagMatch[0], '').trim();
      }

      const results = searchBible(searchQuery, { testament: targetTestament, bookId: targetBookId });

      return {
        id,
        command: cmdLine,
        timestamp,
        outputType: 'table',
        content: {
          title: `ПОШУК: "${searchQuery}" (знайдено збігів: ${results.length})`,
          query: searchQuery,
          results: results.slice(0, 50),
          totalCount: results.length
        }
      };
    }

    case 'books':
    case 'ls': {
      const filter = argsString.toLowerCase();
      let books = CANONICAL_BOOKS;

      if (filter.includes('ot') || filter.includes('старий') || filter.includes('сз')) {
        books = books.filter(b => b.testament === 'OT');
      } else if (filter.includes('nt') || filter.includes('новий') || filter.includes('нз')) {
        books = books.filter(b => b.testament === 'NT');
      } else if (filter.includes('закон') || filter.includes('law')) {
        books = books.filter(b => b.category === 'law');
      } else if (filter.includes('євангел') || filter.includes('gospel')) {
        books = books.filter(b => b.category === 'gospels');
      } else if (filter.includes('поезія') || filter.includes('псалм')) {
        books = books.filter(b => b.category === 'poetry');
      }

      return {
        id,
        command: cmdLine,
        timestamp,
        outputType: 'table',
        content: {
          title: `КНИГИ СВЯТОГО ПИСЬМА (${books.length} книг)`,
          books
        }
      };
    }

    case 'random':
    case 'daily':
    case 'verse': {
      const verse = getRandomVerse();
      return {
        id,
        command: cmdLine,
        timestamp,
        outputType: 'verse',
        content: verse
      };
    }

    case 'theme': {
      const selected = args[0]?.toLowerCase() as TerminalTheme;
      const validThemes: TerminalTheme[] = ['matrix', 'amber', 'nord', 'cyberpunk', 'dos', 'paper', 'dracula', 'solarized'];

      if (validThemes.includes(selected)) {
        ctx.setTheme(selected);
        return {
          id,
          command: cmdLine,
          timestamp,
          outputType: 'success',
          content: `Тему змінено на: [${selected.toUpperCase()}].`
        };
      }

      return {
        id,
        command: cmdLine,
        timestamp,
        outputType: 'info',
        content: `Поточна тема: ${ctx.theme}. Доступні: matrix, amber, nord, cyberpunk, dos, paper, dracula, solarized. Приклад: \`theme amber\``
      };
    }

    case 'translation':
    case 'tr': {
      const tr = args[0]?.toLowerCase() as TranslationMode;
      if (tr === 'ukr' || tr === 'eng' || tr === 'parallel') {
        ctx.setTranslation(tr);
        return {
          id,
          command: cmdLine,
          timestamp,
          outputType: 'success',
          content: `Переклад встановлено: ${tr === 'ukr' ? 'Український (Огієнко)' : tr === 'eng' ? 'English (KJV)' : 'Паралельний (UKR / ENG)'}`
        };
      }
      return {
        id,
        command: cmdLine,
        timestamp,
        outputType: 'info',
        content: `Поточний переклад: ${ctx.translation}. Доступні: ukr, eng, parallel. Приклад: \`translation parallel\``
      };
    }

    case 'crt': {
      const sub = args[0]?.toLowerCase();
      if (sub === 'on' || sub === '1' || sub === 'true') {
        ctx.setCrtEffect(true);
        return { id, command: cmdLine, timestamp, outputType: 'success', content: 'CRT scanline ефект увімкнено.' };
      } else if (sub === 'off' || sub === '0' || sub === 'false') {
        ctx.setCrtEffect(false);
        return { id, command: cmdLine, timestamp, outputType: 'success', content: 'CRT scanline ефект вимкнено.' };
      } else {
        ctx.setCrtEffect(prev => !prev);
        return { id, command: cmdLine, timestamp, outputType: 'info', content: `Стан CRT ефекту перемкнуто.` };
      }
    }

    case 'sound':
    case 'audio': {
      const sub = args[0]?.toLowerCase();
      if (sub === 'on' || sub === '1' || sub === 'true') {
        ctx.setSoundEnabled(true);
        return { id, command: cmdLine, timestamp, outputType: 'success', content: 'Звукові ефекти термінала увімкнено.' };
      } else if (sub === 'off' || sub === '0' || sub === 'false') {
        ctx.setSoundEnabled(false);
        return { id, command: cmdLine, timestamp, outputType: 'success', content: 'Звукові ефекти термінала вимкнено.' };
      } else {
        ctx.setSoundEnabled(prev => !prev);
        return { id, command: cmdLine, timestamp, outputType: 'info', content: `Звук термінала перемкнуто.` };
      }
    }

    case 'layout': {
      const l = args[0]?.toLowerCase();
      if (['tui', 'split', 'cli', 'reader'].includes(l)) {
        ctx.setLayout(l);
        return { id, command: cmdLine, timestamp, outputType: 'success', content: `Режим відображення змінено на [${l.toUpperCase()}].` };
      }
      return { id, command: cmdLine, timestamp, outputType: 'info', content: 'Доступні макети: tui, split, cli, reader. Приклад: `layout split`' };
    }

    case 'bookmark':
    case 'bm': {
      if (args[0] === 'list' || !args[0]) {
        ctx.openBookmarksModal();
        return { id, command: cmdLine, timestamp, outputType: 'info', content: 'Відкрито менеджер закладок та нотаток.' };
      }
      if (args[0] === 'add') {
        const refStr = args.slice(1).join(' ') || `${ctx.currentBook.nameUkr} ${ctx.currentChapter}:${ctx.currentVerse || 1}`;
        const parsed = parseReference(refStr);
        if (parsed?.book && parsed.chapter) {
          const verses = getChapterVerses(parsed.book, parsed.chapter);
          const vNum = parsed.verse || 1;
          const target = verses.find(v => v.verse === vNum) || verses[0];
          ctx.addBookmark(parsed.book.id, parsed.book.nameUkr, parsed.chapter, vNum, target.textUkr);
          return { id, command: cmdLine, timestamp, outputType: 'success', content: `Закладку додано: ${parsed.book.nameUkr} ${parsed.chapter}:${vNum}` };
        }
      }
      return { id, command: cmdLine, timestamp, outputType: 'info', content: 'Використання: `bookmark add [посилання]`, `bookmark list`' };
    }

    case 'stats': {
      return {
        id,
        command: cmdLine,
        timestamp,
        outputType: 'info',
        content: `
═══════════════════════════════════════════════════
  СТАТИСТИКА СВЯТОГО ПИСЬМА (КАНОН 66 КНИГ)
═══════════════════════════════════════════════════
  • Всього книг:           66
  • Старий Заповіт:        39 книг (929 глав)
  • Новий Заповіт:         27 книг (260 глав)
  • Всього глав:           1,189
  • Всього віршів:         ~31,102
  • Найдовша книга:        Псалми (150 глав)
  • Найкоротша книга:      3 Івана / 2 Івана / Овдія
  • Найдовша глава:        Псалом 119 (176 віршів)
  • Найкоротша глава:      Псалом 117 (2 вірші)
  • Центральна глава:      Псалом 118
  • Поточний переклад:     Український (Івана Огієнка)
═══════════════════════════════════════════════════`
      };
    }

    case 'plan': {
      ctx.openPlanModal();
      return { id, command: cmdLine, timestamp, outputType: 'info', content: 'Відкрито інтерактивний план читання Біблії.' };
    }

    case 'quiz':
    case 'game': {
      ctx.openQuizModal();
      return { id, command: cmdLine, timestamp, outputType: 'info', content: 'Запущено термінальну біблійну вікторину.' };
    }

    case 'neofetch':
    case 'fastfetch':
    case 'about': {
      return {
        id,
        command: cmdLine,
        timestamp,
        outputType: 'neofetch',
        content: {
          ascii: `
     +-----------------+
     |  .---.   .---.  |
     | /     \\ /     \\ |
     | |  HOLY BIBLE  ||
     | \\     / \\     / |
     |  '---'   '---'  |
     +-----------------+
          `
        }
      };
    }

    default: {
      // Check if user directly entered a scripture ref like "Івана 3:16" or "Бут 1"
      const quickRef = parseReference(cmdLine);
      if (quickRef?.book && quickRef.chapter) {
        ctx.setCurrentBook(quickRef.book);
        ctx.setCurrentChapter(quickRef.chapter);
        if (quickRef.verse) ctx.setCurrentVerse(quickRef.verse);

        const verses = getChapterVerses(quickRef.book, quickRef.chapter);
        const filteredVerses = quickRef.verse
          ? verses.filter(v => v.verse >= quickRef.verse! && (!quickRef.endVerse || v.verse <= quickRef.endVerse))
          : verses;

        return {
          id,
          command: cmdLine,
          timestamp,
          outputType: 'verses',
          content: {
            book: quickRef.book,
            chapter: quickRef.chapter,
            verse: quickRef.verse,
            verses: filteredVerses
          }
        };
      }

      return {
        id,
        command: cmdLine,
        timestamp,
        outputType: 'error',
        content: `Команду "${cmdLine}" не знайдено. Введіть "help" для списку команд або вкажіть розділ: наприклад, "read Івана 3" або "search любов".`
      };
    }
  }
}
