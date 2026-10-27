import React, { useState } from 'react';
import { RpgHeader } from './RpgHeader';
import { RpgWorldMap } from './RpgWorldMap';
import { RpgBattleArena } from './RpgBattleArena';
import { RpgGrimoire } from './RpgGrimoire';
import { AbcGrimoire } from './AbcGrimoire';
import { RpgHeroProfile } from './RpgHeroProfile';
import { DailyHeroQuests, DailyQuest } from './DailyHeroQuests';
import { RpgBottomNav, RpgNavTab } from './RpgBottomNav';
import { HeroDictionaryModal } from './HeroDictionaryModal';
import { MELODIFY_LESSONS, Lesson } from '../data/lessonsData';
import { playSuccessChime } from '../utils/audio';

export const MelodifyApp: React.FC = () => {
  // Navigation Tabs in RPG Mode: 'map' | 'battle' | 'quests' | 'abc' | 'grimoire' | 'hero'
  const [activeRpgTab, setActiveRpgTab] = useState<RpgNavTab>('map');

  // Hero Dictionary Search Modal
  const [isDictionaryOpen, setIsDictionaryOpen] = useState<boolean>(false);

  // RPG Player Stats & Inventory
  const [playerLevel, setPlayerLevel] = useState<number>(4);
  const [playerXp, setPlayerXp] = useState<number>(60);
  const [playerGold, setPlayerGold] = useState<number>(240);
  const [hpPotions, setHpPotions] = useState<number>(5);
  const [manaPotions, setManaPotions] = useState<number>(4);

  // Level Progression
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(0);
  const [completedLevels, setCompletedLevels] = useState<number[]>([1]);
  const [starsByLevel, setStarsByLevel] = useState<Record<number, number>>({ 1: 3 });

  // Daily Hero Quests Module State
  const [dailyQuests, setDailyQuests] = useState<DailyQuest[]>([
    {
      id: 'quest_sing',
      title: 'Cantar 1 Canção no Karaokê',
      description: 'Complete uma batalha musical com letras sincronizadas na Arena.',
      icon: '🎤',
      currentProgress: 1, // Ready to claim for immediate joy
      targetGoal: 1,
      rewardGold: 60,
      rewardHpPotions: 1,
      rewardMpPotions: 0,
      rewardXp: 80,
      isClaimed: false,
      navTarget: 'battle',
      actionLabel: 'Cantar 🎤'
    },
    {
      id: 'quest_practice',
      title: 'Praticar 5 Novas Palavras',
      description: 'Estude vocabulário no Treino do Bardo ou consulte o Dicionário.',
      icon: '📜',
      currentProgress: 3,
      targetGoal: 5,
      rewardGold: 50,
      rewardHpPotions: 0,
      rewardMpPotions: 1,
      rewardXp: 60,
      isClaimed: false,
      navTarget: 'grimoire',
      actionLabel: 'Praticar 📖'
    },
    {
      id: 'quest_abc',
      title: 'Recitar o Grimório do ABC',
      description: 'Toque em 3 letras ou execute a Canção do ABC.',
      icon: '🔤',
      currentProgress: 3,
      targetGoal: 3,
      rewardGold: 40,
      rewardHpPotions: 0,
      rewardMpPotions: 1,
      rewardXp: 70,
      isClaimed: false,
      navTarget: 'abc',
      actionLabel: 'Abrir ABC 🔤'
    },
    {
      id: 'quest_dict',
      title: 'Consultar o Dicionário do Herói',
      description: 'Pesquise qualquer palavra em inglês e escute a pronúncia nativa.',
      icon: '🔍',
      currentProgress: 1,
      targetGoal: 1,
      rewardGold: 35,
      rewardHpPotions: 1,
      rewardMpPotions: 0,
      rewardXp: 50,
      isClaimed: false,
      navTarget: 'dictionary',
      actionLabel: 'Buscar 🔍'
    },
    {
      id: 'quest_combo',
      title: 'Golpe de Ritmo com Combo',
      description: 'Alcance um multiplicador de combo de pelo menos 2x no Karaokê.',
      icon: '🔥',
      currentProgress: 2,
      targetGoal: 2,
      rewardGold: 75,
      rewardHpPotions: 1,
      rewardMpPotions: 1,
      rewardXp: 100,
      isClaimed: false,
      navTarget: 'battle',
      actionLabel: 'Batalhar ⚔️'
    }
  ]);
  const [isDailyChestClaimed, setIsDailyChestClaimed] = useState<boolean>(false);

  const lesson: Lesson = MELODIFY_LESSONS[currentLevelIndex] || MELODIFY_LESSONS[0];

  // Number of quests ready to claim
  const pendingQuestsCount = dailyQuests.filter(
    (q) => q.currentProgress >= q.targetGoal && !q.isClaimed
  ).length;

  // Handle claiming individual quest reward
  const handleClaimQuest = (
    questId: string,
    rewards: { gold: number; hp: number; mp: number; xp: number }
  ) => {
    setPlayerGold((prev) => prev + rewards.gold);
    setHpPotions((prev) => prev + rewards.hp);
    setManaPotions((prev) => prev + rewards.mp);
    setPlayerXp((prev) => {
      const nextXp = prev + rewards.xp;
      if (nextXp >= 100) setPlayerLevel((lvl) => lvl + 1);
      return nextXp;
    });

    setDailyQuests((prev) =>
      prev.map((q) => (q.id === questId ? { ...q, isClaimed: true } : q))
    );
  };

  // Handle claiming the big daily milestone chest
  const handleClaimDailyChest = (
    rewards: { gold: number; hp: number; mp: number; xp: number }
  ) => {
    setPlayerGold((prev) => prev + rewards.gold);
    setHpPotions((prev) => prev + rewards.hp);
    setManaPotions((prev) => prev + rewards.mp);
    setPlayerXp((prev) => {
      const nextXp = prev + rewards.xp;
      if (nextXp >= 100) setPlayerLevel((lvl) => lvl + 1);
      return nextXp;
    });
    setIsDailyChestClaimed(true);
  };

  // Victory Reward in Battle Arena with Score & Rank
  const handleVictory = (finalScore: number, rankTier: string, isPassed: boolean) => {
    if (!isPassed) return;

    const starsEarned = rankTier === 'Nível S' || rankTier === 'Ouro' ? 3 : rankTier === 'Prata' ? 2 : 1;

    // Award loot: +120 XP, +50 Gold, +1 HP Potion
    setPlayerXp((prev) => {
      const nextXp = prev + 120;
      if (nextXp >= 100) {
        setPlayerLevel((lvl) => lvl + 1);
      }
      return nextXp;
    });
    setPlayerGold((prev) => prev + 50);
    setHpPotions((prev) => prev + 1);
    setStarsByLevel((prev) => ({ ...prev, [lesson.id]: Math.max(prev[lesson.id] || 0, starsEarned) }));

    if (!completedLevels.includes(lesson.id)) {
      setCompletedLevels((prev) => [...prev, lesson.id]);
    }

    // Unlock next level on map if available
    if (currentLevelIndex < MELODIFY_LESSONS.length - 1) {
      setCurrentLevelIndex((prev) => prev + 1);
    }

    // Progress daily quests
    setDailyQuests((prev) =>
      prev.map((q) => {
        if (q.id === 'quest_sing') return { ...q, currentProgress: Math.min(q.targetGoal, q.currentProgress + 1) };
        if (q.id === 'quest_combo') return { ...q, currentProgress: q.targetGoal };
        return q;
      })
    );

    setActiveRpgTab('map');
  };

  return (
    <div className="space-y-6">
      {/* Anime Fantasy RPG Top Bar */}
      <RpgHeader
        playerLevel={playerLevel}
        playerXp={playerXp}
        playerGold={playerGold}
        hpPotions={hpPotions}
        manaPotions={manaPotions}
        onOpenProfile={() => setActiveRpgTab('hero')}
        onOpenDictionary={() => {
          setIsDictionaryOpen(true);
          // Progress dictionary quest
          setDailyQuests((prev) =>
            prev.map((q) => (q.id === 'quest_dict' ? { ...q, currentProgress: q.targetGoal } : q))
          );
        }}
        activeView={activeRpgTab}
        onSwitchView={(v) => setActiveRpgTab(v as any)}
      />

      {/* Main RPG Viewport */}
      {activeRpgTab === 'map' && (
        <RpgWorldMap
          currentLevelIndex={currentLevelIndex}
          completedLevels={completedLevels}
          starsByLevel={starsByLevel}
          onSelectLevel={(idx) => setCurrentLevelIndex(idx)}
          onOpenTraining={() => setActiveRpgTab('grimoire')}
          onOpenBattle={() => setActiveRpgTab('battle')}
          onOpenDictionary={() => {
            setIsDictionaryOpen(true);
            setDailyQuests((prev) =>
              prev.map((q) => (q.id === 'quest_dict' ? { ...q, currentProgress: q.targetGoal } : q))
            );
          }}
          onOpenAbc={() => setActiveRpgTab('abc')}
          onOpenQuests={() => setActiveRpgTab('quests')}
        />
      )}

      {activeRpgTab === 'battle' && (
        <RpgBattleArena
          lesson={lesson}
          playerLevel={playerLevel}
          onVictory={handleVictory}
          onExit={() => setActiveRpgTab('map')}
        />
      )}

      {/* Daily Hero Quests Tab */}
      {activeRpgTab === 'quests' && (
        <DailyHeroQuests
          quests={dailyQuests}
          onClaimQuest={handleClaimQuest}
          onNavigateTab={(tab) => setActiveRpgTab(tab)}
          onOpenDictionary={() => setIsDictionaryOpen(true)}
          isDailyChestClaimed={isDailyChestClaimed}
          onClaimDailyChest={handleClaimDailyChest}
        />
      )}

      {activeRpgTab === 'abc' && (
        <AbcGrimoire />
      )}

      {activeRpgTab === 'grimoire' && (
        <RpgGrimoire
          lesson={lesson}
          onAdvanceToBattle={() => setActiveRpgTab('battle')}
          onAccumulateEnergy={(amount) => {
            setManaPotions((prev) => Math.min(10, prev + 1));
            // Progress practice quest
            setDailyQuests((prev) =>
              prev.map((q) =>
                q.id === 'quest_practice'
                  ? { ...q, currentProgress: Math.min(q.targetGoal, q.currentProgress + 1) }
                  : q
              )
            );
          }}
        />
      )}

      {activeRpgTab === 'hero' && (
        <RpgHeroProfile
          playerLevel={playerLevel}
          playerXp={playerXp}
          playerGold={playerGold}
          hpPotions={hpPotions}
          manaPotions={manaPotions}
          completedLevels={completedLevels}
          starsByLevel={starsByLevel}
        />
      )}

      {/* Minimalist Anime Fantasy RPG Bottom Navigation Bar with 6 Tabs */}
      <RpgBottomNav
        activeTab={activeRpgTab}
        onSelectTab={(tab) => setActiveRpgTab(tab)}
        pendingQuestsCount={pendingQuestsCount}
      />

      {/* Hero Dictionary Modal (Pesquisa de Palavras) */}
      <HeroDictionaryModal
        isOpen={isDictionaryOpen}
        onClose={() => setIsDictionaryOpen(false)}
      />
    </div>
  );
};
