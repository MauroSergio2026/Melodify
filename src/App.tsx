import React, { useState } from 'react';
import { Header } from './components/Header';
import { MelodifyApp } from './components/MelodifyApp';
import { SqlViewer } from './components/SqlViewer';
import { RlsMatrixViewer } from './components/RlsMatrixViewer';
import { RlsSimulator } from './components/RlsSimulator';
import { SchemaDictionary } from './components/SchemaDictionary';
import { SupabaseGuide } from './components/SupabaseGuide';
import { Swords, Database, ShieldCheck, PlayCircle, Layers, BookOpen } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('melodify');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-emerald-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Bar following contract */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Navigation Quick Bar */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-900/90 border-2 border-amber-500/40 rounded-2xl mb-6 overflow-x-auto shadow-lg backdrop-blur-md">
          <button
            onClick={() => setActiveTab('melodify')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-black rounded-xl whitespace-nowrap transition-all ${
              activeTab === 'melodify'
                ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 shadow-md border border-amber-200 rpg-glow-pulse'
                : 'text-amber-100/70 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Swords className="w-4 h-4" />
            <span>Melodify RPG (Anime Fantasy)</span>
          </button>

          <button
            onClick={() => setActiveTab('sql')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-colors ${
              activeTab === 'sql'
                ? 'bg-slate-800 text-amber-400 font-extrabold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Script SQL Vértice (.sql)</span>
          </button>

          <button
            onClick={() => setActiveTab('rls')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-colors ${
              activeTab === 'rls'
                ? 'bg-slate-800 text-amber-400 font-extrabold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Políticas RLS (4 Níveis)</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-colors ${
              activeTab === 'simulator'
                ? 'bg-slate-800 text-amber-400 font-extrabold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>Simulador RBAC</span>
          </button>

          <button
            onClick={() => setActiveTab('schema')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-colors ${
              activeTab === 'schema'
                ? 'bg-slate-800 text-amber-400 font-extrabold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Dicionário DDL</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-colors ${
              activeTab === 'guide'
                ? 'bg-slate-800 text-amber-400 font-extrabold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Guia Supabase</span>
          </button>
        </div>

        {/* Dynamic Tab Viewport */}
        {activeTab === 'melodify' && <MelodifyApp />}
        {activeTab === 'sql' && <SqlViewer />}
        {activeTab === 'rls' && <RlsMatrixViewer />}
        {activeTab === 'simulator' && <RlsSimulator />}
        {activeTab === 'schema' && <SchemaDictionary />}
        {activeTab === 'guide' && <SupabaseGuide />}
      </main>

      {/* RPG Ambient Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-5 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-amber-400">Melodify RPG</span>
            <span aria-hidden="true">·</span>
            <span>Edição Anime Fantasy: Aprenda Inglês com Canções & Batalhas</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-mono">Web Audio & Native Speech</span>
          </div>
          <div className="text-slate-500 font-mono text-[11px]">
            The Harmony Realm · Vilarejo Star ao Reino do Pop
          </div>
        </div>
      </footer>
    </div>
  );
}
