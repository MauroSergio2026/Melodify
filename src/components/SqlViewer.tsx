import React, { useState, useMemo } from 'react';
import { Copy, Check, Search, Download, Terminal, Layers, FileCode } from 'lucide-react';
import { VERTICE_SQL_FULL, SQL_SECTIONS, SqlSection } from '../data/verticeSql';

export const SqlViewer: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'Script Completo' },
    { id: 'enums', label: 'ENUMs & Tipos' },
    { id: 'tables', label: 'Tabelas DDL' },
    { id: 'indexes', label: 'Índices' },
    { id: 'functions', label: 'Funções RLS' },
    { id: 'triggers', label: 'Triggers' },
    { id: 'rls_policies', label: 'Políticas RLS' }
  ];

  const filteredSections = useMemo(() => {
    return SQL_SECTIONS.filter((sec) => {
      const matchCategory = selectedCategory === 'all' || sec.category === selectedCategory;
      const matchSearch =
        searchQuery === '' ||
        sec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sec.sql.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sec.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleCopySection = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadFull = () => {
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

  return (
    <div className="space-y-6">
      {/* Editorial Hero Kicker */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono uppercase text-emerald-400 tracking-wider mb-1">
              Plataforma VÉRTICE · Etapa 1 de Implementação
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Script DDL PostgreSQL / Supabase
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              Script SQL completo pronto para execução direta no Supabase SQL Editor ou PostgreSQL 15+.
              Contém isolamento multi-tenant estrito, 4 níveis de privilégio (RBAC), índices B-Tree de alta performance e gatilhos automatizados.
            </p>
          </div>

          <button
            onClick={handleDownloadFull}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-lg shrink-0 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Baixar vertice_schema_etapa1.sql</span>
          </button>
        </div>

        {/* Clean Unboxed Metadata Specs */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-mono">
          <span className="text-slate-200">Dialeto: PostgreSQL 15+ / Supabase</span>
          <span aria-hidden="true">·</span>
          <span>8 Tabelas Principais</span>
          <span aria-hidden="true">·</span>
          <span>8 ENUMs Tipados</span>
          <span aria-hidden="true">·</span>
          <span>24 Índices de Otimização</span>
          <span aria-hidden="true">·</span>
          <span>4 Níveis de Acesso</span>
          <span aria-hidden="true">·</span>
          <span className="text-emerald-400 font-semibold">100% RLS Ativo</span>
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto py-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar tabela, coluna, função..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Code Display Sections */}
      <div className="space-y-6">
        {filteredSections.length === 0 ? (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-400 text-sm">
            Nenhuma seção encontrada para a busca "{searchQuery}".
          </div>
        ) : (
          filteredSections.map((section: SqlSection) => (
            <div
              key={section.id}
              className="bg-slate-950 border border-slate-800/90 rounded-xl overflow-hidden shadow-md"
            >
              {/* Section Header */}
              <div className="bg-slate-900/90 px-5 py-3.5 border-b border-slate-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <FileCode className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <h2 className="text-sm font-semibold text-white tracking-tight">
                      {section.title}
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {section.description}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleCopySection(section.id, section.sql)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-800 border border-slate-700/80 rounded-md hover:bg-slate-700 hover:text-white transition-colors shrink-0"
                >
                  {copiedId === section.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copiar Bloco</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code Body with Line Numbers */}
              <div className="p-4 overflow-x-auto max-h-[480px] bg-slate-950 font-mono text-xs leading-relaxed text-slate-300">
                <pre className="flex">
                  <span className="select-none text-slate-600 text-right pr-4 border-r border-slate-800/60 tabular-nums">
                    {section.sql
                      .split('\n')
                      .map((_, i) => `${i + 1}`)
                      .join('\n')}
                  </span>
                  <code className="pl-4 text-emerald-300/90 whitespace-pre">
                    {section.sql}
                  </code>
                </pre>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
