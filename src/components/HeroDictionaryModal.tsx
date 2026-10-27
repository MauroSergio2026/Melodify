import React, { useState, useMemo } from 'react';
import { Search, Volume2, Sparkles, X } from 'lucide-react';
import { HERO_DICTIONARY, DictionaryEntry } from '../data/heroDictionary';
import { speakEnglish, playTapSound } from '../utils/audio';

interface HeroDictionaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HeroDictionaryModal: React.FC<HeroDictionaryModalProps> = ({
  isOpen,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [slowAudio, setSlowAudio] = useState<boolean>(false);

  const categories = [
    { id: 'all', label: 'Todas as Palavras' },
    { id: 'musica', label: '🎵 Músicas' },
    { id: 'sentimentos', label: '❤️ Sentimentos' },
    { id: 'aventura', label: '⚔️ Aventura' },
    { id: 'cotidiano', label: '☀️ Cotidiano' }
  ];

  const filteredEntries = useMemo(() => {
    return HERO_DICTIONARY.filter((entry) => {
      const matchCat = selectedCategory === 'all' || entry.category === selectedCategory;
      const term = searchTerm.trim().toLowerCase();
      const matchSearch =
        term === '' ||
        entry.word.toLowerCase().includes(term) ||
        entry.translation.toLowerCase().includes(term) ||
        entry.definition.toLowerCase().includes(term);
      return matchCat && matchSearch;
    });
  }, [searchTerm, selectedCategory]);

  const handleSpeakWord = (word: string) => {
    playTapSound();
    speakEnglish(word, slowAudio);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-gradient-to-b from-amber-100 via-amber-50 to-amber-100 text-amber-950 border-4 border-amber-600 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b-2 border-amber-300 flex items-center justify-between bg-amber-200/60">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 border border-amber-500 flex items-center justify-center text-xl shadow-md">
              📖
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-amber-950">
                Dicionário do Herói
              </h2>
              <p className="text-xs text-amber-800">
                Pesquise palavras, pronúncias nativas e trechos de canções
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSlowAudio(!slowAudio)}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-xl border transition-colors ${
                slowAudio
                  ? 'bg-amber-500 text-slate-950 border-amber-600'
                  : 'bg-amber-200 text-amber-900 border-amber-400'
              }`}
            >
              {slowAudio ? 'Voz 0.7x' : 'Voz 1.0x'}
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-amber-300 hover:bg-amber-400 text-amber-900 flex items-center justify-center font-bold"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Bar Input */}
        <div className="p-4 bg-amber-200/40 border-b border-amber-300 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-700" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Digite qualquer palavra em inglês (ex: Sunshine, Hero, Love, Star)..."
              className="w-full bg-amber-50 border-2 border-amber-400 rounded-2xl pl-10 pr-10 py-2.5 text-xs text-amber-950 placeholder-amber-700/60 font-bold focus:outline-none focus:border-amber-600 shadow-inner"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-amber-700 hover:text-amber-950 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-amber-200/80 text-amber-900 hover:bg-amber-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Word Cards Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {searchTerm && filteredEntries.length === 0 && (
            <div className="p-4 bg-amber-200/70 border-2 border-amber-400 rounded-2xl space-y-2 text-center">
              <span className="text-2xl">✨</span>
              <h3 className="text-sm font-black text-amber-950">
                Ouvir pronúncia de: "{searchTerm}"
              </h3>
              <p className="text-xs text-amber-800">
                Toque no botão para ouvir a pronúncia em inglês com voz nativa!
              </p>
              <button
                onClick={() => handleSpeakWord(searchTerm)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-b from-amber-400 to-amber-600 text-slate-950 font-black rounded-xl text-xs border-2 border-white shadow-md active:scale-95"
              >
                <Volume2 className="w-4 h-4" />
                <span>Ouvir Pronúncia Nativa</span>
              </button>
            </div>
          )}

          {filteredEntries.map((entry: DictionaryEntry) => (
            <div
              key={entry.id}
              className="p-3.5 bg-amber-50/90 border-2 border-amber-300 hover:border-amber-500 rounded-2xl shadow-sm transition-all space-y-2"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{entry.emoji}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-amber-950">
                        {entry.word}
                      </span>
                      <span className="text-xs font-mono text-emerald-800 font-bold">
                        [{entry.phonetic}]
                      </span>
                    </div>
                    <div className="text-xs font-bold text-amber-900">
                      {entry.translation}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleSpeakWord(entry.word)}
                  className="p-2 rounded-xl bg-amber-300 hover:bg-amber-400 text-amber-950 font-bold transition-transform active:scale-90 shadow-sm shrink-0"
                  title="Ouvir pronúncia"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-amber-800/90 leading-relaxed">
                {entry.definition}
              </p>

              {entry.songQuote && (
                <div className="pt-1.5 border-t border-amber-200/80 flex items-center justify-between text-[11px] font-mono text-amber-900">
                  <span className="italic truncate pr-2">
                    "{entry.songQuote}"
                  </span>
                  <span className="text-amber-700 shrink-0 font-bold">
                    ({entry.songArtist})
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
