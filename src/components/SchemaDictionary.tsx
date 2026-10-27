import React, { useState } from 'react';
import { Database, Key, Link2, Search, Table, ShieldAlert } from 'lucide-react';
import { VERTICE_TABLES, TableDefinition, ColumnDefinition } from '../data/schemaData';

export const SchemaDictionary: React.FC = () => {
  const [selectedTable, setSelectedTable] = useState<string>(VERTICE_TABLES[0].name);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'Todas as Tabelas' },
    { id: 'core', label: 'Núcleo Multi-Tenant' },
    { id: 'organizational', label: 'Estrutura & Clientes' },
    { id: 'operations', label: 'Operações & Projetos' },
    { id: 'compliance', label: 'Auditoria & LGPD' }
  ];

  const currentTable = VERTICE_TABLES.find((t) => t.name === selectedTable) || VERTICE_TABLES[0];

  const filteredColumns = currentTable.columns.filter((c) => {
    return (
      searchQuery === '' ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Editorial Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="text-xs font-mono uppercase text-emerald-400 tracking-wider mb-1">
          Dicionário de Dados & Arquitetura Relacional
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Esquema de Tabelas e Chaves Estrangeiras
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
          Especificação formal das 8 tabelas essenciais da plataforma VÉRTICE. Cada tabela conta com identificadores universais UUIDv4,
          rastreabilidade por tenant_id, integridade referencial com <code className="text-emerald-400 font-mono">ON DELETE CASCADE</code> onde cabível e tipagem forte.
        </p>

        {/* Clean Metadata Summary */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-mono">
          <span className="text-slate-200">8 Entidades Relacionais</span>
          <span aria-hidden="true">·</span>
          <span>100% com UUIDv4</span>
          <span aria-hidden="true">·</span>
          <span>Integridade de Chaves Estrangeiras</span>
          <span aria-hidden="true">·</span>
          <span className="text-emerald-400">Trilha de Auditoria com JSONB</span>
        </div>
      </div>

      {/* Table Selector Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {VERTICE_TABLES.map((table) => {
          const isSelected = selectedTable === table.name;
          return (
            <button
              key={table.name}
              onClick={() => setSelectedTable(table.name)}
              className={`p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-emerald-500/10 border-emerald-500/70 text-white shadow-sm ring-1 ring-emerald-500/20'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <Table className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span className="text-[10px] font-mono text-slate-400">
                  {table.columns.length} cols
                </span>
              </div>
              <div className="font-mono text-xs font-bold truncate">
                {table.name}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Table Deep-Dive */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {/* Table Title Bar */}
        <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold font-mono text-white tracking-tight">
                public.{currentTable.name}
              </span>
              <span className="text-xs text-slate-400 font-sans">
                ({currentTable.label})
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              {currentTable.description}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filtrar colunas..."
                className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Columns Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-5 font-semibold">Coluna</th>
                <th className="py-3 px-4 font-semibold">Tipo de Dado</th>
                <th className="py-3 px-3 font-semibold text-center">Chaves</th>
                <th className="py-3 px-3 font-semibold text-center">Nulo?</th>
                <th className="py-3 px-4 font-semibold">Valor Padrão</th>
                <th className="py-3 px-5 font-semibold">Descrição / Função no Sistema</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300 font-sans">
              {filteredColumns.map((col: ColumnDefinition) => (
                <tr key={col.name} className="hover:bg-slate-850/40 transition-colors">
                  <td className="py-3 px-5 font-mono text-white font-medium">
                    {col.name}
                  </td>

                  <td className="py-3 px-4 font-mono text-emerald-400 text-[11px]">
                    {col.type}
                  </td>

                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {col.isPk && (
                        <span
                          title="Chave Primária (PK)"
                          className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold"
                        >
                          PK
                        </span>
                      )}
                      {col.isFk && (
                        <span
                          title={`Chave Estrangeira (FK): ${col.fkTarget}`}
                          className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        >
                          FK
                        </span>
                      )}
                      {!col.isPk && !col.isFk && (
                        <span className="text-slate-600">-</span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-3 text-center font-mono text-[11px]">
                    {col.isNullable ? (
                      <span className="text-slate-400">SIM</span>
                    ) : (
                      <span className="text-amber-400 font-semibold">NÃO</span>
                    )}
                  </td>

                  <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                    {col.defaultValue || <span className="text-slate-600">-</span>}
                  </td>

                  <td className="py-3 px-5 text-slate-300 text-xs">
                    <div>{col.description}</div>
                    {col.fkTarget && (
                      <div className="flex items-center gap-1 text-[11px] text-blue-400 font-mono mt-0.5">
                        <Link2 className="w-3 h-3" />
                        <span>Referência: {col.fkTarget}</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Indexes Box */}
        <div className="bg-slate-950 p-5 border-t border-slate-800">
          <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
            Índices Criados para public.{currentTable.name}
          </h4>
          <div className="flex flex-wrap gap-2">
            {currentTable.indexes.map((idx, index) => (
              <span
                key={index}
                className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-emerald-300"
              >
                {idx}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
