import React from 'react';
import { Terminal, Shield, CheckCircle2, AlertTriangle, Key, ExternalLink } from 'lucide-react';

export const SupabaseGuide: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Editorial Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="text-xs font-mono uppercase text-emerald-400 tracking-wider mb-1">
          Guia de Implantação · Supabase / PostgreSQL
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Como Aplicar e Testar o Script na Plataforma VÉRTICE
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
          Instruções passo a passo para executar o script no Supabase SQL Editor, validar a sincronização entre
          o Supabase Auth e a tabela de perfis, e simular os 4 níveis de acesso com segurança.
        </p>
      </div>

      {/* Step by Step Execution */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-bold flex items-center justify-center text-xs mb-3">
              01
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Executar no Supabase SQL Editor
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Abra seu projeto no Supabase, acesse o <strong>SQL Editor</strong>, crie uma nova query, cole o conteúdo de <code className="text-emerald-400 font-mono">vertice_schema_etapa1.sql</code> e clique em <strong>Run</strong>.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 font-mono">
            Tempo estimado: &lt; 3 segundos
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-bold flex items-center justify-center text-xs mb-3">
              02
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Sincronização com auth.users
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              O trigger <code className="text-emerald-400 font-mono">on_auth_user_created</code> escuta novos cadastros no Supabase Auth e injeta automaticamente os metadados (<code className="text-emerald-400 font-mono">tenant_id</code> e <code className="text-emerald-400 font-mono">nivel_acesso</code>) em <code className="text-emerald-400 font-mono">public.perfis</code>.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 font-mono">
            Zero latência na criação do perfil
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-bold flex items-center justify-center text-xs mb-3">
              03
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Validação das Políticas RLS
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Todas as 8 tabelas possuem <code className="text-emerald-400 font-mono">ROW LEVEL SECURITY</code> ativado. Qualquer requisição via Supabase Client (<code className="text-emerald-400 font-mono">supabase-js</code>) executará estritamente sob as regras dos 4 níveis de acesso.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 font-mono">
            Proteção multi-tenant garantida
          </div>
        </div>
      </div>

      {/* Code Snippet: How to test RLS in Supabase SQL Editor */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="bg-slate-900 px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-white">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>Snippet SQL: Como Testar a RLS Simulando um Operador no Supabase</span>
          </div>
        </div>

        <div className="p-4 bg-slate-950 font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto">
          <pre>
            <code className="text-emerald-300/90 whitespace-pre">{`-- 1. Criar um usuário de teste e atribuir perfil de Operador
-- No Supabase Auth, o UUID é gerado na autenticação.
-- Você pode simular o token JWT e auth.uid() no SQL Editor executando:

BEGIN;

-- Simula a identidade de Lucas (Operador)
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" = '3b98e21a-4f51-40b9-8e21-9988221100aa';

-- Tentativa 1: O operador tenta ler tarefas da sua organização
-- RESULTADO: Retorna apenas tarefas com atribuido_para = auth.uid()
SELECT id, titulo, status, atribuido_para 
FROM public.tarefas;

-- Tentativa 2: O operador tenta deletar um projeto
-- RESULTADO: Bloqueado pelo RLS (DELETE 0)
DELETE FROM public.projetos WHERE id = 'c0000000-0000-0000-0000-000000000001';

-- Tentativa 3: O operador registra apontamento de horas na sua tarefa
-- RESULTADO: Autorizado com status pendente
INSERT INTO public.apontamentos_horas (
    tenant_id,
    tarefa_id,
    usuario_id,
    data_trabalho,
    horas_lancadas,
    descricao_atividades
) VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    '3b98e21a-4f51-40b9-8e21-9988221100aa',
    CURRENT_DATE,
    4.5,
    'Levantamento de requisitos de segurança de banco de dados'
);

ROLLBACK;`}</code>
          </pre>
        </div>
      </div>

      {/* Enterprise Best Practices */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>Boas Práticas de Segurança Multi-Tenant Adotadas na Etapa 1</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800/80">
            <h4 className="font-bold text-white mb-1">1. Isolamento por Tenant ID Hermético</h4>
            <p className="text-slate-400 leading-relaxed">
              Todas as entidades vinculadas a uma empresa possuem a coluna <code className="text-emerald-400 font-mono">tenant_id</code> com chave estrangeira indexada.
              As políticas de RLS nunca confiam em parâmetros enviados pelo frontend; o tenant é sempre resolvido em servidor pela função <code className="text-emerald-400 font-mono">public.fn_get_auth_tenant_id()</code>.
            </p>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800/80">
            <h4 className="font-bold text-white mb-1">2. Funções SECURITY DEFINER com STABLE</h4>
            <p className="text-slate-400 leading-relaxed">
              As funções de autorização (<code className="text-emerald-400 font-mono">fn_is_superadmin</code>, <code className="text-emerald-400 font-mono">fn_is_admin_or_higher</code>, <code className="text-emerald-400 font-mono">fn_is_gestor_or_higher</code>) são marcadas como <code className="text-emerald-400 font-mono">STABLE</code>, permitindo que o otimizador do Postgres faça cache do resultado durante toda a transação, mantendo latência próxima de zero.
            </p>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800/80">
            <h4 className="font-bold text-white mb-1">3. Imutabilidade na Auditoria (LGPD)</h4>
            <p className="text-slate-400 leading-relaxed">
              A tabela <code className="text-emerald-400 font-mono">logs_auditoria</code> não possui políticas de UPDATE ou DELETE concedidas a nenhum usuário comum, garantindo não-repúdio e conformidade integral com auditorias de segurança e normas da LGPD.
            </p>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800/80">
            <h4 className="font-bold text-white mb-1">4. Proteção contra Escalada de Privilégios</h4>
            <p className="text-slate-400 leading-relaxed">
              A política <code className="text-emerald-400 font-mono">perfis_admin_insert</code> e <code className="text-emerald-400 font-mono">perfis_admin_update</code> impede explicitamente que administradores de um tenant atribuam a si ou a terceiros a role <code className="text-emerald-400 font-mono">'superadmin'</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
