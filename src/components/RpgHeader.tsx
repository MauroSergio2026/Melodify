import React from 'react';
import { Sparkles, Star, Coins, Shield, Swords, Zap, Search, BookOpen } from 'lucide-react';
import { playTapSound } from '../utils/audio';

interface RpgHeaderProps {
  playerLevel: number;
  playerXp: number;
  playerGold: number;
  hpPotions: number;
  manaPotions: number;
  onOpenProfile: () => void;
  onOpenDictionary: () => void;
  activeView: string;
  onSwitchView: (view: string) => void;
}

export const RpgHeader: React.FC<RpgHeaderProps> = ({
  playerLevel,
  playerXp,
  playerGold,
  hpPotions,
  manaPotions,
  onOpenProfile,
  onOpenDictionary,
  activeView,
  onSwitchView
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b-2 border-amber-600/40 shadow-lg">
      <div className="max-w-4xl mx-auto px-4 py-2.5">
        <div className="flex items-center justify-between gap-3">
          {/* Hero Avatar & Level in Golden Frame */}
          <button
            onClick={() => {
              playTapSound();
              onOpenProfile();
            }}
            className="flex items-center gap-3 group text-left transition-transform active:scale-95"
            title="Ver Perfil do Herói"
          >
            {/* Golden Embossed Avatar Frame */}
            <div className="relative">
              <div className="w-13 h-13 rounded-2xl p-0.5 bg-gradient-to-b from-amber-300 via-amber-500 to-amber-700 shadow-md shadow-amber-950/60 ring-2 ring-amber-400/50">
                <div className="w-12 h-12 rounded-[14px] overflow-hidden bg-slate-900 border border-amber-300/60">
                  <img
                    src="/src/assets/images/anime_hero_avatar_1793103878768.jpg"
                    alt="Bardo Guerreiro"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
              {/* Level Badge in Golden Star */}
              <div className="absolute -bottom-1 -right-1.5 bg-gradient-to-b from-amber-400 to-amber-600 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-full border border-amber-200 shadow-sm font-mono">
                Lv.{playerLevel}
              </div>
            </div>

            {/* Hero Stats */}
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-amber-300 tracking-tight">
                  Bardo Guerreiro
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Herói
                </span>
              </div>

              {/* XP Bar */}
              <div className="w-28 bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-700 mt-1">
                <div
                  className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full rounded-full transition-all duration-300"
                  style={{ width: `${(playerXp % 100)}%` }}
                />
              </div>
              <div className="text-[9px] font-mono text-slate-400 mt-0.5">
                XP: {playerXp % 100} / 100
              </div>
            </div>
          </button>

          {/* Quick Word Search Button (Dicionário do Herói) */}
          <button
            onClick={() => {
              playTapSound();
              onOpenDictionary();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/30 border border-amber-400/50 hover:border-amber-300 text-amber-200 hover:text-white text-xs font-bold transition-all active:scale-95 shadow-sm"
            title="Pesquisar qualquer palavra em inglês"
          >
            <Search className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden xs:inline">Dicionário</span>
            <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1 rounded border border-amber-400/30">
              Buscar
            </span>
          </button>

          {/* RPG Resources: Red HP Potions, Green/Blue Mana Potions, Gold Coins */}
          <div className="flex items-center gap-1.5 sm:gap-2 font-mono text-xs">
            {/* Red HP Potion */}
            <div
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-xl bg-slate-900/90 border border-rose-500/40 shadow-sm text-rose-300"
              title="Poção de Vida (HP)"
            >
              <span className="text-sm">🧪</span>
              <span className="font-extrabold text-[11px] text-rose-400">{hpPotions}</span>
              <span className="text-[9px] text-rose-400/80 hidden md:inline">HP</span>
            </div>

            {/* Blue/Green Mana Potion */}
            <div
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-xl bg-slate-900/90 border border-sky-500/40 shadow-sm text-sky-300"
              title="Poção de Mana / Foco"
            >
              <span className="text-sm">🔮</span>
              <span className="font-extrabold text-[11px] text-sky-400">{manaPotions}</span>
              <span className="text-[9px] text-sky-400/80 hidden md:inline">MP</span>
            </div>

            {/* Gold Coins */}
            <div
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-xl bg-slate-900/90 border border-amber-500/50 shadow-sm text-amber-300"
              title="Moedas de Ouro do Reino"
            >
              <span className="text-sm">🪙</span>
              <span className="font-extrabold text-[11px] text-amber-300">{playerGold}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
