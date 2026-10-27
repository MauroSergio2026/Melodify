import React from 'react';
import { Music, Download, Check, Copy, Swords, Sparkles } from 'lucide-react';
import { VERTICE_SQL_FULL } from '../data/verticeSql';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopySql = () => {
    navigator.clipboard.writeText(VERTICE_SQL_FULL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSql = () => {
    const blob = new Blob([VERTICE_SQL_FULL], { type: 'text/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'vertice_banco_de_dados_etapa1.sql');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const navLinks = [
    { id: 'melodify', label: '⚔️ Melodify RPG' },
    { id: 'sql', label: '📜 Script SQL Vértice' },
    { id: 'rls', label: '🛡️ Políticas RLS' },
    { id: 'simulator', label: '🧪 Simulador RBAC' },
    { id: 'schema', label: '🧩 Dicionário DDL' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 border-b-2 border-amber-500/50 backdrop-blur-md shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-md border border-amber-200">
              <Swords className="w-5 h-5 text-slate-950" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-white whitespace-nowrap drop-shadow">
                Melodify <span className="text-amber-400 text-xs uppercase font-mono font-bold">RPG</span>
              </span>
              <span className="text-[10px] font-mono text-amber-300/80 -mt-1 tracking-wider uppercase">
                Anime Fantasy Edition
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 overflow-x-auto py-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                  activeTab === link.id
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                    : 'text-amber-100/70 hover:text-white hover:bg-slate-900'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={handleCopySql}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-700 rounded-xl hover:bg-slate-800 hover:text-white transition-colors whitespace-nowrap"
              title="Copiar script SQL para área de transferência"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copiar SQL</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadSql}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-md border border-amber-200 transition-all whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar .SQL</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden items-center gap-1 pb-3 overflow-x-auto border-t border-slate-800/80 pt-2">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => setActiveTab(link.id)}
              className={`px-2.5 py-1 text-xs font-bold rounded-xl whitespace-nowrap ${
                activeTab === link.id
                  ? 'bg-amber-500 text-slate-950 font-black'
                  : 'text-amber-100/70 hover:text-white'
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
