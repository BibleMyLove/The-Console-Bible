import { BookInfo } from '../types';

export const CANONICAL_BOOKS: BookInfo[] = [
  // OLD TESTAMENT (СТАРИЙ ЗАПОВІТ - 39 книг)
  // П'ятикнижжя (Law)
  {
    id: 'gen',
    number: 1,
    nameUkr: 'Буття',
    nameEng: 'Genesis',
    shortUkr: 'Бут',
    shortEng: 'Gen',
    aliases: ['бут', 'буття', 'gen', 'genesis', '1'],
    testament: 'OT',
    category: 'law',
    categoryUkr: 'П\'ятикнижжя',
    chaptersCount: 50,
    totalVersesApprox: 1533
  },
  {
    id: 'exo',
    number: 2,
    nameUkr: 'Вихід',
    nameEng: 'Exodus',
    shortUkr: 'Вих',
    shortEng: 'Exo',
    aliases: ['вих', 'вихід', 'exo', 'exod', 'exodus', '2'],
    testament: 'OT',
    category: 'law',
    categoryUkr: 'П\'ятикнижжя',
    chaptersCount: 40,
    totalVersesApprox: 1213
  },
  {
    id: 'lev',
    number: 3,
    nameUkr: 'Левит',
    nameEng: 'Leviticus',
    shortUkr: 'Лев',
    shortEng: 'Lev',
    aliases: ['лев', 'левит', 'lev', 'leviticus', '3'],
    testament: 'OT',
    category: 'law',
    categoryUkr: 'П\'ятикнижжя',
    chaptersCount: 27,
    totalVersesApprox: 859
  },
  {
    id: 'num',
    number: 4,
    nameUkr: 'Числа',
    nameEng: 'Numbers',
    shortUkr: 'Чис',
    shortEng: 'Num',
    aliases: ['чис', 'числа', 'num', 'numbers', '4'],
    testament: 'OT',
    category: 'law',
    categoryUkr: 'П\'ятикнижжя',
    chaptersCount: 36,
    totalVersesApprox: 1288
  },
  {
    id: 'deu',
    number: 5,
    nameUkr: 'Повторення Закону',
    nameEng: 'Deuteronomy',
    shortUkr: 'Повт',
    shortEng: 'Deut',
    aliases: ['повт', 'повторення', 'повторення закону', 'деут', 'deut', 'deuteronomy', '5'],
    testament: 'OT',
    category: 'law',
    categoryUkr: 'П\'ятикнижжя',
    chaptersCount: 34,
    totalVersesApprox: 959
  },

  // Історичні книги (History)
  {
    id: 'jos',
    number: 6,
    nameUkr: 'Ісуса Навина',
    nameEng: 'Joshua',
    shortUkr: 'Нав',
    shortEng: 'Josh',
    aliases: ['нав', 'ісус навин', 'ісуса навина', 'навина', 'josh', 'joshua', 'jos', '6'],
    testament: 'OT',
    category: 'history',
    categoryUkr: 'Історичні',
    chaptersCount: 24,
    totalVersesApprox: 658
  },
  {
    id: 'jdg',
    number: 7,
    nameUkr: 'Суддів',
    nameEng: 'Judges',
    shortUkr: 'Суд',
    shortEng: 'Judg',
    aliases: ['суд', 'суддів', 'judg', 'judges', 'jdg', '7'],
    testament: 'OT',
    category: 'history',
    categoryUkr: 'Історичні',
    chaptersCount: 21,
    totalVersesApprox: 618
  },
  {
    id: 'rut',
    number: 8,
    nameUkr: 'Рут',
    nameEng: 'Ruth',
    shortUkr: 'Рут',
    shortEng: 'Ruth',
    aliases: ['рут', 'ruth', 'rut', '8'],
    testament: 'OT',
    category: 'history',
    categoryUkr: 'Історичні',
    chaptersCount: 4,
    totalVersesApprox: 85
  },
  {
    id: '1sa',
    number: 9,
    nameUkr: '1 Самуїлова',
    nameEng: '1 Samuel',
    shortUkr: '1Сам',
    shortEng: '1Sam',
    aliases: ['1сам', '1 сам', '1 самуїла', '1 самуїлова', '1sam', '1samuel', '1sa', '9'],
    testament: 'OT',
    category: 'history',
    categoryUkr: 'Історичні',
    chaptersCount: 31,
    totalVersesApprox: 810
  },
  {
    id: '2sa',
    number: 10,
    nameUkr: '2 Самуїлова',
    nameEng: '2 Samuel',
    shortUkr: '2Сам',
    shortEng: '2Sam',
    aliases: ['2сам', '2 сам', '2 самуїла', '2 самуїлова', '2sam', '2samuel', '2sa', '10'],
    testament: 'OT',
    category: 'history',
    categoryUkr: 'Історичні',
    chaptersCount: 24,
    totalVersesApprox: 695
  },
  {
    id: '1ki',
    number: 11,
    nameUkr: '1 Царів',
    nameEng: '1 Kings',
    shortUkr: '1Цар',
    shortEng: '1Kings',
    aliases: ['1цар', '1 цар', '1 царів', '1kings', '1 kings', '1ki', '11'],
    testament: 'OT',
    category: 'history',
    categoryUkr: 'Історичні',
    chaptersCount: 22,
    totalVersesApprox: 816
  },
  {
    id: '2ki',
    number: 12,
    nameUkr: '2 Царів',
    nameEng: '2 Kings',
    shortUkr: '2Цар',
    shortEng: '2Kings',
    aliases: ['2цар', '2 цар', '2 царів', '2kings', '2 kings', '2ki', '12'],
    testament: 'OT',
    category: 'history',
    categoryUkr: 'Історичні',
    chaptersCount: 25,
    totalVersesApprox: 714
  },
  {
    id: '1ch',
    number: 13,
    nameUkr: '1 Хронік',
    nameEng: '1 Chronicles',
    shortUkr: '1Хр',
    shortEng: '1Chron',
    aliases: ['1хр', '1 хр', '1хронік', '1 хронік', '1 хроніки', '1chron', '1chronicles', '1ch', '13'],
    testament: 'OT',
    category: 'history',
    categoryUkr: 'Історичні',
    chaptersCount: 29,
    totalVersesApprox: 941
  },
  {
    id: '2ch',
    number: 14,
    nameUkr: '2 Хронік',
    nameEng: '2 Chronicles',
    shortUkr: '2Хр',
    shortEng: '2Chron',
    aliases: ['2хр', '2 хр', '2хронік', '2 хронік', '2 хроніки', '2chron', '2chronicles', '2ch', '14'],
    testament: 'OT',
    category: 'history',
    categoryUkr: 'Історичні',
    chaptersCount: 36,
    totalVersesApprox: 822
  },
  {
    id: 'ezr',
    number: 15,
    nameUkr: 'Ездри',
    nameEng: 'Ezra',
    shortUkr: 'Езд',
    shortEng: 'Ezra',
    aliases: ['езд', 'ездри', 'ездра', 'ezra', 'ezr', '15'],
    testament: 'OT',
    category: 'history',
    categoryUkr: 'Історичні',
    chaptersCount: 10,
    totalVersesApprox: 280
  },
  {
    id: 'neh',
    number: 16,
    nameUkr: 'Неємії',
    nameEng: 'Nehemiah',
    shortUkr: 'Неєм',
    shortEng: 'Neh',
    aliases: ['неєм', 'неємії', 'неємія', 'neh', 'nehemiah', '16'],
    testament: 'OT',
    category: 'history',
    categoryUkr: 'Історичні',
    chaptersCount: 13,
    totalVersesApprox: 406
  },
  {
    id: 'est',
    number: 17,
    nameUkr: 'Естер',
    nameEng: 'Esther',
    shortUkr: 'Ест',
    shortEng: 'Esth',
    aliases: ['ест', 'естер', 'esth', 'esther', 'est', '17'],
    testament: 'OT',
    category: 'history',
    categoryUkr: 'Історичні',
    chaptersCount: 10,
    totalVersesApprox: 167
  },

  // Поетичні та книги Мудрості (Poetry)
  {
    id: 'job',
    number: 18,
    nameUkr: 'Йова',
    nameEng: 'Job',
    shortUkr: 'Йов',
    shortEng: 'Job',
    aliases: ['йов', 'йова', 'job', '18'],
    testament: 'OT',
    category: 'poetry',
    categoryUkr: 'Поетичні та Мудрість',
    chaptersCount: 42,
    totalVersesApprox: 1070
  },
  {
    id: 'psa',
    number: 19,
    nameUkr: 'Псалми',
    nameEng: 'Psalms',
    shortUkr: 'Пс',
    shortEng: 'Ps',
    aliases: ['пс', 'псалми', 'псалом', 'ps', 'psa', 'psalms', '19'],
    testament: 'OT',
    category: 'poetry',
    categoryUkr: 'Поетичні та Мудрість',
    chaptersCount: 150,
    totalVersesApprox: 2461
  },
  {
    id: 'pro',
    number: 20,
    nameUkr: 'Приповісті',
    nameEng: 'Proverbs',
    shortUkr: 'Прип',
    shortEng: 'Prov',
    aliases: ['прип', 'приповісті', 'притчі', 'приповістей', 'prov', 'proverbs', 'pro', '20'],
    testament: 'OT',
    category: 'poetry',
    categoryUkr: 'Поетичні та Мудрість',
    chaptersCount: 31,
    totalVersesApprox: 915
  },
  {
    id: 'ecc',
    number: 21,
    nameUkr: 'Екклезіяст',
    nameEng: 'Ecclesiastes',
    shortUkr: 'Еккл',
    shortEng: 'Eccl',
    aliases: ['еккл', 'екклезіяст', 'проповідник', 'eccl', 'ecclesiastes', 'ecc', '21'],
    testament: 'OT',
    category: 'poetry',
    categoryUkr: 'Поетичні та Мудрість',
    chaptersCount: 12,
    totalVersesApprox: 222
  },
  {
    id: 'sng',
    number: 22,
    nameUkr: 'Пісня над піснями',
    nameEng: 'Song of Solomon',
    shortUkr: 'Пісн',
    shortEng: 'Song',
    aliases: ['пісн', 'пісня', 'пісня пісень', 'пісня над піснями', 'song', 'canticles', 'sng', '22'],
    testament: 'OT',
    category: 'poetry',
    categoryUkr: 'Поетичні та Мудрість',
    chaptersCount: 8,
    totalVersesApprox: 117
  },

  // Великі пророки (Major Prophets)
  {
    id: 'isa',
    number: 23,
    nameUkr: 'Ісаї',
    nameEng: 'Isaiah',
    shortUkr: 'Іса',
    shortEng: 'Isa',
    aliases: ['іса', 'ісаї', 'ісая', 'isa', 'isaiah', '23'],
    testament: 'OT',
    category: 'major_prophets',
    categoryUkr: 'Великі пророки',
    chaptersCount: 66,
    totalVersesApprox: 1292
  },
  {
    id: 'jer',
    number: 24,
    nameUkr: 'Єремії',
    nameEng: 'Jeremiah',
    shortUkr: 'Єрем',
    shortEng: 'Jer',
    aliases: ['єрем', 'єремії', 'єремія', 'jer', 'jeremiah', '24'],
    testament: 'OT',
    category: 'major_prophets',
    categoryUkr: 'Великі пророки',
    chaptersCount: 52,
    totalVersesApprox: 1364
  },
  {
    id: 'lam',
    number: 25,
    nameUkr: 'Плач Єремії',
    nameEng: 'Lamentations',
    shortUkr: 'Плач',
    shortEng: 'Lam',
    aliases: ['плач', 'плач єремії', 'плач єрем', 'lam', 'lamentations', '25'],
    testament: 'OT',
    category: 'major_prophets',
    categoryUkr: 'Великі пророки',
    chaptersCount: 5,
    totalVersesApprox: 154
  },
  {
    id: 'ezk',
    number: 26,
    nameUkr: 'Єзекіїля',
    nameEng: 'Ezekiel',
    shortUkr: 'Єзек',
    shortEng: 'Ezek',
    aliases: ['єзек', 'єзекіїля', 'єзекіїль', 'ezek', 'ezekiel', 'ezk', '26'],
    testament: 'OT',
    category: 'major_prophets',
    categoryUkr: 'Великі пророки',
    chaptersCount: 48,
    totalVersesApprox: 1273
  },
  {
    id: 'dan',
    number: 27,
    nameUkr: 'Даниїла',
    nameEng: 'Daniel',
    shortUkr: 'Дан',
    shortEng: 'Dan',
    aliases: ['дан', 'даниїла', 'даниїл', 'dan', 'daniel', '27'],
    testament: 'OT',
    category: 'major_prophets',
    categoryUkr: 'Великі пророки',
    chaptersCount: 12,
    totalVersesApprox: 357
  },

  // Малі пророки (Minor Prophets)
  {
    id: 'hos',
    number: 28,
    nameUkr: 'Осії',
    nameEng: 'Hosea',
    shortUkr: 'Ос',
    shortEng: 'Hos',
    aliases: ['ос', 'осії', 'осія', 'hos', 'hosea', '28'],
    testament: 'OT',
    category: 'minor_prophets',
    categoryUkr: 'Малі пророки',
    chaptersCount: 14,
    totalVersesApprox: 197
  },
  {
    id: 'jol',
    number: 29,
    nameUkr: 'Йоіла',
    nameEng: 'Joel',
    shortUkr: 'Йоіл',
    shortEng: 'Joel',
    aliases: ['йоіл', 'йоіла', 'joel', 'jol', '29'],
    testament: 'OT',
    category: 'minor_prophets',
    categoryUkr: 'Малі пророки',
    chaptersCount: 3,
    totalVersesApprox: 73
  },
  {
    id: 'amo',
    number: 30,
    nameUkr: 'Амоса',
    nameEng: 'Amos',
    shortUkr: 'Ам',
    shortEng: 'Amos',
    aliases: ['ам', 'амоса', 'амос', 'amo', 'amos', '30'],
    testament: 'OT',
    category: 'minor_prophets',
    categoryUkr: 'Малі пророки',
    chaptersCount: 9,
    totalVersesApprox: 146
  },
  {
    id: 'oba',
    number: 31,
    nameUkr: 'Овдія',
    nameEng: 'Obadiah',
    shortUkr: 'Овд',
    shortEng: 'Obad',
    aliases: ['овд', 'овдія', 'овдій', 'obad', 'obadiah', 'oba', '31'],
    testament: 'OT',
    category: 'minor_prophets',
    categoryUkr: 'Малі пророки',
    chaptersCount: 1,
    totalVersesApprox: 21
  },
  {
    id: 'jon',
    number: 32,
    nameUkr: 'Йони',
    nameEng: 'Jonah',
    shortUkr: 'Йон',
    shortEng: 'Jonah',
    aliases: ['йон', 'йони', 'йона', 'jon', 'jonah', '32'],
    testament: 'OT',
    category: 'minor_prophets',
    categoryUkr: 'Малі пророки',
    chaptersCount: 4,
    totalVersesApprox: 48
  },
  {
    id: 'mic',
    number: 33,
    nameUkr: 'Михея',
    nameEng: 'Micah',
    shortUkr: 'Мих',
    shortEng: 'Mic',
    aliases: ['мих', 'михея', 'михей', 'mic', 'micah', '33'],
    testament: 'OT',
    category: 'minor_prophets',
    categoryUkr: 'Малі пророки',
    chaptersCount: 7,
    totalVersesApprox: 105
  },
  {
    id: 'nam',
    number: 34,
    nameUkr: 'Наума',
    nameEng: 'Nahum',
    shortUkr: 'Наум',
    shortEng: 'Nah',
    aliases: ['наум', 'наума', 'nah', 'nahum', 'nam', '34'],
    testament: 'OT',
    category: 'minor_prophets',
    categoryUkr: 'Малі пророки',
    chaptersCount: 3,
    totalVersesApprox: 47
  },
  {
    id: 'hab',
    number: 35,
    nameUkr: 'Авакума',
    nameEng: 'Habakkuk',
    shortUkr: 'Авак',
    shortEng: 'Hab',
    aliases: ['авак', 'авакума', 'авакум', 'hab', 'habakkuk', '35'],
    testament: 'OT',
    category: 'minor_prophets',
    categoryUkr: 'Малі пророки',
    chaptersCount: 3,
    totalVersesApprox: 56
  },
  {
    id: 'zep',
    number: 36,
    nameUkr: 'Софонії',
    nameEng: 'Zephaniah',
    shortUkr: 'Соф',
    shortEng: 'Zeph',
    aliases: ['соф', 'софонії', 'софонія', 'zeph', 'zephaniah', 'zep', '36'],
    testament: 'OT',
    category: 'minor_prophets',
    categoryUkr: 'Малі пророки',
    chaptersCount: 3,
    totalVersesApprox: 53
  },
  {
    id: 'hag',
    number: 37,
    nameUkr: 'Огія',
    nameEng: 'Haggai',
    shortUkr: 'Ог',
    shortEng: 'Hag',
    aliases: ['ог', 'огія', 'огій', 'hag', 'haggai', '37'],
    testament: 'OT',
    category: 'minor_prophets',
    categoryUkr: 'Малі пророки',
    chaptersCount: 2,
    totalVersesApprox: 38
  },
  {
    id: 'zec',
    number: 38,
    nameUkr: 'Захарія',
    nameEng: 'Zechariah',
    shortUkr: 'Зах',
    shortEng: 'Zech',
    aliases: ['зах', 'захарія', 'захарій', 'zech', 'zechariah', '38'],
    testament: 'OT',
    category: 'minor_prophets',
    categoryUkr: 'Малі пророки',
    chaptersCount: 14,
    totalVersesApprox: 211
  },
  {
    id: 'mal',
    number: 39,
    nameUkr: 'Малахії',
    nameEng: 'Malachi',
    shortUkr: 'Мал',
    shortEng: 'Mal',
    aliases: ['мал', 'малахії', 'малахія', 'mal', 'malachi', '39'],
    testament: 'OT',
    category: 'minor_prophets',
    categoryUkr: 'Малі пророки',
    chaptersCount: 4,
    totalVersesApprox: 55
  },

  // NEW TESTAMENT (НОВИЙ ЗАПОВІТ - 27 книг)
  // Євангелії (Gospels)
  {
    id: 'mat',
    number: 40,
    nameUkr: 'Від Матвія',
    nameEng: 'Matthew',
    shortUkr: 'Мат',
    shortEng: 'Matt',
    aliases: ['мат', 'матвія', 'матвій', 'від матвія', 'matt', 'matthew', 'mt', 'mat', '40'],
    testament: 'NT',
    category: 'gospels',
    categoryUkr: 'Євангелії',
    chaptersCount: 28,
    totalVersesApprox: 1071
  },
  {
    id: 'mrk',
    number: 41,
    nameUkr: 'Від Марка',
    nameEng: 'Mark',
    shortUkr: 'Мар',
    shortEng: 'Mark',
    aliases: ['мар', 'марка', 'марк', 'від марка', 'mark', 'mrk', 'mk', '41'],
    testament: 'NT',
    category: 'gospels',
    categoryUkr: 'Євангелії',
    chaptersCount: 16,
    totalVersesApprox: 678
  },
  {
    id: 'luk',
    number: 42,
    nameUkr: 'Від Луки',
    nameEng: 'Luke',
    shortUkr: 'Лук',
    shortEng: 'Luke',
    aliases: ['лук', 'луки', 'лука', 'від луки', 'luke', 'luk', 'lk', '42'],
    testament: 'NT',
    category: 'gospels',
    categoryUkr: 'Євангелії',
    chaptersCount: 24,
    totalVersesApprox: 1151
  },
  {
    id: 'jhn',
    number: 43,
    nameUkr: 'Від Івана',
    nameEng: 'John',
    shortUkr: 'Ів',
    shortEng: 'John',
    aliases: ['ів', 'івана', 'іван', 'від івана', 'john', 'jhn', 'jn', '43'],
    testament: 'NT',
    category: 'gospels',
    categoryUkr: 'Євангелії',
    chaptersCount: 21,
    totalVersesApprox: 879
  },

  // Дії Апостолів (Acts)
  {
    id: 'act',
    number: 44,
    nameUkr: 'Дії Апостолів',
    nameEng: 'Acts',
    shortUkr: 'Дії',
    shortEng: 'Acts',
    aliases: ['дії', 'діян', 'діяння', 'дії апостолів', 'acts', 'act', '44'],
    testament: 'NT',
    category: 'church_history',
    categoryUkr: 'Історія Церкви',
    chaptersCount: 28,
    totalVersesApprox: 1007
  },

  // Послання Апостола Павла (Pauline Epistles)
  {
    id: 'rom',
    number: 45,
    nameUkr: 'До Римлян',
    nameEng: 'Romans',
    shortUkr: 'Рим',
    shortEng: 'Rom',
    aliases: ['рим', 'римлян', 'до римлян', 'rom', 'romans', '45'],
    testament: 'NT',
    category: 'pauline_epistles',
    categoryUkr: 'Послання Павла',
    chaptersCount: 16,
    totalVersesApprox: 433
  },
  {
    id: '1co',
    number: 46,
    nameUkr: '1 до Коринтян',
    nameEng: '1 Corinthians',
    shortUkr: '1Кор',
    shortEng: '1Cor',
    aliases: ['1кор', '1 кор', '1коринтян', '1 коринтян', '1 до коринтян', '1cor', '1corinthians', '1co', '46'],
    testament: 'NT',
    category: 'pauline_epistles',
    categoryUkr: 'Послання Павла',
    chaptersCount: 16,
    totalVersesApprox: 437
  },
  {
    id: '2co',
    number: 47,
    nameUkr: '2 до Коринтян',
    nameEng: '2 Corinthians',
    shortUkr: '2Кор',
    shortEng: '2Cor',
    aliases: ['2кор', '2 кор', '2коринтян', '2 коринтян', '2 до коринтян', '2cor', '2corinthians', '2co', '47'],
    testament: 'NT',
    category: 'pauline_epistles',
    categoryUkr: 'Послання Павла',
    chaptersCount: 13,
    totalVersesApprox: 257
  },
  {
    id: 'gal',
    number: 48,
    nameUkr: 'До Галатів',
    nameEng: 'Galatians',
    shortUkr: 'Гал',
    shortEng: 'Gal',
    aliases: ['гал', 'галатів', 'до галатів', 'gal', 'galatians', '48'],
    testament: 'NT',
    category: 'pauline_epistles',
    categoryUkr: 'Послання Павла',
    chaptersCount: 6,
    totalVersesApprox: 149
  },
  {
    id: 'eph',
    number: 49,
    nameUkr: 'До Ефесян',
    nameEng: 'Ephesians',
    shortUkr: 'Еф',
    shortEng: 'Eph',
    aliases: ['еф', 'ефесян', 'до ефесян', 'eph', 'ephesians', '49'],
    testament: 'NT',
    category: 'pauline_epistles',
    categoryUkr: 'Послання Павла',
    chaptersCount: 6,
    totalVersesApprox: 155
  },
  {
    id: 'php',
    number: 50,
    nameUkr: 'До Филип\'ян',
    nameEng: 'Philippians',
    shortUkr: 'Фил',
    shortEng: 'Phil',
    aliases: ['фил', 'филип', 'филип\'ян', 'до филип\'ян', 'phil', 'philippians', 'php', '50'],
    testament: 'NT',
    category: 'pauline_epistles',
    categoryUkr: 'Послання Павла',
    chaptersCount: 4,
    totalVersesApprox: 104
  },
  {
    id: 'col',
    number: 51,
    nameUkr: 'До Колосян',
    nameEng: 'Colossians',
    shortUkr: 'Кол',
    shortEng: 'Col',
    aliases: ['кол', 'колосян', 'до колосян', 'col', 'colossians', '51'],
    testament: 'NT',
    category: 'pauline_epistles',
    categoryUkr: 'Послання Павла',
    chaptersCount: 4,
    totalVersesApprox: 95
  },
  {
    id: '1th',
    number: 52,
    nameUkr: '1 до Солунян',
    nameEng: '1 Thessalonians',
    shortUkr: '1Сол',
    shortEng: '1Thess',
    aliases: ['1сол', '1 сол', '1солунян', '1 солунян', '1 до солунян', 'солунян', '1thess', '1thessalonians', '1th', '52'],
    testament: 'NT',
    category: 'pauline_epistles',
    categoryUkr: 'Послання Павла',
    chaptersCount: 5,
    totalVersesApprox: 89
  },
  {
    id: '2th',
    number: 53,
    nameUkr: '2 до Солунян',
    nameEng: '2 Thessalonians',
    shortUkr: '2Сол',
    shortEng: '2Thess',
    aliases: ['2сол', '2 сол', '2солунян', '2 солунян', '2 до солунян', '2thess', '2thessalonians', '2th', '53'],
    testament: 'NT',
    category: 'pauline_epistles',
    categoryUkr: 'Послання Павла',
    chaptersCount: 3,
    totalVersesApprox: 47
  },
  {
    id: '1ti',
    number: 54,
    nameUkr: '1 до Тимофія',
    nameEng: '1 Timothy',
    shortUkr: '1Тим',
    shortEng: '1Tim',
    aliases: ['1тим', '1 тим', '1тимофія', '1 тимофія', '1 до тимофія', '1tim', '1timothy', '1ti', '54'],
    testament: 'NT',
    category: 'pauline_epistles',
    categoryUkr: 'Послання Павла',
    chaptersCount: 6,
    totalVersesApprox: 113
  },
  {
    id: '2ti',
    number: 55,
    nameUkr: '2 до Тимофія',
    nameEng: '2 Timothy',
    shortUkr: '2Тим',
    shortEng: '2Tim',
    aliases: ['2тим', '2 тим', '2тимофія', '2 тимофія', '2 до тимофія', '2tim', '2timothy', '2ti', '55'],
    testament: 'NT',
    category: 'pauline_epistles',
    categoryUkr: 'Послання Павла',
    chaptersCount: 4,
    totalVersesApprox: 83
  },
  {
    id: 'tit',
    number: 56,
    nameUkr: 'До Тита',
    nameEng: 'Titus',
    shortUkr: 'Тит',
    shortEng: 'Titus',
    aliases: ['тит', 'тита', 'до тита', 'tit', 'titus', '56'],
    testament: 'NT',
    category: 'pauline_epistles',
    categoryUkr: 'Послання Павла',
    chaptersCount: 3,
    totalVersesApprox: 46
  },
  {
    id: 'phm',
    number: 57,
    nameUkr: 'До Филимона',
    nameEng: 'Philemon',
    shortUkr: 'Флм',
    shortEng: 'Phlm',
    aliases: ['флм', 'филимона', 'до филимона', 'phlm', 'philemon', 'phm', '57'],
    testament: 'NT',
    category: 'pauline_epistles',
    categoryUkr: 'Послання Павла',
    chaptersCount: 1,
    totalVersesApprox: 25
  },
  {
    id: 'heb',
    number: 58,
    nameUkr: 'До Євреїв',
    nameEng: 'Hebrews',
    shortUkr: 'Євр',
    shortEng: 'Heb',
    aliases: ['євр', 'євреїв', 'до євреїв', 'heb', 'hebrews', '58'],
    testament: 'NT',
    category: 'general_epistles',
    categoryUkr: 'Загальні послання',
    chaptersCount: 13,
    totalVersesApprox: 303
  },
  {
    id: 'jas',
    number: 59,
    nameUkr: 'Якова',
    nameEng: 'James',
    shortUkr: 'Як',
    shortEng: 'Jas',
    aliases: ['як', 'якова', 'соборне якова', 'jas', 'james', '59'],
    testament: 'NT',
    category: 'general_epistles',
    categoryUkr: 'Загальні послання',
    chaptersCount: 5,
    totalVersesApprox: 108
  },
  {
    id: '1pe',
    number: 60,
    nameUkr: '1 Петра',
    nameEng: '1 Peter',
    shortUkr: '1Пет',
    shortEng: '1Pet',
    aliases: ['1пет', '1 пет', '1петра', '1 петра', '1pet', '1peter', '1pe', '60'],
    testament: 'NT',
    category: 'general_epistles',
    categoryUkr: 'Загальні послання',
    chaptersCount: 5,
    totalVersesApprox: 105
  },
  {
    id: '2pe',
    number: 61,
    nameUkr: '2 Петра',
    nameEng: '2 Peter',
    shortUkr: '2Пет',
    shortEng: '2Pet',
    aliases: ['2пет', '2 пет', '2петра', '2 петра', '2pet', '2peter', '2pe', '61'],
    testament: 'NT',
    category: 'general_epistles',
    categoryUkr: 'Загальні послання',
    chaptersCount: 3,
    totalVersesApprox: 61
  },
  {
    id: '1jn',
    number: 62,
    nameUkr: '1 Івана',
    nameEng: '1 John',
    shortUkr: '1Ів',
    shortEng: '1John',
    aliases: ['1ів', '1 ів', '1івана', '1 івана', '1john', '1jn', '1jhn', '62'],
    testament: 'NT',
    category: 'general_epistles',
    categoryUkr: 'Загальні послання',
    chaptersCount: 5,
    totalVersesApprox: 105
  },
  {
    id: '2jn',
    number: 63,
    nameUkr: '2 Івана',
    nameEng: '2 John',
    shortUkr: '2Ів',
    shortEng: '2John',
    aliases: ['2ів', '2 ів', '2івана', '2 івана', '2john', '2jn', '2jhn', '63'],
    testament: 'NT',
    category: 'general_epistles',
    categoryUkr: 'Загальні послання',
    chaptersCount: 1,
    totalVersesApprox: 13
  },
  {
    id: '3jn',
    number: 64,
    nameUkr: '3 Івана',
    nameEng: '3 John',
    shortUkr: '3Ів',
    shortEng: '3John',
    aliases: ['3ів', '3 ів', '3івана', '3 івана', '3john', '3jn', '3jhn', '64'],
    testament: 'NT',
    category: 'general_epistles',
    categoryUkr: 'Загальні послання',
    chaptersCount: 1,
    totalVersesApprox: 14
  },
  {
    id: 'jud',
    number: 65,
    nameUkr: 'Юди',
    nameEng: 'Jude',
    shortUkr: 'Юд',
    shortEng: 'Jude',
    aliases: ['юд', 'юди', 'соборне юди', 'jude', 'jud', '65'],
    testament: 'NT',
    category: 'general_epistles',
    categoryUkr: 'Загальні послання',
    chaptersCount: 1,
    totalVersesApprox: 25
  },

  // Пророцтво (Prophecy)
  {
    id: 'rev',
    number: 66,
    nameUkr: 'Об\'явлення',
    nameEng: 'Revelation',
    shortUkr: 'Об',
    shortEng: 'Rev',
    aliases: ['об', 'об\'явлення', 'об\'явлення івана', 'апокаліпсис', 'rev', 'revelation', '66'],
    testament: 'NT',
    category: 'prophecy',
    categoryUkr: 'Пророцтво',
    chaptersCount: 22,
    totalVersesApprox: 404
  }
];

export function findBookByQuery(query: string): BookInfo | undefined {
  if (!query) return undefined;
  const clean = query.trim().toLowerCase();
  
  // 1. Direct number check (e.g. "1" to "66")
  const numCheck = parseInt(clean, 10);
  if (!isNaN(numCheck) && numCheck >= 1 && numCheck <= 66 && clean === numCheck.toString()) {
    return CANONICAL_BOOKS.find(b => b.number === numCheck);
  }

  // 2. Exact match by ID, names, short codes, aliases
  const exact = CANONICAL_BOOKS.find(b => 
    b.id.toLowerCase() === clean ||
    b.nameUkr.toLowerCase() === clean ||
    b.nameEng.toLowerCase() === clean ||
    b.shortUkr.toLowerCase() === clean ||
    b.shortEng.toLowerCase() === clean ||
    b.aliases.some(alias => alias.toLowerCase() === clean)
  );
  if (exact) return exact;

  // 3. Match without spaces / punctuation (e.g. "1sam", "1 kings", "1 царів", "1thess")
  const normalized = clean.replace(/[\s_\-–—']/g, '');
  const normMatch = CANONICAL_BOOKS.find(b =>
    b.id.toLowerCase() === normalized ||
    b.nameUkr.toLowerCase().replace(/[\s_\-–—']/g, '') === normalized ||
    b.nameEng.toLowerCase().replace(/[\s_\-–—']/g, '') === normalized ||
    b.shortUkr.toLowerCase().replace(/[\s_\-–—']/g, '') === normalized ||
    b.shortEng.toLowerCase().replace(/[\s_\-–—']/g, '') === normalized ||
    b.aliases.some(alias => alias.toLowerCase().replace(/[\s_\-–—']/g, '') === normalized)
  );
  if (normMatch) return normMatch;

  // 4. Prefix match
  return CANONICAL_BOOKS.find(b => 
    b.nameUkr.toLowerCase().startsWith(clean) ||
    b.nameEng.toLowerCase().startsWith(clean) ||
    b.aliases.some(alias => alias.toLowerCase().startsWith(clean))
  );
}
