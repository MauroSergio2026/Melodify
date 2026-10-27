import React, { useState } from 'react';
import { Play, ShieldAlert, CheckCircle2, XCircle, ArrowRight, CornerDownRight, Database, User, Terminal } from 'lucide-react';
import { ACCESS_ROLES, SIMULATION_SCENARIOS, SimulationScenario, AccessLevel } from '../data/rlsMatrix';

export const RlsSimulator: React.FC = () => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(SIMULATION_SCENARIOS[0].id);
  const [simulatedExecution, setSimulatedExecution] = useState<boolean>(true);
  const [activePersona, setActivePersona] = useState<AccessLevel>(SIMULATION_SCENARIOS[0].userRole);

  const currentScenario = SIMULATION_SCENARIOS.find((s) => s.id === selectedScenarioId) || SIMULATION_SCENARIOS[0];
  const activeRoleData = ACCESS_ROLES.find((r) => r.id === activePersona) || ACCESS_ROLES[0];

  const handleSelectScenario = (sc: SimulationScenario) => {
    setSelectedScenarioId(sc.id);
    setActivePersona(sc.userRole);
    setSimulatedExecution(true);
  };

  return (
    <div className="space-y-6">
      {/* Editorial Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="text-xs font-mono uppercase text-emerald-400 tracking-wider mb-1">
          Ambiente de Testes Interativo · PostgreSQL Engine
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Simulador de Políticas RLS em Tempo Real
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
          Teste o comportamento do motor de segurança do PostgreSQL sob os 4 níveis de privilégio da plataforma VÉRTICE.
          Selecione um cenário empresarial real para verificar a resolução dinâmica das funções <code className="text-emerald-400 font-mono">auth.uid()</code> e <code className="text-emerald-400 font-mono">tenant_id</code>.
        </p>
      </div>

      {/* Main Grid: Scenarios List (Left) + Execution Terminal (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Scenarios Selector */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-400 px-1">
            Cenários de Teste Disponíveis
          </div>

          <div className="space-y-2.5">
            {SIMULATION_SCENARIOS.map((sc) => {
              const isSelected = selectedScenarioId === sc.id;
              const role = ACCESS_ROLES.find((r) => r.id === sc.userRole);

              return (
                <button
                  key={sc.id}
                  onClick={() => handleSelectScenario(sc)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-slate-850 border-emerald-500/70 shadow-md ring-1 ring-emerald-500/30'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[11px] font-mono text-emerald-400 uppercase">
                      {sc.operation} · {sc.table}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        sc.expectedResult === 'allowed'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                          : 'bg-rose-950 text-rose-400 border border-rose-800/60'
                      }`}
                    >
                      {sc.expectedResult === 'allowed' ? 'PERMITIDO' : 'BLOQUEADO'}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white tracking-tight">
                    {sc.title}
                  </h4>

                  <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400 font-sans">
                    <span className="font-medium text-slate-300">
                      Nível {role?.nivel}: {role?.label.split(':')[1]?.trim()}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Simulation Inspection Console */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            {/* Terminal Top Bar */}
            <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>Simulador de Execução PostgreSQL</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
              </div>
            </div>

            {/* Terminal Body */}
            <div className="p-5 space-y-5 font-mono text-xs">
              {/* Context Token Simulated */}
              <div>
                <div className="text-[11px] text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Sessão Supabase Auth Ativa</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-slate-300 space-y-1">
                  <div>
                    <span className="text-slate-500">auth.uid() = </span>
                    <span className="text-emerald-300 font-bold">
                      {activeRoleData.id === 'superadmin' ? '00000000-0000-0000-0000-000000000001' : '3b98e21a-4f51-40b9-8e21-9988221100aa'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">jwt.claims.email = </span>
                    <span className="text-slate-200">"{activeRoleData.mockUser.email}"</span>
                  </div>
                  <div>
                    <span className="text-slate-500">fn_get_auth_nivel_acesso() = </span>
                    <span className="text-amber-400 font-bold">'{activeRoleData.id}'</span>
                  </div>
                  <div>
                    <span className="text-slate-500">fn_get_auth_tenant_id() = </span>
                    <span className="text-blue-300">
                      {activeRoleData.id === 'superadmin' ? 'NULL (Acesso Cross-Tenant)' : 'a0000000-0000-0000-0000-000000000001 (Vértice Tech)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Target SQL Query */}
              <div>
                <div className="text-[11px] text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-slate-400" />
                  <span>Consulta SQL Submetida pelo Cliente</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-emerald-300 font-semibold">
                  {currentScenario.targetDescription}
                </div>
              </div>

              {/* RLS Policy Evaluated */}
              <div>
                <div className="text-[11px] text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <CornerDownRight className="w-3.5 h-3.5 text-slate-400" />
                  <span>Política RLS Avaliada pelo PostgreSQL</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 space-y-1.5">
                  <div className="text-slate-300">
                    <span className="text-slate-500">Política: </span>
                    <span className="text-white font-bold">{currentScenario.policyEvaluated}</span>
                  </div>
                  <div className="text-slate-400 text-[11px] leading-relaxed">
                    <span className="text-slate-500">Cláusula: </span>
                    <span className="text-emerald-400">{currentScenario.sqlClause}</span>
                  </div>
                </div>
              </div>

              {/* Result Badge & Explanation */}
              <div
                className={`p-4 rounded-xl border ${
                  currentScenario.expectedResult === 'allowed'
                    ? 'bg-emerald-950/40 border-emerald-700/60'
                    : 'bg-rose-950/40 border-rose-700/60'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {currentScenario.expectedResult === 'allowed' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  )}
                  <span
                    className={`font-bold tracking-tight text-sm font-sans ${
                      currentScenario.expectedResult === 'allowed'
                        ? 'text-emerald-300'
                        : 'text-rose-300'
                    }`}
                  >
                    {currentScenario.expectedResult === 'allowed'
                      ? 'EXECUÇÃO AUTORIZADA PELA POLÍTICA RLS'
                      : 'EXECUÇÃO BLOQUEADA PELO MOTOR POSTGRESQL'}
                  </span>
                </div>

                <p className="text-xs font-sans text-slate-300 leading-relaxed">
                  {currentScenario.explanation}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
