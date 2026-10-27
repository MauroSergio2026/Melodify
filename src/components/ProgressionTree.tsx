import React from 'react';
import { Star, Lock, CheckCircle2, Play, Flame, Sparkles, Music, ChevronRight } from 'lucide-react';
import { MELODIFY_LESSONS, Lesson } from '../data/lessonsData';
import { playTapSound } from '../utils/audio';

interface ProgressionTreeProps {
  currentLevelIndex: number;
  completedLevels: number[];
  starsByLevel: Record<number, number>;
  onSelectLevel: (index: number) => void;
  onStartLesson: (index: number) => void;
}

export const ProgressionTree: React.FC<ProgressionTreeProps> = ({
  currentLevelIndex,
  completedLevels,
  starsByLevel,
  onSelectLevel,
  onStartLesson
}) => {
  return (
    <div className="space-y-6 max-w-xl mx-auto py-2">
      {/* Unit Banner */}
      <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 rounded-3xl p-5 text-white shadow-xl shadow-indigo-950/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono uppercase tracking-wider bg-white/20 backdrop-blur-md px-3 py-1 rounded-full font-bold">
            Unidade 1 · Fundamentos com Ritmo
          </span>
          <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs bg-black/20 px-2.5 py-1 rounded-full">
            <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
            <span>
              {Object.values(starsByLevel).reduce((a, b) => a + b, 0)} / {MELODIFY_LESSONS.length * 3}
            </span>
          </div>
        </div>
        <h2 className="text-xl font-extrabold tracking-tight">
          Aprenda Inglês através das Melodias
        </h2>
        <p className="text-xs text-indigo-100 mt-1 leading-relaxed">
          Cada nó ensina 3 palavras com fonética falada e fecha com um desafio no estilo karaokê!
        </p>
      </div>

      {/* Winding Duolingo-style Tree Path */}
      <div className="relative py-6 flex flex-col items-center gap-10">
        {/* Curving SVG background connector line */}
        <svg
          className="absolute top-8 left-1/2 -translate-x-1/2 w-48 h-[640px] pointer-events-none stroke-slate-800"
          fill="none"
          strokeWidth="6"
          strokeDasharray="8 8"
        >
          <path d="M 96,20 Q 20,110 96,200 T 96,380 T 96,560" />
        </svg>

        {MELODIFY_LESSONS.map((lesson: Lesson, idx: number) => {
          const isCompleted = completedLevels.includes(lesson.id);
          const isCurrent = idx === currentLevelIndex;
          const isLocked = idx > 0 && !completedLevels.includes(MELODIFY_LESSONS[idx - 1].id) && !isCurrent;
          const stars = starsByLevel[lesson.id] || 0;

          // Asymmetric zigzag horizontal offset for Duolingo feel
          const offsetClasses = [
            'translate-x-0',
            '-translate-x-12 sm:-translate-x-16',
            'translate-x-12 sm:translate-x-16',
            '-translate-x-8 sm:-translate-x-10',
            'translate-x-8 sm:translate-x-10',
            'translate-x-0'
          ];
          const offset = offsetClasses[idx % offsetClasses.length];

          return (
            <div key={lesson.id} className={`relative flex flex-col items-center ${offset} z-10`}>
              {/* Floating Start Lesson Tag on Current Node */}
              {isCurrent && (
                <div className="absolute -top-10 animate-bounce bg-emerald-500 text-slate-950 font-extrabold text-[11px] px-3.5 py-1 rounded-full shadow-lg shadow-emerald-500/30 whitespace-nowrap flex items-center gap-1">
                  <Play className="w-3 h-3 fill-slate-950" />
                  <span>COMEÇAR LIÇÃO</span>
                </div>
              )}

              {/* Node Circle Button */}
              <button
                onClick={() => {
                  playTapSound();
                  if (!isLocked) {
                    onSelectLevel(idx);
                    onStartLesson(idx);
                  }
                }}
                disabled={isLocked}
                className={`relative w-20 h-20 rounded-full flex flex-col items-center justify-center transition-all transform active:scale-90 ${
                  isLocked
                    ? 'bg-slate-850 border-4 border-slate-700/80 text-slate-600 opacity-60 cursor-not-allowed'
                    : isCurrent
                    ? 'bg-gradient-to-b from-emerald-400 to-emerald-600 border-4 border-emerald-300 text-slate-950 shadow-xl shadow-emerald-500/40 ring-8 ring-emerald-500/20'
                    : 'bg-gradient-to-b from-violet-600 to-indigo-700 border-4 border-violet-400 text-white shadow-lg hover:scale-105'
                }`}
              >
                {isLocked ? (
                  <Lock className="w-7 h-7 text-slate-500" />
                ) : isCompleted ? (
                  <CheckCircle2 className="w-8 h-8 text-white drop-shadow" />
                ) : (
                  <span className="text-2xl drop-shadow">{lesson.vocabularies[0].emoji}</span>
                )}

                {/* Star rating beneath node */}
                {!isLocked && (
                  <div className="absolute -bottom-3 flex items-center gap-0.5 bg-slate-950 border border-slate-700/80 px-2 py-0.5 rounded-full shadow-md">
                    {[1, 2, 3].map((starIdx) => (
                      <Star
                        key={starIdx}
                        className={`w-3 h-3 ${
                          starIdx <= stars
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-600'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </button>

              {/* Label below node */}
              <div className="mt-4 text-center">
                <span className="text-xs font-bold text-white block">
                  {lesson.title}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {lesson.musicStage.songTitle}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
