-- ==============================================================================
-- PLATAFORMA VÉRTICE - ETAPA 1: ARQUITETURA DE BANCO DE DADOS POSTGRESQL / SUPABASE
-- Script DDL Completo com ENUMs, Tabelas, Foreign Keys, Índices, Triggers e RLS
-- Níveis de Acesso (RBAC): Superadmin (1), Admin (2), Gestor (3), Operador (4)
-- Versão: 1.0.0
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. EXTENSÕES DO POSTGRESQL
-- ------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 2. ENUMS (TIPOS CUSTOMIZADOS)
-- ------------------------------------------------------------------------------

-- Níveis hierárquicos de acesso da plataforma Vértice
DO $$ BEGIN
    CREATE TYPE nivel_acesso_enum AS ENUM (
        'superadmin',  -- Nível 1: Acesso irrestrito a todos os tenants e à infraestrutura
        'admin',       -- Nível 2: Administrador da organização/tenant (gestão total do tenant)
        'gestor',      -- Nível 3: Coordenador/Gerente (gestão operacional, aprovações, projetos)
        'operador'     -- Nível 4: Executor operacional (tarefas atribuídas, apontamentos)
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Status operacional geral
DO $$ BEGIN
    CREATE TYPE status_geral_enum AS ENUM (
        'ativo',
        'inativo',
        'suspenso',
        'cancelado'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Status de contas de usuários
DO $$ BEGIN
    CREATE TYPE status_usuario_enum AS ENUM (
        'ativo',
        'inativo',
        'pendente',
        'bloqueado'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Planos de assinatura do Tenant
DO $$ BEGIN
    CREATE TYPE tipo_plano_enum AS ENUM (
        'starter',
        'pro',
        'enterprise',
        'custom'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Níveis de prioridade
DO $$ BEGIN
    CREATE TYPE prioridade_enum AS ENUM (
        'baixa',
        'media',
        'alta',
        'critica'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Status de projetos corporativos
DO $$ BEGIN
    CREATE TYPE status_projeto_enum AS ENUM (
        'planejamento',
        'em_andamento',
        'em_revisao',
        'pausado',
        'concluido',
        'cancelado'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Status de tarefas
DO $$ BEGIN
    CREATE TYPE status_tarefa_enum AS ENUM (
        'pendente',
        'em_execucao',
        'aguardando_aprovacao',
        'concluida',
        'bloqueada',
        'cancelada'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Status de aprovação para apontamentos e fluxos
DO $$ BEGIN
    CREATE TYPE status_aprovacao_enum AS ENUM (
        'pendente',
        'aprovado',
        'rejeitado'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ------------------------------------------------------------------------------
-- 3. TABELAS ESSENCIAIS
-- ------------------------------------------------------------------------------

-- Tabela 3.1: Tenants (Organizações / Empresas Multi-tenant)
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cnpj VARCHAR(18) UNIQUE,
    razao_social VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    plano tipo_plano_enum NOT NULL DEFAULT 'starter',
    status status_geral_enum NOT NULL DEFAULT 'ativo',
    limite_usuarios INTEGER NOT NULL DEFAULT 10,
    configuracoes JSONB NOT NULL DEFAULT '{
        "permite_apontamento_retroativo": false,
        "notificacoes_email": true,
        "exige_aprovacao_horas": true,
        "tema": "light"
    }'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Tabela 3.2: Departamentos (Setores / Unidades de Negócio)
CREATE TABLE IF NOT EXISTS public.departamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    codigo VARCHAR(20),
    descricao TEXT,
    orcamento_anual NUMERIC(15,2) DEFAULT 0.00,
    gestor_id UUID, -- Foreign key adicionada após a criação da tabela perfis
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_departamento_tenant_nome UNIQUE (tenant_id, nome)
);

-- Tabela 3.3: Perfis (Extensão de auth.users com RBAC e tenant_id)
CREATE TABLE IF NOT EXISTS public.perfis (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    nome_completo VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    cargo VARCHAR(100),
    nivel_acesso nivel_acesso_enum NOT NULL DEFAULT 'operador',
    departamento_id UUID REFERENCES public.departamentos(id) ON DELETE SET NULL,
    status status_usuario_enum NOT NULL DEFAULT 'ativo',
    avatar_url TEXT,
    preferencias JSONB NOT NULL DEFAULT '{
        "idioma": "pt-BR",
        "notificacoes_push": true,
        "digest_semanal": true
    }'::jsonb,
    ultimo_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Adicionar Foreign Key de gestor_id em departamentos agora que perfis existe
ALTER TABLE public.departamentos 
    DROP CONSTRAINT IF EXISTS fk_departamentos_gestor,
    ADD CONSTRAINT fk_departamentos_gestor 
    FOREIGN KEY (gestor_id) REFERENCES public.perfis(id) ON DELETE SET NULL;

-- Tabela 3.4: Clientes (Carteira de Clientes Corporativos do Tenant)
CREATE TABLE IF NOT EXISTS public.clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    razao_social VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255),
    documento VARCHAR(20) NOT NULL, -- CPF ou CNPJ
    email_contato VARCHAR(255),
    telefone VARCHAR(20),
    endereco_completo JSONB DEFAULT '{}'::jsonb,
    status status_geral_enum NOT NULL DEFAULT 'ativo',
    responsavel_id UUID REFERENCES public.perfis(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_cliente_tenant_documento UNIQUE (tenant_id, documento)
);

-- Tabela 3.5: Projetos (Iniciativas / Demandas Corporativas)
CREATE TABLE IF NOT EXISTS public.projetos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
    departamento_id UUID REFERENCES public.departamentos(id) ON DELETE SET NULL,
    gestor_id UUID REFERENCES public.perfis(id) ON DELETE SET NULL,
    codigo_projeto VARCHAR(30),
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    prioridade prioridade_enum NOT NULL DEFAULT 'media',
    status status_projeto_enum NOT NULL DEFAULT 'planejamento',
    orcamento_aprovado NUMERIC(15,2) DEFAULT 0.00,
    custo_atual NUMERIC(15,2) DEFAULT 0.00,
    data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
    data_conclusao_prevista DATE,
    data_conclusao_real DATE,
    created_by UUID REFERENCES public.perfis(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Tabela 3.6: Tarefas (Entregáveis Operacionais executados pelos Operadores)
CREATE TABLE IF NOT EXISTS public.tarefas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    projeto_id UUID NOT NULL REFERENCES public.projetos(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    status status_tarefa_enum NOT NULL DEFAULT 'pendente',
    prioridade prioridade_enum NOT NULL DEFAULT 'media',
    atribuido_para UUID REFERENCES public.perfis(id) ON DELETE SET NULL,
    created_by UUID REFERENCES public.perfis(id) ON DELETE SET NULL,
    data_limite TIMESTAMPTZ,
    horas_estimadas NUMERIC(6,2) DEFAULT 0.00,
    horas_realizadas NUMERIC(6,2) DEFAULT 0.00,
    progresso_percentual INTEGER NOT NULL DEFAULT 0 CHECK (progresso_percentual BETWEEN 0 AND 100),
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Tabela 3.7: Apontamentos de Horas (Time tracking / Execuções Operacionais)
CREATE TABLE IF NOT EXISTS public.apontamentos_horas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    tarefa_id UUID NOT NULL REFERENCES public.tarefas(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES public.perfis(id) ON DELETE CASCADE,
    data_trabalho DATE NOT NULL DEFAULT CURRENT_DATE,
    horas_lancadas NUMERIC(5,2) NOT NULL CHECK (horas_lancadas > 0 AND horas_lancadas <= 24),
    descricao_atividades TEXT NOT NULL,
    status_aprovacao status_aprovacao_enum NOT NULL DEFAULT 'pendente',
    aprovado_por UUID REFERENCES public.perfis(id) ON DELETE SET NULL,
    data_aprovacao TIMESTAMPTZ,
    justificativa_recusa TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Tabela 3.8: Logs de Auditoria (Audit Trail / LGPD / Compliance)
CREATE TABLE IF NOT EXISTS public.logs_auditoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES public.perfis(id) ON DELETE SET NULL,
    acao VARCHAR(50) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'ROLE_CHANGE', 'STATUS_CHANGE'
    nome_tabela VARCHAR(50) NOT NULL,
    registro_id UUID,
    dados_anteriores JSONB,
    dados_novos JSONB,
    ip_origem INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 4. ÍNDICES DE ALTA PERFORMANCE (MULTI-TENANCY & RBAC)
-- ------------------------------------------------------------------------------

-- Tenants
CREATE INDEX IF NOT EXISTS idx_tenants_status ON public.tenants(status);
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON public.tenants(slug);

-- Perfis
CREATE INDEX IF NOT EXISTS idx_perfis_tenant_id ON public.perfis(tenant_id);
CREATE INDEX IF NOT EXISTS idx_perfis_nivel_acesso ON public.perfis(nivel_acesso);
CREATE INDEX IF NOT EXISTS idx_perfis_departamento_id ON public.perfis(departamento_id);
CREATE INDEX IF NOT EXISTS idx_perfis_tenant_status ON public.perfis(tenant_id, status);

-- Departamentos
CREATE INDEX IF NOT EXISTS idx_departamentos_tenant_id ON public.departamentos(tenant_id);
CREATE INDEX IF NOT EXISTS idx_departamentos_gestor_id ON public.departamentos(gestor_id);

-- Clientes
CREATE INDEX IF NOT EXISTS idx_clientes_tenant_id ON public.clientes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_clientes_responsavel_id ON public.clientes(responsavel_id);

-- Projetos
CREATE INDEX IF NOT EXISTS idx_projetos_tenant_id ON public.projetos(tenant_id);
CREATE INDEX IF NOT EXISTS idx_projetos_gestor_id ON public.projetos(gestor_id);
CREATE INDEX IF NOT EXISTS idx_projetos_cliente_id ON public.projetos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_projetos_status ON public.projetos(status);
CREATE INDEX IF NOT EXISTS idx_projetos_tenant_status ON public.projetos(tenant_id, status);

-- Tarefas
CREATE INDEX IF NOT EXISTS idx_tarefas_tenant_id ON public.tarefas(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_projeto_id ON public.tarefas(projeto_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_atribuido_para ON public.tarefas(atribuido_para);
CREATE INDEX IF NOT EXISTS idx_tarefas_created_by ON public.tarefas(created_by);
CREATE INDEX IF NOT EXISTS idx_tarefas_status ON public.tarefas(status);
CREATE INDEX IF NOT EXISTS idx_tarefas_tenant_atribuido ON public.tarefas(tenant_id, atribuido_para);

-- Apontamentos de Horas
CREATE INDEX IF NOT EXISTS idx_apontamentos_tenant_id ON public.apontamentos_horas(tenant_id);
CREATE INDEX IF NOT EXISTS idx_apontamentos_tarefa_id ON public.apontamentos_horas(tarefa_id);
CREATE INDEX IF NOT EXISTS idx_apontamentos_usuario_id ON public.apontamentos_horas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_apontamentos_data_trabalho ON public.apontamentos_horas(data_trabalho);
CREATE INDEX IF NOT EXISTS idx_apontamentos_tenant_usuario ON public.apontamentos_horas(tenant_id, usuario_id);

-- Logs de Auditoria
CREATE INDEX IF NOT EXISTS idx_auditoria_tenant_id ON public.logs_auditoria(tenant_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario_id ON public.logs_auditoria(usuario_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_tabela_registro ON public.logs_auditoria(nome_tabela, registro_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_created_at ON public.logs_auditoria(created_at DESC);

-- ------------------------------------------------------------------------------
-- 5. FUNÇÕES AUXILIARES DE SEGURANÇA PARA RLS (SECURITY DEFINER)
-- ------------------------------------------------------------------------------

-- Função para obter o tenant_id do usuário conectado
CREATE OR REPLACE FUNCTION public.fn_get_auth_tenant_id()
RETURNS UUID AS $$
    SELECT tenant_id 
    FROM public.perfis 
    WHERE id = auth.uid()
    LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Função para obter o nível de acesso do usuário conectado
CREATE OR REPLACE FUNCTION public.fn_get_auth_nivel_acesso()
RETURNS nivel_acesso_enum AS $$
    SELECT nivel_acesso 
    FROM public.perfis 
    WHERE id = auth.uid()
    LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Nível 1: Validação de Superadmin (Acesso Global)
CREATE OR REPLACE FUNCTION public.fn_is_superadmin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.perfis 
        WHERE id = auth.uid() 
          AND nivel_acesso = 'superadmin' 
          AND status = 'ativo'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Nível 2 ou superior: Admin do Tenant ou Superadmin
CREATE OR REPLACE FUNCTION public.fn_is_admin_or_higher()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.perfis 
        WHERE id = auth.uid() 
          AND nivel_acesso IN ('superadmin', 'admin') 
          AND status = 'ativo'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Nível 3 ou superior: Gestor, Admin ou Superadmin
CREATE OR REPLACE FUNCTION public.fn_is_gestor_or_higher()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.perfis 
        WHERE id = auth.uid() 
          AND nivel_acesso IN ('superadmin', 'admin', 'gestor') 
          AND status = 'ativo'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- 6. TRIGGERS AUTOMATIZADOS (UPDATED_AT & SUPABASE AUTH INTEGRATION)
-- ------------------------------------------------------------------------------

-- Função genérica para atualizar a coluna updated_at
CREATE OR REPLACE FUNCTION public.fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Associação do trigger a todas as tabelas com updated_at
DROP TRIGGER IF EXISTS trg_tenants_updated_at ON public.tenants;
CREATE TRIGGER trg_tenants_updated_at BEFORE UPDATE ON public.tenants
    FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

DROP TRIGGER IF EXISTS trg_departamentos_updated_at ON public.departamentos;
CREATE TRIGGER trg_departamentos_updated_at BEFORE UPDATE ON public.departamentos
    FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

DROP TRIGGER IF EXISTS trg_perfis_updated_at ON public.perfis;
CREATE TRIGGER trg_perfis_updated_at BEFORE UPDATE ON public.perfis
    FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

DROP TRIGGER IF EXISTS trg_clientes_updated_at ON public.clientes;
CREATE TRIGGER trg_clientes_updated_at BEFORE UPDATE ON public.clientes
    FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

DROP TRIGGER IF EXISTS trg_projetos_updated_at ON public.projetos;
CREATE TRIGGER trg_projetos_updated_at BEFORE UPDATE ON public.projetos
    FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

DROP TRIGGER IF EXISTS trg_tarefas_updated_at ON public.tarefas;
CREATE TRIGGER trg_tarefas_updated_at BEFORE UPDATE ON public.tarefas
    FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

DROP TRIGGER IF EXISTS trg_apontamentos_updated_at ON public.apontamentos_horas;
CREATE TRIGGER trg_apontamentos_updated_at BEFORE UPDATE ON public.apontamentos_horas
    FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

-- Trigger para sincronizar novo usuário do Supabase Auth para a tabela pública de perfis
CREATE OR REPLACE FUNCTION public.fn_handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.perfis (
        id,
        email,
        nome_completo,
        tenant_id,
        nivel_acesso,
        status
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'nome_completo', split_part(NEW.email, '@', 1)),
        (NEW.raw_user_meta_data->>'tenant_id')::UUID,
        COALESCE((NEW.raw_user_meta_data->>'nivel_acesso')::nivel_acesso_enum, 'operador'::nivel_acesso_enum),
        'ativo'::status_usuario_enum
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.fn_handle_new_auth_user();

-- Trigger de Auditoria Automática para Tabela de Tarefas e Projetos
CREATE OR REPLACE FUNCTION public.fn_audit_trail_logger()
RETURNS TRIGGER AS $$
DECLARE
    v_tenant_id UUID;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        v_tenant_id := OLD.tenant_id;
        INSERT INTO public.logs_auditoria (
            tenant_id,
            usuario_id,
            acao,
            nome_tabela,
            registro_id,
            dados_anteriores,
            dados_novos
        ) VALUES (
            v_tenant_id,
            auth.uid(),
            TG_OP,
            TG_TABLE_NAME,
            OLD.id,
            to_jsonb(OLD),
            NULL
        );
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        v_tenant_id := NEW.tenant_id;
        INSERT INTO public.logs_auditoria (
            tenant_id,
            usuario_id,
            acao,
            nome_tabela,
            registro_id,
            dados_anteriores,
            dados_novos
        ) VALUES (
            v_tenant_id,
            auth.uid(),
            TG_OP,
            TG_TABLE_NAME,
            NEW.id,
            to_jsonb(OLD),
            to_jsonb(NEW)
        );
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        v_tenant_id := NEW.tenant_id;
        INSERT INTO public.logs_auditoria (
            tenant_id,
            usuario_id,
            acao,
            nome_tabela,
            registro_id,
            dados_anteriores,
            dados_novos
        ) VALUES (
            v_tenant_id,
            auth.uid(),
            TG_OP,
            TG_TABLE_NAME,
            NEW.id,
            NULL,
            to_jsonb(NEW)
        );
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- 7. ATIVAÇÃO DE ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------------------------

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apontamentos_horas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs_auditoria ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 8. POLÍTICAS DE RLS PARA OS 4 NÍVEIS DE ACESSO
--    Nível 1 (Superadmin) | Nível 2 (Admin) | Nível 3 (Gestor) | Nível 4 (Operador)
-- ------------------------------------------------------------------------------

-- ==============================================================================
-- 8.1 POLÍTICAS PARA A TABELA: TENANTS
-- ==============================================================================

-- Superadmin: Acesso irrestrito a todos os tenants
CREATE POLICY "tenants_superadmin_all" ON public.tenants
    FOR ALL
    TO authenticated
    USING (public.fn_is_superadmin())
    WITH CHECK (public.fn_is_superadmin());

-- Admin, Gestor e Operador: Visualizar somente o seu próprio tenant
CREATE POLICY "tenants_members_select" ON public.tenants
    FOR SELECT
    TO authenticated
    USING (id = public.fn_get_auth_tenant_id());

-- Admin: Atualizar configurações da sua organização
CREATE POLICY "tenants_admin_update" ON public.tenants
    FOR UPDATE
    TO authenticated
    USING (id = public.fn_get_auth_tenant_id() AND public.fn_is_admin_or_higher())
    WITH CHECK (id = public.fn_get_auth_tenant_id() AND public.fn_is_admin_or_higher());

-- ==============================================================================
-- 8.2 POLÍTICAS PARA A TABELA: PERFIS
-- ==============================================================================

-- Superadmin: Gerenciamento total de perfis de todos os tenants
CREATE POLICY "perfis_superadmin_all" ON public.perfis
    FOR ALL
    TO authenticated
    USING (public.fn_is_superadmin())
    WITH CHECK (public.fn_is_superadmin());

-- Todos os membros do mesmo tenant podem visualizar os colegas de equipe
CREATE POLICY "perfis_tenant_select" ON public.perfis
    FOR SELECT
    TO authenticated
    USING (tenant_id = public.fn_get_auth_tenant_id());

-- Usuário pode atualizar seus próprios dados de perfil (avatar, telefone, preferências)
CREATE POLICY "perfis_user_update_self" ON public.perfis
    FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (
        id = auth.uid() 
        AND nivel_acesso = (SELECT p.nivel_acesso FROM public.perfis p WHERE p.id = auth.uid())
        AND tenant_id = (SELECT p.tenant_id FROM public.perfis p WHERE p.id = auth.uid())
    );

-- Admin: Criar, atualizar e gerenciar perfis dentro do seu tenant (exceto criar superadmin)
CREATE POLICY "perfis_admin_insert" ON public.perfis
    FOR INSERT
    TO authenticated
    WITH CHECK (
        public.fn_is_admin_or_higher() 
        AND tenant_id = public.fn_get_auth_tenant_id()
        AND nivel_acesso != 'superadmin'
    );

CREATE POLICY "perfis_admin_update" ON public.perfis
    FOR UPDATE
    TO authenticated
    USING (
        public.fn_is_admin_or_higher() 
        AND tenant_id = public.fn_get_auth_tenant_id()
    )
    WITH CHECK (
        public.fn_is_admin_or_higher() 
        AND tenant_id = public.fn_get_auth_tenant_id()
        AND nivel_acesso != 'superadmin'
    );

CREATE POLICY "perfis_admin_delete" ON public.perfis
    FOR DELETE
    TO authenticated
    USING (
        public.fn_is_admin_or_higher() 
        AND tenant_id = public.fn_get_auth_tenant_id()
        AND id != auth.uid() -- Impede auto-exclusão acidental
    );

-- ==============================================================================
-- 8.3 POLÍTICAS PARA A TABELA: DEPARTAMENTOS
-- ==============================================================================

-- Superadmin
CREATE POLICY "departamentos_superadmin_all" ON public.departamentos
    FOR ALL
    TO authenticated
    USING (public.fn_is_superadmin())
    WITH CHECK (public.fn_is_superadmin());

-- Todos os membros do tenant podem visualizar os departamentos da empresa
CREATE POLICY "departamentos_members_select" ON public.departamentos
    FOR SELECT
    TO authenticated
    USING (tenant_id = public.fn_get_auth_tenant_id());

-- Admin: Gestão completa de departamentos
CREATE POLICY "departamentos_admin_all" ON public.departamentos
    FOR ALL
    TO authenticated
    USING (
        public.fn_is_admin_or_higher() 
        AND tenant_id = public.fn_get_auth_tenant_id()
    )
    WITH CHECK (
        public.fn_is_admin_or_higher() 
        AND tenant_id = public.fn_get_auth_tenant_id()
    );

-- Gestor: Pode atualizar dados do departamento do qual é gestor_id
CREATE POLICY "departamentos_gestor_update" ON public.departamentos
    FOR UPDATE
    TO authenticated
    USING (
        public.fn_is_gestor_or_higher() 
        AND tenant_id = public.fn_get_auth_tenant_id()
        AND gestor_id = auth.uid()
    )
    WITH CHECK (
        public.fn_is_gestor_or_higher() 
        AND tenant_id = public.fn_get_auth_tenant_id()
        AND gestor_id = auth.uid()
    );

-- ==============================================================================
-- 8.4 POLÍTICAS PARA A TABELA: CLIENTES
-- ==============================================================================

-- Superadmin
CREATE POLICY "clientes_superadmin_all" ON public.clientes
    FOR ALL
    TO authenticated
    USING (public.fn_is_superadmin())
    WITH CHECK (public.fn_is_superadmin());

-- Todos os colaboradores do tenant podem consultar clientes
CREATE POLICY "clientes_members_select" ON public.clientes
    FOR SELECT
    TO authenticated
    USING (tenant_id = public.fn_get_auth_tenant_id());

-- Admin & Gestor: Criar e atualizar clientes
CREATE POLICY "clientes_gestor_admin_insert" ON public.clientes
    FOR INSERT
    TO authenticated
    WITH CHECK (
        public.fn_is_gestor_or_higher() 
        AND tenant_id = public.fn_get_auth_tenant_id()
    );

CREATE POLICY "clientes_gestor_admin_update" ON public.clientes
    FOR UPDATE
    TO authenticated
    USING (
        public.fn_is_gestor_or_higher() 
        AND tenant_id = public.fn_get_auth_tenant_id()
    )
    WITH CHECK (
        public.fn_is_gestor_or_higher() 
        AND tenant_id = public.fn_get_auth_tenant_id()
    );

-- Apenas Admin pode remover clientes
CREATE POLICY "clientes_admin_delete" ON public.clientes
    FOR DELETE
    TO authenticated
    USING (
        public.fn_is_admin_or_higher() 
        AND tenant_id = public.fn_get_auth_tenant_id()
    );

-- ==============================================================================
-- 8.5 POLÍTICAS PARA A TABELA: PROJETOS
-- ==============================================================================

-- Superadmin
CREATE POLICY "projetos_superadmin_all" ON public.projetos
    FOR ALL
    TO authenticated
    USING (public.fn_is_superadmin())
    WITH CHECK (public.fn_is_superadmin());

-- Admin e Gestor: Visualizar todos os projetos do seu tenant
CREATE POLICY "projetos_gestor_admin_select" ON public.projetos
    FOR SELECT
    TO authenticated
    USING (
        public.fn_is_gestor_or_higher() 
        AND tenant_id = public.fn_get_auth_tenant_id()
    );

-- Operador: Visualizar apenas projetos onde participa via tarefas atribuídas ou como criador
CREATE POLICY "projetos_operador_select" ON public.projetos
    FOR SELECT
    TO authenticated
    USING (
        public.fn_get_auth_nivel_acesso() = 'operador'
        AND tenant_id = public.fn_get_auth_tenant_id()
        AND (
            created_by = auth.uid()
            OR gestor_id = auth.uid()
            OR EXISTS (
                SELECT 1 
                FROM public.tarefas t 
                WHERE t.projeto_id = projetos.id 
                  AND t.atribuido_para = auth.uid()
            )
        )
    );

-- Admin e Gestor: Criar projetos para o seu tenant
CREATE POLICY "projetos_gestor_admin_insert" ON public.projetos
    FOR INSERT
    TO authenticated
    WITH CHECK (
        public.fn_is_gestor_or_higher() 
        AND tenant_id = public.fn_get_auth_tenant_id()
    );

-- Admin: Atualização irrestrita de projetos do tenant
CREATE POLICY "projetos_admin_update" ON public.projetos
    FOR UPDATE
    TO authenticated
    USING (
        public.fn_is_admin_or_higher() 
        AND tenant_id = public.fn_get_auth_tenant_id()
    )
    WITH CHECK (
        public.fn_is_admin_or_higher() 
        AND tenant_id = public.fn_get_auth_tenant_id()
    );

-- Gestor: Atualizar projetos dos quais é gestor responsável ou do seu departamento
CREATE POLICY "projetos_gestor_update" ON public.projetos
    FOR UPDATE
    TO authenticated
    USING (
        public.fn_get_auth_nivel_acesso() = 'gestor'
        AND tenant_id = public.fn_get_auth_tenant_id()
        AND (
            gestor_id = auth.uid() 
            OR created_by = auth.uid()
            OR departamento_id IN (SELECT d.id FROM public.departamentos d WHERE d.gestor_id = auth.uid())
        )
    )
    WITH CHECK (
        public.fn_get_auth_nivel_acesso() = 'gestor'
        AND tenant_id = public.fn_get_auth_tenant_id()
    );

-- Apenas Admin pode excluir projetos
CREATE POLICY "projetos_admin_delete" ON public.projetos
    FOR DELETE
    TO authenticated
    USING (
        public.fn_is_admin_or_higher() 
        AND tenant_id = public.fn_get_auth_tenant_id()
    );

-- ==============================================================================
-- 8.6 POLÍTICAS PARA A TABELA: TAREFAS
-- ==============================================================================

-- Superadmin
CREATE POLICY "tarefas_superadmin_all" ON public.tarefas
    FOR ALL
    TO authenticated
    USING (public.fn_is_superadmin())
    WITH CHECK (public.fn_is_superadmin());

-- Admin e Gestor: Visualizar todas as tarefas do tenant
CREATE POLICY "tarefas_gestor_admin_select" ON public.tarefas
    FOR SELECT
    TO authenticated
    USING (
        public.fn_is_gestor_or_higher() 
        AND tenant_id = public.fn_get_auth_tenant_id()
    );

-- Operador: Visualizar tarefas atribuídas a ele ou criadas por ele
CREATE POLICY "tarefas_operador_select" ON public.tarefas
    FOR SELECT
    TO authenticated
    USING (
        public.fn_get_auth_nivel_acesso() = 'operador'
        AND tenant_id = public.fn_get_auth_tenant_id()
        AND (atribuido_para = auth.uid() OR created_by = auth.uid())
    );

-- Admin e Gestor: Criar tarefas no tenant
CREATE POLICY "tarefas_gestor_admin_insert" ON public.tarefas
    FOR INSERT
    TO authenticated
    WITH CHECK (
        public.fn_is_gestor_or_higher() 
        AND tenant_id = public.fn_get_auth_tenant_id()
    );

-- Admin e Gestor: Atualização completa de tarefas no tenant
CREATE POLICY "tarefas_gestor_admin_update" ON public.tarefas
    FOR UPDATE
    TO authenticated
    USING (
        public.fn_is_gestor_or_higher() 
        AND tenant_id = public.fn_get_auth_tenant_id()
    )
    WITH CHECK (
        public.fn_is_gestor_or_higher() 
        AND tenant_id = public.fn_get_auth_tenant_id()
    );

-- Operador: Pode atualizar status e progresso da tarefa atribuída a ele
CREATE POLICY "tarefas_operador_update" ON public.tarefas
    FOR UPDATE
    TO authenticated
    USING (
        public.fn_get_auth_nivel_acesso() = 'operador'
        AND tenant_id = public.fn_get_auth_tenant_id()
        AND atribuido_para = auth.uid()
    )
    WITH CHECK (
        public.fn_get_auth_nivel_acesso() = 'operador'
        AND tenant_id = public.fn_get_auth_tenant_id()
        AND atribuido_para = auth.uid()
    );

-- Apenas Admin e Gestor podem deletar tarefas
CREATE POLICY "tarefas_gestor_admin_delete" ON public.tarefas
    FOR DELETE
    TO authenticated
    USING (
        public.fn_is_gestor_or_higher() 
        AND tenant_id = public.fn_get_auth_tenant_id()
    );

-- ==============================================================================
-- 8.7 POLÍTICAS PARA A TABELA: APONTAMENTOS DE HORAS
-- ==============================================================================

-- Superadmin
CREATE POLICY "apontamentos_superadmin_all" ON public.apontamentos_horas
    FOR ALL
    TO authenticated
    USING (public.fn_is_superadmin())
    WITH CHECK (public.fn_is_superadmin());

-- Admin e Gestor: Visualizar todos os lançamentos do tenant
CREATE POLICY "apontamentos_gestor_admin_select" ON public.apontamentos_horas
    FOR SELECT
    TO authenticated
    USING (
        public.fn_is_gestor_or_higher() 
        AND tenant_id = public.fn_get_auth_tenant_id()
    );

-- Operador: Visualizar apenas os seus próprios apontamentos
CREATE POLICY "apontamentos_operador_select" ON public.apontamentos_horas
    FOR SELECT
    TO authenticated
    USING (
        public.fn_get_auth_nivel_acesso() = 'operador'
        AND tenant_id = public.fn_get_auth_tenant_id()
        AND usuario_id = auth.uid()
    );

-- Operador, Gestor e Admin: Inserir apontamentos para si mesmo em tarefas do seu tenant
CREATE POLICY "apontamentos_user_insert" ON public.apontamentos_horas
    FOR INSERT
    TO authenticated
    WITH CHECK (
        tenant_id = public.fn_get_auth_tenant_id()
        AND usuario_id = auth.uid()
        AND status_aprovacao = 'pendente' -- Sempre nasce pendente de validação
        AND EXISTS (
            SELECT 1 FROM public.tarefas t 
            WHERE t.id = tarefa_id 
              AND t.tenant_id = public.fn_get_auth_tenant_id()
        )
    );

-- Operador: Pode editar seu próprio apontamento apenas enquanto estiver pendente
CREATE POLICY "apontamentos_operador_update_own" ON public.apontamentos_horas
    FOR UPDATE
    TO authenticated
    USING (
        public.fn_get_auth_nivel_acesso() = 'operador'
        AND tenant_id = public.fn_get_auth_tenant_id()
        AND usuario_id = auth.uid()
        AND status_aprovacao = 'pendente'
    )
    WITH CHECK (
        public.fn_get_auth_nivel_acesso() = 'operador'
        AND tenant_id = public.fn_get_auth_tenant_id()
        AND usuario_id = auth.uid()
        AND status_aprovacao = 'pendente'
    );

-- Gestor e Admin: Aprovar, reprovar e gerenciar apontamentos do tenant
CREATE POLICY "apontamentos_gestor_admin_update" ON public.apontamentos_horas
    FOR UPDATE
    TO authenticated
    USING (
        public.fn_is_gestor_or_higher() 
        AND tenant_id = public.fn_get_auth_tenant_id()
    )
    WITH CHECK (
        public.fn_is_gestor_or_higher() 
        AND tenant_id = public.fn_get_auth_tenant_id()
    );

-- Operador pode deletar apenas se estiver pendente; Gestor/Admin podem deletar no tenant
CREATE POLICY "apontamentos_delete" ON public.apontamentos_horas
    FOR DELETE
    TO authenticated
    USING (
        (public.fn_is_gestor_or_higher() AND tenant_id = public.fn_get_auth_tenant_id())
        OR (usuario_id = auth.uid() AND status_aprovacao = 'pendente' AND tenant_id = public.fn_get_auth_tenant_id())
    );

-- ==============================================================================
-- 8.8 POLÍTICAS PARA A TABELA: LOGS DE AUDITORIA
-- ==============================================================================

-- Superadmin: Visualiza todos os logs de auditoria
CREATE POLICY "auditoria_superadmin_select" ON public.logs_auditoria
    FOR SELECT
    TO authenticated
    USING (public.fn_is_superadmin());

-- Admin: Visualiza logs de auditoria exclusivos do seu tenant
CREATE POLICY "auditoria_admin_select" ON public.logs_auditoria
    FOR SELECT
    TO authenticated
    USING (
        public.fn_is_admin_or_higher() 
        AND tenant_id = public.fn_get_auth_tenant_id()
    );

-- Gestor: Visualiza logs do seu tenant referente a projetos e tarefas
CREATE POLICY "auditoria_gestor_select" ON public.logs_auditoria
    FOR SELECT
    TO authenticated
    USING (
        public.fn_get_auth_nivel_acesso() = 'gestor'
        AND tenant_id = public.fn_get_auth_tenant_id()
        AND nome_tabela IN ('projetos', 'tarefas', 'apontamentos_horas')
    );

-- Ninguém pode atualizar ou deletar logs de auditoria (Imutabilidade de Compliance)
-- (Não existem políticas de UPDATE/DELETE concedidas a usuários normais)

-- Inserção de logs pelo sistema / triggers
CREATE POLICY "auditoria_system_insert" ON public.logs_auditoria
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 9. DADOS DE TESTE E EXEMPLO (SEEDS PARA DEMONSTRAÇÃO)
-- ------------------------------------------------------------------------------

-- Inserção de Tenant Exemplo
INSERT INTO public.tenants (
    id,
    cnpj,
    razao_social,
    nome_fantasia,
    slug,
    plano,
    status
) VALUES 
(
    'a0000000-0000-0000-0000-000000000001'::uuid,
    '12.345.678/0001-90',
    'Vértice Engenharia e Tecnologia S.A.',
    'Vértice Tech',
    'vertice-tech',
    'enterprise',
    'ativo'
),
(
    'a0000000-0000-0000-0000-000000000002'::uuid,
    '98.765.432/0001-10',
    'Nexus Soluções Corporativas Ltda',
    'Nexus Corp',
    'nexus-corp',
    'pro',
    'ativo'
)
ON CONFLICT (id) DO NOTHING;

-- Inserção de Departamentos
INSERT INTO public.departamentos (
    id,
    tenant_id,
    nome,
    codigo,
    descricao,
    orcamento_anual
) VALUES 
(
    'b0000000-0000-0000-0000-000000000001'::uuid,
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'Engenharia de Software',
    'ENG-TI',
    'Desenvolvimento de sistemas e infraestrutura em nuvem',
    450000.00
),
(
    'b0000000-0000-0000-0000-000000000002'::uuid,
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'Operações e Projetos',
    'OPS-PMO',
    'Planejamento, implantação e entrega técnica aos clientes',
    280000.00
)
ON CONFLICT DO NOTHING;

-- ==============================================================================
-- FIM DO SCRIPT DE ARQUITETURA DE BANCO DE DADOS DA PLATAFORMA VÉRTICE (ETAPA 1)
-- ==============================================================================
