import React, { useState } from 'react';
import { Volume2, Play, Pause, Sparkles, Music, Star, RotateCcw, BookOpen } from 'lucide-react';
import { ALPHABET_DATA, AlphabetLetter } from '../data/alphabetData';
import { speakEnglish, playTapSound, playSongMelody } from '../utils/audio';

export const AbcGrimoire: React.FC = () => {
  const [selectedLetter, setSelectedLetter] = useState<AlphabetLetter>(ALPHABET_DATA[0]);
  const [isPlayingAbcSong, setIsPlayingAbcSong] = useState<boolean>(false);
  const [activeLetterHighlight, setActiveLetterHighlight] = useState<string | null>(null);
  const [slowAudio, setSlowAudio] = useState<boolean>(false);

  const handlePlayLetter = (item: AlphabetLetter) => {
    playTapSound();
    setSelectedLetter(item);
    playSongMelody([item.audioNoteFreq]);
    speakEnglish(`${item.letter}. ${item.exampleWord}.`, slowAudio);
  };

  const handlePlayAbcSong = () => {
    playTapSound();
    if (isPlayingAbcSong) {
      setIsPlayingAbcSong(false);
      setActiveLetterHighlight(null);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      return;
    }

    setIsPlayingAbcSong(true);
    let index = 0;

    const playNext = () => {
      if (index >= ALPHABET_DATA.length) {
        setIsPlayingAbcSong(false);
        setActiveLetterHighlight(null);
        return;
      }

      const current = ALPHABET_DATA[index];
      setSelectedLetter(current);
      setActiveLetterHighlight(current.letter);
      playSongMelody([current.audioNoteFreq]);
      speakEnglish(current.letter, false, () => {
        index++;
        setTimeout(playNext, 180);
      });
    };

    playNext();
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto pb-24">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-slate-950 rounded-3xl p-6 border-4 border-amber-300 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase font-black tracking-wider text-amber-950">
              <Sparkles className="w-4 h-4 text-amber-950" />
              <span>Grimório do ABC · Alfabeto do Inglês</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-950 mt-0.5">
              O Alfabeto Musical (A a Z)
            </h1>
            <p className="text-xs text-amber-950/90 font-medium mt-1">
              Toque em qualquer letra para ouvir o som fonético e o exemplo cantado!
            </p>
          </div>

          <div className="w-14 h-14 rounded-2xl bg-amber-400/40 border-2 border-white flex items-center justify-center text-3xl shadow-md shrink-0">
            🔤
          </div>
        </div>

        {/* ABC Song Player Button */}
        <div className="mt-4 pt-3 border-t-2 border-amber-400/60 flex items-center justify-between gap-3">
          <button
            onClick={handlePlayAbcSong}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-950 text-amber-300 font-black text-xs border-2 border-amber-400 shadow-md transform active:scale-95 transition-transform"
          >
            {isPlayingAbcSong ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-amber-300" />}
            <span>{isPlayingAbcSong ? 'Pausar Canção do ABC' : 'Tocar Canção do ABC (A a Z)'}</span>
          </button>

          <button
            onClick={() => setSlowAudio(!slowAudio)}
            className="px-3 py-1.5 rounded-xl bg-amber-400/80 text-amber-950 font-bold text-xs border border-amber-300"
          >
            {slowAudio ? 'Voz 0.7x' : 'Voz 1.0x'}
          </button>
        </div>
      </div>

      {/* Featured Letter Spotlight Card */}
      <div className="bg-gradient-to-b from-amber-100 via-amber-50 to-amber-100 text-amber-950 rounded-3xl p-6 border-4 border-amber-600 shadow-xl text-center space-y-4">
        <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-800">
          Letra em Destaque no Grimório
        </div>

        <div className="flex items-center justify-center gap-6">
          <div className="w-24 h-24 rounded-3xl bg-amber-200/90 border-2 border-amber-400 flex items-center justify-center text-6xl font-black text-amber-950 shadow-inner">
            {selectedLetter.letter}
          </div>

          <div className="text-left space-y-1">
            <div className="text-sm font-mono text-emerald-800 font-extrabold">
              Som fonético: [{selectedLetter.phonetic}]
            </div>
            <div className="text-xl font-black text-amber-950 flex items-center gap-1.5">
              <span>{selectedLetter.emoji}</span>
              <span>{selectedLetter.exampleWord}</span>
            </div>
            <div className="text-xs text-amber-800 font-bold">
              Tradução: {selectedLetter.translation}
            </div>
          </div>
        </div>

        {/* Audio Button for Selected Letter */}
        <button
          onClick={() => handlePlayLetter(selectedLetter)}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black text-xs border-2 border-white border-b-4 border-b-amber-800 shadow-md transform active:scale-95 transition-transform"
        >
          <Volume2 className="w-4 h-4" />
          <span>Ouvir Som da Letra "{selectedLetter.letter}"</span>
        </button>
      </div>

      {/* 26 Letters Alphabet Grid (A-Z) */}
      <div className="bg-slate-900 border-2 border-amber-500/60 rounded-3xl p-5 shadow-2xl space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-amber-300 font-bold border-b border-slate-800 pb-2">
          <span>Tabela do Alfabeto (26 Letras)</span>
          <span className="text-slate-400">Toque para escutar</span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 pt-1">
          {ALPHABET_DATA.map((item) => {
            const isSelected = selectedLetter.letter === item.letter;
            const isHighlighted = activeLetterHighlight === item.letter;

            return (
              <button
                key={item.letter}
                onClick={() => handlePlayLetter(item)}
                className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-0.5 transition-all transform active:scale-90 border-b-4 ${
                  isHighlighted || isSelected
                    ? 'bg-gradient-to-b from-amber-300 to-amber-500 text-slate-950 border-white border-b-amber-800 shadow-lg scale-105 ring-2 ring-amber-400'
                    : 'bg-slate-950 border-slate-800 hover:border-amber-500/60 text-white border-b-slate-900'
                }`}
              >
                <span className="text-xl font-black">{item.letter}</span>
                <span className="text-[10px] font-mono text-amber-400/90 font-bold">
                  [{item.phonetic}]
                </span>
                <span className="text-xs">{item.emoji}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
