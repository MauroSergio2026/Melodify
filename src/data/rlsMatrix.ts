export type AccessLevel = 'superadmin' | 'admin' | 'gestor' | 'operador';

export interface AccessRoleInfo {
  id: AccessLevel;
  nivel: number;
  label: string;
  tagline: string;
  description: string;
  mockUser: {
    name: string;
    email: string;
    role: string;
    company: string;
    avatar: string;
  };
  keyCapabilities: string[];
  keyRestrictions: string[];
}

export const ACCESS_ROLES: AccessRoleInfo[] = [
  {
    id: 'superadmin',
    nivel: 1,
    label: 'Nível 1: Superadmin',
    tagline: 'Acesso Global & Suporte da Plataforma Vértice',
    description: 'Possui acesso irrestrito e universal a todos os tenants, dados e configurações do ecossistema. Utilizado para suporte técnico N3, faturamento e governança global.',
    mockUser: {
      name: 'Carlos Magno',
      email: 'carlos.super@vertice.io',
      role: 'Superadmin Vértice',
      company: 'Plataforma Vértice Global',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    keyCapabilities: [
      'Visualizar e alterar dados de TODOS os tenants cadastrados',
      'Criar e desativar organizações/tenants',
      'Configurar cotas, planos e upgrades corporativos',
      'Auditar logs de segurança e conformidade LGPD em nível global'
    ],
    keyRestrictions: [
      'Nenhuma restrição de RLS (bypass via fn_is_superadmin())'
    ]
  },
  {
    id: 'admin',
    nivel: 2,
    label: 'Nível 2: Admin do Tenant',
    tagline: 'Diretoria Executiva & Gestão do Tenant',
    description: 'Administrador geral da empresa contratante. Possui controle total sobre todos os colaboradores, departamentos, projetos, clientes e configurações da sua organização.',
    mockUser: {
      name: 'Mariana Drummond',
      email: 'mariana.admin@verticetech.com.br',
      role: 'Diretora de Operações (Admin)',
      company: 'Vértice Engenharia e Tech',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
    },
    keyCapabilities: [
      'Acesso irrestrito a todos os dados do seu próprio tenant_id',
      'Cadastrar, desativar e alterar cargos e perfis de colaboradores',
      'Criar departamentos e alterar configurações do tenant',
      'Visualizar relatórios financeiros, horas gastas e logs do tenant'
    ],
    keyRestrictions: [
      'Isolamento estrito: Zero visibilidade sobre dados de outros tenants',
      'Não pode se autopromover para Superadmin global',
      'Não pode deletar sua própria conta ativa acidentalmente'
    ]
  },
  {
    id: 'gestor',
    nivel: 3,
    label: 'Nível 3: Gestor',
    tagline: 'Gerente de Projetos & Coordenador de Equipe',
    description: 'Responsável pelo planejamento e entrega de projetos e coordenação de setores. Pode delegar tarefas, gerenciar clientes e aprovar apontamentos de horas.',
    mockUser: {
      name: 'Rafael Silveira',
      email: 'rafael.gestor@verticetech.com.br',
      role: 'Gerente de PMO & Projetos',
      company: 'Vértice Engenharia e Tech',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    },
    keyCapabilities: [
      'Criar e gerenciar projetos do seu departamento ou atribuídos',
      'Cadastrar e delegar tarefas operacionais para os operadores',
      'Aprovar ou recusar apontamentos de horas da equipe',
      'Cadastrar e atualizar clientes corporativos no tenant'
    ],
    keyRestrictions: [
      'Não pode alterar configurações corporativas ou planos do tenant',
      'Não pode criar ou alterar perfis de usuários com cargo Admin',
      'Não pode excluir projetos críticos sem aval do Admin'
    ]
  },
  {
    id: 'operador',
    nivel: 4,
    label: 'Nível 4: Operador',
    tagline: 'Executor Operacional / Especialista Técnico',
    description: 'Membro executor de ponta. Acesso estritamente restrito aos projetos e tarefas onde está alocado ou onde é autor, além de lançamento das suas próprias horas.',
    mockUser: {
      name: 'Lucas Nogueira',
      email: 'lucas.operador@verticetech.com.br',
      role: 'Engenheiro de Campo / Executor',
      company: 'Vértice Engenharia e Tech',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
    },
    keyCapabilities: [
      'Visualizar projetos onde possui tarefas atribuídas',
      'Atualizar status e percentual de avanço de suas tarefas',
      'Lançar apontamentos de horas (time tracking) de suas atividades',
      'Visualizar contatos e dados básicos dos colegas de equipe'
    ],
    keyRestrictions: [
      'Não pode visualizar tarefas atribuídas exclusivamente a outros colegas',
      'Não pode alterar apontamentos após aprovação pelo gestor',
      'Não pode criar projetos, departamentos ou novos clientes',
      'Sem acesso aos logs de auditoria LGPD'
    ]
  }
];

export interface TableRlsRule {
  tableName: string;
  tableLabel: string;
  select: Record<AccessLevel, { allowed: boolean; condition: string; notes: string }>;
  insert: Record<AccessLevel, { allowed: boolean; condition: string; notes: string }>;
  update: Record<AccessLevel, { allowed: boolean; condition: string; notes: string }>;
  delete: Record<AccessLevel, { allowed: boolean; condition: string; notes: string }>;
}

export const RLS_PERMISSION_MATRIX: TableRlsRule[] = [
  {
    tableName: 'tenants',
    tableLabel: 'Tenants (Organizações)',
    select: {
      superadmin: { allowed: true, condition: 'fn_is_superadmin()', notes: 'Enxerga todas as empresas' },
      admin: { allowed: true, condition: 'id = fn_get_auth_tenant_id()', notes: 'Apenas a própria organização' },
      gestor: { allowed: true, condition: 'id = fn_get_auth_tenant_id()', notes: 'Apenas a própria organização' },
      operador: { allowed: true, condition: 'id = fn_get_auth_tenant_id()', notes: 'Apenas a própria organização' }
    },
    insert: {
      superadmin: { allowed: true, condition: 'fn_is_superadmin()', notes: 'Cria novos tenants no sistema' },
      admin: { allowed: false, condition: 'false', notes: 'Não pode criar outros tenants' },
      gestor: { allowed: false, condition: 'false', notes: 'Sem permissão' },
      operador: { allowed: false, condition: 'false', notes: 'Sem permissão' }
    },
    update: {
      superadmin: { allowed: true, condition: 'fn_is_superadmin()', notes: 'Edita qualquer tenant e plano' },
      admin: { allowed: true, condition: 'id = fn_get_auth_tenant_id()', notes: 'Edita configurações do próprio tenant' },
      gestor: { allowed: false, condition: 'false', notes: 'Sem permissão para alterar tenant' },
      operador: { allowed: false, condition: 'false', notes: 'Sem permissão' }
    },
    delete: {
      superadmin: { allowed: true, condition: 'fn_is_superadmin()', notes: 'Exclusão física do tenant' },
      admin: { allowed: false, condition: 'false', notes: 'Exige intervenção do suporte Vértice' },
      gestor: { allowed: false, condition: 'false', notes: 'Sem permissão' },
      operador: { allowed: false, condition: 'false', notes: 'Sem permissão' }
    }
  },
  {
    tableName: 'perfis',
    tableLabel: 'Perfis (Usuários)',
    select: {
      superadmin: { allowed: true, condition: 'fn_is_superadmin()', notes: 'Todos os usuários de todos os tenants' },
      admin: { allowed: true, condition: 'tenant_id = fn_get_auth_tenant_id()', notes: 'Todos os membros do tenant' },
      gestor: { allowed: true, condition: 'tenant_id = fn_get_auth_tenant_id()', notes: 'Colegas do mesmo tenant' },
      operador: { allowed: true, condition: 'tenant_id = fn_get_auth_tenant_id()', notes: 'Colegas do mesmo tenant' }
    },
    insert: {
      superadmin: { allowed: true, condition: 'fn_is_superadmin()', notes: 'Cria qualquer perfil' },
      admin: { allowed: true, condition: 'tenant_id = fn_get_auth_tenant_id() AND nivel != superadmin', notes: 'Cadastra colaboradores no tenant' },
      gestor: { allowed: false, condition: 'false', notes: 'Gestão de usuários é função do Admin' },
      operador: { allowed: false, condition: 'false', notes: 'Sem permissão' }
    },
    update: {
      superadmin: { allowed: true, condition: 'fn_is_superadmin()', notes: 'Atualiza qualquer usuário' },
      admin: { allowed: true, condition: 'tenant_id = fn_get_auth_tenant_id()', notes: 'Gerencia membros do tenant' },
      gestor: { allowed: true, condition: 'id = auth.uid()', notes: 'Apenas seu próprio perfil (avatar/telefone)' },
      operador: { allowed: true, condition: 'id = auth.uid()', notes: 'Apenas seu próprio perfil (avatar/telefone)' }
    },
    delete: {
      superadmin: { allowed: true, condition: 'fn_is_superadmin()', notes: 'Exclui qualquer perfil' },
      admin: { allowed: true, condition: 'tenant_id = fn_get_auth_tenant_id() AND id != auth.uid()', notes: 'Remove usuários do tenant' },
      gestor: { allowed: false, condition: 'false', notes: 'Sem permissão' },
      operador: { allowed: false, condition: 'false', notes: 'Sem permissão' }
    }
  },
  {
    tableName: 'projetos',
    tableLabel: 'Projetos',
    select: {
      superadmin: { allowed: true, condition: 'fn_is_superadmin()', notes: 'Todos os projetos de qualquer empresa' },
      admin: { allowed: true, condition: 'tenant_id = fn_get_auth_tenant_id()', notes: 'Todos os projetos do seu tenant' },
      gestor: { allowed: true, condition: 'tenant_id = fn_get_auth_tenant_id()', notes: 'Todos os projetos do seu tenant' },
      operador: { allowed: true, condition: 'atribuido_para = auth.uid() OR created_by = auth.uid()', notes: 'Apenas projetos onde atua ou criou' }
    },
    insert: {
      superadmin: { allowed: true, condition: 'fn_is_superadmin()', notes: 'Cria em qualquer tenant' },
      admin: { allowed: true, condition: 'tenant_id = fn_get_auth_tenant_id()', notes: 'Cria projetos no tenant' },
      gestor: { allowed: true, condition: 'tenant_id = fn_get_auth_tenant_id()', notes: 'Cria projetos no tenant' },
      operador: { allowed: false, condition: 'false', notes: 'Operador não abre novos projetos' }
    },
    update: {
      superadmin: { allowed: true, condition: 'fn_is_superadmin()', notes: 'Edição irrestrita' },
      admin: { allowed: true, condition: 'tenant_id = fn_get_auth_tenant_id()', notes: 'Edita qualquer projeto do tenant' },
      gestor: { allowed: true, condition: 'gestor_id = auth.uid() OR departamento_gestor', notes: 'Edita projetos sob sua gestão' },
      operador: { allowed: false, condition: 'false', notes: 'Operador não edita parâmetros de projeto' }
    },
    delete: {
      superadmin: { allowed: true, condition: 'fn_is_superadmin()', notes: 'Exclusão permitida' },
      admin: { allowed: true, condition: 'tenant_id = fn_get_auth_tenant_id()', notes: 'Apenas Admin pode deletar projetos' },
      gestor: { allowed: false, condition: 'false', notes: 'Gestor não pode excluir projetos' },
      operador: { allowed: false, condition: 'false', notes: 'Sem permissão' }
    }
  },
  {
    tableName: 'tarefas',
    tableLabel: 'Tarefas',
    select: {
      superadmin: { allowed: true, condition: 'fn_is_superadmin()', notes: 'Todas as tarefas do banco' },
      admin: { allowed: true, condition: 'tenant_id = fn_get_auth_tenant_id()', notes: 'Todas as tarefas do tenant' },
      gestor: { allowed: true, condition: 'tenant_id = fn_get_auth_tenant_id()', notes: 'Todas as tarefas do tenant' },
      operador: { allowed: true, condition: 'atribuido_para = auth.uid() OR created_by = auth.uid()', notes: 'Apenas tarefas atribuídas a ele' }
    },
    insert: {
      superadmin: { allowed: true, condition: 'fn_is_superadmin()', notes: 'Permitido' },
      admin: { allowed: true, condition: 'tenant_id = fn_get_auth_tenant_id()', notes: 'Cria e delega tarefas no tenant' },
      gestor: { allowed: true, condition: 'tenant_id = fn_get_auth_tenant_id()', notes: 'Cria e delega tarefas no tenant' },
      operador: { allowed: false, condition: 'false', notes: 'Operador apenas recebe tarefas delegadas' }
    },
    update: {
      superadmin: { allowed: true, condition: 'fn_is_superadmin()', notes: 'Edição irrestrita' },
      admin: { allowed: true, condition: 'tenant_id = fn_get_auth_tenant_id()', notes: 'Edita qualquer tarefa do tenant' },
      gestor: { allowed: true, condition: 'tenant_id = fn_get_auth_tenant_id()', notes: 'Edita qualquer tarefa do tenant' },
      operador: { allowed: true, condition: 'atribuido_para = auth.uid()', notes: 'Atualiza apenas progresso e status da sua tarefa' }
    },
    delete: {
      superadmin: { allowed: true, condition: 'fn_is_superadmin()', notes: 'Permitido' },
      admin: { allowed: true, condition: 'tenant_id = fn_get_auth_tenant_id()', notes: 'Pode excluir tarefas do tenant' },
      gestor: { allowed: true, condition: 'tenant_id = fn_get_auth_tenant_id()', notes: 'Pode excluir tarefas operacionais' },
      operador: { allowed: false, condition: 'false', notes: 'Operador não deleta tarefas' }
    }
  },
  {
    tableName: 'apontamentos_horas',
    tableLabel: 'Apontamentos de Horas',
    select: {
      superadmin: { allowed: true, condition: 'fn_is_superadmin()', notes: 'Todos os apontamentos globais' },
      admin: { allowed: true, condition: 'tenant_id = fn_get_auth_tenant_id()', notes: 'Todos os apontamentos do tenant' },
      gestor: { allowed: true, condition: 'tenant_id = fn_get_auth_tenant_id()', notes: 'Todos os apontamentos do tenant' },
      operador: { allowed: true, condition: 'usuario_id = auth.uid()', notes: 'Apenas os seus próprios lançamentos' }
    },
    insert: {
      superadmin: { allowed: true, condition: 'fn_is_superadmin()', notes: 'Permitido' },
      admin: { allowed: true, condition: 'tenant_id = fn_get_auth_tenant_id()', notes: 'Permitido' },
      gestor: { allowed: true, condition: 'tenant_id = fn_get_auth_tenant_id()', notes: 'Permitido' },
      operador: { allowed: true, condition: 'usuario_id = auth.uid() AND status = pendente', notes: 'Registra horas em tarefas do seu tenant' }
    },
    update: {
      superadmin: { allowed: true, condition: 'fn_is_superadmin()', notes: 'Permitido' },
      admin: { allowed: true, condition: 'tenant_id = fn_get_auth_tenant_id()', notes: 'Aprova/reprova e ajusta horas' },
      gestor: { allowed: true, condition: 'tenant_id = fn_get_auth_tenant_id()', notes: 'Aprova ou rejeita apontamentos da equipe' },
      operador: { allowed: true, condition: 'usuario_id = auth.uid() AND status = pendente', notes: 'Pode alterar apenas enquanto estiver pendente' }
    },
    delete: {
      superadmin: { allowed: true, condition: 'fn_is_superadmin()', notes: 'Permitido' },
      admin: { allowed: true, condition: 'tenant_id = fn_get_auth_tenant_id()', notes: 'Exclui no tenant' },
      gestor: { allowed: true, condition: 'tenant_id = fn_get_auth_tenant_id()', notes: 'Exclui no tenant' },
      operador: { allowed: true, condition: 'usuario_id = auth.uid() AND status = pendente', notes: 'Cancela seu apontamento antes de aprovação' }
    }
  },
  {
    tableName: 'logs_auditoria',
    tableLabel: 'Logs de Auditoria',
    select: {
      superadmin: { allowed: true, condition: 'fn_is_superadmin()', notes: 'Logs de todo o ecossistema' },
      admin: { allowed: true, condition: 'tenant_id = fn_get_auth_tenant_id()', notes: 'Logs completos da sua empresa' },
      gestor: { allowed: true, condition: 'nome_tabela IN (projetos, tarefas, horas)', notes: 'Apenas logs das atividades operacionais' },
      operador: { allowed: false, condition: 'false', notes: 'Sem acesso à trilha de auditoria' }
    },
    insert: {
      superadmin: { allowed: true, condition: 'true (via sistema)', notes: 'Triggers do banco' },
      admin: { allowed: true, condition: 'true (via sistema)', notes: 'Triggers do banco' },
      gestor: { allowed: true, condition: 'true (via sistema)', notes: 'Triggers do banco' },
      operador: { allowed: true, condition: 'true (via sistema)', notes: 'Triggers do banco' }
    },
    update: {
      superadmin: { allowed: false, condition: 'false', notes: 'Imutável por conformidade LGPD' },
      admin: { allowed: false, condition: 'false', notes: 'Imutável por conformidade LGPD' },
      gestor: { allowed: false, condition: 'false', notes: 'Imutável por conformidade LGPD' },
      operador: { allowed: false, condition: 'false', notes: 'Imutável por conformidade LGPD' }
    },
    delete: {
      superadmin: { allowed: false, condition: 'false', notes: 'Imutável por conformidade LGPD' },
      admin: { allowed: false, condition: 'false', notes: 'Imutável por conformidade LGPD' },
      gestor: { allowed: false, condition: 'false', notes: 'Imutável por conformidade LGPD' },
      operador: { allowed: false, condition: 'false', notes: 'Imutável por conformidade LGPD' }
    }
  }
];

export interface SimulationScenario {
  id: string;
  title: string;
  userRole: AccessLevel;
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  targetDescription: string;
  expectedResult: 'allowed' | 'blocked';
  policyEvaluated: string;
  sqlClause: string;
  explanation: string;
}

export const SIMULATION_SCENARIOS: SimulationScenario[] = [
  {
    id: 'sc-1',
    title: 'Operador tenta listar tarefas de outros colegas',
    userRole: 'operador',
    operation: 'SELECT',
    table: 'tarefas',
    targetDescription: 'Query: SELECT * FROM public.tarefas WHERE atribuido_para != auth.uid();',
    expectedResult: 'blocked',
    policyEvaluated: 'tarefas_operador_select',
    sqlClause: 'USING (public.fn_get_auth_nivel_acesso() = "operador" AND (atribuido_para = auth.uid() OR created_by = auth.uid()))',
    explanation: 'O PostgreSQL descarta silenciosamente as linhas onde atribuido_para não corresponde ao UUID do usuário conectado. O Operador visualiza exclusivamente seu próprio backlog.'
  },
  {
    id: 'sc-2',
    title: 'Operador atualiza status de tarefa atribuída a ele',
    userRole: 'operador',
    operation: 'UPDATE',
    table: 'tarefas',
    targetDescription: 'Query: UPDATE tarefas SET status = "em_execucao", progresso_percentual = 50 WHERE id = "tarefa-123";',
    expectedResult: 'allowed',
    policyEvaluated: 'tarefas_operador_update',
    sqlClause: 'USING (atribuido_para = auth.uid()) WITH CHECK (atribuido_para = auth.uid())',
    explanation: 'A política permite a modificação porque o registro possui atribuido_para = auth.uid() e pertence ao mesmo tenant_id.'
  },
  {
    id: 'sc-3',
    title: 'Operador tenta excluir projeto corporativo',
    userRole: 'operador',
    operation: 'DELETE',
    table: 'projetos',
    targetDescription: 'Query: DELETE FROM public.projetos WHERE id = "proj-456";',
    expectedResult: 'blocked',
    policyEvaluated: 'projetos_admin_delete',
    sqlClause: 'USING (public.fn_is_admin_or_higher() AND tenant_id = public.fn_get_auth_tenant_id())',
    explanation: 'A política de DELETE exige privilégio de Administrador do Tenant ou superior (fn_is_admin_or_higher()). A operação falha imediatamente com 0 linhas afetadas.'
  },
  {
    id: 'sc-4',
    title: 'Gestor aprova apontamento de horas da equipe',
    userRole: 'gestor',
    operation: 'UPDATE',
    table: 'apontamentos_horas',
    targetDescription: 'Query: UPDATE apontamentos_horas SET status_aprovacao = "aprovado", aprovado_por = auth.uid() WHERE id = "apont-789";',
    expectedResult: 'allowed',
    policyEvaluated: 'apontamentos_gestor_admin_update',
    sqlClause: 'USING (public.fn_is_gestor_or_higher() AND tenant_id = public.fn_get_auth_tenant_id())',
    explanation: 'Gestores possuem autorização formal para validar lançamentos de horas de todos os membros de sua organização.'
  },
  {
    id: 'sc-5',
    title: 'Admin tenta consultar dados de outro Tenant',
    userRole: 'admin',
    operation: 'SELECT',
    table: 'clientes',
    targetDescription: 'Query: SELECT * FROM clientes WHERE tenant_id = "tenant-concorrente-uuid";',
    expectedResult: 'blocked',
    policyEvaluated: 'clientes_members_select',
    sqlClause: 'USING (tenant_id = public.fn_get_auth_tenant_id())',
    explanation: 'O isolamento multi-tenant da plataforma VÉRTICE é hermético: cada query é filtrada pelo tenant_id resolvido no token do usuário conectado.'
  },
  {
    id: 'sc-6',
    title: 'Superadmin audita logs de segurança em toda a plataforma',
    userRole: 'superadmin',
    operation: 'SELECT',
    table: 'logs_auditoria',
    targetDescription: 'Query: SELECT * FROM logs_auditoria ORDER BY created_at DESC LIMIT 50;',
    expectedResult: 'allowed',
    policyEvaluated: 'auditoria_superadmin_select',
    sqlClause: 'USING (public.fn_is_superadmin())',
    explanation: 'A função fn_is_superadmin() valida o cargo de Nível 1 e concede visão universal e irrestrita a qualquer tenant da infraestrutura.'
  },
  {
    id: 'sc-7',
    title: 'Operador tenta alterar apontamento já aprovado',
    userRole: 'operador',
    operation: 'UPDATE',
    table: 'apontamentos_horas',
    targetDescription: 'Query: UPDATE apontamentos_horas SET horas_lancadas = 8.00 WHERE id = "apont-aprovado";',
    expectedResult: 'blocked',
    policyEvaluated: 'apontamentos_operador_update_own',
    sqlClause: 'USING (usuario_id = auth.uid() AND status_aprovacao = "pendente")',
    explanation: 'A política de segurança restringe atualizações de operadores estritamente a registros com status_aprovacao = "pendente". Apontamentos homologados são imutáveis.'
  }
];
