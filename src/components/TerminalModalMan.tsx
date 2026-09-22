import React from 'react';
import { TerminalTheme } from '../types';
import { THEMES } from '../utils/themeStyles';
import { X, Book, Terminal, HelpCircle } from 'lucide-react';
import { terminalSounds } from '../services/soundEffects';

interface TerminalModalManProps {
  isOpen: boolean;
  onClose: () => void;
  theme: TerminalTheme;
}

export const TerminalModalMan: React.FC<TerminalModalManProps> = ({
  isOpen,
  onClose,
  theme
}) => {
  const currentTheme = THEMES[theme];

  if (!isOpen) return null;

  return (
    <div 
      id="modal-man-page"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-sm font-mono select-text"
      onClick={onClose}
    >
      <div 
        className={`w-full max-w-4xl h-[90vh] flex flex-col rounded-lg border-2 ${currentTheme.borderActive} ${currentTheme.bg} shadow-2xl overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-4 py-2.5 border-b ${currentTheme.border} ${currentTheme.bgSecondary} flex items-center justify-between select-none`}>
          <div className="flex items-center space-x-2 font-bold text-xs md:text-sm">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span className={currentTheme.textBright}>MANUAL: bible(1) — Holy Scriptures Terminal CLI</span>
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

        {/* Man Page Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 text-xs md:text-sm leading-relaxed min-h-0 text-white/90">
          <div>
            <div className="font-bold text-yellow-400 mb-1">NAME</div>
            <div className="pl-4">
              <strong>bible</strong> — консольний інтерфейс та TUI рідер для читання і пошуку Святого Письма (66 канонічних книг).
            </div>
          </div>

          <div>
            <div className="font-bold text-yellow-400 mb-1">SYNOPSIS</div>
            <div className="pl-4 font-mono bg-black/40 p-2 rounded border border-current/20 space-y-1">
              <div><strong>read</strong> &lt;книга&gt; &lt;глава&gt;[:вірш[-кінець]]</div>
              <div><strong>search</strong> &lt;запит&gt; [-b книга] [-ot|-nt]</div>
              <div><strong>books</strong> [ot|nt|категорія]</div>
              <div><strong>goto</strong> &lt;посилання&gt;</div>
              <div><strong>theme</strong> &lt;matrix|amber|nord|cyberpunk|dos|paper|dracula|solarized&gt;</div>
              <div><strong>translation</strong> &lt;ukr|eng|parallel&gt;</div>
            </div>
          </div>

          <div>
            <div className="font-bold text-yellow-400 mb-1">DESCRIPTION</div>
            <div className="pl-4 space-y-2">
              <p>
                <strong>CLI Bible</strong> — це повнофункціональний термінал Святого Письма, створений для швидкого пошуку, глибокого читання, закладок та паралельного порівняння текстів в естетиці класичних терміналів (Matrix CRT, Amber 1982, DOS VGA тощо).
              </p>
              <p>
                Підтримує український переклад професора Івана Огієнка та англійський переклад King James Version (KJV).
              </p>
            </div>
          </div>

          <div>
            <div className="font-bold text-yellow-400 mb-1">KEYBOARD SHORTCUTS (ГАРЯЧІ КЛАВІШІ)</div>
            <div className="pl-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded bg-black/30 border border-current/10">
                <span className="font-bold text-cyan-300">j / ↓ / Space</span> — прокрутка вниз
              </div>
              <div className="p-2 rounded bg-black/30 border border-current/10">
                <span className="font-bold text-cyan-300">k / ↑</span> — прокрутка вгору
              </div>
              <div className="p-2 rounded bg-black/30 border border-current/10">
                <span className="font-bold text-cyan-300">h / ← / p</span> — попередня глава
              </div>
              <div className="p-2 rounded bg-black/30 border border-current/10">
                <span className="font-bold text-cyan-300">l / → / n</span> — наступна глава
              </div>
              <div className="p-2 rounded bg-black/30 border border-current/10">
                <span className="font-bold text-cyan-300">/ (Слеш)</span> — відкрити вікно пошуку
              </div>
              <div className="p-2 rounded bg-black/30 border border-current/10">
                <span className="font-bold text-cyan-300">Tab</span> — автодоповнення в командному рядку
              </div>
              <div className="p-2 rounded bg-black/30 border border-current/10">
                <span className="font-bold text-cyan-300">↑ / ↓ (в інпуті)</span> — історія команд
              </div>
              <div className="p-2 rounded bg-black/30 border border-current/10">
                <span className="font-bold text-cyan-300">Esc</span> — закрити модальне вікно
              </div>
            </div>
          </div>

          <div>
            <div className="font-bold text-yellow-400 mb-1">EXAMPLES (ПРИКЛАДИ)</div>
            <div className="pl-4 space-y-1 font-mono text-xs">
              <div className="p-1.5 bg-black/30 rounded"><code>read Івана 3:16</code> — відкрити Євангеліє від Івана, розділ 3, вірш 16</div>
              <div className="p-1.5 bg-black/30 rounded"><code>read Псалми 23</code> — відкрити 23-й Псалом</div>
              <div className="p-1.5 bg-black/30 rounded"><code>read Бут 1:1-5</code> — перші 5 віршів книги Буття</div>
              <div className="p-1.5 bg-black/30 rounded"><code>search любов</code> — пошук усіх згадок слова &quot;любов&quot;</div>
              <div className="p-1.5 bg-black/30 rounded"><code>theme amber</code> — встановити теплий бурштиновий CRT-стиль</div>
              <div className="p-1.5 bg-black/30 rounded"><code>random</code> — отримати надихаючий вірш дня</div>
              <div className="p-1.5 bg-black/30 rounded"><code>stats</code> — вивести канонічну статистику Біблії</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-4 py-2 border-t ${currentTheme.border} ${currentTheme.bgSecondary} flex items-center justify-between text-[11px] opacity-70 select-none`}>
          <span>BIBLE(1) • Holy Scriptures CLI Manual</span>
          <kbd className="px-1.5 py-0.5 bg-black/40 border border-current/20 rounded font-mono">Esc для закриття</kbd>
        </div>
      </div>
    </div>
  );
};
