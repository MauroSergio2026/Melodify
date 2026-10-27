export interface ColumnDefinition {
  name: string;
  type: string;
  isPk?: boolean;
  isFk?: boolean;
  fkTarget?: string;
  isNullable: boolean;
  defaultValue?: string;
  description: string;
}

export interface TableDefinition {
  name: string;
  label: string;
  description: string;
  category: 'core' | 'organizational' | 'operations' | 'compliance';
  columns: ColumnDefinition[];
  indexes: string[];
  rlsPoliciesCount: number;
}

export const VERTICE_TABLES: TableDefinition[] = [
  {
    name: 'tenants',
    label: 'Tenants (Organizações)',
    category: 'core',
    description: 'Entidade central multi-tenant. Cada organização cliente da plataforma Vértice possui isolamento lógico completo de dados.',
    rlsPoliciesCount: 3,
    columns: [
      { name: 'id', type: 'UUID', isPk: true, isNullable: false, defaultValue: 'gen_random_uuid()', description: 'Identificador global exclusivo da organização' },
      { name: 'cnpj', type: 'VARCHAR(18)', isNullable: true, defaultValue: 'NULL', description: 'Cadastro Nacional da Pessoa Jurídica (único)' },
      { name: 'razao_social', type: 'VARCHAR(255)', isNullable: false, description: 'Razão social registrada' },
      { name: 'nome_fantasia', type: 'VARCHAR(255)', isNullable: false, description: 'Nome comercial da organização' },
      { name: 'slug', type: 'VARCHAR(100)', isNullable: false, description: 'Identificador textual amigável em URLs' },
      { name: 'plano', type: 'tipo_plano_enum', isNullable: false, defaultValue: "'starter'", description: 'Plano contratado (starter, pro, enterprise, custom)' },
      { name: 'status', type: 'status_geral_enum', isNullable: false, defaultValue: "'ativo'", description: 'Estado cadastral da organização (ativo, inativo, suspenso)' },
      { name: 'limite_usuarios', type: 'INTEGER', isNullable: false, defaultValue: '10', description: 'Cota de usuários do plano' },
      { name: 'configuracoes', type: 'JSONB', isNullable: false, defaultValue: "'{...}'::jsonb", description: 'Parâmetros operacionais e preferências do tenant' },
      { name: 'created_at', type: 'TIMESTAMPTZ', isNullable: false, defaultValue: 'now()', description: 'Data e hora da criação' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', isNullable: false, defaultValue: 'now()', description: 'Última modificação' },
    ],
    indexes: ['idx_tenants_status (status)', 'idx_tenants_slug (slug UNIQUE)', 'tenants_cnpj_key (cnpj UNIQUE)']
  },
  {
    name: 'perfis',
    label: 'Perfis (Usuários & RBAC)',
    category: 'core',
    description: 'Extensão pública da tabela auth.users do Supabase, contendo nível de acesso (RBAC), tenant_id e atributos do usuário.',
    rlsPoliciesCount: 6,
    columns: [
      { name: 'id', type: 'UUID', isPk: true, isFk: true, fkTarget: 'auth.users(id)', isNullable: false, description: 'Vínculo 1:1 direto com o usuário autenticado do Supabase Auth' },
      { name: 'tenant_id', type: 'UUID', isFk: true, fkTarget: 'tenants(id)', isNullable: true, description: 'Tenant associado (NULL apenas para Superadmin global)' },
      { name: 'email', type: 'VARCHAR(255)', isNullable: false, description: 'E-mail corporativo' },
      { name: 'nome_completo', type: 'VARCHAR(255)', isNullable: false, description: 'Nome e sobrenome do colaborador' },
      { name: 'telefone', type: 'VARCHAR(20)', isNullable: true, description: 'Contato celular/WhatsApp' },
      { name: 'cargo', type: 'VARCHAR(100)', isNullable: true, description: 'Título funcional na empresa' },
      { name: 'nivel_acesso', type: 'nivel_acesso_enum', isNullable: false, defaultValue: "'operador'", description: 'Nível hierárquico: superadmin, admin, gestor ou operador' },
      { name: 'departamento_id', type: 'UUID', isFk: true, fkTarget: 'departamentos(id)', isNullable: true, description: 'Setor onde o usuário está alocado' },
      { name: 'status', type: 'status_usuario_enum', isNullable: false, defaultValue: "'ativo'", description: 'Estado da conta (ativo, inativo, pendente, bloqueado)' },
      { name: 'avatar_url', type: 'TEXT', isNullable: true, description: 'URL da foto de perfil' },
      { name: 'preferencias', type: 'JSONB', isNullable: false, defaultValue: "'{...}'::jsonb", description: 'Configurações de interface e notificações' },
      { name: 'ultimo_login', type: 'TIMESTAMPTZ', isNullable: true, description: 'Timestamp do último acesso' },
      { name: 'created_at', type: 'TIMESTAMPTZ', isNullable: false, defaultValue: 'now()', description: 'Data de cadastro' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', isNullable: false, defaultValue: 'now()', description: 'Data da última alteração' },
    ],
    indexes: ['idx_perfis_tenant_id (tenant_id)', 'idx_perfis_nivel_acesso (nivel_acesso)', 'idx_perfis_departamento_id (departamento_id)', 'idx_perfis_tenant_status (tenant_id, status)']
  },
  {
    name: 'departamentos',
    label: 'Departamentos (Setores)',
    category: 'organizational',
    description: 'Estrutura organizacional interna do tenant (e.g. Engenharia, Operações, Comercial, Financeiro).',
    rlsPoliciesCount: 4,
    columns: [
      { name: 'id', type: 'UUID', isPk: true, isNullable: false, defaultValue: 'gen_random_uuid()', description: 'Identificador do departamento' },
      { name: 'tenant_id', type: 'UUID', isFk: true, fkTarget: 'tenants(id)', isNullable: false, description: 'Tenant proprietário do setor' },
      { name: 'nome', type: 'VARCHAR(100)', isNullable: false, description: 'Nome do setor / departamento' },
      { name: 'codigo', type: 'VARCHAR(20)', isNullable: true, description: 'Sigla ou código contábil' },
      { name: 'descricao', type: 'TEXT', isNullable: true, description: 'Atribuições e escopo do setor' },
      { name: 'orcamento_anual', type: 'NUMERIC(15,2)', isNullable: true, defaultValue: '0.00', description: 'Budget alocado' },
      { name: 'gestor_id', type: 'UUID', isFk: true, fkTarget: 'perfis(id)', isNullable: true, description: 'Líder / Coordenador responsável pelo setor' },
      { name: 'created_at', type: 'TIMESTAMPTZ', isNullable: false, defaultValue: 'now()', description: 'Criação' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', isNullable: false, defaultValue: 'now()', description: 'Atualização' },
    ],
    indexes: ['idx_departamentos_tenant_id (tenant_id)', 'idx_departamentos_gestor_id (gestor_id)', 'uq_departamento_tenant_nome (tenant_id, nome)']
  },
  {
    name: 'clientes',
    label: 'Clientes (Contas Atendidas)',
    category: 'organizational',
    description: 'Carteira de clientes ou contas corporativas atendidas pela organização no sistema Vértice.',
    rlsPoliciesCount: 5,
    columns: [
      { name: 'id', type: 'UUID', isPk: true, isNullable: false, defaultValue: 'gen_random_uuid()', description: 'ID do cliente' },
      { name: 'tenant_id', type: 'UUID', isFk: true, fkTarget: 'tenants(id)', isNullable: false, description: 'Tenant ao qual o cliente pertence' },
      { name: 'razao_social', type: 'VARCHAR(255)', isNullable: false, description: 'Razão social do cliente' },
      { name: 'nome_fantasia', type: 'VARCHAR(255)', isNullable: true, description: 'Nome comercial' },
      { name: 'documento', type: 'VARCHAR(20)', isNullable: false, description: 'CPF ou CNPJ' },
      { name: 'email_contato', type: 'VARCHAR(255)', isNullable: true, description: 'E-mail do ponto focal' },
      { name: 'telefone', type: 'VARCHAR(20)', isNullable: true, description: 'Telefone de contato' },
      { name: 'endereco_completo', type: 'JSONB', isNullable: true, defaultValue: "'{}'::jsonb", description: 'Logradouro, cidade, estado, CEP' },
      { name: 'status', type: 'status_geral_enum', isNullable: false, defaultValue: "'ativo'", description: 'Status da conta' },
      { name: 'responsavel_id', type: 'UUID', isFk: true, fkTarget: 'perfis(id)', isNullable: true, description: 'Account Manager / Colaborador responsável' },
      { name: 'created_at', type: 'TIMESTAMPTZ', isNullable: false, defaultValue: 'now()', description: 'Criação' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', isNullable: false, defaultValue: 'now()', description: 'Atualização' },
    ],
    indexes: ['idx_clientes_tenant_id (tenant_id)', 'idx_clientes_responsavel_id (responsavel_id)', 'uq_cliente_tenant_documento (tenant_id, documento)']
  },
  {
    name: 'projetos',
    label: 'Projetos (Demandas & Contratos)',
    category: 'operations',
    description: 'Iniciativas de engenharia, contratos ou fluxos de trabalho gerenciados pela plataforma.',
    rlsPoliciesCount: 7,
    columns: [
      { name: 'id', type: 'UUID', isPk: true, isNullable: false, defaultValue: 'gen_random_uuid()', description: 'Identificador do projeto' },
      { name: 'tenant_id', type: 'UUID', isFk: true, fkTarget: 'tenants(id)', isNullable: false, description: 'Tenant proprietário' },
      { name: 'cliente_id', type: 'UUID', isFk: true, fkTarget: 'clientes(id)', isNullable: true, description: 'Cliente beneficiário' },
      { name: 'departamento_id', type: 'UUID', isFk: true, fkTarget: 'departamentos(id)', isNullable: true, description: 'Setor encarregado' },
      { name: 'gestor_id', type: 'UUID', isFk: true, fkTarget: 'perfis(id)', isNullable: true, description: 'Gerente do projeto (Nível Gestor)' },
      { name: 'codigo_projeto', type: 'VARCHAR(30)', isNullable: true, description: 'Código único do projeto no tenant' },
      { name: 'titulo', type: 'VARCHAR(255)', isNullable: false, description: 'Nome descritivo da iniciativa' },
      { name: 'descricao', type: 'TEXT', isNullable: true, description: 'Escopo detalhado' },
      { name: 'prioridade', type: 'prioridade_enum', isNullable: false, defaultValue: "'media'", description: 'Gravidade/prioridade' },
      { name: 'status', type: 'status_projeto_enum', isNullable: false, defaultValue: "'planejamento'", description: 'Fase do ciclo de vida' },
      { name: 'orcamento_aprovado', type: 'NUMERIC(15,2)', isNullable: true, defaultValue: '0.00', description: 'Verba aprovada' },
      { name: 'custo_atual', type: 'NUMERIC(15,2)', isNullable: true, defaultValue: '0.00', description: 'Custo acumulado' },
      { name: 'data_inicio', type: 'DATE', isNullable: false, defaultValue: 'CURRENT_DATE', description: 'Início oficial' },
      { name: 'data_conclusao_prevista', type: 'DATE', isNullable: true, description: 'Data estimada de entrega' },
      { name: 'created_by', type: 'UUID', isFk: true, fkTarget: 'perfis(id)', isNullable: true, description: 'Usuário autor da criação' },
      { name: 'created_at', type: 'TIMESTAMPTZ', isNullable: false, defaultValue: 'now()', description: 'Criação' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', isNullable: false, defaultValue: 'now()', description: 'Atualização' },
    ],
    indexes: ['idx_projetos_tenant_id (tenant_id)', 'idx_projetos_gestor_id (gestor_id)', 'idx_projetos_status (status)', 'idx_projetos_tenant_status (tenant_id, status)']
  },
  {
    name: 'tarefas',
    label: 'Tarefas (Itens de Trabalho)',
    category: 'operations',
    description: 'Entregáveis operacionais executados pelos operadores e acompanhados pelos gestores.',
    rlsPoliciesCount: 6,
    columns: [
      { name: 'id', type: 'UUID', isPk: true, isNullable: false, defaultValue: 'gen_random_uuid()', description: 'ID da tarefa' },
      { name: 'tenant_id', type: 'UUID', isFk: true, fkTarget: 'tenants(id)', isNullable: false, description: 'Tenant proprietário' },
      { name: 'projeto_id', type: 'UUID', isFk: true, fkTarget: 'projetos(id)', isNullable: false, description: 'Projeto pai' },
      { name: 'titulo', type: 'VARCHAR(255)', isNullable: false, description: 'Resumo da atividade' },
      { name: 'descricao', type: 'TEXT', isNullable: true, description: 'Instruções e critérios de aceite' },
      { name: 'status', type: 'status_tarefa_enum', isNullable: false, defaultValue: "'pendente'", description: 'Status do fluxo operacional' },
      { name: 'prioridade', type: 'prioridade_enum', isNullable: false, defaultValue: "'media'", description: 'Prioridade' },
      { name: 'atribuido_para', type: 'UUID', isFk: true, fkTarget: 'perfis(id)', isNullable: true, description: 'Operador encarregado da execução' },
      { name: 'created_by', type: 'UUID', isFk: true, fkTarget: 'perfis(id)', isNullable: true, description: 'Criador da tarefa' },
      { name: 'data_limite', type: 'TIMESTAMPTZ', isNullable: true, description: 'Prazo fatal' },
      { name: 'horas_estimadas', type: 'NUMERIC(6,2)', isNullable: true, defaultValue: '0.00', description: 'Esforço previsto em horas' },
      { name: 'horas_realizadas', type: 'NUMERIC(6,2)', isNullable: true, defaultValue: '0.00', description: 'Esforço acumulado em horas' },
      { name: 'progresso_percentual', type: 'INTEGER', isNullable: false, defaultValue: '0', description: 'Percentual de avanço (0 a 100)' },
      { name: 'tags', type: 'TEXT[]', isNullable: true, defaultValue: 'ARRAY[]::TEXT[]', description: 'Marcadores' },
      { name: 'created_at', type: 'TIMESTAMPTZ', isNullable: false, defaultValue: 'now()', description: 'Criação' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', isNullable: false, defaultValue: 'now()', description: 'Atualização' },
    ],
    indexes: ['idx_tarefas_tenant_id (tenant_id)', 'idx_tarefas_projeto_id (projeto_id)', 'idx_tarefas_atribuido_para (atribuido_para)', 'idx_tarefas_tenant_atribuido (tenant_id, atribuido_para)']
  },
  {
    name: 'apontamentos_horas',
    label: 'Apontamentos de Horas',
    category: 'operations',
    description: 'Time tracking e registro de atividades de campo realizadas pelos operadores com aprovação de gestores.',
    rlsPoliciesCount: 6,
    columns: [
      { name: 'id', type: 'UUID', isPk: true, isNullable: false, defaultValue: 'gen_random_uuid()', description: 'ID do apontamento' },
      { name: 'tenant_id', type: 'UUID', isFk: true, fkTarget: 'tenants(id)', isNullable: false, description: 'Tenant' },
      { name: 'tarefa_id', type: 'UUID', isFk: true, fkTarget: 'tarefas(id)', isNullable: false, description: 'Tarefa executada' },
      { name: 'usuario_id', type: 'UUID', isFk: true, fkTarget: 'perfis(id)', isNullable: false, description: 'Operador que executou a hora' },
      { name: 'data_trabalho', type: 'DATE', isNullable: false, defaultValue: 'CURRENT_DATE', description: 'Data do serviço prestado' },
      { name: 'horas_lancadas', type: 'NUMERIC(5,2)', isNullable: false, description: 'Quantidade de horas (0.01 a 24.00)' },
      { name: 'descricao_atividades', type: 'TEXT', isNullable: false, description: 'Memorial descritivo da atividade executada' },
      { name: 'status_aprovacao', type: 'status_aprovacao_enum', isNullable: false, defaultValue: "'pendente'", description: 'Estado da validação técnica' },
      { name: 'aprovado_por', type: 'UUID', isFk: true, fkTarget: 'perfis(id)', isNullable: true, description: 'Gestor validador' },
      { name: 'data_aprovacao', type: 'TIMESTAMPTZ', isNullable: true, description: 'Data/hora da aprovação' },
      { name: 'created_at', type: 'TIMESTAMPTZ', isNullable: false, defaultValue: 'now()', description: 'Criação' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', isNullable: false, defaultValue: 'now()', description: 'Atualização' },
    ],
    indexes: ['idx_apontamentos_tenant_id (tenant_id)', 'idx_apontamentos_tarefa_id (tarefa_id)', 'idx_apontamentos_usuario_id (usuario_id)', 'idx_apontamentos_tenant_usuario (tenant_id, usuario_id)']
  },
  {
    name: 'logs_auditoria',
    label: 'Logs de Auditoria (LGPD & Compliance)',
    category: 'compliance',
    description: 'Trilha imutável de eventos de auditoria registrando quem alterou cada registro, quando e com quais dados.',
    rlsPoliciesCount: 4,
    columns: [
      { name: 'id', type: 'UUID', isPk: true, isNullable: false, defaultValue: 'gen_random_uuid()', description: 'ID do registro de auditoria' },
      { name: 'tenant_id', type: 'UUID', isFk: true, fkTarget: 'tenants(id)', isNullable: true, description: 'Tenant afetado' },
      { name: 'usuario_id', type: 'UUID', isFk: true, fkTarget: 'perfis(id)', isNullable: true, description: 'Usuário executor da ação' },
      { name: 'acao', type: 'VARCHAR(50)', isNullable: false, description: 'INSERT, UPDATE, DELETE, ROLE_CHANGE' },
      { name: 'nome_tabela', type: 'VARCHAR(50)', isNullable: false, description: 'Tabela alvo' },
      { name: 'registro_id', type: 'UUID', isNullable: true, description: 'Chave primária do registro impactado' },
      { name: 'dados_anteriores', type: 'JSONB', isNullable: true, description: 'Snapshot do estado anterior' },
      { name: 'dados_novos', type: 'JSONB', isNullable: true, description: 'Snapshot dos novos dados aplicados' },
      { name: 'ip_origem', type: 'INET', isNullable: true, description: 'Endereço IP da requisição' },
      { name: 'user_agent', type: 'TEXT', isNullable: true, description: 'Identificador do navegador/dispositivo' },
      { name: 'created_at', type: 'TIMESTAMPTZ', isNullable: false, defaultValue: 'now()', description: 'Momento exato da ocorrência' },
    ],
    indexes: ['idx_auditoria_tenant_id (tenant_id)', 'idx_auditoria_usuario_id (usuario_id)', 'idx_auditoria_tabela_registro (nome_tabela, registro_id)', 'idx_auditoria_created_at (created_at DESC)']
  }
];
