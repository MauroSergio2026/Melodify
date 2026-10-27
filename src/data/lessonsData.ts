export interface VocabularyAnchor {
  id: string;
  word: string;
  translation: string;
  phonetic: string;
  emoji: string;
  anchorDescription: string;
  contextSentence: string;
  contextTranslation: string;
}

export interface KaraokeLine {
  id: number;
  timeSec: number;
  text: string;
  translation: string;
  highlightWord?: string;
  isBlank?: boolean;
}

export interface Lesson {
  id: number;
  title: string;
  theme: string;
  category: string;
  durationMinutes: number;
  vocabularies: VocabularyAnchor[]; // Strictly 3 key words per lesson!
  fixationQuiz: {
    id: string;
    type: 'audio_match' | 'visual_meaning' | 'context_fill';
    instruction: string;
    targetWordId: string;
    options: {
      text: string;
      emoji: string;
      isCorrect: boolean;
      feedbackNote: string;
    }[];
  }[];
  musicStage: {
    songTitle: string;
    artist: string;
    genre: string;
    tempoBpm: number;
    coverBg: string;
    melodyNotes: number[];
    chordRoots: number[];
    karaokeLyrics: KaraokeLine[];
    challengeWord: string;
    challengeOptions: string[];
    culturalFact: string;
  };
}

export const MELODIFY_LESSONS: Lesson[] = [
  {
    id: 1,
    title: 'Sol, Calor e Alegria',
    theme: 'Pop Acústico & Folk',
    category: 'Natureza & Sensações',
    durationMinutes: 4,
    vocabularies: [
      {
        id: 'v1-1',
        word: 'Sunshine',
        translation: 'Luz do Sol / Raio de Sol',
        phonetic: 'sán-chain',
        emoji: '☀️',
        anchorDescription: 'Luz dourada do sol brilhando no horizonte',
        contextSentence: 'The morning sunshine brings joy.',
        contextTranslation: 'O raio de sol da manhã traz alegria.'
      },
      {
        id: 'v1-2',
        word: 'Warm',
        translation: 'Quentinho / Acolhedor',
        phonetic: 'uórm',
        emoji: '🧣',
        anchorDescription: 'Sensação aconchegante de calor agradável',
        contextSentence: 'Give me a warm gentle hug.',
        contextTranslation: 'Me dê um abraço quentinho e gentil.'
      },
      {
        id: 'v1-3',
        word: 'Smile',
        translation: 'Sorrir / Sorriso',
        phonetic: 'smáil',
        emoji: '😊',
        anchorDescription: 'Expressão de felicidade no rosto',
        contextSentence: 'Your smile lights up the room.',
        contextTranslation: 'O seu sorriso ilumina o ambiente.'
      }
    ],
    fixationQuiz: [
      {
        id: 'q1-1',
        type: 'visual_meaning',
        instruction: 'Qual destas palavras significa "Luz do Sol"?',
        targetWordId: 'v1-1',
        options: [
          { text: 'Sunshine', emoji: '☀️', isCorrect: true, feedbackNote: 'Perfeito! Sunshine = Luz do Sol.' },
          { text: 'Smile', emoji: '😊', isCorrect: false, feedbackNote: 'Smile significa Sorriso!' }
        ]
      },
      {
        id: 'q1-2',
        type: 'audio_match',
        instruction: 'Ouça o áudio e identifique a palavra falada:',
        targetWordId: 'v1-2', // "Warm"
        options: [
          { text: 'Warm (Quentinho)', emoji: '🧣', isCorrect: true, feedbackNote: 'Muito bem! "Warm" é quente e aconchegante.' },
          { text: 'Cold (Frio)', emoji: '❄️', isCorrect: false, feedbackNote: 'Cold é o oposto (frio)!' }
        ]
      },
      {
        id: 'q1-3',
        type: 'context_fill',
        instruction: 'Como dizemos "sorriso" em inglês?',
        targetWordId: 'v1-3',
        options: [
          { text: 'Smile', emoji: '😊', isCorrect: true, feedbackNote: 'Exato! A smile brings peace.' },
          { text: 'Sleep', emoji: '😴', isCorrect: false, feedbackNote: 'Sleep significa dormir.' }
        ]
      }
    ],
    musicStage: {
      songTitle: 'You Are My Sunshine',
      artist: 'Canção Tradicional Americana',
      genre: 'Acoustic Folk',
      tempoBpm: 92,
      coverBg: 'from-amber-500/30 to-orange-600/20',
      melodyNotes: [392.00, 440.00, 523.25, 587.33, 659.25, 659.25], // G4, A4, C5, D5, E5, E5
      chordRoots: [261.63, 349.23, 392.00, 261.63], // C, F, G, C
      karaokeLyrics: [
        { id: 1, timeSec: 0, text: 'You are my', translation: 'Você é o meu', highlightWord: 'You' },
        { id: 2, timeSec: 2, text: '______ (raio de sol), my only sunshine,', translation: 'raio de sol, meu único raio de sol,', isBlank: true },
        { id: 3, timeSec: 5, text: 'You make me happy when skies are gray,', translation: 'Você me faz feliz quando os céus estão cinzentos,' },
        { id: 4, timeSec: 8, text: 'You\'ll never know, dear, how much I love you!', translation: 'Você nunca saberá, querido(a), o quanto eu te amo!' }
      ],
      challengeWord: 'sunshine',
      challengeOptions: ['sunshine', 'rain'],
      culturalFact: 'Criada nos anos 1930 nos EUA, esta canção se tornou hino de afeto entre pais e filhos no mundo todo!'
    }
  },
  {
    id: 2,
    title: 'Amor, Cuidado e União',
    theme: 'Pop Rock & Clássico',
    category: 'Sentimentos & Conexão',
    durationMinutes: 4,
    vocabularies: [
      {
        id: 'v2-1',
        word: 'Love',
        translation: 'Amor / Amar',
        phonetic: 'lâv',
        emoji: '❤️',
        anchorDescription: 'Coração pulsando com carinho e afeição',
        contextSentence: 'Love is all around us.',
        contextTranslation: 'O amor está ao nosso redor.'
      },
      {
        id: 'v2-2',
        word: 'Need',
        translation: 'Precisar / Necessidade',
        phonetic: 'níid',
        emoji: '🤲',
        anchorDescription: 'Mãos estendidas pedindo ou dando apoio',
        contextSentence: 'All we need is peace.',
        contextTranslation: 'Tudo o que precisamos é paz.'
      },
      {
        id: 'v2-3',
        word: 'Together',
        translation: 'Juntos / Em União',
        phonetic: 'tu-gué-der',
        emoji: '👫',
        anchorDescription: 'Duas pessoas caminhando lado a lado',
        contextSentence: 'We can win together.',
        contextTranslation: 'Nós podemos vencer juntos.'
      }
    ],
    fixationQuiz: [
      {
        id: 'q2-1',
        type: 'visual_meaning',
        instruction: 'Qual é a palavra em inglês para "Amor"?',
        targetWordId: 'v2-1',
        options: [
          { text: 'Love', emoji: '❤️', isCorrect: true, feedbackNote: 'Perfeito! Love = Amor.' },
          { text: 'Leave', emoji: '🚪', isCorrect: false, feedbackNote: 'Leave significa partir ou deixar.' }
        ]
      },
      {
        id: 'q2-2',
        type: 'audio_match',
        instruction: 'Escute com atenção: o que significa o verbo pronunciado?',
        targetWordId: 'v2-2', // "Need"
        options: [
          { text: 'Need (Precisar)', emoji: '🤲', isCorrect: true, feedbackNote: 'Correto! I need you = Eu preciso de você.' },
          { text: 'No (Não)', emoji: '❌', isCorrect: false, feedbackNote: 'Não, o áudio pronunciou "Need".' }
        ]
      },
      {
        id: 'q2-3',
        type: 'context_fill',
        instruction: 'Qual palavra expressa "estar juntos"?',
        targetWordId: 'v2-3',
        options: [
          { text: 'Together', emoji: '👫', isCorrect: true, feedbackNote: 'Excelente! Together = Juntos.' },
          { text: 'Alone', emoji: '🚶', isCorrect: false, feedbackNote: 'Alone significa sozinho.' }
        ]
      }
    ],
    musicStage: {
      songTitle: 'All You Need Is Love',
      artist: 'The Beatles',
      genre: 'Classic Pop Rock',
      tempoBpm: 104,
      coverBg: 'from-pink-500/30 to-rose-700/20',
      melodyNotes: [440.00, 493.88, 523.25, 587.33, 523.25], // A4, B4, C5, D5, C5
      chordRoots: [349.23, 392.00, 261.63, 220.00], // F, G, C, Am
      karaokeLyrics: [
        { id: 1, timeSec: 0, text: 'Love, love, love!', translation: 'Amor, amor, amor!' },
        { id: 2, timeSec: 3, text: 'All you need is ______ (amor),', translation: 'Tudo o que você precisa é amor,', isBlank: true },
        { id: 3, timeSec: 6, text: 'All you need is love,', translation: 'Tudo o que você precisa é amor,' },
        { id: 4, timeSec: 9, text: 'Love is all you need!', translation: 'Amor é tudo o que você precisa!' }
      ],
      challengeWord: 'love',
      challengeOptions: ['love', 'money'],
      culturalFact: 'Composta por John Lennon em 1967, foi a primeira transmissão global de TV ao vivo via satélite!'
    }
  },
  {
    id: 3,
    title: 'Ritmo, Dança e Alegria',
    theme: 'Dance Pop Anos 80',
    category: 'Ação & Celebração',
    durationMinutes: 4,
    vocabularies: [
      {
        id: 'v3-1',
        word: 'Dance',
        translation: 'Dançar / Dança',
        phonetic: 'déns',
        emoji: '💃',
        anchorDescription: 'Pessoa rodopiando ao som de uma boa batida',
        contextSentence: 'I feel the urge to dance.',
        contextTranslation: 'Eu sinto a vontade de dançar.'
      },
      {
        id: 'v3-2',
        word: 'Night',
        translation: 'Noite',
        phonetic: 'náit',
        emoji: '🌙',
        anchorDescription: 'Céu estrelado com a lua brilhando',
        contextSentence: 'The night is young and magical.',
        contextTranslation: 'A noite é jovem e mágica.'
      },
      {
        id: 'v3-3',
        word: 'Feel',
        translation: 'Sentir / Sensação',
        phonetic: 'fíil',
        emoji: '✨',
        anchorDescription: 'Coração sentindo a emoção da música',
        contextSentence: 'I can feel the good energy.',
        contextTranslation: 'Eu posso sentir a boa energia.'
      }
    ],
    fixationQuiz: [
      {
        id: 'q3-1',
        type: 'visual_meaning',
        instruction: 'Qual palavra representa a ação de "Dançar"?',
        targetWordId: 'v3-1',
        options: [
          { text: 'Dance', emoji: '💃', isCorrect: true, feedbackNote: 'Perfeito! Dance = Dançar.' },
          { text: 'Sit', emoji: '🪑', isCorrect: false, feedbackNote: 'Sit significa sentar.' }
        ]
      },
      {
        id: 'q3-2',
        type: 'audio_match',
        instruction: 'Ouça o áudio e selecione a tradução:',
        targetWordId: 'v3-2', // "Night"
        options: [
          { text: 'Night (Noite)', emoji: '🌙', isCorrect: true, feedbackNote: 'Exato! Good night = Boa noite.' },
          { text: 'Day (Dia)', emoji: '☀️', isCorrect: false, feedbackNote: 'Day é o dia!' }
        ]
      },
      {
        id: 'q3-3',
        type: 'context_fill',
        instruction: 'Como expressar "sentir" em inglês?',
        targetWordId: 'v3-3',
        options: [
          { text: 'Feel', emoji: '✨', isCorrect: true, feedbackNote: 'Muito bem! I feel good = Eu me sinto bem.' },
          { text: 'Fall', emoji: '🍂', isCorrect: false, feedbackNote: 'Fall significa cair ou outono.' }
        ]
      }
    ],
    musicStage: {
      songTitle: 'I Wanna Dance With Somebody',
      artist: 'Whitney Houston',
      genre: '80s Dance Pop',
      tempoBpm: 118,
      coverBg: 'from-purple-500/30 to-indigo-700/20',
      melodyNotes: [587.33, 659.25, 783.99, 880.00, 783.99],
      chordRoots: [293.66, 329.63, 392.00, 440.00], // D, E, G, A
      karaokeLyrics: [
        { id: 1, timeSec: 0, text: 'Oh, I wanna dance with somebody,', translation: 'Oh, eu quero dançar com alguém,' },
        { id: 2, timeSec: 3, text: 'I wanna ______ (dançar) with somebody,', translation: 'Eu quero dançar com alguém,', isBlank: true },
        { id: 3, timeSec: 6, text: 'I wanna feel the heat with somebody,', translation: 'Eu quero sentir o calor com alguém,' },
        { id: 4, timeSec: 9, text: 'With somebody who loves me!', translation: 'Com alguém que me ame!' }
      ],
      challengeWord: 'dance',
      challengeOptions: ['dance', 'sleep'],
      culturalFact: 'Com esta música de 1987, Whitney Houston se tornou uma das maiores vozes da história da música mundial!'
    }
  },
  {
    id: 4,
    title: 'O Mundo e a Esperança',
    theme: 'Jazz & Soul Inspirador',
    category: 'Planeta & Gratidão',
    durationMinutes: 4,
    vocabularies: [
      {
        id: 'v4-1',
        word: 'World',
        translation: 'Mundo',
        phonetic: 'uôrld',
        emoji: '🌍',
        anchorDescription: 'Nosso lindo planeta Terra visto do espaço',
        contextSentence: 'Peace across the world.',
        contextTranslation: 'Paz por todo o mundo.'
      },
      {
        id: 'v4-2',
        word: 'Green',
        translation: 'Verde',
        phonetic: 'gríin',
        emoji: '🌳',
        anchorDescription: 'Folhas vibrantes de uma árvore florida',
        contextSentence: 'The trees are green and alive.',
        contextTranslation: 'As árvores estão verdes e cheias de vida.'
      },
      {
        id: 'v4-3',
        word: 'Sky',
        translation: 'Céu',
        phonetic: 'skái',
        emoji: '☁️',
        anchorDescription: 'O infinito azul do céu limpo',
        contextSentence: 'Look at the clear blue sky.',
        contextTranslation: 'Olhe para o céu azul e limpo.'
      }
    ],
    fixationQuiz: [
      {
        id: 'q4-1',
        type: 'visual_meaning',
        instruction: 'Qual palavra representa o "Mundo"?',
        targetWordId: 'v4-1',
        options: [
          { text: 'World', emoji: '🌍', isCorrect: true, feedbackNote: 'Perfeito! World = Mundo.' },
          { text: 'Word', emoji: '📝', isCorrect: false, feedbackNote: 'Word significa "palavra", sem o "L"!' }
        ]
      },
      {
        id: 'q4-2',
        type: 'audio_match',
        instruction: 'Identifique a cor pronunciada pelo professor:',
        targetWordId: 'v4-2', // "Green"
        options: [
          { text: 'Green (Verde)', emoji: '🌳', isCorrect: true, feedbackNote: 'Isso aí! Green = Verde.' },
          { text: 'Red (Vermelho)', emoji: '🍎', isCorrect: false, feedbackNote: 'Red é vermelho!' }
        ]
      },
      {
        id: 'q4-3',
        type: 'context_fill',
        instruction: 'Como se chama o "céu" em inglês?',
        targetWordId: 'v4-3',
        options: [
          { text: 'Sky', emoji: '☁️', isCorrect: true, feedbackNote: 'Excelente! Sky = Céu.' },
          { text: 'Sea', emoji: '🌊', isCorrect: false, feedbackNote: 'Sea significa mar!' }
        ]
      }
    ],
    musicStage: {
      songTitle: 'What a Wonderful World',
      artist: 'Louis Armstrong',
      genre: 'Classic Soul & Jazz',
      tempoBpm: 76,
      coverBg: 'from-emerald-600/30 to-teal-800/20',
      melodyNotes: [392.00, 440.00, 493.88, 523.25, 440.00, 392.00],
      chordRoots: [261.63, 329.63, 349.23, 392.00], // C, Em, F, G
      karaokeLyrics: [
        { id: 1, timeSec: 0, text: 'I see trees of green, red roses too,', translation: 'Eu vejo árvores verdes, rosas vermelhas também,' },
        { id: 2, timeSec: 4, text: 'I see them bloom for me and you,', translation: 'Eu as vejo florescer para mim e para você,' },
        { id: 3, timeSec: 8, text: 'And I think to myself: what a wonderful ______ (mundo)!', translation: 'E eu penso comigo mesmo: que mundo maravilhoso!', isBlank: true }
      ],
      challengeWord: 'world',
      challengeOptions: ['world', 'computer'],
      culturalFact: 'Gravada em 1967, a voz rouca e calorosa de Louis Armstrong tornou esta canção um dos maiores patrimônios da humanidade.'
    }
  },
  {
    id: 5,
    title: 'Paz, Sonhos e Imaginação',
    theme: 'Balada Clássica de Piano',
    category: 'Harmonia & União',
    durationMinutes: 4,
    vocabularies: [
      {
        id: 'v5-1',
        word: 'Dreamer',
        translation: 'Sonhador / Que tem esperança',
        phonetic: 'dríi-mêr',
        emoji: '✨',
        anchorDescription: 'Alguém que olha para as estrelas imaginando um futuro melhor',
        contextSentence: 'You may say I\'m a dreamer.',
        contextTranslation: 'Você pode dizer que eu sou um sonhador.'
      },
      {
        id: 'v5-2',
        word: 'Peace',
        translation: 'Paz / Tranquilidade',
        phonetic: 'píis',
        emoji: '🕊️',
        anchorDescription: 'Pomba branca voando em harmonia serena',
        contextSentence: 'Living life in peace and unity.',
        contextTranslation: 'Vivendo a vida em paz e união.'
      },
      {
        id: 'v5-3',
        word: 'Join',
        translation: 'Juntar-se / Unir-se',
        phonetic: 'djóin',
        emoji: '🤝',
        anchorDescription: 'Apertar de mãos unindo forças',
        contextSentence: 'I hope someday you will join us.',
        contextTranslation: 'Espero que algum dia você se junte a nós.'
      }
    ],
    fixationQuiz: [
      {
        id: 'q5-1',
        type: 'visual_meaning',
        instruction: 'Qual palavra significa "Sonhador"?',
        targetWordId: 'v5-1',
        options: [
          { text: 'Dreamer', emoji: '✨', isCorrect: true, feedbackNote: 'Perfeito! Dream = Sonho, Dreamer = Sonhador.' },
          { text: 'Driver', emoji: '🚗', isCorrect: false, feedbackNote: 'Driver significa motorista!' }
        ]
      },
      {
        id: 'q5-2',
        type: 'audio_match',
        instruction: 'Ouça o áudio e selecione a tradução:',
        targetWordId: 'v5-2', // "Peace"
        options: [
          { text: 'Peace (Paz)', emoji: '🕊️', isCorrect: true, feedbackNote: 'Exato! Peace = Paz mundial.' },
          { text: 'Piece (Pedaço)', emoji: '🧩', isCorrect: false, feedbackNote: 'Piece soa igual, mas significa pedaço!' }
        ]
      },
      {
        id: 'q5-3',
        type: 'context_fill',
        instruction: 'Como dizer "unir-se" ou "juntar-se"?',
        targetWordId: 'v5-3',
        options: [
          { text: 'Join', emoji: '🤝', isCorrect: true, feedbackNote: 'Muito bem! Join us = Junte-se a nós.' },
          { text: 'Jump', emoji: '🦘', isCorrect: false, feedbackNote: 'Jump significa pular.' }
        ]
      }
    ],
    musicStage: {
      songTitle: 'Imagine',
      artist: 'John Lennon',
      genre: 'Classic Piano Ballad',
      tempoBpm: 75,
      coverBg: 'from-sky-500/30 to-indigo-700/20',
      melodyNotes: [523.25, 493.88, 440.00, 392.00, 349.23],
      chordRoots: [261.63, 349.23, 220.00, 246.94], // C, F, Am, Bm
      karaokeLyrics: [
        { id: 1, timeSec: 0, text: 'You may say I\'m a ______ (sonhador),', translation: 'Você pode dizer que eu sou um sonhador,', isBlank: true },
        { id: 2, timeSec: 4, text: 'But I\'m not the only one,', translation: 'Mas eu não sou o único,' },
        { id: 3, timeSec: 8, text: 'I hope someday you will join us,', translation: 'Espero que algum dia você se junte a nós,' },
        { id: 4, timeSec: 11, text: 'And the world will be as one!', translation: 'E o mundo será como um só!' }
      ],
      challengeWord: 'dreamer',
      challengeOptions: ['dreamer', 'fighter'],
      culturalFact: 'Escrita em 1971, Imagine se tornou o hino oficial de paz entoado em aberturas dos Jogos Olímpicos.'
    }
  },
  {
    id: 6,
    title: 'O Trono da Vitória & Fé',
    theme: 'Rock Épico & Hino de Arena',
    category: 'Perseverança & Triunfo',
    durationMinutes: 5,
    vocabularies: [
      {
        id: 'v6-1',
        word: 'Believe',
        translation: 'Acreditar / Ter Fé',
        phonetic: 'bi-líiv',
        emoji: '🔥',
        anchorDescription: 'Chama de determinação e fé interior',
        contextSentence: 'Always believe in your heart.',
        contextTranslation: 'Sempre acredite no seu coração.'
      },
      {
        id: 'v6-2',
        word: 'Holding',
        translation: 'Segurando / Mantendo firme',
        phonetic: 'rôul-ding',
        emoji: '✊',
        anchorDescription: 'Mão firme segurando um ideal ou amizade',
        contextSentence: 'Hold onto that feeling.',
        contextTranslation: 'Segure firme esse sentimento.'
      },
      {
        id: 'v6-3',
        word: 'Champion',
        translation: 'Campeão / Vencedor',
        phonetic: 'tchémp-i-on',
        emoji: '👑',
        anchorDescription: 'Coroa dourada do vencedor da jornada',
        contextSentence: 'You are the music champion!',
        contextTranslation: 'Você é o campeão da música!'
      }
    ],
    fixationQuiz: [
      {
        id: 'q6-1',
        type: 'visual_meaning',
        instruction: 'Qual palavra significa "Acreditar"?',
        targetWordId: 'v6-1',
        options: [
          { text: 'Believe', emoji: '🔥', isCorrect: true, feedbackNote: 'Perfeito! Believe = Acreditar.' },
          { text: 'Belong', emoji: '🏠', isCorrect: false, feedbackNote: 'Belong significa pertencer.' }
        ]
      },
      {
        id: 'q6-2',
        type: 'audio_match',
        instruction: 'Escute a voz do mentor e selecione a tradução:',
        targetWordId: 'v6-2', // "Holding"
        options: [
          { text: 'Holding (Segurando firme)', emoji: '✊', isCorrect: true, feedbackNote: 'Isso! Hold on = Aguente firme.' },
          { text: 'Hiding (Escondendo)', emoji: '🙈', isCorrect: false, feedbackNote: 'Hiding é escondendo!' }
        ]
      },
      {
        id: 'q6-3',
        type: 'context_fill',
        instruction: 'Qual título o herói recebe ao vencer o Reino do Pop?',
        targetWordId: 'v6-3',
        options: [
          { text: 'Champion', emoji: '👑', isCorrect: true, feedbackNote: 'Parabéns, grande Campeão!' },
          { text: 'Coward', emoji: '😨', isCorrect: false, feedbackNote: 'Coward significa covarde.' }
        ]
      }
    ],
    musicStage: {
      songTitle: 'Don\'t Stop Believin\'',
      artist: 'Journey',
      genre: 'Classic Arena Rock',
      tempoBpm: 119,
      coverBg: 'from-amber-600/30 to-rose-800/20',
      melodyNotes: [523.25, 587.33, 659.25, 783.99, 880.00],
      chordRoots: [329.63, 246.94, 220.00, 261.63], // E, B, C#m, A
      karaokeLyrics: [
        { id: 1, timeSec: 0, text: 'Don\'t stop ______ (acreditar),', translation: 'Não pare de acreditar,', isBlank: true },
        { id: 2, timeSec: 3, text: 'Hold on to that feeling,', translation: 'Segure firme nesse sentimento,' },
        { id: 3, timeSec: 6, text: 'Streetlight, people living just to find emotion,', translation: 'Luzes da rua, pessoas vivendo para encontrar emoção,' },
        { id: 4, timeSec: 9, text: 'Don\'t stop believin\'!', translation: 'Não pare de acreditar!' }
      ],
      challengeWord: 'believin\'',
      challengeOptions: ['believin\'', 'sleeping'],
      culturalFact: 'O maior hino de celebração do rock, usado em incontáveis finais de campeonatos esportivos e séries.'
    }
  }
];
