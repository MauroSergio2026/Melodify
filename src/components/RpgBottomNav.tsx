import React from 'react';
import { Map, Swords, Scroll, Shield, BookOpen, CheckSquare } from 'lucide-react';
import { playTapSound } from '../utils/audio';

export type RpgNavTab = 'map' | 'battle' | 'quests' | 'abc' | 'grimoire' | 'hero';

interface RpgBottomNavProps {
  activeTab: RpgNavTab;
  onSelectTab: (tab: RpgNavTab) => void;
  pendingQuestsCount?: number;
}

export const RpgBottomNav: React.FC<RpgBottomNavProps> = ({
  activeTab,
  onSelectTab,
  pendingQuestsCount = 0
}) => {
  const tabs = [
    { id: 'map', label: 'Mapa', icon: <Map className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { id: 'battle', label: 'Batalha', icon: <Swords className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { id: 'quests', label: 'Missões', icon: <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5" />, hasBadge: pendingQuestsCount > 0 },
    { id: 'abc', label: 'ABC', icon: <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { id: 'grimoire', label: 'Treino', icon: <Scroll className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { id: 'hero', label: 'Herói', icon: <Shield className="w-4 h-4 sm:w-5 sm:h-5" /> }
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t-2 border-amber-600/50 shadow-2xl">
      <div className="max-w-xl mx-auto grid grid-cols-6 items-center h-16 px-1.5 gap-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                playTapSound();
                onSelectTab(tab.id);
              }}
              className={`relative flex flex-col items-center justify-center min-h-[44px] rounded-2xl transition-all border-b-2 transform active:scale-95 ${
                isActive
                  ? 'bg-gradient-to-b from-amber-400 to-amber-600 text-slate-950 font-black border-amber-200 border-b-amber-800 shadow-md shadow-amber-500/30 rpg-glow-pulse'
                  : 'text-amber-100/70 hover:text-white border-transparent hover:bg-slate-900/60'
              }`}
            >
              {tab.icon}
              <span className="text-[9px] sm:text-[10px] tracking-tight mt-0.5 font-bold">
                {tab.label}
              </span>

              {/* Notification Badge on Missões if claimable */}
              {'hasBadge' in tab && tab.hasBadge && (
                <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-rose-500 animate-ping ring-2 ring-amber-400" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
