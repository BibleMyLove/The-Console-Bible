export type Testament = 'OT' | 'NT';

export type BookCategory = 
  | 'law'             // П'ятикнижжя (Закон)
  | 'history'         // Історичні
  | 'poetry'          // Поетичні та мудрість
  | 'major_prophets'  // Великі пророки
  | 'minor_prophets'  // Малі пророки
  | 'gospels'         // Євангелії
  | 'church_history'  // Дії Апостолів
  | 'pauline_epistles'// Послання Павла
  | 'general_epistles'// Загальні послання
  | 'prophecy';       // Пророцтво (Об'явлення)

export interface BookInfo {
  id: string; // e.g. 'gen', 'jhn', 'psa'
  number: number; // 1 to 66
  nameUkr: string; // "Буття"
  nameEng: string; // "Genesis"
  shortUkr: string; // "Бут"
  shortEng: string; // "Gen"
  aliases: string[]; // ["бут", "genesis", "быт", "1"]
  testament: Testament;
  category: BookCategory;
  categoryUkr: string;
  chaptersCount: number;
  totalVersesApprox: number;
}

export interface Verse {
  bookId: string;
  bookName: string;
  chapter: number;
  verse: number;
  textUkr: string;
  textEng?: string;
}

export interface Bookmark {
  id: string;
  bookId: string;
  bookName: string;
  chapter: number;
  verse: number;
  textUkr: string;
  note?: string;
  tag?: string;
  createdAt: string;
}

export interface Highlight {
  id: string;
  bookId: string;
  chapter: number;
  verse: number;
  color: 'yellow' | 'green' | 'cyan' | 'magenta' | 'red';
}

export interface SearchResult {
  bookId: string;
  bookName: string;
  testament: Testament;
  chapter: number;
  verse: number;
  textUkr: string;
  textEng?: string;
  matches: string[];
}

export type TerminalTheme = 
  | 'matrix'       // Phosphor Matrix Green (#00ff66)
  | 'amber'        // Vintage Amber CRT (#ffb000)
  | 'nord'         // Arctic Nord Ice Blue & Slate
  | 'cyberpunk'    // Cyan & Magenta Neon
  | 'dos'          // Classic VGA Blue/White
  | 'paper'        // Monospace Clean Light Paper
  | 'dracula'      // Dracula Dark Violet
  | 'solarized';   // Solarized Dark

export type TerminalLayout = 'tui' | 'split' | 'cli' | 'reader';

export type TranslationMode = 'ukr' | 'eng' | 'parallel';

export interface CommandHistoryItem {
  id: string;
  command: string;
  timestamp: string;
  outputType: 'text' | 'error' | 'success' | 'info' | 'table' | 'verse' | 'verses' | 'man' | 'help' | 'neofetch';
  content?: any;
}

export interface BibleStats {
  totalBooks: number;
  totalChapters: number;
  totalVerses: number;
  otBooks: number;
  ntBooks: number;
  readChaptersCount: number;
  bookmarkedCount: number;
}
