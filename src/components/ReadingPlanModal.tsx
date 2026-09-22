import React, { useState, useEffect } from 'react';
import { TerminalTheme, BookInfo } from '../types';
import { CANONICAL_BOOKS } from '../data/canonicalBooks';
import { THEMES } from '../utils/themeStyles';
import { Calendar, X, CheckSquare, Square, Trophy, ArrowRight, Sparkles } from 'lucide-react';
import { terminalSounds } from '../services/soundEffects';

interface ReadingPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToRef: (book: BookInfo, chapter: number) => void;
  theme: TerminalTheme;
}

interface PlanDay {
  day: number;
  title: string;
  otRef: string;
  otBookId: string;
  otCh: number;
  ntRef: string;
  ntBookId: string;
  ntCh: number;
  psaRef: string;
  psaCh: number;
}

export const ReadingPlanModal: React.FC<ReadingPlanModalProps> = ({
  isOpen,
  onClose,
  onNavigateToRef,
  theme
}) => {
  const currentTheme = THEMES[theme];
  const [completedDays, setCompletedDays] = useState<Set<number>>(new Set());
  const [selectedMonth, setSelectedMonth] = useState<number>(1);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cli_bible_plan_completed');
      if (saved) {
        setCompletedDays(new Set(JSON.parse(saved)));
      }
    } catch {}
  }, []);

  if (!isOpen) return null;

  const toggleDay = (day: number) => {
    terminalSounds.playKeyClick();
    setCompletedDays(prev => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      try {
        localStorage.setItem('cli_bible_plan_completed', JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  };

  // Generate 30 days for selected month
  const daysInMonth = 30;
  const startDay = (selectedMonth - 1) * 30 + 1;
  const planDays: PlanDay[] = Array.from({ length: daysInMonth }, (_, idx) => {
    const day = startDay + idx;
    const otCh = ((day * 3 - 2) % 50) + 1;
    const ntCh = ((day - 1) % 28) + 1;
    const psaCh = ((day - 1) % 150) + 1;

    return {
      day,
      title: `День ${day}`,
      otRef: `Буття ${otCh}`,
      otBookId: 'gen',
      otCh: otCh,
      ntRef: `Матвія ${ntCh}`,
      ntBookId: 'mat',
      ntCh: ntCh,
      psaRef: `Псалми ${psaCh}`,
      psaCh: psaCh
    };
  });

  const progressPercent = Math.round((completedDays.size / 365) * 100);

  const navigateTo = (bookId: string, ch: number) => {
    terminalSounds.playKeyClick();
    const b = CANONICAL_BOOKS.find(book => book.id === bookId) || CANONICAL_BOOKS[0];
    onNavigateToRef(b, ch);
    onClose();
  };

  return (
    <div 
      id="modal-reading-plan"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-sm font-mono select-text"
      onClick={onClose}
    >
      <div 
        className={`w-full max-w-3xl h-[85vh] flex flex-col rounded-lg border-2 ${currentTheme.borderActive} ${currentTheme.bg} shadow-2xl overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-4 py-3 border-b ${currentTheme.border} ${currentTheme.bgSecondary} flex items-center justify-between select-none`}>
          <div className="flex items-center space-x-2 font-bold text-sm">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span className={currentTheme.textBright}>РІЧНИЙ ПЛАН ЧИТАННЯ БІБЛІЇ (365 ДНІВ)</span>
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

        {/* Progress Bar & Month Tabs */}
        <div className="p-3 border-b border-current/10 space-y-3 bg-black/20 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span>Прогрес річного читання: <strong>{completedDays.size} / 365 днів ({progressPercent}%)</strong></span>
            </div>
          </div>
          <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden border border-current/20">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-green-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Month Tabs */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 text-[11px]">
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <button
                key={m}
                onClick={() => {
                  terminalSounds.playKeyClick();
                  setSelectedMonth(m);
                }}
                className={`px-2.5 py-1 rounded border whitespace-nowrap font-bold ${selectedMonth === m ? `${currentTheme.accentBg} ${currentTheme.borderActive}` : 'border-current/10 hover:border-current/40 opacity-70 hover:opacity-100'}`}
              >
                Місяць {m}
              </button>
            ))}
          </div>
        </div>

        {/* Days List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
          {planDays.map((p) => {
            const isDone = completedDays.has(p.day);
            return (
              <div
                key={p.day}
                className={`p-3 rounded border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 ${isDone ? 'border-emerald-500/40 bg-emerald-950/20 opacity-80' : `border-current/20 bg-white/5 hover:bg-white/10`}`}
              >
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => toggleDay(p.day)}
                    className="p-0.5 hover:scale-110 transition"
                  >
                    {isDone ? <CheckSquare className="w-5 h-5 text-emerald-400" /> : <Square className="w-5 h-5 opacity-60" />}
                  </button>
                  <div>
                    <div className="font-bold text-xs flex items-center space-x-2">
                      <span>День {p.day}</span>
                      {isDone && <span className="text-[10px] text-emerald-400 uppercase font-mono">Виконано</span>}
                    </div>
                    <div className="text-xs opacity-75 font-mono space-x-2">
                      <span>{p.otRef}</span> • <span>{p.ntRef}</span> • <span>{p.psaRef}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 self-end sm:self-center">
                  <button
                    onClick={() => navigateTo(p.otBookId, p.otCh)}
                    className="px-2 py-1 rounded text-[11px] bg-white/10 hover:bg-white/20 transition flex items-center space-x-1"
                  >
                    <span>{p.otRef}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => navigateTo(p.ntBookId, p.ntCh)}
                    className="px-2 py-1 rounded text-[11px] bg-white/10 hover:bg-white/20 transition flex items-center space-x-1"
                  >
                    <span>{p.ntRef}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
