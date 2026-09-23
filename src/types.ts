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
