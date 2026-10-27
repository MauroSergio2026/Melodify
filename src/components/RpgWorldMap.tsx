import React from 'react';
import { Star, Swords, Scroll, Lock, CheckCircle2, Play, Shield, Compass, Sparkles, Search, BookOpen, Music } from 'lucide-react';
import { MELODIFY_LESSONS, Lesson } from '../data/lessonsData';
import { playTapSound } from '../utils/audio';

interface RpgWorldMapProps {
  currentLevelIndex: number;
  completedLevels: number[];
  starsByLevel: Record<number, number>;
  onSelectLevel: (index: number) => void;
  onOpenTraining: () => void;
  onOpenBattle: () => void;
  onOpenDictionary: () => void;
  onOpenAbc: () => void;
  onOpenQuests?: () => void;
}

export const RpgWorldMap: React.FC<RpgWorldMapProps> = ({
  currentLevelIndex,
  completedLevels,
  starsByLevel,
  onSelectLevel,
  onOpenTraining,
  onOpenBattle,
  onOpenDictionary,
  onOpenAbc,
  onOpenQuests
}) => {
  const activeLesson: Lesson = MELODIFY_LESSONS[currentLevelIndex] || MELODIFY_LESSONS[0];

  const mapLandmarks = [
    { title: 'Vilarejo Star', icon: '🏡', subtitle: 'Início da Jornada Acústica' },
    { title: 'Floresta Melódica', icon: '🌲', subtitle: 'Bosque dos Beatles' },
    { title: 'Castelo Chord', icon: '🏰', subtitle: 'Fortaleza do Ritmo & Dança' },
    { title: 'Montanha do Jazz', icon: '🏔️', subtitle: 'Pico de Louis Armstrong' },
    { title: 'Santuário dos Sonhos', icon: '✨', subtitle: 'Templo da Imaginação' },
    { title: 'Reino do Pop', icon: '👑', subtitle: 'Trono do Chefão Final' }
  ];

  return (
    <div className="space-y-6 max-w-xl mx-auto pb-24">
      {/* World Realm Header Banner in Medieval Parchment Style */}
      <div className="relative rounded-3xl p-5 border-2 border-amber-400/80 bg-gradient-to-r from-emerald-900 via-green-900 to-amber-950 shadow-2xl overflow-hidden">
        {/* Subtle Map Graphic Watermark Backdrop */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <img
            src="/src/assets/images/anime_rpg_world_map_1793103879506.jpg"
            alt="Anime World Map"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase text-amber-300 font-bold tracking-wider">
              <Compass className="w-4 h-4 text-amber-400" />
              <span>Mapa do Reino: The Harmony Realm</span>
            </div>
            <h1 className="text-xl font-black text-white tracking-tight drop-shadow-md mt-0.5">
              Trilha das Terras Musicais
            </h1>
            <p className="text-xs text-amber-100/90 mt-1">
              Do Vilarejo Star até o Trono no Reino do Pop!
            </p>
          </div>

          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border-2 border-amber-400/60 flex items-center justify-center text-3xl shadow-lg shrink-0">
            🗺️
          </div>
        </div>
      </div>

      {/* QUICK TOOLS & DAILY QUESTS FAST-TRAVEL STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {/* Search Bar (Dicionário do Herói) */}
        <button
          onClick={() => {
            playTapSound();
            onOpenDictionary();
          }}
          className="flex items-center gap-2 p-2.5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border-2 border-amber-400/50 hover:border-amber-400 text-left transition-all active:scale-[0.98] shadow-lg group"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 group-hover:scale-105 transition-transform shrink-0">
            <Search className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-mono uppercase text-amber-300 font-bold truncate">
              Dicionário
            </div>
            <div className="text-[11px] text-slate-300 truncate">
              Buscar palavras
            </div>
          </div>
        </button>

        {/* ABC Grimoire Quick Button */}
        <button
          onClick={() => {
            playTapSound();
            onOpenAbc();
          }}
          className="flex items-center gap-2 p-2.5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border-2 border-emerald-400/50 hover:border-emerald-400 text-left transition-all active:scale-[0.98] shadow-lg group"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-400/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 group-hover:scale-105 transition-transform shrink-0">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-mono uppercase text-emerald-300 font-bold truncate">
              Grimório ABC
            </div>
            <div className="text-[11px] text-slate-300 truncate">
              A-Z Cantado
            </div>
          </div>
        </button>

        {/* Daily Quests Quick Button */}
        <button
          onClick={() => {
            playTapSound();
            if (onOpenQuests) onOpenQuests();
          }}
          className="flex items-center gap-2 p-2.5 rounded-2xl bg-gradient-to-r from-amber-950 to-slate-950 border-2 border-amber-500/70 hover:border-amber-400 text-left transition-all active:scale-[0.98] shadow-lg group"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-500/30 border border-amber-400/50 flex items-center justify-center text-amber-300 group-hover:scale-105 transition-transform shrink-0">
            <Scroll className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-mono uppercase text-amber-400 font-bold truncate">
              Missões Diárias
            </div>
            <div className="text-[11px] text-amber-200 truncate">
              Faturar Ouro & Poções
            </div>
          </div>
        </button>
      </div>

      {/* Interactive RPG Adventure Path on Green Pasture / Parchment */}
      <div className="relative rounded-3xl p-6 border-4 border-amber-500/70 shadow-2xl overflow-hidden bg-gradient-to-b from-emerald-950/90 via-slate-900 to-emerald-950/90">
        {/* Anime World Map Background Art */}
        <div className="absolute inset-0 opacity-25 pointer-events-none">
          <img
            src="/src/assets/images/anime_rpg_world_map_1793103879506.jpg"
            alt="Anime Pasture Map"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Winding Trail Nodes */}
        <div className="relative z-10 flex flex-col items-center gap-10 py-6">
          {MELODIFY_LESSONS.map((lesson: Lesson, idx: number) => {
            const isCompleted = completedLevels.includes(lesson.id);
            const isCurrent = idx === currentLevelIndex;
            const isLocked = idx > 0 && !completedLevels.includes(MELODIFY_LESSONS[idx - 1].id) && !isCurrent;
            const stars = starsByLevel[lesson.id] || 0;
            const landmark = mapLandmarks[idx] || { title: `Fase ${idx + 1}`, icon: '⚔️', subtitle: lesson.musicStage.songTitle };

            // Natural winding RPG trail zigzag offsets
            const offsets = [
              'translate-x-0',
              '-translate-x-12 sm:-translate-x-16',
              'translate-x-12 sm:translate-x-16',
              '-translate-x-8 sm:-translate-x-10',
              'translate-x-8 sm:translate-x-10',
              'translate-x-0'
            ];
            const offset = offsets[idx % offsets.length];

            return (
              <div
                key={lesson.id}
                className={`relative flex flex-col items-center transition-all duration-300 ${offset}`}
              >
                {/* Hero Avatar Standing Pin on Current Stage */}
                {isCurrent && (
                  <div className="absolute -top-12 z-20 flex flex-col items-center animate-bounce pointer-events-none">
                    <div className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-b from-amber-300 via-amber-500 to-amber-700 shadow-xl ring-2 ring-amber-300">
                      <img
                        src="/src/assets/images/anime_hero_avatar_1793103878768.jpg"
                        alt="Hero location"
                        className="w-full h-full object-cover rounded-full"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="w-2.5 h-2.5 bg-amber-400 rotate-45 -mt-1.5 shadow-sm" />
                  </div>
                )}

                {/* Level Node Circle */}
                <button
                  onClick={() => {
                    playTapSound();
                    if (!isLocked) onSelectLevel(idx);
                  }}
                  disabled={isLocked}
                  className={`w-18 h-18 sm:w-20 sm:h-20 rounded-full flex flex-col items-center justify-center relative transform active:scale-95 transition-all shadow-xl ${
                    isCurrent
                      ? 'bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 text-slate-950 ring-4 ring-amber-300 border-2 border-white shadow-amber-500/50 scale-105'
                      : isCompleted
                      ? 'bg-gradient-to-b from-emerald-500 to-teal-700 text-white border-2 border-emerald-300 shadow-emerald-600/30'
                      : 'bg-gradient-to-b from-slate-800 to-slate-900 text-slate-500 border-2 border-slate-700 opacity-70 cursor-not-allowed'
                  }`}
                >
                  <div className="text-xl sm:text-2xl drop-shadow-sm">
                    {isLocked ? <Lock className="w-6 h-6 text-slate-400" /> : landmark.icon}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-wider font-mono ${isCurrent ? 'text-slate-950 font-black' : ''}`}>
                    Lv.{lesson.id}
                  </span>

                  {/* Star Rating Badge */}
                  {isCompleted && (
                    <div className="absolute -bottom-2 flex items-center justify-center gap-0.5 bg-slate-950/90 px-1.5 py-0.5 rounded-full border border-amber-400/60 shadow">
                      {Array.from({ length: 3 }).map((_, starI) => (
                        <Star
                          key={starI}
                          className={`w-2.5 h-2.5 ${
                            starI < stars ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </button>

                {/* Landmark Label Plate */}
                <div className="mt-2 text-center pointer-events-none">
                  <div className={`text-xs font-black tracking-tight ${
                    isCurrent ? 'text-amber-300 drop-shadow' : isCompleted ? 'text-white' : 'text-slate-400'
                  }`}>
                    {landmark.title}
                  </div>
                  <div className="text-[10px] font-mono text-amber-200/60 truncate max-w-[140px]">
                    {landmark.subtitle}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Medieval Active Mission Card (Menu de Missão Ativa) */}
      <div className="relative rounded-3xl p-5 border-4 border-amber-600 bg-gradient-to-b from-amber-100 via-amber-50 to-amber-100 text-amber-950 shadow-2xl overflow-hidden">
        {/* Ribbon Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-amber-300 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-400 border border-amber-500 flex items-center justify-center text-base shadow-sm">
              📜
            </div>
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-800">
                Menu de Missão Ativa
              </div>
              <h3 className="text-base font-extrabold text-amber-950 tracking-tight">
                Level {activeLesson.id}: {mapLandmarks[currentLevelIndex]?.title}
              </h3>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] font-mono text-amber-800">Recompensa</div>
            <div className="flex items-center gap-1 text-xs font-black text-amber-900">
              <span>+120 XP</span>
              <span>·</span>
              <span>🧪 +1 HP</span>
            </div>
          </div>
        </div>

        {/* Goal Description */}
        <div className="space-y-1 mb-5">
          <p className="text-xs font-semibold text-amber-900">
            Missão do Bardo: Dominar <strong className="text-amber-950 underline">"{activeLesson.musicStage.songTitle}"</strong>
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-mono text-amber-800">3 Palavras-chave:</span>
            {activeLesson.vocabularies.map((v) => (
              <span
                key={v.id}
                className="px-2 py-0.5 rounded-lg bg-amber-200/80 border border-amber-400 text-amber-950 text-xs font-bold"
              >
                {v.emoji} {v.word}
              </span>
            ))}
          </div>
        </div>

        {/* Two Highlight Action Buttons with 3D Embossed Golden Styling */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Button 1: Treinar Vocabulário */}
          <button
            onClick={() => {
              playTapSound();
              onOpenTraining();
            }}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-b from-sky-400 via-sky-500 to-sky-700 text-white font-extrabold text-sm border-2 border-sky-200 border-b-4 border-b-sky-900 shadow-lg shadow-sky-950/30 transform active:scale-95 transition-all"
          >
            <Scroll className="w-4 h-4 text-sky-100" />
            <span>Treinar Vocabulário</span>
          </button>

          {/* Button 2: Batalha Musical (Karaokê) */}
          <button
            onClick={() => {
              playTapSound();
              onOpenBattle();
            }}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black text-sm border-2 border-white border-b-4 border-b-amber-800 shadow-lg shadow-amber-600/40 transform active:scale-95 transition-all"
          >
            <Swords className="w-4 h-4 text-slate-950" />
            <span>Batalha Musical ⚔️</span>
          </button>
        </div>
      </div>
    </div>
  );
};
