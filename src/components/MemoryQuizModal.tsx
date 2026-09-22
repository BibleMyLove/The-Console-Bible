import React, { useState } from 'react';
import { TerminalTheme } from '../types';
import { THEMES } from '../utils/themeStyles';
import { Sparkles, X, CheckCircle2, XCircle, RefreshCw, Trophy, ArrowRight } from 'lucide-react';
import { terminalSounds } from '../services/soundEffects';

interface MemoryQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: TerminalTheme;
}

interface QuizQuestion {
  id: number;
  prompt: string;
  verseQuote: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    prompt: "З якої книги та розділу цей відомий вірш?",
    verseQuote: "Так-бо Бог полюбив світ, що дав Сина Свого Однородженого, щоб кожен, хто вірує в Нього, не згинув, але мав життя вічне.",
    options: ["Від Матвія 5:14", "Від Івана 3:16", "До Римлян 8:28", "1 Коринтян 13:4"],
    correctIndex: 1,
    explanation: "Євангеліє від Івана 3:16 — один із найбільш цитованих віршів Святого Письма."
  },
  {
    id: 2,
    prompt: "Якими словами починається Святе Письмо (Буття 1:1)?",
    verseQuote: "На початку Бог створив...",
    options: ["людину та звірів", "Небо та землю", "сонце, місяць і зорі", "рай в Едені"],
    correctIndex: 1,
    explanation: "Буття 1:1 — 'На початку Бог створив Небо та землю.'"
  },
  {
    id: 3,
    prompt: "Яке продовження 23-го Псалму Давида?",
    verseQuote: "Господь то мій Пастир, тому...",
    options: ["в недостатку не буду", "не злякаюся ворогів", "знайду спокій душі", "буду славити Його"],
    correctIndex: 0,
    explanation: "Псалом 23:1 — 'Господь то мій Пастир, тому в недостатку не буду!'"
  },
  {
    id: 4,
    prompt: "Що, згідно з 1 Коринтян 13:13, є найбільшим серед чеснот?",
    verseQuote: "А тепер залишаються віра, надія, любов, оці три. А найбільша між ними то...",
    options: ["віра", "надія", "любов", "мудрість"],
    correctIndex: 2,
    explanation: "1 Коринтян 13:13 — 'А тепер залишаються віра, надія, любов, оці три. А найбільша між ними то любов!'"
  },
  {
    id: 5,
    prompt: "З якої проповіді взяті Заповіді Блаженств ('Блаженні вбогі духом...')?",
    verseQuote: "Блаженні лагідні, бо землю успадкують вони...",
    options: ["Нагірна проповідь (Матвія 5)", "Промова в Оливному саду", "Проповідь Петра в день П'ятидесятниці", "Послання до Галатів"],
    correctIndex: 0,
    explanation: "Заповіді Блаженств виголошені Ісусом Христом у Нагірній проповіді (Від Матвія 5-7)."
  }
];

export const MemoryQuizModal: React.FC<MemoryQuizModalProps> = ({
  isOpen,
  onClose,
  theme
}) => {
  const currentTheme = THEMES[theme];
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  if (!isOpen) return null;

  const currentQ = QUIZ_QUESTIONS[currentIdx];

  const handleSelectOption = (index: number) => {
    if (isAnswered) return;
    terminalSounds.playKeyClick();
    setSelectedOpt(index);
    setIsAnswered(true);

    if (index === currentQ.correctIndex) {
      setScore(s => s + 1);
      terminalSounds.playCommandExec();
    } else {
      terminalSounds.playBell();
    }
  };

  const handleNext = () => {
    terminalSounds.playKeyClick();
    if (currentIdx + 1 < QUIZ_QUESTIONS.length) {
      setCurrentIdx(i => i + 1);
      setSelectedOpt(null);
      setIsAnswered(false);
    } else {
      setQuizFinished(true);
    }
  };

  const handleRestart = () => {
    terminalSounds.playKeyClick();
    setCurrentIdx(0);
    setSelectedOpt(null);
    setIsAnswered(false);
    setScore(0);
    setQuizFinished(false);
  };

  return (
    <div 
      id="modal-memory-quiz"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-sm font-mono select-text"
      onClick={onClose}
    >
      <div 
        className={`w-full max-w-2xl flex flex-col rounded-lg border-2 ${currentTheme.borderActive} ${currentTheme.bg} shadow-2xl overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-4 py-3 border-b ${currentTheme.border} ${currentTheme.bgSecondary} flex items-center justify-between select-none`}>
          <div className="flex items-center space-x-2 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className={currentTheme.textBright}>ТЕРМІНАЛЬНА ВІКТОРИНА СВЯТОГО ПИСЬМА</span>
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

        {/* Quiz Body */}
        <div className="p-4 md:p-6 space-y-4 text-xs md:text-sm">
          {!quizFinished ? (
            <>
              {/* Question Header & Progress */}
              <div className="flex items-center justify-between text-xs opacity-70 pb-2 border-b border-current/10">
                <span>Питання {currentIdx + 1} з {QUIZ_QUESTIONS.length}</span>
                <span>Рахунок: <strong className="text-yellow-400">{score}</strong></span>
              </div>

              {/* Question text */}
              <div className="space-y-2">
                <div className="font-bold text-sm text-cyan-300">{currentQ.prompt}</div>
                <div className="p-3 bg-black/40 rounded border border-current/20 italic text-amber-200">
                  &ldquo;{currentQ.verseQuote}&rdquo;
                </div>
              </div>

              {/* Options */}
              <div className="space-y-2 pt-2">
                {currentQ.options.map((opt, idx) => {
                  let optStyle = 'border-current/20 bg-white/5 hover:bg-white/15';
                  if (isAnswered) {
                    if (idx === currentQ.correctIndex) {
                      optStyle = 'border-green-500 bg-green-950/40 text-green-300 font-bold';
                    } else if (idx === selectedOpt) {
                      optStyle = 'border-red-500 bg-red-950/40 text-red-300';
                    } else {
                      optStyle = 'opacity-40 border-transparent';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswered}
                      className={`w-full text-left p-3 rounded border transition flex items-center justify-between ${optStyle}`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="font-bold opacity-60 w-5 font-mono">{idx + 1}.</span>
                        <span>{opt}</span>
                      </div>
                      {isAnswered && idx === currentQ.correctIndex && (
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      )}
                      {isAnswered && idx === selectedOpt && idx !== currentQ.correctIndex && (
                        <XCircle className="w-4 h-4 text-red-400" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Answer Explanation & Next Button */}
              {isAnswered && (
                <div className="pt-3 border-t border-current/10 space-y-3">
                  <div className="text-xs opacity-90 p-2.5 rounded bg-black/30 border border-current/10">
                    💡 <strong>Пояснення:</strong> {currentQ.explanation}
                  </div>
                  <button
                    onClick={handleNext}
                    className={`w-full py-2.5 rounded border ${currentTheme.border} ${currentTheme.accentBg} font-bold text-xs flex items-center justify-center space-x-2 hover:brightness-125 transition`}
                  >
                    <span>{currentIdx + 1 === QUIZ_QUESTIONS.length ? 'Завершити вікторину' : 'Наступне питання'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-6 space-y-4">
              <Trophy className="w-12 h-12 text-yellow-400 mx-auto" />
              <div className="text-base font-bold text-white">ВІКТОРИНУ ЗАВЕРШЕНО!</div>
              <div className="text-sm">
                Ваш результат: <span className="font-bold text-cyan-300 text-lg">{score}</span> з {QUIZ_QUESTIONS.length} правильних відповідей.
              </div>
              <p className="text-xs opacity-75 max-w-sm mx-auto">
                {score === QUIZ_QUESTIONS.length 
                  ? 'Чудово! Ви відмінно знаєте ключові уривки Святого Письма!' 
                  : 'Гарна спроба! Продовжуйте читати та досліджувати Слово Боже щодня.'}
              </p>
              <button
                onClick={handleRestart}
                className={`px-4 py-2 rounded border ${currentTheme.border} ${currentTheme.accentBg} font-bold text-xs inline-flex items-center space-x-2`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Спробувати ще раз</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
