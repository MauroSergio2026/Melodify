import React, { useState, useEffect } from 'react';
import { 
  Swords, Shield, Heart, Sparkles, Volume2, Play, Pause, 
  RotateCcw, Award, CheckCircle2, Star, Flame, Disc, Radio, 
  Music, Zap, Trophy, Crown, ArrowRight
} from 'lucide-react';
import { Lesson, KaraokeLine } from '../data/lessonsData';
import { 
  speakEnglish, playTapSound, playSuccessChime, 
  playGentleEncourage, playSongMelody, playChordProgression 
} from '../utils/audio';

interface RpgBattleArenaProps {
  lesson: Lesson;
  playerLevel: number;
  onVictory: (finalScore: number, rankTier: string, isPassed: boolean) => void;
  onExit: () => void;
}

export const RpgBattleArena: React.FC<RpgBattleArenaProps> = ({
  lesson,
  playerLevel,
  onVictory,
  onExit
}) => {
  // Game states
  const [bossHp, setBossHp] = useState<number>(100);
  const [playerHp, setPlayerHp] = useState<number>(100);
  const [isPlayingMusic, setIsPlayingMusic] = useState<boolean>(false);
  const [battleProgressSec, setBattleProgressSec] = useState<number>(0);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [isCriticalHit, setIsCriticalHit] = useState<boolean>(false);
  const [isVictoryModal, setIsVictoryModal] = useState<boolean>(false);
  const [slowAudio, setSlowAudio] = useState<boolean>(false);

  // Scoring & Combo System
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [lastHitRating, setLastHitRating] = useState<'PERFECT' | 'GREAT' | 'GOOD' | null>(null);
  const [rankResult, setRankResult] = useState<{
    tier: 'Nível S' | 'Ouro' | 'Prata' | 'Bronze';
    title: string;
    badge: string;
    color: string;
    stars: number;
  }>({
    tier: 'Bronze',
    title: 'Aprendiz do Ritmo',
    badge: '🥉',
    color: 'from-amber-700 to-amber-900',
    stars: 1
  });

  const durationSec = 14;

  // Music progress timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlayingMusic && bossHp > 0) {
      interval = setInterval(() => {
        setBattleProgressSec((prev) => {
          if (prev >= durationSec) {
            setIsPlayingMusic(false);
            return durationSec;
          }
          // Gradual points for listening to the rhythm
          setScore((s) => s + 10);
          return prev + 1;
        });
      }, slowAudio ? 1400 : 1000);
    }
    return () => clearInterval(interval);
  }, [isPlayingMusic, bossHp, slowAudio]);

  const handlePlayToggle = () => {
    playTapSound();
    const next = !isPlayingMusic;
    setIsPlayingMusic(next);

    if (next) {
      playChordProgression(lesson.musicStage.chordRoots);
      speakEnglish(lesson.musicStage.songTitle, slowAudio);
    }
  };

  const handleRestart = () => {
    playTapSound();
    setBattleProgressSec(0);
    setIsPlayingMusic(true);
    playChordProgression(lesson.musicStage.chordRoots);
  };

  const calculateFinalRank = (finalScore: number) => {
    if (finalScore >= 850) {
      return {
        tier: 'Nível S' as const,
        title: 'LENDÁRIO! Maestria Musical Perfeita',
        badge: '💎',
        color: 'from-cyan-400 via-sky-500 to-indigo-600',
        stars: 3
      };
    } else if (finalScore >= 650) {
      return {
        tier: 'Ouro' as const,
        title: 'MESTRE DO RITMO',
        badge: '🥇',
        color: 'from-amber-300 via-yellow-400 to-amber-600',
        stars: 3
      };
    } else if (finalScore >= 400) {
      return {
        tier: 'Prata' as const,
        title: 'AVANÇADO',
        badge: '🥈',
        color: 'from-slate-300 via-slate-400 to-slate-600',
        stars: 2
      };
    } else {
      return {
        tier: 'Bronze' as const,
        title: 'APRENDIZ DO RITMO',
        badge: '🥉',
        color: 'from-amber-600 via-amber-700 to-amber-900',
        stars: 1
      };
    }
  };

  const handleAttackOption = (word: string) => {
    setSelectedWord(word);
    const isCorrect = word.toLowerCase() === lesson.musicStage.challengeWord.toLowerCase();

    if (isCorrect) {
      // Combo calculation
      const newCombo = combo + 1;
      setCombo(newCombo);
      if (newCombo > maxCombo) setMaxCombo(newCombo);

      // Hit Rating based on timing
      const rating = newCombo >= 3 ? 'PERFECT' : newCombo >= 2 ? 'GREAT' : 'GOOD';
      setLastHitRating(rating);

      const hitBonus = rating === 'PERFECT' ? 350 : rating === 'GREAT' ? 260 : 180;
      const comboMultiplier = Math.min(newCombo, 4);
      const pointsEarned = hitBonus * comboMultiplier;

      const updatedScore = score + pointsEarned;
      setScore(updatedScore);

      // Boss defeated!
      setIsCriticalHit(true);
      setBossHp(0);
      setIsPlayingMusic(false);
      playSuccessChime();
      playSongMelody(lesson.musicStage.melodyNotes);
      speakEnglish(
        `Critical Hit! ${rating}! ${lesson.musicStage.songTitle}. You are my ${lesson.musicStage.challengeWord}!`,
        slowAudio
      );

      const calculatedRank = calculateFinalRank(updatedScore);
      setRankResult(calculatedRank);

      setTimeout(() => {
        setIsVictoryModal(true);
      }, 1600);
    } else {
      // Friendly encouraging feedback
      playGentleEncourage();
      setCombo(0);
      setLastHitRating(null);
      // Soft boss counter - never kills player, minimum 80 HP
      setPlayerHp((prev) => Math.max(80, prev - 10));
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-24">
      {/* Boss Fight Arena Card with Fantasy Parchment & Metal Border */}
      <div className="relative rounded-3xl p-4 sm:p-6 border-4 border-amber-500 bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 shadow-2xl overflow-hidden">
        {/* Arena Top Navigation & Boss Identification */}
        <div className="flex items-center justify-between border-b border-indigo-800/80 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-amber-400" />
            <div>
              <span className="text-[10px] font-mono uppercase text-amber-400 font-bold tracking-wider">
                Arena de Batalha & Karaokê Interativo
              </span>
              <h2 className="text-sm font-extrabold text-white">
                Chefão: Melodia, o Dragão Harmônico
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              playTapSound();
              onExit();
            }}
            className="px-3 py-1 bg-slate-900 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold active:scale-95 transition-transform"
          >
            Voltar ao Mapa
          </button>
        </div>

        {/* Live Score & Combo Meter HUD */}
        <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-slate-950/80 border border-amber-400/30 mb-4 text-center">
          <div>
            <div className="text-[9px] font-mono uppercase text-amber-300">Pontuação</div>
            <div className="text-lg font-black text-amber-400 font-mono tracking-tight">
              {score} <span className="text-[10px] font-normal text-amber-200">pts</span>
            </div>
          </div>

          <div>
            <div className="text-[9px] font-mono uppercase text-rose-300">Combo Ritmo</div>
            <div className="flex items-center justify-center gap-1 text-lg font-black text-rose-400 font-mono">
              <Flame className={`w-4 h-4 ${combo > 0 ? 'text-amber-400 fill-amber-400 animate-pulse' : 'text-slate-600'}`} />
              <span>{combo}x</span>
            </div>
          </div>

          <div>
            <div className="text-[9px] font-mono uppercase text-emerald-300">Classificação</div>
            <div className="text-sm font-black text-emerald-400 font-mono">
              {score >= 850 ? '💎 Nível S' : score >= 650 ? '🥇 Ouro' : score >= 400 ? '🥈 Prata' : '🥉 Bronze'}
            </div>
          </div>
        </div>

        {/* Combatants Showcase (Hero vs Boss) */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 items-center py-1">
          {/* Left: Hero Combatant */}
          <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-slate-900/80 border border-emerald-500/40">
            <div className="w-16 h-16 rounded-2xl p-0.5 bg-gradient-to-b from-amber-400 to-amber-600 shadow-md">
              <img
                src="/src/assets/images/anime_hero_avatar_1793103878768.jpg"
                alt="Herói Bardo"
                className="w-full h-full object-cover rounded-[14px]"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="text-xs font-black text-amber-300 mt-2">
              Bardo Guerreiro (Você)
            </div>
            <div className="text-[10px] font-mono text-emerald-400">Lv.{playerLevel}</div>

            {/* Hero HP Bar */}
            <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-emerald-700/60 mt-1.5">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${playerHp}%` }}
              />
            </div>
            <div className="text-[9px] font-mono text-emerald-300 mt-0.5">
              HP: {playerHp}/100
            </div>
          </div>

          {/* Right: Boss Combatant */}
          <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-slate-900/80 border border-purple-500/40 relative">
            <div className="w-16 h-16 rounded-2xl p-0.5 bg-gradient-to-b from-rose-400 to-purple-600 shadow-md">
              <img
                src="/src/assets/images/anime_music_boss_1793103895751.jpg"
                alt="Chefão Dragão"
                className={`w-full h-full object-cover rounded-[14px] transition-transform ${
                  isCriticalHit ? 'animate-ping' : ''
                }`}
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="text-xs font-black text-rose-300 mt-2">
              Dragão Harmônico
            </div>
            <div className="text-[10px] font-mono text-rose-400">Boss da Fase</div>

            {/* Boss HP Bar */}
            <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-rose-700/60 mt-1.5">
              <div
                className="bg-rose-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${bossHp}%` }}
              />
            </div>
            <div className="text-[9px] font-mono text-rose-300 mt-0.5">
              HP: {bossHp}/100
            </div>

            {/* Critical Hit Floating Damage Popup */}
            {isCriticalHit && (
              <div className="absolute top-2 right-2 animate-bounce bg-rose-600 text-white font-black text-xs px-2.5 py-1 rounded-full border border-yellow-300 shadow-lg z-20">
                💥 -100 HP CRÍTICO!
              </div>
            )}
          </div>
        </div>

        {/* SPOTIFY-STYLE KARAOKE PLAYER WITH SYNCHRONIZED REAL-TIME LYRICS */}
        <div className="mt-5 p-4 sm:p-5 rounded-3xl bg-slate-950/95 border-2 border-indigo-700/80 shadow-inner space-y-4">
          {/* Track Header with Spinning Disc */}
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center p-1 shadow-lg shrink-0">
              <div className={`w-full h-full rounded-full bg-slate-950 border-2 border-amber-300 flex items-center justify-center ${isPlayingMusic ? 'animate-spin' : ''}`}>
                <Disc className="w-5 h-5 text-amber-400" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                  Karaokê Spotify
                </span>
                <span className="text-[10px] font-mono text-slate-400">Reino do Pop</span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-white truncate mt-0.5">
                {lesson.musicStage.songTitle}
              </h3>
            </div>

            {/* Sound Wave Bars */}
            <div className="flex items-end gap-1 h-6">
              {[40, 75, 55, 90, 60, 80].map((h, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-300 ${
                    isPlayingMusic ? 'bg-amber-400 animate-pulse' : 'bg-slate-700'
                  }`}
                  style={{ height: isPlayingMusic ? `${h}%` : '20%' }}
                />
              ))}
            </div>
          </div>

          {/* Time & Audio Progress Bar */}
          <div className="space-y-1">
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-amber-400 via-amber-500 to-emerald-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${(battleProgressSec / durationSec) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>0:{battleProgressSec < 10 ? `0${battleProgressSec}` : battleProgressSec}</span>
              <span>0:{durationSec}</span>
            </div>
          </div>

          {/* Synchronized Karaoke Lyrics Display */}
          <div className="space-y-2 py-1">
            {lesson.musicStage.karaokeLyrics.map((line: KaraokeLine) => {
              const isActive = battleProgressSec >= line.timeSec && battleProgressSec < line.timeSec + 4;
              return (
                <div
                  key={line.id}
                  className={`p-3 rounded-2xl transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500/20 via-purple-900/40 to-indigo-900/40 border-2 border-amber-400 shadow-md scale-[1.01]'
                      : 'opacity-40 bg-slate-900/40 border border-slate-800/40'
                  }`}
                >
                  <div className="text-sm sm:text-base font-extrabold text-white leading-relaxed">
                    {line.isBlank ? (
                      <span>
                        {line.text.split('______')[0]}{' '}
                        <span
                          className={`inline-block px-3 py-0.5 rounded-xl border-2 border-dashed ${
                            isCriticalHit
                              ? 'bg-emerald-500/40 border-emerald-300 text-emerald-200'
                              : 'bg-amber-500/30 border-amber-400 text-amber-300 animate-pulse'
                          }`}
                        >
                          {selectedWord || '______'}
                        </span>{' '}
                        {line.text.split('______')[1]}
                      </span>
                    ) : (
                      <span>{line.text}</span>
                    )}
                  </div>
                  <div className="text-xs text-amber-200/70 italic mt-0.5">
                    {line.translation}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Player Controls */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <button
              onClick={handleRestart}
              className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-700 text-xs"
              title="Reiniciar Canção"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePlayToggle}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black rounded-2xl text-xs border-2 border-white border-b-4 border-b-amber-800 shadow-lg shadow-amber-500/30 active:scale-95 transition-all"
              >
                {isPlayingMusic ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlayingMusic ? 'Pausar Ritmo' : 'Cantar / Tocar Áudio'}</span>
              </button>
            </div>

            <button
              onClick={() => setSlowAudio(!slowAudio)}
              className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 text-slate-300 rounded-xl text-[11px] font-semibold"
            >
              {slowAudio ? '0.7x' : '1.0x'}
            </button>
          </div>
        </div>

        {/* Interactive Musical Strike Choices */}
        <div className="mt-5 p-4 rounded-3xl bg-amber-500/10 border-2 border-amber-400/50 text-center space-y-3">
          <div className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Complete a Canção para Desferir o Golpe Musical:</span>
          </div>

          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
            {lesson.musicStage.challengeOptions.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAttackOption(opt)}
                className="py-3 px-4 rounded-2xl bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black text-sm border-2 border-white border-b-4 border-b-amber-800 shadow-lg shadow-amber-600/40 active:scale-95 transition-transform"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* FINAL SCOREBOARD & RANK MODAL (Bronze, Prata, Ouro, Nível S) */}
      {isVictoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-slate-900 via-purple-950 to-slate-900 border-4 border-amber-400 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-5 shadow-2xl animate-in zoom-in-95">
            {/* Rank Emblem */}
            <div className="relative mx-auto w-24 h-24 rounded-3xl bg-gradient-to-b from-amber-400 to-amber-600 p-1 shadow-2xl">
              <div className="w-full h-full rounded-[20px] bg-slate-950 flex flex-col items-center justify-center border-2 border-amber-300">
                <span className="text-4xl">{rankResult.badge}</span>
                <span className="text-[10px] font-black text-amber-300 uppercase tracking-wider mt-0.5">
                  {rankResult.tier}
                </span>
              </div>
            </div>

            <div>
              {/* Stars Display */}
              <div className="flex items-center justify-center gap-1.5 text-amber-400 mb-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-6 h-6 ${
                      i < rankResult.stars ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                    }`}
                  />
                ))}
              </div>

              <h3 className="text-2xl font-black text-white tracking-tight">
                {score >= 300 ? 'VITÓRIA MUSICAL!' : 'BATALHA FINALIZADA'}
              </h3>
              <p className="text-xs font-bold text-amber-300 mt-1 uppercase tracking-wide">
                {rankResult.title}
              </p>
            </div>

            {/* Pass / Fail Status Banner */}
            {score >= 300 ? (
              <div className="p-3 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 text-center space-y-0.5">
                <div className="text-xs font-black text-emerald-300 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>FASE CONCLUÍDA: APROVADO!</span>
                </div>
                <div className="text-[11px] text-emerald-100">
                  Pontuação atingida ({score} ≥ 300 pts). A próxima fase do mapa foi desbloqueada!
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-amber-500/20 border-2 border-amber-400 text-center space-y-0.5">
                <div className="text-xs font-black text-amber-300">
                  ⚠️ PONTUAÇÃO INSUFICIENTE ({score} / 300 pts)
                </div>
                <div className="text-[11px] text-amber-100">
                  São necessários pelo menos 300 pontos (Rank Bronze) para passar de fase. Pratique no treino ou tente novamente!
                </div>
              </div>
            )}

            {/* Detailed Performance Scoreboard */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-amber-400/50 text-left space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-xs text-slate-300 font-semibold">Pontuação Total:</span>
                <span className="text-lg font-black text-amber-400 font-mono">
                  {score} pts
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-mono">Combo Máximo</div>
                  <div className="text-sm font-black text-rose-400 font-mono">{maxCombo}x 🔥</div>
                </div>

                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-mono">Classificação</div>
                  <div className="text-sm font-black text-emerald-400 font-mono">{rankResult.tier}</div>
                </div>
              </div>

              {/* Loot Box Rewards (if passed) */}
              {score >= 300 && (
                <div className="pt-2">
                  <div className="text-[10px] font-mono uppercase text-amber-400 font-bold mb-1.5">
                    Recompensas do Baú:
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-sm">🧪</div>
                      <div className="text-[10px] font-bold text-rose-400">+1 Poção HP</div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-sm">🪙</div>
                      <div className="text-[10px] font-bold text-amber-300">+50 Ouro</div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-sm">⚡</div>
                      <div className="text-[10px] font-bold text-emerald-400">+120 XP</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons based on pass/fail */}
            {score >= 300 ? (
              <button
                onClick={() => {
                  playTapSound();
                  setIsVictoryModal(false);
                  onVictory(score, rankResult.tier, true);
                }}
                className="w-full py-3.5 px-4 bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black rounded-2xl text-sm border-2 border-white border-b-4 border-b-amber-800 shadow-xl shadow-amber-500/40 active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                <span>Coletar Recompensas & Desbloquear Próxima Fase</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => {
                    playTapSound();
                    setIsVictoryModal(false);
                    setBossHp(100);
                    setScore(0);
                    setCombo(0);
                    setSelectedWord(null);
                    setBattleProgressSec(0);
                    setIsCriticalHit(false);
                  }}
                  className="py-3 px-3 bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black rounded-2xl text-xs border-2 border-white border-b-4 border-b-amber-800 shadow-md active:scale-95"
                >
                  Repetir Karaokê 🔄
                </button>

                <button
                  onClick={() => {
                    playTapSound();
                    setIsVictoryModal(false);
                    onExit();
                  }}
                  className="py-3 px-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl text-xs border border-slate-600"
                >
                  Voltar ao Treino
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
