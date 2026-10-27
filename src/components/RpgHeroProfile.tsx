import React, { useState } from 'react';
import { Shield, Swords, Sparkles, Star, Award, Trophy, Music, Flame, Zap, Heart, CheckCircle2 } from 'lucide-react';
import { MELODIFY_LESSONS } from '../data/lessonsData';
import { playTapSound, playSuccessChime, speakEnglish } from '../utils/audio';

interface RpgHeroProfileProps {
  playerLevel: number;
  playerXp: number;
  playerGold: number;
  hpPotions: number;
  manaPotions: number;
  completedLevels: number[];
  starsByLevel: Record<number, number>;
}

export const RpgHeroProfile: React.FC<RpgHeroProfileProps> = ({
  playerLevel,
  playerXp,
  playerGold,
  hpPotions,
  manaPotions,
  completedLevels,
  starsByLevel
}) => {
  const [selectedAchievement, setSelectedAchievement] = useState<string | null>(null);
  const [activeHp, setActiveHp] = useState<number>(hpPotions);
  const [activeMp, setActiveMp] = useState<number>(manaPotions);
  const [useFeedback, setUseFeedback] = useState<string | null>(null);

  const totalStars = Object.values(starsByLevel).reduce((a, b) => a + b, 0);

  const heroEquipment = [
    { slot: 'Arma Principal', name: 'Microfone Dourado do Bardo', icon: '🎤', perk: '+25% Precisão de Pronúncia' },
    { slot: 'Arma Secundária', name: 'Espada dos Acordes Mágicos', icon: '⚔️', perk: '+15% Crítico Harmônico' },
    { slot: 'Armadura', name: 'Capa do Menestrel Errante', icon: '🧥', perk: '+50 Pontos de Mana/Foco' },
    { slot: 'Relíquia', name: 'Amuleto das 3 Palavras', icon: '💎', perk: 'Memorização e Fixação Sem Estresse' }
  ];

  const achievementCards = [
    {
      id: 'first_chord',
      title: 'Primeiro Acorde',
      subtitle: 'Completou a Fase 1 (Vilarejo Star)',
      icon: '🎸',
      reward: '+50 XP · 🪙 +30 Ouro',
      isUnlocked: completedLevels.includes(1),
      description: 'Você deu seus primeiros passos no Reino da Harmonia e dominou a canção tradicional "You Are My Sunshine"!'
    },
    {
      id: 'karaoke_master',
      title: 'Mestre do Karaokê',
      subtitle: 'Atingiu Nível S ou Ouro em Batalha',
      icon: '🎤',
      reward: '+100 XP · 🧪 +1 Poção',
      isUnlocked: Object.values(starsByLevel).some((s) => s >= 3),
      description: 'Sua pontuação rítmica superou 650 pontos com combo sincronizado perfeito!'
    },
    {
      id: 'energy_spark',
      title: 'Energia Pura',
      subtitle: 'Carregou 100% de Mana no Treino',
      icon: '⚡',
      reward: '+60 XP · 🔮 +1 Mana',
      isUnlocked: true, // Acumulado nas práticas
      description: 'Completou todas as 3 tarefas de prática do Mestre Aurelius sem penalidades.'
    },
    {
      id: 'abc_scholar',
      title: 'Grimório do ABC Dominado',
      subtitle: 'Aprendeu a fonética do alfabeto (A-Z)',
      icon: '🔤',
      reward: '+80 XP · 🪙 +40 Ouro',
      isUnlocked: true,
      description: 'Explorou as 26 letras com sons e pronúncia brasileira adaptada!'
    },
    {
      id: 'pop_kingdom',
      title: 'Campeão dos Reinos',
      subtitle: 'Desbloqueou o lendário Reino do Pop',
      icon: '👑',
      reward: '+200 XP · 💎 Título Campeão',
      isUnlocked: completedLevels.includes(5) || completedLevels.includes(6),
      description: 'Alcançou o trono da música mundial e provou que é possível aprender inglês cantando.'
    }
  ];

  const handleUseHp = () => {
    if (activeHp <= 0) return;
    playSuccessChime();
    setActiveHp((prev) => prev - 1);
    setUseFeedback('🧪 Poção de Vida usada! Sua energia vital foi restaurada.');
    setTimeout(() => setUseFeedback(null), 3000);
  };

  const handleUseMp = () => {
    if (activeMp <= 0) return;
    playSuccessChime();
    setActiveMp((prev) => prev - 1);
    setUseFeedback('🔮 Poção de Mana usada! Seu foco mental e ritmo foram amplificados.');
    setTimeout(() => setUseFeedback(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto pb-24">
      {/* Hero Character Card in Anime Fantasy RPG Frame */}
      <div className="bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 border-4 border-amber-400 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          {/* Avatar with Golden Frame */}
          <div className="relative shrink-0">
            <div className="w-24 h-24 rounded-3xl p-1 bg-gradient-to-b from-amber-300 via-amber-500 to-amber-700 shadow-xl ring-4 ring-amber-400/40">
              <img
                src="/src/assets/images/anime_hero_avatar_1793103878768.jpg"
                alt="Bardo Guerreiro"
                className="w-full h-full object-cover rounded-[20px]"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-gradient-to-b from-amber-400 to-amber-600 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-full border-2 border-white shadow-md">
              Lv.{playerLevel}
            </div>
          </div>

          {/* Title & Level Info */}
          <div className="text-center sm:text-left flex-1">
            <div className="text-[10px] font-mono uppercase text-amber-300 font-bold tracking-wider">
              Herói do Reino da Harmonia
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight mt-0.5">
              Bardo Guerreiro
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Classe: Mestre dos Acordes e do Canto Épico
            </p>

            {/* XP Bar */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                <span>Experiência Musical (XP)</span>
                <span className="text-emerald-400 font-bold">{playerXp % 100} / 100 XP</span>
              </div>
              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full rounded-full transition-all duration-300"
                  style={{ width: `${playerXp % 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Hero Resources Quick Bar with Use Potion action */}
        <div className="grid grid-cols-3 gap-2.5 mt-6 pt-5 border-t border-indigo-900/80 text-center font-mono text-xs">
          <div className="p-2.5 rounded-2xl bg-slate-950 border border-rose-500/40 flex flex-col items-center justify-between">
            <div className="text-lg">🧪</div>
            <div className="font-extrabold text-rose-400">{activeHp} Poções</div>
            <div className="text-[9px] text-slate-400 mb-1">Vida (HP)</div>
            <button
              onClick={handleUseHp}
              disabled={activeHp <= 0}
              className="w-full py-1 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-[10px] text-rose-300 font-bold active:scale-95 transition-all disabled:opacity-40"
            >
              Usar
            </button>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-950 border border-sky-500/40 flex flex-col items-center justify-between">
            <div className="text-lg">🔮</div>
            <div className="font-extrabold text-sky-400">{activeMp} Poções</div>
            <div className="text-[9px] text-slate-400 mb-1">Mana (MP)</div>
            <button
              onClick={handleUseMp}
              disabled={activeMp <= 0}
              className="w-full py-1 rounded-lg bg-sky-950/80 hover:bg-sky-900 border border-sky-500/50 text-[10px] text-sky-300 font-bold active:scale-95 transition-all disabled:opacity-40"
            >
              Usar
            </button>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-950 border border-amber-500/50 flex flex-col items-center justify-between">
            <div className="text-lg">🪙</div>
            <div className="font-extrabold text-amber-300">{playerGold} Ouro</div>
            <div className="text-[9px] text-slate-400 mb-1">Moedas</div>
            <div className="text-[10px] text-amber-400 font-bold py-1">⭐ {totalStars} Estrelas</div>
          </div>
        </div>

        {useFeedback && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400 text-center text-xs font-bold text-emerald-200 animate-in fade-in">
            {useFeedback}
          </div>
        )}
      </div>

      {/* CARTAS DE CONQUISTAS MUSICAIS (SISTEMA DE RECOMPENSAS) */}
      <div className="bg-slate-900 border-2 border-amber-500/60 rounded-3xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-extrabold text-white">
                Cartas de Conquistas Musicais
              </h3>
              <p className="text-[10px] text-slate-400">
                Coleção de troféus e títulos do Bardo
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-amber-400 font-bold">
            {achievementCards.filter((c) => c.isUnlocked).length} / {achievementCards.length} Desbloqueadas
          </span>
        </div>

        <div className="space-y-2.5">
          {achievementCards.map((ach) => (
            <div
              key={ach.id}
              onClick={() => {
                playTapSound();
                setSelectedAchievement(selectedAchievement === ach.id ? null : ach.id);
              }}
              className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                ach.isUnlocked
                  ? 'bg-slate-950/90 border-amber-400/60 hover:border-amber-300 shadow-md'
                  : 'bg-slate-950/40 border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-2xl shrink-0">
                    {ach.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black text-white">{ach.title}</h4>
                      {ach.isUnlocked && (
                        <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-mono font-bold border border-emerald-500/30">
                          Desbloqueado
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-300">{ach.subtitle}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono text-amber-300 font-bold block">
                    {ach.reward}
                  </span>
                </div>
              </div>

              {selectedAchievement === ach.id && (
                <div className="mt-2.5 pt-2 border-t border-slate-800 text-xs text-amber-100/90 leading-relaxed bg-amber-500/10 p-2.5 rounded-xl border border-amber-400/20">
                  {ach.description}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Equipment Slots */}
      <div className="bg-slate-900 border-2 border-amber-500/60 rounded-3xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-extrabold text-white">
              Equipamentos do Aventureiro
            </h3>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-bold">4 / 4 Equipados</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {heroEquipment.map((eq, i) => (
            <div
              key={i}
              className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-amber-500/40 flex items-center justify-center text-xl shrink-0">
                {eq.icon}
              </div>
              <div>
                <div className="text-[10px] font-mono text-amber-400 font-bold uppercase">{eq.slot}</div>
                <div className="text-xs font-bold text-white">{eq.name}</div>
                <div className="text-[10px] text-emerald-400 font-medium">{eq.perk}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
