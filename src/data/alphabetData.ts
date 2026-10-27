export interface AlphabetLetter {
  letter: string;
  phonetic: string;
  exampleWord: string;
  translation: string;
  emoji: string;
  audioNoteFreq: number;
}

export const ALPHABET_DATA: AlphabetLetter[] = [
  { letter: 'A', phonetic: 'êi', exampleWord: 'Apple', translation: 'Maçã', emoji: '🍎', audioNoteFreq: 261.63 },
  { letter: 'B', phonetic: 'bi', exampleWord: 'Bard', translation: 'Bardo / Menestrel', emoji: '🎸', audioNoteFreq: 293.66 },
  { letter: 'C', phonetic: 'si', exampleWord: 'Castle', translation: 'Castelo', emoji: '🏰', audioNoteFreq: 329.63 },
  { letter: 'D', phonetic: 'di', exampleWord: 'Dragon', translation: 'Dragão', emoji: '🐉', audioNoteFreq: 349.23 },
  { letter: 'E', phonetic: 'i', exampleWord: 'Energy', translation: 'Energia', emoji: '⚡', audioNoteFreq: 392.00 },
  { letter: 'F', phonetic: 'éf', exampleWord: 'Fire', translation: 'Fogo', emoji: '🔥', audioNoteFreq: 440.00 },
  { letter: 'G', phonetic: 'dji', exampleWord: 'Gold', translation: 'Ouro', emoji: '🪙', audioNoteFreq: 493.88 },
  { letter: 'H', phonetic: 'êitch', exampleWord: 'Hero', translation: 'Herói', emoji: '⚔️', audioNoteFreq: 523.25 },
  { letter: 'I', phonetic: 'ái', exampleWord: 'Island', translation: 'Ilha', emoji: '🏝️', audioNoteFreq: 587.33 },
  { letter: 'J', phonetic: 'djêi', exampleWord: 'Joy', translation: 'Alegria', emoji: '🎉', audioNoteFreq: 659.25 },
  { letter: 'K', phonetic: 'kêi', exampleWord: 'King', translation: 'Rei', emoji: '👑', audioNoteFreq: 698.46 },
  { letter: 'L', phonetic: 'él', exampleWord: 'Love', translation: 'Amor', emoji: '❤️', audioNoteFreq: 783.99 },
  { letter: 'M', phonetic: 'ém', exampleWord: 'Music', translation: 'Música', emoji: '🎵', audioNoteFreq: 880.00 },
  { letter: 'N', phonetic: 'én', exampleWord: 'Night', translation: 'Noite', emoji: '🌙', audioNoteFreq: 987.77 },
  { letter: 'O', phonetic: 'ôu', exampleWord: 'Ocean', translation: 'Oceano', emoji: '🌊', audioNoteFreq: 1046.50 },
  { letter: 'P', phonetic: 'pi', exampleWord: 'Potion', translation: 'Poção', emoji: '🧪', audioNoteFreq: 1174.66 },
  { letter: 'Q', phonetic: 'kiu', exampleWord: 'Queen', translation: 'Rainha', emoji: '👸', audioNoteFreq: 1318.51 },
  { letter: 'R', phonetic: 'ár', exampleWord: 'Rhythm', translation: 'Ritmo', emoji: '🥁', audioNoteFreq: 1396.91 },
  { letter: 'S', phonetic: 'és', exampleWord: 'Star', translation: 'Estrela', emoji: '⭐', audioNoteFreq: 1567.98 },
  { letter: 'T', phonetic: 'ti', exampleWord: 'Treasure', translation: 'Tesouro', emoji: '💎', audioNoteFreq: 1760.00 },
  { letter: 'U', phonetic: 'iú', exampleWord: 'Universe', translation: 'Universo', emoji: '🌌', audioNoteFreq: 1975.53 },
  { letter: 'V', phonetic: 'vi', exampleWord: 'Village', translation: 'Vilarejo', emoji: '🏡', audioNoteFreq: 2093.00 },
  { letter: 'W', phonetic: 'dâbliu', exampleWord: 'World', translation: 'Mundo', emoji: '🌍', audioNoteFreq: 2349.32 },
  { letter: 'X', phonetic: 'éks', exampleWord: 'Xylophone', translation: 'Xilofone', emoji: '🎼', audioNoteFreq: 2637.02 },
  { letter: 'Y', phonetic: 'uái', exampleWord: 'Youth', translation: 'Juventude', emoji: '🌱', audioNoteFreq: 2793.83 },
  { letter: 'Z', phonetic: 'zi', exampleWord: 'Zephyr', translation: 'Brisa Suave', emoji: '🍃', audioNoteFreq: 3135.96 }
];
