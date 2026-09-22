import { BookInfo, Verse, SearchResult } from '../types';
import { CANONICAL_BOOKS } from './canonicalBooks';

// Import all 66 Ukrainian Bible JSON books from /src/ubio/
const ubioModules = import.meta.glob<Record<string, string[]>>('../ubio/*.json', {
  eager: true,
  import: 'default'
});

// Map book ID from canonicalBooks to the corresponding ubio filename
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

// Index data by normalized file key
const ubioData: Record<string, Record<string, string[]>> = {};

for (const path in ubioModules) {
  const match = path.match(/\/([^/]+)\.json$/);
  if (match) {
    const key = match[1];
    ubioData[key] = ubioModules[path];
  }
}

/**
 * Get raw chapter mapping for a specific book ID
 */
export function getBookData(bookId: string): Record<string, string[]> | undefined {
  const fileKey = UBIO_FILE_MAP[bookId] || bookId;
  return ubioData[fileKey];
}

/**
 * Get the total number of chapters in a book from the ubio files
 */
export function getBookChapterCount(bookId: string): number {
  const data = getBookData(bookId);
  if (data) {
    return Object.keys(data).length;
  }
  const book = CANONICAL_BOOKS.find(b => b.id === bookId);
  return book?.chaptersCount || 1;
}

/**
 * Get all verses for a given book and chapter from authentic ubio translation
 */
export function getChapterVerses(book: BookInfo, chapter: number): Verse[] {
  const data = getBookData(book.id);
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

/**
 * Search across the entire Ukrainian Bible (all 66 books)
 */
export function searchBible(
  query: string,
  options?: { testament?: 'OT' | 'NT'; bookId?: string; limit?: number }
): SearchResult[] {
  const cleanQ = query.trim().toLowerCase();
  if (!cleanQ) return [];

  const maxResults = options?.limit || 60;
  const results: SearchResult[] = [];

  for (const book of CANONICAL_BOOKS) {
    if (options?.testament && book.testament !== options.testament) continue;
    if (options?.bookId && book.id !== options.bookId) continue;

    const data = getBookData(book.id);
    if (!data) continue;

    const chapterNums = Object.keys(data).map(Number).sort((a, b) => a - b);

    for (const ch of chapterNums) {
      const verses = data[ch.toString()] || [];
      for (let idx = 0; idx < verses.length; idx++) {
        const text = verses[idx];
        if (text && text.toLowerCase().includes(cleanQ)) {
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
 * Get a random verse from the complete authentic Ukrainian Bible
 */
export function getRandomVerse(): { ref: string; bookId: string; chapter: number; verse: number; text: string } {
  const randomBook = CANONICAL_BOOKS[Math.floor(Math.random() * CANONICAL_BOOKS.length)];
  const data = getBookData(randomBook.id);
  
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
