import React from 'react';
import { Award, Flame, Star, Music, CheckCircle2, Trophy, Headphones, Zap, Play } from 'lucide-react';
import { MELODIFY_LESSONS } from '../data/lessonsData';
import { playChordProgression, playSongMelody, speakEnglish, playTapSound } from '../utils/audio';

interface AchievementsViewProps {
  completedLevels: number[];
  starsByLevel: Record<number, number>;
  dailyStreak: number;
}

export const AchievementsView: React.FC<AchievementsViewProps> = ({
  completedLevels,
  starsByLevel,
  dailyStreak
}) => {
  const totalStars = Object.values(starsByLevel).reduce((a, b) => a + b, 0);
  const totalWordsLearned = completedLevels.length * 3;
  const totalXp = completedLevels.length * 120 + dailyStreak * 30;

  const badges = [
    {
      id: 'b1',
      title: 'Primeiro Acorde',
      description: 'Concluiu a primeira lição com áudio e karaokê.',
      icon: <Music className="w-5 h-5 text-emerald-400" />,
      isUnlocked: completedLevels.length >= 1
    },
    {
      id: 'b2',
      title: 'Ouvido Afiado',
      description: 'Acertou o exercício de escuta ativa sem hesitar.',
      icon: <Headphones className="w-5 h-5 text-indigo-400" />,
      isUnlocked: completedLevels.length >= 2
    },
    {
      id: 'b3',
      title: 'Estrela do Karaokê',
      description: 'Completou a letra da canção no ritmo certo.',
      icon: <Star className="w-5 h-5 text-amber-400" />,
      isUnlocked: completedLevels.length >= 3
    },
    {
      id: 'b4',
      title: 'Ritmo Constante',
      description: 'Manteve uma sequência de 4 dias de prática.',
      icon: <Flame className="w-5 h-5 text-rose-400" />,
      isUnlocked: dailyStreak >= 4
    }
  ];

  const daysOfWeek = [
    { day: 'SEG', active: true },
    { day: 'TER', active: true },
    { day: 'QUA', active: true },
    { day: 'QUI', active: true },
    { day: 'SEX', active: false },
    { day: 'SÁB', active: false },
    { day: 'DOM', active: false }
  ];

  return (
    <div className="space-y-6 max-w-2xl mx-auto py-2">
      {/* Profile & XP Hero Card */}
      <div className="bg-gradient-to-br from-violet-600 via-indigo-700 to-purple-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-3xl shadow-inner">
            🎵
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase text-indigo-200 tracking-wider">
              Estudante Melodify · Nível Iniciante
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">
              Seu Progresso Musical
            </h2>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-indigo-100 font-medium">
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                <span>{dailyStreak} Dias Seguidos</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                <span>{totalStars} Estrelas</span>
              </span>
            </div>
          </div>
        </div>

        {/* Weekly Habit Tracker Strip */}
        <div className="mt-6 pt-5 border-t border-white/10">
          <div className="text-xs text-indigo-100 mb-2 font-medium">
            Frequência de Prática Semanal
          </div>
          <div className="grid grid-cols-7 gap-2 text-center">
            {daysOfWeek.map((d, i) => (
              <div
                key={i}
                className={`p-2 rounded-xl text-xs font-mono font-bold transition-all ${
                  d.active
                    ? 'bg-emerald-400 text-slate-950 shadow-md'
                    : 'bg-white/10 text-white/40'
                }`}
              >
                <div className="text-[10px]">{d.day}</div>
                <div className="mt-1">{d.active ? '✓' : '·'}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
          <div className="text-2xl font-extrabold text-white font-mono">{totalXp}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Pontos XP</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">{totalWordsLearned}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Palavras Fixadas</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
          <div className="text-2xl font-extrabold text-violet-400 font-mono">{completedLevels.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Músicas Concluídas</div>
        </div>
      </div>

      {/* Unlocked Badges */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">
              Conquistas Desbloqueadas
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {badges.filter((b) => b.isUnlocked).length} de {badges.length}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {badges.map((b) => (
            <div
              key={b.id}
              className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all ${
                b.isUnlocked
                  ? 'bg-slate-950 border-slate-800'
                  : 'bg-slate-950/40 border-slate-850 opacity-40'
              }`}
            >
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                {b.icon}
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">{b.title}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  {b.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
