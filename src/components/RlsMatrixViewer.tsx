import React, { useState } from 'react';
import { ShieldCheck, Lock, UserCheck, Briefcase, Wrench, Crown, Eye, Plus, Edit3, Trash2 } from 'lucide-react';
import { ACCESS_ROLES, RLS_PERMISSION_MATRIX, AccessLevel } from '../data/rlsMatrix';

export const RlsMatrixViewer: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<AccessLevel>('operador');
  const [activeFilterTable, setActiveFilterTable] = useState<string>('all');

  const currentRoleInfo = ACCESS_ROLES.find((r) => r.id === selectedRole) || ACCESS_ROLES[0];

  const getRoleIcon = (id: AccessLevel) => {
    switch (id) {
      case 'superadmin':
        return <Crown className="w-4 h-4 text-amber-400" />;
      case 'admin':
        return <Briefcase className="w-4 h-4 text-blue-400" />;
      case 'gestor':
        return <UserCheck className="w-4 h-4 text-emerald-400" />;
      case 'operador':
        return <Wrench className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="text-xs font-mono uppercase text-emerald-400 tracking-wider mb-1">
          Hierarquia de Permissões · Row Level Security (RLS)
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Políticas de Segurança para os 4 Níveis de Acesso
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
          A plataforma VÉRTICE utiliza políticas de Row Level Security (RLS) nativas do PostgreSQL combinadas com
          funções <code className="text-emerald-400 font-mono">SECURITY DEFINER</code>. Todas as queries de clientes web passam obrigatoriamente
          pela filtragem de autorização em nível de linha, impedindo vazamento de dados entre empresas.
        </p>

        {/* 4 Role Selector Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
          {ACCESS_ROLES.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={`p-4 rounded-lg text-left transition-all border ${
                selectedRole === role.id
                  ? 'bg-slate-800/90 border-emerald-500/60 shadow-md ring-1 ring-emerald-500/30'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getRoleIcon(role.id)}
                  <span className="text-xs font-mono font-semibold text-white">
                    Nível {role.nivel}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400 uppercase">
                  {role.id}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-100 tracking-tight">
                {role.label.split(':')[1]?.trim() || role.label}
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                {role.tagline}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Role Deep-Dive Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
              {getRoleIcon(currentRoleInfo.id)}
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                <span>Nível {currentRoleInfo.nivel} de Privilégio</span>
                <span aria-hidden="true">·</span>
                <span>ENUM: '{currentRoleInfo.id}'</span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">
                {currentRoleInfo.label}
              </h2>
              <p className="text-sm text-slate-300 mt-1 max-w-2xl">
                {currentRoleInfo.description}
              </p>
            </div>
          </div>

          {/* Persona Demonstration */}
          <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-3 shrink-0 min-w-[260px]">
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5">
              Persona de Teste no Supabase
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-emerald-400 text-xs">
                {currentRoleInfo.mockUser.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <div>
                <div className="text-xs font-semibold text-white">
                  {currentRoleInfo.mockUser.name}
                </div>
                <div className="text-[11px] text-slate-400">
                  {currentRoleInfo.mockUser.email}
                </div>
                <div className="text-[10px] text-emerald-400/80 font-mono mt-0.5">
                  {currentRoleInfo.mockUser.company}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Capabilities vs Restrictions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4" />
              <span>Capacidades Concedidas pela RLS</span>
            </h4>
            <ul className="space-y-2">
              {currentRoleInfo.keyCapabilities.map((cap, i) => (
                <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                  <span>{cap}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-amber-400 flex items-center gap-2 mb-3">
              <Lock className="w-4 h-4" />
              <span>Bloqueios & Restrições de RLS</span>
            </h4>
            <ul className="space-y-2">
              {currentRoleInfo.keyRestrictions.map((rest, i) => (
                <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="text-amber-400 font-bold mt-0.5">✕</span>
                  <span>{rest}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Permissions Matrix by Table for Current Role */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Matriz de Acesso por Tabela ({currentRoleInfo.label.split(':')[1]?.trim()})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Status das 4 operações CRUD para o perfil selecionado.
            </p>
          </div>

          {/* Table quick filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Filtrar:</span>
            <select
              value={activeFilterTable}
              onChange={(e) => setActiveFilterTable(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Todas as Tabelas</option>
              {RLS_PERMISSION_MATRIX.map((m) => (
                <option key={m.tableName} value={m.tableName}>
                  {m.tableLabel}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-5 font-semibold">Tabela</th>
                <th className="py-3 px-4 font-semibold text-center">SELECT (Ler)</th>
                <th className="py-3 px-4 font-semibold text-center">INSERT (Criar)</th>
                <th className="py-3 px-4 font-semibold text-center">UPDATE (Editar)</th>
                <th className="py-3 px-4 font-semibold text-center">DELETE (Excluir)</th>
                <th className="py-3 px-5 font-semibold">Cláusula SQL / Regra de Negócio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {RLS_PERMISSION_MATRIX.filter(
                (m) => activeFilterTable === 'all' || m.tableName === activeFilterTable
              ).map((row) => {
                const s = row.select[selectedRole];
                const i = row.insert[selectedRole];
                const u = row.update[selectedRole];
                const d = row.delete[selectedRole];

                return (
                  <tr key={row.tableName} className="hover:bg-slate-850/40 transition-colors">
                    <td className="py-3.5 px-5 font-mono text-white font-medium">
                      <div>{row.tableName}</div>
                      <div className="text-[11px] text-slate-400 font-sans">{row.tableLabel}</div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded ${
                          s.allowed
                            ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800/60'
                            : 'text-rose-400 bg-rose-950/60 border border-rose-800/60'
                        }`}
                      >
                        {s.allowed ? 'PERMITIDO' : 'NEGADO'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded ${
                          i.allowed
                            ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800/60'
                            : 'text-rose-400 bg-rose-950/60 border border-rose-800/60'
                        }`}
                      >
                        {i.allowed ? 'PERMITIDO' : 'NEGADO'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded ${
                          u.allowed
                            ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800/60'
                            : 'text-rose-400 bg-rose-950/60 border border-rose-800/60'
                        }`}
                      >
                        {u.allowed ? 'PERMITIDO' : 'NEGADO'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded ${
                          d.allowed
                            ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800/60'
                            : 'text-rose-400 bg-rose-950/60 border border-rose-800/60'
                        }`}
                      >
                        {d.allowed ? 'PERMITIDO' : 'NEGADO'}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 font-mono text-[11px] text-slate-300">
                      <div className="text-emerald-400/90 truncate max-w-xs" title={s.condition}>
                        {s.condition}
                      </div>
                      <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                        {s.notes}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
