export interface DictionaryEntry {
  id: string;
  word: string;
  translation: string;
  phonetic: string;
  category: 'musica' | 'aventura' | 'sentimentos' | 'cotidiano';
  emoji: string;
  definition: string;
  songQuote?: string;
  songArtist?: string;
}

export const HERO_DICTIONARY: DictionaryEntry[] = [
  {
    id: 'd-sunshine',
    word: 'Sunshine',
    translation: 'Luz do Sol / Raio de Sol',
    phonetic: 'sán-chain',
    category: 'cotidiano',
    emoji: '☀️',
    definition: 'A luz calorosa emitida pelo sol, que ilumina e aquece.',
    songQuote: 'You are my sunshine, my only sunshine!',
    songArtist: 'Canção Tradicional Americana'
  },
  {
    id: 'd-warm',
    word: 'Warm',
    translation: 'Quentinho / Acolhedor',
    phonetic: 'uórm',
    category: 'cotidiano',
    emoji: '🧣',
    definition: 'Temperatura agradável, nem fria nem excessivamente quente.',
    songQuote: 'Keep me warm in the winter night.',
    songArtist: 'Canção Acústica'
  },
  {
    id: 'd-smile',
    word: 'Smile',
    translation: 'Sorrir / Sorriso',
    phonetic: 'smáil',
    category: 'sentimentos',
    emoji: '😊',
    definition: 'Expressão facial de felicidade e gentileza.',
    songQuote: 'Smile, though your heart is aching.',
    songArtist: 'Nat King Cole'
  },
  {
    id: 'd-love',
    word: 'Love',
    translation: 'Amor / Amar',
    phonetic: 'lâv',
    category: 'sentimentos',
    emoji: '❤️',
    definition: 'Sentimento profundo de carinho, conexão e apreço mútuo.',
    songQuote: 'All you need is love, love is all you need.',
    songArtist: 'The Beatles'
  },
  {
    id: 'd-need',
    word: 'Need',
    translation: 'Precisar / Necessidade',
    phonetic: 'níid',
    category: 'cotidiano',
    emoji: '🤲',
    definition: 'Ter necessidade ou carência de algo importante.',
    songQuote: 'I need somebody to love.',
    songArtist: 'Queen'
  },
  {
    id: 'd-together',
    word: 'Together',
    translation: 'Juntos / Em União',
    phonetic: 'tu-gué-der',
    category: 'sentimentos',
    emoji: '👫',
    definition: 'Em companhia de outra pessoa ou grupo.',
    songQuote: 'We will be together forever.',
    songArtist: 'Rick Astley'
  },
  {
    id: 'd-dance',
    word: 'Dance',
    translation: 'Dançar / Dança',
    phonetic: 'déns',
    category: 'musica',
    emoji: '💃',
    definition: 'Mover o corpo ritmicamente ao som da música.',
    songQuote: 'I wanna dance with somebody who loves me!',
    songArtist: 'Whitney Houston'
  },
  {
    id: 'd-night',
    word: 'Night',
    translation: 'Noite',
    phonetic: 'náit',
    category: 'cotidiano',
    emoji: '🌙',
    definition: 'O período do dia em que o sol se põe e a lua brilha.',
    songQuote: 'A hard day\'s night.',
    songArtist: 'The Beatles'
  },
  {
    id: 'd-feel',
    word: 'Feel',
    translation: 'Sentir / Emoção',
    phonetic: 'fíil',
    category: 'sentimentos',
    emoji: '✨',
    definition: 'Experimentar uma sensação física ou emocional.',
    songQuote: 'Can you feel the love tonight?',
    songArtist: 'Elton John'
  },
  {
    id: 'd-world',
    word: 'World',
    translation: 'Mundo / Planeta',
    phonetic: 'uôrld',
    category: 'aventura',
    emoji: '🌍',
    definition: 'A Terra, nossa casa cósmica cheia de vida e culturas.',
    songQuote: 'And I think to myself: what a wonderful world.',
    songArtist: 'Louis Armstrong'
  },
  {
    id: 'd-green',
    word: 'Green',
    translation: 'Verde',
    phonetic: 'gríin',
    category: 'cotidiano',
    emoji: '🌳',
    definition: 'A cor da natureza, das folhas e da esperança.',
    songQuote: 'I see trees of green, red roses too.',
    songArtist: 'Louis Armstrong'
  },
  {
    id: 'd-sky',
    word: 'Sky',
    translation: 'Céu',
    phonetic: 'skái',
    category: 'aventura',
    emoji: '☁️',
    definition: 'A abóbada celeste azul visível acima da Terra.',
    songQuote: 'Look at the stars in the sky.',
    songArtist: 'Coldplay'
  },
  {
    id: 'd-dream',
    word: 'Dream',
    translation: 'Sonho / Sonhar',
    phonetic: 'druím',
    category: 'sentimentos',
    emoji: '✨',
    definition: 'Imagens e desejos concebidos pela imaginação e esperança.',
    songQuote: 'A million dreams are keeping me awake.',
    songArtist: 'The Greatest Showman'
  },
  {
    id: 'd-stand',
    word: 'Stand',
    translation: 'Ficar de Pé / Apoiar',
    phonetic: 'sténd',
    category: 'aventura',
    emoji: '🤝',
    definition: 'Permanecer firme ao lado de quem precisa de apoio.',
    songQuote: 'Stand by me, oh stand by me.',
    songArtist: 'Ben E. King'
  },
  {
    id: 'd-friend',
    word: 'Friend',
    translation: 'Amigo / Amiga',
    phonetic: 'frênd',
    category: 'sentimentos',
    emoji: '🤝',
    definition: 'Pessoa com quem se tem um laço de amizade e carinho.',
    songQuote: 'You\'ve got a friend in me.',
    songArtist: 'Randy Newman'
  },
  {
    id: 'd-music',
    word: 'Music',
    translation: 'Música',
    phonetic: 'miú-zik',
    category: 'musica',
    emoji: '🎵',
    definition: 'A arte de combinar sons e melodias harmoniosas.',
    songQuote: 'Thank you for the music, the songs I\'m singing.',
    songArtist: 'ABBA'
  },
  {
    id: 'd-heart',
    word: 'Heart',
    translation: 'Coração',
    phonetic: 'rárt',
    category: 'sentimentos',
    emoji: '💖',
    definition: 'Órgão vital associado poeticamente aos sentimentos.',
    songQuote: 'My heart will go on.',
    songArtist: 'Celine Dion'
  },
  {
    id: 'd-hero',
    word: 'Hero',
    translation: 'Herói / Heroína',
    phonetic: 'rírôu',
    category: 'aventura',
    emoji: '⚔️',
    definition: 'Pessoa admirada por sua coragem e nobreza.',
    songQuote: 'We can be heroes, just for one day.',
    songArtist: 'David Bowie'
  },
  {
    id: 'd-potion',
    word: 'Potion',
    translation: 'Poção Mágica',
    phonetic: 'pôu-shân',
    category: 'aventura',
    emoji: '🧪',
    definition: 'Elixir mágico que restaura vida ou mana no RPG.',
    songQuote: 'Love potion number nine.',
    songArtist: 'The Clovers'
  },
  {
    id: 'd-star',
    word: 'Star',
    translation: 'Estrela',
    phonetic: 'stár',
    category: 'aventura',
    emoji: '⭐',
    definition: 'Corpo celeste brilhante que guia viajantes na noite.',
    songQuote: 'A sky full of stars.',
    songArtist: 'Coldplay'
  }
];
