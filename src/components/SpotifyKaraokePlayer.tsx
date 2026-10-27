import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, Music, CheckCircle2, FastForward, Disc, Radio, Sparkles } from 'lucide-react';
import { Lesson, KaraokeLine } from '../data/lessonsData';
import { speakEnglish, playTapSound, playSuccessChime, playGentleEncourage, playSongMelody, playChordProgression } from '../utils/audio';

interface SpotifyKaraokePlayerProps {
  lesson: Lesson;
  onCompleteChallenge: () => void;
}

export const SpotifyKaraokePlayer: React.FC<SpotifyKaraokePlayerProps> = ({
  lesson,
  onCompleteChallenge
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progressSec, setProgressSec] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<'normal' | 'slow'>('normal');
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [isChallengeSuccess, setIsChallengeSuccess] = useState<boolean>(false);

  const durationSec = 14;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && !isChallengeSuccess) {
      interval = setInterval(() => {
        setProgressSec((prev) => {
          if (prev >= durationSec) {
            setIsPlaying(false);
            return durationSec;
          }
          return prev + 1;
        });
      }, playbackRate === 'slow' ? 1400 : 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isChallengeSuccess, playbackRate]);

  const handlePlayToggle = () => {
    playTapSound();
    const nextState = !isPlaying;
    setIsPlaying(nextState);

    if (nextState) {
      playChordProgression(lesson.musicStage.chordRoots);
      speakEnglish(lesson.musicStage.songTitle, playbackRate === 'slow');
    }
  };

  const handleRestart = () => {
    playTapSound();
    setProgressSec(0);
    setIsPlaying(true);
    playChordProgression(lesson.musicStage.chordRoots);
  };

  const handleWordSelect = (choice: string) => {
    setSelectedWord(choice);
    const isCorrect = choice.toLowerCase() === lesson.musicStage.challengeWord.toLowerCase();

    if (isCorrect) {
      setIsChallengeSuccess(true);
      setIsPlaying(false);
      playSuccessChime();
      playSongMelody(lesson.musicStage.melodyNotes);
      speakEnglish(
        `Great job! ${lesson.musicStage.songTitle}. You are my ${lesson.musicStage.challengeWord}!`,
        playbackRate === 'slow'
      );
      setTimeout(() => {
        onCompleteChallenge();
      }, 1800);
    } else {
      playGentleEncourage();
    }
  };

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remaining = sec % 60;
    return `${mins}:${remaining < 10 ? '0' : ''}${remaining}`;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl mx-auto shadow-2xl relative overflow-hidden space-y-6">
      {/* Background Soft Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar with Mode & Speed Toggle */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
            Spotify Karaokê Mode
          </span>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
          <button
            onClick={() => setPlaybackRate('slow')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              playbackRate === 'slow'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            0.8x Lento
          </button>
          <button
            onClick={() => setPlaybackRate('normal')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              playbackRate === 'normal'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            1.0x Normal
          </button>
        </div>
      </div>

      {/* Vinyl & Song Meta Showcase */}
      <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
        {/* Spinning Vinyl Album Mockup */}
        <div className="relative group shrink-0">
          <div
            className={`w-32 h-32 rounded-full bg-slate-950 border-4 border-slate-800 flex items-center justify-center shadow-xl ${
              isPlaying ? 'animate-spin [animation-duration:6s]' : ''
            }`}
          >
            {/* Vinyl grooved circles */}
            <div className="w-28 h-28 rounded-full border border-slate-800 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full border border-slate-700/80 flex items-center justify-center">
                {/* Center Label Album Art */}
                <div className={`w-12 h-12 rounded-full bg-gradient-to-tr ${lesson.musicStage.coverBg} flex items-center justify-center shadow-inner`}>
                  <Music className="w-6 h-6 text-white drop-shadow" />
                </div>
              </div>
            </div>
            {/* Center spindle hole */}
            <div className="absolute w-3.5 h-3.5 rounded-full bg-slate-900 border border-slate-700" />
          </div>
        </div>

        {/* Track Title & Artist Info */}
        <div className="text-center sm:text-left flex-1">
          <span className="text-[11px] font-mono uppercase text-violet-400 font-bold">
            {lesson.musicStage.genre} · {lesson.musicStage.tempoBpm} BPM
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-0.5">
            {lesson.musicStage.songTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">
            {lesson.musicStage.artist}
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
            {lesson.vocabularies.map((v) => (
              <span
                key={v.id}
                className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-300"
              >
                {v.emoji} {v.word}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Audio Wave Visualizer Spectrum */}
      <div className="flex items-center justify-center gap-1.5 h-12 bg-slate-950/90 rounded-2xl px-5 border border-slate-800/80 overflow-hidden">
        {[20, 60, 90, 45, 80, 100, 35, 70, 95, 50, 85, 30, 65, 90, 40, 75, 100, 55, 30, 70].map((h, i) => (
          <div
            key={i}
            className="w-1.5 rounded-full bg-gradient-to-t from-emerald-500 to-teal-300 transition-all duration-200"
            style={{
              height: isPlaying ? `${Math.max(15, (h * ((progressSec + i) % 5 + 1)) % 100)}%` : '15%',
              opacity: isPlaying ? 0.95 : 0.25
            }}
          />
        ))}
      </div>

      {/* Synchronized Karaoke Live Lyrics */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="text-[10px] font-mono uppercase text-slate-500 tracking-wider text-center">
          Letra ao Vivo com Destaque
        </div>

        <div className="space-y-3.5">
          {lesson.musicStage.karaokeLyrics.map((line: KaraokeLine) => {
            const isActive = progressSec >= line.timeSec && progressSec < line.timeSec + 4;
            return (
              <div
                key={line.id}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-slate-900 border border-emerald-500/50 shadow-md scale-[1.01]'
                    : 'opacity-50'
                }`}
              >
                <div className="text-base sm:text-lg font-extrabold text-white leading-relaxed">
                  {line.isBlank ? (
                    <span>
                      {line.text.split('______')[0]}{' '}
                      <span
                        className={`inline-block px-3.5 py-0.5 rounded-lg border-2 border-dashed ${
                          isChallengeSuccess
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-sm'
                            : 'bg-slate-800 border-amber-400 text-amber-300 animate-pulse'
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
                <div className="text-xs text-slate-400 italic mt-0.5 font-sans">
                  {line.translation}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Blank Word Choice */}
      <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3 text-center">
        <div className="text-xs font-semibold text-slate-300">
          Qual das palavras aprendidas completa a letra da canção?
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
          {lesson.musicStage.challengeOptions.map((choice, i) => {
            const isSelected = selectedWord === choice;
            const isCorrect = choice.toLowerCase() === lesson.musicStage.challengeWord.toLowerCase();
            return (
              <button
                key={i}
                onClick={() => handleWordSelect(choice)}
                className={`py-3.5 px-6 rounded-2xl font-bold text-base border transition-all transform active:scale-95 ${
                  isSelected && isCorrect
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg ring-2 ring-emerald-400'
                    : 'bg-slate-900 border-slate-700 hover:border-emerald-500 text-white hover:bg-slate-850'
                }`}
              >
                {choice}
              </button>
            );
          })}
        </div>
      </div>

      {/* Scrubber & Player Controls */}
      <div className="space-y-2 pt-2">
        {/* Time Progress Bar */}
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden cursor-pointer">
          <div
            className="bg-emerald-400 h-full transition-all duration-300"
            style={{ width: `${(progressSec / durationSec) * 100}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>{formatTime(progressSec)}</span>
          <span>{formatTime(durationSec)}</span>
        </div>

        {/* Transport Buttons */}
        <div className="flex items-center justify-center gap-4 pt-2">
          <button
            onClick={handleRestart}
            className="p-3 rounded-full bg-slate-800 hover:bg-slate-750 text-slate-300 transition-colors"
            title="Reiniciar faixa"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handlePlayToggle}
            className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-transform active:scale-95"
            title={isPlaying ? 'Pausar' : 'Tocar'}
          >
            {isPlaying ? <Pause className="w-6 h-6 fill-slate-950" /> : <Play className="w-6 h-6 fill-slate-950 ml-0.5" />}
          </button>

          <button
            onClick={() => {
              playTapSound();
              speakEnglish(lesson.musicStage.songTitle, playbackRate === 'slow');
            }}
            className="p-3 rounded-full bg-slate-800 hover:bg-slate-750 text-slate-300 transition-colors"
            title="Ouvir título em inglês"
          >
            <Volume2 className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
