import { BookInfo, Verse, SearchResult } from '../types';
import { CANONICAL_BOOKS } from './canonicalBooks';

export type TranslationType = 'ubio' | 'cuv';

export interface TranslationMeta {
  id: TranslationType;
  name: string;
  shortName: string;
  descriptionEng: string;
  descriptionUkr: string;
}

export const TRANSLATIONS: Record<TranslationType, TranslationMeta> = {
  ubio: {
    id: 'ubio',
    name: 'Переклад Івана Огієнка (1962)',
    shortName: 'UBIO',
    descriptionEng: 'Ukrainian Bible (Ivan Ohienko Translation, 1962)',
    descriptionUkr: 'Українська Біблія (Переклад Івана Огієнка, 1962)'
  },
  cuv: {
    id: 'cuv',
    name: 'Сучасний український переклад (CUV)',
    shortName: 'CUV',
    descriptionEng: 'Contemporary Ukrainian Version (CUV)',
    descriptionUkr: 'Сучасний український переклад (CUV)'
  }
};

// Import all 66 Ukrainian Bible JSON books from /src/ubio/
const ubioModules = import.meta.glob<Record<string, string[]>>('../ubio/*.json', {
  eager: true,
  import: 'default'
});

// Import all 66 Ukrainian Bible JSON books from /src/cuv/
const cuvModules = import.meta.glob<Record<string, string[]>>('../cuv/*.json', {
  eager: true,
  import: 'default'
});

// Map book ID from canonicalBooks to the corresponding filename
export const UBIO_FILE_MAP: Record<string, string> = {
  gen: 'gen',
  exo: 'exod',
  lev: 'lev',
  num: 'num',
  deu: 'deut',
  jos: 'josh',
  jdg: 'judg',
  rut: 'ruth',
  '1sa': '1sam',
  '2sa': '2sam',
  '1ki': '1kgs',
  '2ki': '2kgs',
  '1ch': '1chr',
  '2ch': '2chr',
  ezr: 'ezra',
  neh: 'neh',
  est: 'esth',
  job: 'job',
  psa: 'ps',
  pro: 'prov',
  ecc: 'eccl',
  sng: 'song',
  isa: 'isa',
  jer: 'jer',
  lam: 'lam',
  ezk: 'ezek',
  dan: 'dan',
  hos: 'hos',
  jol: 'joel',
  amo: 'amos',
  oba: 'obad',
  jon: 'jonah',
  mic: 'mic',
  nam: 'nah',
  hab: 'hab',
  zep: 'zeph',
  hag: 'hag',
  zec: 'zech',
  mal: 'mal',
  mat: 'matt',
  mrk: 'mark',
  luk: 'luke',
  jhn: 'john',
  act: 'acts',
  rom: 'rom',
  '1co': '1cor',
  '2co': '2cor',
  gal: 'gal',
  eph: 'eph',
  php: 'phil',
  col: 'col',
  '1th': '1thess',
  '2th': '2thess',
  '1ti': '1tim',
  '2ti': '2tim',
  tit: 'titus',
  phm: 'phlm',
  heb: 'heb',
  jas: 'jas',
  '1pe': '1pet',
  '2pe': '2pet',
  '1jn': '1john',
  '2jn': '2john',
  '3jn': '3john',
  jud: 'jude',
  rev: 'rev',
};

// Index data by normalized file key for both translations
const ubioData: Record<string, Record<string, string[]>> = {};
const cuvData: Record<string, Record<string, string[]>> = {};

for (const path in ubioModules) {
  const match = path.match(/\/([^/]+)\.json$/);
  if (match) {
    const key = match[1];
    ubioData[key] = ubioModules[path];
  }
}

for (const path in cuvModules) {
  const match = path.match(/\/([^/]+)\.json$/);
  if (match) {
    const key = match[1];
    cuvData[key] = cuvModules[path];
  }
}

/**
 * Get raw chapter mapping for a specific book ID and translation
 */
export function getBookData(bookId: string, translation: TranslationType = 'ubio'): Record<string, string[]> | undefined {
  const fileKey = UBIO_FILE_MAP[bookId] || bookId;
  const store = translation === 'cuv' ? cuvData : ubioData;
  return store[fileKey] || ubioData[fileKey] || cuvData[fileKey];
}

/**
 * Get the total number of chapters in a book
 */
export function getBookChapterCount(bookId: string, translation: TranslationType = 'ubio'): number {
  const data = getBookData(bookId, translation);
  if (data) {
    return Object.keys(data).length;
  }
  const book = CANONICAL_BOOKS.find(b => b.id === bookId);
  return book?.chaptersCount || 1;
}

/**
 * Get all verses for a given book and chapter from the selected translation
 */
export function getChapterVerses(book: BookInfo, chapter: number, translation: TranslationType = 'ubio'): Verse[] {
  const data = getBookData(book.id, translation);
  if (data && data[chapter.toString()]) {
    const rawVerses = data[chapter.toString()];
    return rawVerses.map((text, idx) => ({
      bookId: book.id,
      bookName: book.nameUkr,
      chapter,
      verse: idx + 1,
      textUkr: text,
    }));
  }

  return [
    {
      bookId: book.id,
      bookName: book.nameUkr,
      chapter,
      verse: 1,
      textUkr: 'Розділ завантажується...',
    }
  ];
}

function normalizeForSearch(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Search across the entire Bible in the chosen translation
 */
export function searchBible(
  query: string,
  options?: { testament?: 'OT' | 'NT'; bookId?: string; limit?: number; translation?: TranslationType }
): SearchResult[] {
  const cleanQ = query.trim().toLowerCase();
  if (!cleanQ) return [];

  const normQ = normalizeForSearch(cleanQ);
  if (!normQ) return [];

  const maxResults = options?.limit || 80;
  const translation = options?.translation || 'ubio';
  const results: SearchResult[] = [];

  for (const book of CANONICAL_BOOKS) {
    if (options?.testament && book.testament !== options.testament) continue;
    if (options?.bookId && book.id !== options.bookId) continue;

    const data = getBookData(book.id, translation);
    if (!data) continue;

    const chapterNums = Object.keys(data).map(Number).sort((a, b) => a - b);

    for (const ch of chapterNums) {
      const verses = data[ch.toString()] || [];
      for (let idx = 0; idx < verses.length; idx++) {
        const text = verses[idx];
        if (!text) continue;
        const lowerText = text.toLowerCase();
        const normText = normalizeForSearch(text);

        // Exact phrase match: words must appear in exact order and contiguity
        const isMatch = lowerText.includes(cleanQ) || normText.includes(normQ);

        if (isMatch) {
          results.push({
            bookId: book.id,
            bookName: book.nameUkr,
            testament: book.testament,
            chapter: ch,
            verse: idx + 1,
            textUkr: text,
            matches: [cleanQ]
          });

          if (results.length >= maxResults) {
            return results;
          }
        }
      }
    }
  }

  return results;
}

/**
 * Get a random verse from the complete authentic Bible
 */
export function getRandomVerse(translation: TranslationType = 'ubio'): { ref: string; bookId: string; chapter: number; verse: number; text: string } {
  const randomBook = CANONICAL_BOOKS[Math.floor(Math.random() * CANONICAL_BOOKS.length)];
  const data = getBookData(randomBook.id, translation);
  
  if (data) {
    const chapters = Object.keys(data);
    if (chapters.length > 0) {
      const randomChStr = chapters[Math.floor(Math.random() * chapters.length)];
      const chNum = parseInt(randomChStr, 10);
      const verses = data[randomChStr];
      if (verses && verses.length > 0) {
        const vIdx = Math.floor(Math.random() * verses.length);
        return {
          ref: `${randomBook.nameUkr} ${chNum}:${vIdx + 1}`,
          bookId: randomBook.id,
          chapter: chNum,
          verse: vIdx + 1,
          text: verses[vIdx]
        };
      }
    }
  }

  return {
    ref: "Івана 3:16",
    bookId: "jhn",
    chapter: 3,
    verse: 16,
    text: "Так-бо Бог полюбив світ, що дав Сина Свого Однородженого, щоб кожен, хто вірує в Нього, не згинув, але мав життя вічне."
  };
}
