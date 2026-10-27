import React, { useState } from 'react';
import { 
  Scroll, CheckCircle2, Clock, Sparkles, Trophy, Star, 
  Coins, Zap, ArrowRight, Gift, Flame, BookOpen, Swords, Search
} from 'lucide-react';
import { playTapSound, playSuccessChime } from '../utils/audio';
import { RpgNavTab } from './RpgBottomNav';

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  icon: string;
  currentProgress: number;
  targetGoal: number;
  rewardGold: number;
  rewardHpPotions: number;
  rewardMpPotions: number;
  rewardXp: number;
  isClaimed: boolean;
  navTarget: RpgNavTab | 'dictionary';
  actionLabel: string;
}

interface DailyHeroQuestsProps {
  quests: DailyQuest[];
  onClaimQuest: (questId: string, rewards: { gold: number; hp: number; mp: number; xp: number }) => void;
  onNavigateTab: (tab: RpgNavTab) => void;
  onOpenDictionary: () => void;
  isDailyChestClaimed: boolean;
  onClaimDailyChest: (rewards: { gold: number; hp: number; mp: number; xp: number }) => void;
}

export const DailyHeroQuests: React.FC<DailyHeroQuestsProps> = ({
  quests,
  onClaimQuest,
  onNavigateTab,
  onOpenDictionary,
  isDailyChestClaimed,
  onClaimDailyChest
}) => {
  const [claimFeedback, setClaimFeedback] = useState<string | null>(null);

  const completedCount = quests.filter((q) => q.currentProgress >= q.targetGoal).length;
  const totalQuests = quests.length;
  const progressPercent = Math.round((completedCount / totalQuests) * 100);
  const canUnlockChest = completedCount >= 3 && !isDailyChestClaimed;

  const handleClaim = (quest: DailyQuest) => {
    playSuccessChime();
    onClaimQuest(quest.id, {
      gold: quest.rewardGold,
      hp: quest.rewardHpPotions,
      mp: quest.rewardMpPotions,
      xp: quest.rewardXp
    });

    const parts = [];
    if (quest.rewardGold) parts.push(`+${quest.rewardGold} Ouro 🪙`);
    if (quest.rewardHpPotions) parts.push(`+${quest.rewardHpPotions} Poção HP 🧪`);
    if (quest.rewardMpPotions) parts.push(`+${quest.rewardMpPotions} Poção MP 🔮`);
    if (quest.rewardXp) parts.push(`+${quest.rewardXp} XP ⚡`);

    setClaimFeedback(`Recompensa resgatada com sucesso! ${parts.join(' · ')}`);
    setTimeout(() => setClaimFeedback(null), 3500);
  };

  const handleClaimChest = () => {
    if (!canUnlockChest) return;
    playSuccessChime();
    onClaimDailyChest({
      gold: 150,
      hp: 2,
      mp: 2,
      xp: 150
    });
    setClaimFeedback('🎉 Grande Baú da Guilda Aberto! +150 Ouro, +2 Poções HP, +2 Poções MP e +150 XP!');
    setTimeout(() => setClaimFeedback(null), 4000);
  };

  const handleAction = (quest: DailyQuest) => {
    playTapSound();
    if (quest.navTarget === 'dictionary') {
      onOpenDictionary();
    } else {
      onNavigateTab(quest.navTarget);
    }
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto pb-24">
      {/* Anime Fantasy Guild Bounty Board Header */}
      <div className="relative rounded-3xl p-5 border-4 border-amber-500 bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 text-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-amber-400 font-bold tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Quadro de Tarefas da Guilda dos Bardos</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Missões Diárias do Herói
            </h1>
            <p className="text-xs text-amber-200/90">
              Cumpra tarefas fáceis de estudo e música para faturar Ouro e Poções extras!
            </p>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-400/80 flex items-center justify-center text-3xl shadow-xl shrink-0">
            📜
          </div>
        </div>

        {/* Refresh Timer Bar */}
        <div className="mt-4 pt-3 border-t border-amber-800/80 flex items-center justify-between text-xs font-mono">
          <span className="flex items-center gap-1.5 text-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Novas missões em: 14h 28m</span>
          </span>
          <span className="text-emerald-400 font-bold">
            {completedCount} de {totalQuests} Concluídas
          </span>
        </div>
      </div>

      {/* Floating Success Notification Banner */}
      {claimFeedback && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/30 to-teal-500/30 border-2 border-emerald-400 text-center text-xs font-black text-emerald-200 shadow-xl animate-in zoom-in-95">
          {claimFeedback}
        </div>
      )}

      {/* BIG GUILD MILESTONE CHEST (BAÚ DO BARDO DIÁRIO) */}
      <div className={`p-5 rounded-3xl border-4 transition-all shadow-xl relative overflow-hidden ${
        isDailyChestClaimed
          ? 'bg-slate-900/60 border-slate-700 opacity-70'
          : canUnlockChest
          ? 'bg-gradient-to-r from-amber-900 via-amber-800 to-amber-950 border-amber-400 ring-4 ring-amber-400/30'
          : 'bg-slate-900/90 border-amber-500/50'
      }`}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 border-2 ${
              isDailyChestClaimed
                ? 'bg-slate-800 border-slate-700'
                : canUnlockChest
                ? 'bg-amber-400 border-white animate-bounce shadow-lg shadow-amber-500/50'
                : 'bg-amber-500/20 border-amber-400/50'
            }`}>
              {isDailyChestClaimed ? '📦' : '🎁'}
            </div>

            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-sm font-black text-white">
                  Grande Baú da Guilda Musical
                </span>
                {canUnlockChest && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[9px] uppercase tracking-wider animate-pulse">
                    Pronto!
                  </span>
                )}
              </div>
              <p className="text-xs text-amber-200/80 mt-0.5">
                Complete pelo menos 3 missões diárias para destrancar este tesouro.
              </p>
              <div className="text-[10px] font-mono text-emerald-400 font-bold mt-1">
                Recompensa: +150 Ouro · 🧪 +2 HP · 🔮 +2 MP · +150 XP
              </div>
            </div>
          </div>

          <button
            onClick={handleClaimChest}
            disabled={!canUnlockChest || isDailyChestClaimed}
            className={`w-full sm:w-auto px-5 py-3 rounded-2xl font-black text-xs border-2 border-b-4 transition-all active:scale-95 shadow-md ${
              isDailyChestClaimed
                ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
                : canUnlockChest
                ? 'bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 text-slate-950 border-white border-b-amber-800 shadow-amber-500/40'
                : 'bg-slate-800 border-slate-700 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isDailyChestClaimed ? 'Baú Coletado ✅' : canUnlockChest ? 'Abrir Baú Dourado 🎁' : `${completedCount}/3 Missões`}
          </button>
        </div>

        {/* Small Milestone Progress Bar */}
        <div className="mt-3 w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-700">
          <div
            className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (completedCount / 3) * 100)}%` }}
          />
        </div>
      </div>

      {/* DAILY QUESTS LIST IN MEDIEVAL PARCHMENT / GUILD BOARD STYLE */}
      <div className="space-y-3.5">
        {quests.map((quest) => {
          const isFinished = quest.currentProgress >= quest.targetGoal;
          const isClaimed = quest.isClaimed;

          return (
            <div
              key={quest.id}
              className={`p-4 sm:p-5 rounded-3xl border-3 transition-all relative overflow-hidden ${
                isClaimed
                  ? 'bg-slate-950/60 border-slate-800 opacity-60'
                  : isFinished
                  ? 'bg-gradient-to-b from-amber-100 via-amber-50 to-amber-100 text-amber-950 border-amber-500 shadow-lg'
                  : 'bg-gradient-to-b from-slate-900 to-slate-950 text-white border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                {/* Quest Left: Icon & Text Info */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 border-2 ${
                    isClaimed
                      ? 'bg-slate-900 border-slate-700'
                      : isFinished
                      ? 'bg-amber-300 border-amber-500 shadow-inner'
                      : 'bg-slate-800 border-slate-700'
                  }`}>
                    {quest.icon}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-sm font-black truncate ${
                        isFinished && !isClaimed ? 'text-amber-950' : 'text-white'
                      }`}>
                        {quest.title}
                      </h3>

                      {isClaimed && (
                        <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-mono font-bold border border-emerald-500/30">
                          Resgatado ✅
                        </span>
                      )}
                    </div>

                    <p className={`text-xs leading-relaxed ${
                      isFinished && !isClaimed ? 'text-amber-900 font-medium' : 'text-slate-300'
                    }`}>
                      {quest.description}
                    </p>

                    {/* Rewards Tags */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      {quest.rewardGold > 0 && (
                        <span className="px-2 py-0.5 rounded-lg bg-amber-400/20 border border-amber-500/40 text-[10px] font-mono text-amber-400 font-bold">
                          +{quest.rewardGold} Ouro 🪙
                        </span>
                      )}
                      {quest.rewardHpPotions > 0 && (
                        <span className="px-2 py-0.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-[10px] font-mono text-rose-400 font-bold">
                          +{quest.rewardHpPotions} Poção HP 🧪
                        </span>
                      )}
                      {quest.rewardMpPotions > 0 && (
                        <span className="px-2 py-0.5 rounded-lg bg-sky-500/20 border border-sky-500/40 text-[10px] font-mono text-sky-400 font-bold">
                          +{quest.rewardMpPotions} Poção MP 🔮
                        </span>
                      )}
                      {quest.rewardXp > 0 && (
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-mono text-emerald-400 font-bold">
                          +{quest.rewardXp} XP ⚡
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quest Right: Progress & Buttons */}
                <div className="w-full sm:w-auto flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  {/* Progress Counter & mini bar */}
                  <div className="text-left sm:text-right">
                    <span className={`text-xs font-mono font-bold ${
                      isFinished && !isClaimed ? 'text-emerald-800' : 'text-slate-400'
                    }`}>
                      {quest.currentProgress} / {quest.targetGoal}
                    </span>
                    <div className="w-24 bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-700 mt-1">
                      <div
                        className="bg-emerald-400 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (quest.currentProgress / quest.targetGoal) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Action or Claim Button */}
                  {isClaimed ? (
                    <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Concluída</span>
                    </div>
                  ) : isFinished ? (
                    <button
                      onClick={() => handleClaim(quest)}
                      className="px-4 py-2 bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black rounded-xl text-xs border-2 border-white border-b-4 border-b-amber-800 shadow-md active:scale-95 transition-transform animate-pulse"
                    >
                      Resgatar Recompensa 🎁
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAction(quest)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold rounded-xl text-xs border border-amber-500/40 active:scale-95 transition-all"
                    >
                      <span>{quest.actionLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
