import React, { useState } from 'react';
import { 
  Scroll, Volume2, CheckCircle2, ChevronRight, ChevronLeft, 
  Sparkles, BookOpen, Swords, Zap, MessageSquare, Award
} from 'lucide-react';
import { Lesson, VocabularyAnchor } from '../data/lessonsData';
import { speakEnglish, playTapSound, playSuccessChime, playGentleEncourage } from '../utils/audio';

interface RpgGrimoireProps {
  lesson: Lesson;
  onAdvanceToBattle: () => void;
  onAccumulateEnergy?: (amount: number) => void;
}

export const RpgGrimoire: React.FC<RpgGrimoireProps> = ({
  lesson,
  onAdvanceToBattle,
  onAccumulateEnergy
}) => {
  const [grimoireMode, setGrimoireMode] = useState<'cards' | 'practice'>('cards');
  const [vocabIndex, setVocabIndex] = useState<number>(0);
  const [slowAudio, setSlowAudio] = useState<boolean>(false);

  // Practice state & Energy accumulation
  const [practiceIndex, setPracticeIndex] = useState<number>(0);
  const [energyPercent, setEnergyPercent] = useState<number>(0);
  const [selectedPracticeOption, setSelectedPracticeOption] = useState<number | null>(null);
  const [practiceFeedback, setPracticeFeedback] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);
  const [isPracticeComplete, setIsPracticeComplete] = useState<boolean>(false);

  const activeVocab: VocabularyAnchor = lesson.vocabularies[vocabIndex] || lesson.vocabularies[0];
  const activeExercise = lesson.fixationQuiz[practiceIndex] || lesson.fixationQuiz[0];

  const handleSpeak = (text: string, forceSlow: boolean = false) => {
    playTapSound();
    speakEnglish(text, forceSlow || slowAudio);
  };

  const nextCard = () => {
    playTapSound();
    if (vocabIndex < lesson.vocabularies.length - 1) {
      setVocabIndex((prev) => prev + 1);
    } else {
      setVocabIndex(0);
      setPracticeIndex(0);
      setGrimoireMode('practice');
    }
  };

  const prevCard = () => {
    playTapSound();
    if (vocabIndex > 0) {
      setVocabIndex((prev) => prev - 1);
    }
  };

  const handlePracticeSelect = (optIdx: number, isCorrect: boolean, feedback: string) => {
    setSelectedPracticeOption(optIdx);
    setPracticeFeedback(feedback);

    if (isCorrect) {
      setIsError(false);
      playSuccessChime();

      // Accumulate Mana/Energy: 34% per question (3 questions = 100%)
      const nextEnergy = Math.min(100, Math.round(((practiceIndex + 1) / lesson.fixationQuiz.length) * 100));
      setEnergyPercent(nextEnergy);
      if (onAccumulateEnergy) onAccumulateEnergy(25);

      setTimeout(() => {
        setSelectedPracticeOption(null);
        setPracticeFeedback('');
        if (practiceIndex < lesson.fixationQuiz.length - 1) {
          setPracticeIndex((prev) => prev + 1);
        } else {
          // All practice tasks completed! Energy 100% full!
          setIsPracticeComplete(true);
        }
      }, 900);
    } else {
      setIsError(true);
      playGentleEncourage();
    }
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto pb-24">
      {/* Anime Mentor Header (Mestre Bardo Aurelius) */}
      <div className="relative rounded-3xl p-4 sm:p-5 border-4 border-amber-500 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3.5">
          {/* Mentor Avatar */}
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl p-0.5 bg-gradient-to-b from-amber-300 via-amber-500 to-amber-700 shadow-md shrink-0">
            <div className="w-full h-full rounded-[14px] overflow-hidden bg-slate-900 border border-amber-300 flex items-center justify-center text-3xl">
              🧙‍♂️
            </div>
            <div className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 text-[9px] font-black px-1 rounded-full font-mono">
              MENTOR
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-amber-400 font-bold tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Lição do Mestre Bardo: Fase {lesson.id}</span>
            </div>
            <h3 className="text-sm sm:text-base font-black text-white truncate">
              {lesson.title}
            </h3>
            <p className="text-xs text-amber-200/80 truncate">
              Missão: Dominar 3 palavras para a canção <strong className="text-amber-300">"{lesson.musicStage.songTitle}"</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Cycle Stage Navigation Tabs (a. Lição do Professor | b. Tarefas de Prática) */}
      <div className="flex items-center justify-between p-1.5 rounded-2xl bg-slate-900 border-2 border-amber-500/60 shadow-lg gap-2">
        <button
          onClick={() => {
            playTapSound();
            setGrimoireMode('cards');
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
            grimoireMode === 'cards'
              ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md font-black'
              : 'text-amber-200/80 hover:text-white'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>a) Lição do Professor</span>
        </button>

        <button
          onClick={() => {
            playTapSound();
            setGrimoireMode('practice');
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
            grimoireMode === 'practice'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-md font-black'
              : 'text-emerald-200/80 hover:text-white'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>b) Tarefas de Prática ({energyPercent}%)</span>
        </button>
      </div>

      {/* STAGE A: LIÇÃO DO PROFESSOR (VOCABULARY ANCHORS) */}
      {grimoireMode === 'cards' && (
        <div className="bg-gradient-to-b from-amber-100 via-amber-50 to-amber-100 text-amber-950 rounded-3xl p-6 sm:p-8 border-4 border-amber-600 shadow-2xl relative space-y-6">
          {/* Stepper Dots (1/3, 2/3, 3/3) */}
          <div className="flex items-center justify-between border-b-2 border-amber-300 pb-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-800">
              Palavra {vocabIndex + 1} de {lesson.vocabularies.length}
            </span>
            <div className="flex items-center gap-1.5">
              {lesson.vocabularies.map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-all border ${
                    i === vocabIndex
                      ? 'bg-amber-600 border-amber-800 scale-125'
                      : 'bg-amber-200 border-amber-400'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Visual Anchor & Word Card */}
          <div className="text-center space-y-3">
            <div className="w-24 h-24 rounded-3xl bg-amber-200/80 border-2 border-amber-400 flex items-center justify-center text-5xl mx-auto shadow-inner">
              {activeVocab.emoji}
            </div>

            <div>
              <div className="text-xs font-mono uppercase text-amber-800 font-bold">
                {activeVocab.anchorDescription}
              </div>
              <h2 className="text-4xl font-black text-amber-950 tracking-tight mt-1">
                {activeVocab.word}
              </h2>
              <div className="text-sm font-mono text-emerald-700 font-bold mt-1">
                Pronúncia falada: [{activeVocab.phonetic}]
              </div>
              <div className="mt-3 text-lg font-bold text-amber-950 bg-amber-200/90 border border-amber-400 py-1.5 px-4 rounded-2xl inline-block shadow-sm">
                Tradução: <strong className="text-amber-900">{activeVocab.translation}</strong>
              </div>
            </div>
          </div>

          {/* Dual Audio Speed Controls with 3D Embossed Golden buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => handleSpeak(activeVocab.word, false)}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black rounded-2xl text-xs border-2 border-white border-b-4 border-b-amber-800 shadow-md active:scale-95 transition-transform"
            >
              <Volume2 className="w-4 h-4" />
              <span>Ouvir Normal (1.0x)</span>
            </button>

            <button
              onClick={() => handleSpeak(activeVocab.word, true)}
              className="flex items-center gap-2 px-4 py-3 bg-amber-200 hover:bg-amber-300 text-amber-950 border border-amber-400 font-bold rounded-2xl text-xs transition-colors active:scale-95"
            >
              <Volume2 className="w-4 h-4 text-amber-700" />
              <span>Ouvir Desacelerado (0.7x)</span>
            </button>
          </div>

          {/* Context Sentence in Grimoire */}
          <div className="bg-amber-200/60 border border-amber-400 rounded-2xl p-4 text-left space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono text-amber-800 uppercase font-bold">
              <span>Frase Mágica do Mestre</span>
              <button
                onClick={() => handleSpeak(activeVocab.contextSentence, false)}
                className="text-amber-900 hover:text-amber-950 font-bold flex items-center gap-1"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Ouvir</span>
              </button>
            </div>
            <p className="text-sm font-bold text-amber-950">
              "{activeVocab.contextSentence}"
            </p>
            <p className="text-xs text-amber-800 italic">
              {activeVocab.contextTranslation}
            </p>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t-2 border-amber-300">
            <button
              onClick={prevCard}
              disabled={vocabIndex === 0}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold border ${
                vocabIndex === 0
                  ? 'opacity-40 cursor-not-allowed border-amber-300 text-amber-700'
                  : 'bg-amber-200 hover:bg-amber-300 text-amber-950 border-amber-400'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>

            <button
              onClick={nextCard}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-b from-emerald-500 via-emerald-600 to-emerald-700 text-white font-black rounded-2xl text-xs border-2 border-emerald-300 border-b-4 border-b-emerald-900 shadow-md active:scale-95 transition-transform"
            >
              <span>
                {vocabIndex < lesson.vocabularies.length - 1
                  ? 'Próxima Palavra →'
                  : 'Ir para as Tarefas de Prática →'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* STAGE B: TAREFAS DE PRÁTICA (ENERGY ACCUMULATION) */}
      {grimoireMode === 'practice' && !isPracticeComplete && (
        <div className="bg-gradient-to-b from-amber-100 via-amber-50 to-amber-100 text-amber-950 rounded-3xl p-6 sm:p-8 border-4 border-amber-600 shadow-2xl relative space-y-5">
          {/* Energy Accumulation Gauge */}
          <div className="p-3.5 rounded-2xl bg-slate-950 text-white border-2 border-amber-400/80 space-y-1.5">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="flex items-center gap-1.5 text-sky-400 font-bold">
                <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>Energia Mágica Acumulada:</span>
              </span>
              <span className="font-black text-amber-400">{energyPercent}% / 100%</span>
            </div>
            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-700">
              <div
                className="bg-gradient-to-r from-sky-400 via-teal-300 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${energyPercent}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 italic">
              Acerte os exercícios para carregar sua energia antes de enfrentar o Chefe!
            </div>
          </div>

          <div className="flex items-center justify-between border-b-2 border-amber-300 pb-2">
            <span className="text-xs font-mono font-bold uppercase text-amber-800">
              Exercício {practiceIndex + 1} de {lesson.fixationQuiz.length}
            </span>
            <span className="text-xs font-bold text-emerald-800">Sem Penalidade de Vidas</span>
          </div>

          <div className="text-center space-y-1">
            <h2 className="text-lg sm:text-xl font-black text-amber-950 tracking-tight">
              {activeExercise.instruction}
            </h2>
            <p className="text-xs text-amber-800">
              Fixe o som e significado para desferir o golpe harmônico!
            </p>
          </div>

          {activeExercise.type === 'audio_match' && (
            <div className="text-center py-2">
              <button
                onClick={() => {
                  playTapSound();
                  const targetVocab = lesson.vocabularies.find((v) => v.id === activeExercise.targetWordId);
                  if (targetVocab) speakEnglish(targetVocab.word, slowAudio);
                }}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-amber-200 hover:bg-amber-300 text-amber-950 border-2 border-amber-500 rounded-2xl font-black text-sm shadow-md transition-transform active:scale-95"
              >
                <Volume2 className="w-5 h-5 text-amber-700" />
                <span>Toque para Ouvir a Voz do Mestre</span>
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {activeExercise.options.map((opt, idx) => {
              const isSelected = selectedPracticeOption === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handlePracticeSelect(idx, opt.isCorrect, opt.feedbackNote)}
                  className={`p-5 rounded-3xl border-2 text-center transition-all flex flex-col items-center justify-center gap-2 min-h-[110px] transform active:scale-95 border-b-4 ${
                    isSelected && opt.isCorrect
                      ? 'bg-emerald-500 text-white border-white border-b-emerald-800 shadow-lg ring-2 ring-emerald-500'
                      : isSelected && !opt.isCorrect
                      ? 'bg-rose-500 text-white border-rose-300 border-b-rose-800'
                      : 'bg-amber-200/90 border-amber-400 hover:border-amber-500 text-amber-950 border-b-amber-600'
                  }`}
                >
                  <span className="text-4xl">{opt.emoji}</span>
                  <span className="text-base font-black">{opt.text}</span>
                </button>
              );
            })}
          </div>

          {practiceFeedback && (
            <div
              className={`p-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 border font-bold ${
                isError
                  ? 'bg-amber-200 border-amber-400 text-amber-900'
                  : 'bg-emerald-100 border-emerald-400 text-emerald-900'
              }`}
            >
              {isError ? (
                <span>{practiceFeedback} Tente a outra opção sem pressa!</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>{practiceFeedback} (+Energia Carregada!)</span>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* PRACTICE COMPLETED: READY FOR STAGE C (DESAFIO DO CHEFE) */}
      {isPracticeComplete && (
        <div className="bg-gradient-to-b from-amber-100 via-amber-50 to-amber-100 text-amber-950 rounded-3xl p-6 sm:p-8 border-4 border-amber-600 shadow-2xl relative space-y-6 text-center animate-in zoom-in-95">
          <div className="w-20 h-20 rounded-3xl bg-amber-400/30 border-2 border-amber-500 flex items-center justify-center text-4xl mx-auto shadow-inner">
            ⚡
          </div>

          <div className="space-y-1">
            <span className="text-xs font-mono uppercase font-black text-amber-800">
              Energia Total Acumulada (100%)
            </span>
            <h2 className="text-2xl font-black text-amber-950">
              Você Dominou o Treinamento!
            </h2>
            <p className="text-xs text-amber-900 max-w-sm mx-auto">
              O Mestre Bardo Aurelius abençoou sua espada musical. O Chefão da fase espera por você no Karaokê!
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-200/70 border border-amber-400 text-left space-y-1">
            <div className="text-[10px] font-mono uppercase text-amber-800 font-bold">
              Desafio do Chefe na Batalha Musical:
            </div>
            <div className="text-xs font-bold text-amber-950">
              Canção: "{lesson.musicStage.songTitle}"
            </div>
            <div className="text-[11px] text-amber-800">
              Acerte o ritmo das estrofes sincronizadas e preencha a palavra-chave para vencer o Chefe com classificação S ou Ouro!
            </div>
          </div>

          <button
            onClick={() => {
              playTapSound();
              onAdvanceToBattle();
            }}
            className="w-full py-4 px-6 bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black rounded-2xl text-sm border-2 border-white border-b-4 border-b-amber-800 shadow-xl shadow-amber-500/40 active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            <Swords className="w-5 h-5 text-slate-950" />
            <span>c) Entrar no Desafio do Chefe (Batalha Musical) ⚔️</span>
          </button>
        </div>
      )}
    </div>
  );
};
