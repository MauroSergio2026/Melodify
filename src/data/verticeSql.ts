export interface SqlSection {
  id: string;
  title: string;
  category: 'extensions' | 'enums' | 'tables' | 'indexes' | 'functions' | 'triggers' | 'rls_activation' | 'rls_policies' | 'seeds';
  description: string;
  sql: string;
}

export const VERTICE_SQL_FULL = `-- ==============================================================================
-- PLATAFORMA VÉRTICE - ETAPA 1: ARQUITETURA DE BANCO DE DADOS POSTGRESQL / SUPABASE
-- Script DDL Completo com ENUMs, Tabelas, Foreign Keys, Índices, Triggers e RLS
-- Níveis de Acesso (RBAC): Superadmin (1), Admin (2), Gestor (3), Operador (4)
-- Versão: 1.0.0
-- ==============================================================================

-- 1. EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS (TIPOS CUSTOMIZADOS)
DO $$ BEGIN
    CREATE TYPE nivel_acesso_enum AS ENUM (
        'superadmin',  -- Nível 1: Acesso global irrestrito
        'admin',       -- Nível 2: Administrador da organização/tenant
        'gestor',      -- Nível 3: Gestor operacional e de projetos
        'operador'     -- Nível 4: Executor operacional
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE status_geral_enum AS ENUM ('ativo', 'inativo', 'suspenso', 'cancelado');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE status_usuario_enum AS ENUM ('ativo', 'inativo', 'pendente', 'bloqueado');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE tipo_plano_enum AS ENUM ('starter', 'pro', 'enterprise', 'custom');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE prioridade_enum AS ENUM ('baixa', 'media', 'alta', 'critica');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE status_projeto_enum AS ENUM ('planejamento', 'em_andamento', 'em_revisao', 'pausado', 'concluido', 'cancelado');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE status_tarefa_enum AS ENUM ('pendente', 'em_execucao', 'aguardando_aprovacao', 'concluida', 'bloqueada', 'cancelada');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE status_aprovacao_enum AS ENUM ('pendente', 'aprovado', 'rejeitado');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. TABELAS ESSENCIAIS

-- 3.1: Tenants (Multi-tenant master)
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

-- 3.2: Departamentos
CREATE TABLE IF NOT EXISTS public.departamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    codigo VARCHAR(20),
    descricao TEXT,
    orcamento_anual NUMERIC(15,2) DEFAULT 0.00,
    gestor_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_departamento_tenant_nome UNIQUE (tenant_id, nome)
);

-- 3.3: Perfis (Extensão de auth.users com RBAC)
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

ALTER TABLE public.departamentos 
    DROP CONSTRAINT IF EXISTS fk_departamentos_gestor,
    ADD CONSTRAINT fk_departamentos_gestor 
    FOREIGN KEY (gestor_id) REFERENCES public.perfis(id) ON DELETE SET NULL;

-- 3.4: Clientes
CREATE TABLE IF NOT EXISTS public.clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    razao_social VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255),
    documento VARCHAR(20) NOT NULL,
    email_contato VARCHAR(255),
    telefone VARCHAR(20),
    endereco_completo JSONB DEFAULT '{}'::jsonb,
    status status_geral_enum NOT NULL DEFAULT 'ativo',
    responsavel_id UUID REFERENCES public.perfis(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_cliente_tenant_documento UNIQUE (tenant_id, documento)
);

-- 3.5: Projetos
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

-- 3.6: Tarefas
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

-- 3.7: Apontamentos de Horas
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

-- 3.8: Logs de Auditoria
CREATE TABLE IF NOT EXISTS public.logs_auditoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES public.perfis(id) ON DELETE SET NULL,
    acao VARCHAR(50) NOT NULL,
    nome_tabela VARCHAR(50) NOT NULL,
    registro_id UUID,
    dados_anteriores JSONB,
    dados_novos JSONB,
    ip_origem INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. ÍNDICES DE PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_tenants_status ON public.tenants(status);
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON public.tenants(slug);

CREATE INDEX IF NOT EXISTS idx_perfis_tenant_id ON public.perfis(tenant_id);
CREATE INDEX IF NOT EXISTS idx_perfis_nivel_acesso ON public.perfis(nivel_acesso);
CREATE INDEX IF NOT EXISTS idx_perfis_departamento_id ON public.perfis(departamento_id);
CREATE INDEX IF NOT EXISTS idx_perfis_tenant_status ON public.perfis(tenant_id, status);

CREATE INDEX IF NOT EXISTS idx_departamentos_tenant_id ON public.departamentos(tenant_id);
CREATE INDEX IF NOT EXISTS idx_departamentos_gestor_id ON public.departamentos(gestor_id);

CREATE INDEX IF NOT EXISTS idx_clientes_tenant_id ON public.clientes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_clientes_responsavel_id ON public.clientes(responsavel_id);

CREATE INDEX IF NOT EXISTS idx_projetos_tenant_id ON public.projetos(tenant_id);
CREATE INDEX IF NOT EXISTS idx_projetos_gestor_id ON public.projetos(gestor_id);
CREATE INDEX IF NOT EXISTS idx_projetos_cliente_id ON public.projetos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_projetos_status ON public.projetos(status);
CREATE INDEX IF NOT EXISTS idx_projetos_tenant_status ON public.projetos(tenant_id, status);

CREATE INDEX IF NOT EXISTS idx_tarefas_tenant_id ON public.tarefas(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_projeto_id ON public.tarefas(projeto_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_atribuido_para ON public.tarefas(atribuido_para);
CREATE INDEX IF NOT EXISTS idx_tarefas_created_by ON public.tarefas(created_by);
CREATE INDEX IF NOT EXISTS idx_tarefas_status ON public.tarefas(status);
CREATE INDEX IF NOT EXISTS idx_tarefas_tenant_atribuido ON public.tarefas(tenant_id, atribuido_para);

CREATE INDEX IF NOT EXISTS idx_apontamentos_tenant_id ON public.apontamentos_horas(tenant_id);
CREATE INDEX IF NOT EXISTS idx_apontamentos_tarefa_id ON public.apontamentos_horas(tarefa_id);
CREATE INDEX IF NOT EXISTS idx_apontamentos_usuario_id ON public.apontamentos_horas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_apontamentos_data_trabalho ON public.apontamentos_horas(data_trabalho);
CREATE INDEX IF NOT EXISTS idx_apontamentos_tenant_usuario ON public.apontamentos_horas(tenant_id, usuario_id);

CREATE INDEX IF NOT EXISTS idx_auditoria_tenant_id ON public.logs_auditoria(tenant_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario_id ON public.logs_auditoria(usuario_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_tabela_registro ON public.logs_auditoria(nome_tabela, registro_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_created_at ON public.logs_auditoria(created_at DESC);

-- 5. FUNÇÕES AUXILIARES DE RLS
CREATE OR REPLACE FUNCTION public.fn_get_auth_tenant_id()
RETURNS UUID AS $$
    SELECT tenant_id 
    FROM public.perfis 
    WHERE id = auth.uid()
    LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.fn_get_auth_nivel_acesso()
RETURNS nivel_acesso_enum AS $$
    SELECT nivel_acesso 
    FROM public.perfis 
    WHERE id = auth.uid()
    LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

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

-- 6. TRIGGERS AUTOMÁTICOS
CREATE OR REPLACE FUNCTION public.fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

-- 7. ATIVAÇÃO DE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apontamentos_horas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs_auditoria ENABLE ROW LEVEL SECURITY;

-- 8. POLÍTICAS DE RLS PARA OS 4 NÍVEIS DE ACESSO

-- 8.1 TENANTS
CREATE POLICY "tenants_superadmin_all" ON public.tenants
    FOR ALL TO authenticated
    USING (public.fn_is_superadmin())
    WITH CHECK (public.fn_is_superadmin());

CREATE POLICY "tenants_members_select" ON public.tenants
    FOR SELECT TO authenticated
    USING (id = public.fn_get_auth_tenant_id());

CREATE POLICY "tenants_admin_update" ON public.tenants
    FOR UPDATE TO authenticated
    USING (id = public.fn_get_auth_tenant_id() AND public.fn_is_admin_or_higher())
    WITH CHECK (id = public.fn_get_auth_tenant_id() AND public.fn_is_admin_or_higher());

-- 8.2 PERFIS
CREATE POLICY "perfis_superadmin_all" ON public.perfis
    FOR ALL TO authenticated
    USING (public.fn_is_superadmin())
    WITH CHECK (public.fn_is_superadmin());

CREATE POLICY "perfis_tenant_select" ON public.perfis
    FOR SELECT TO authenticated
    USING (tenant_id = public.fn_get_auth_tenant_id());

CREATE POLICY "perfis_user_update_self" ON public.perfis
    FOR UPDATE TO authenticated
    USING (id = auth.uid())
    WITH CHECK (
        id = auth.uid() 
        AND nivel_acesso = (SELECT p.nivel_acesso FROM public.perfis p WHERE p.id = auth.uid())
        AND tenant_id = (SELECT p.tenant_id FROM public.perfis p WHERE p.id = auth.uid())
    );

CREATE POLICY "perfis_admin_insert" ON public.perfis
    FOR INSERT TO authenticated
    WITH CHECK (
        public.fn_is_admin_or_higher() 
        AND tenant_id = public.fn_get_auth_tenant_id()
        AND nivel_acesso != 'superadmin'
    );

CREATE POLICY "perfis_admin_update" ON public.perfis
    FOR UPDATE TO authenticated
    USING (public.fn_is_admin_or_higher() AND tenant_id = public.fn_get_auth_tenant_id())
    WITH CHECK (
        public.fn_is_admin_or_higher() 
        AND tenant_id = public.fn_get_auth_tenant_id()
        AND nivel_acesso != 'superadmin'
    );

CREATE POLICY "perfis_admin_delete" ON public.perfis
    FOR DELETE TO authenticated
    USING (public.fn_is_admin_or_higher() AND tenant_id = public.fn_get_auth_tenant_id() AND id != auth.uid());

-- 8.3 DEPARTAMENTOS
CREATE POLICY "departamentos_superadmin_all" ON public.departamentos
    FOR ALL TO authenticated
    USING (public.fn_is_superadmin())
    WITH CHECK (public.fn_is_superadmin());

CREATE POLICY "departamentos_members_select" ON public.departamentos
    FOR SELECT TO authenticated
    USING (tenant_id = public.fn_get_auth_tenant_id());

CREATE POLICY "departamentos_admin_all" ON public.departamentos
    FOR ALL TO authenticated
    USING (public.fn_is_admin_or_higher() AND tenant_id = public.fn_get_auth_tenant_id())
    WITH CHECK (public.fn_is_admin_or_higher() AND tenant_id = public.fn_get_auth_tenant_id());

CREATE POLICY "departamentos_gestor_update" ON public.departamentos
    FOR UPDATE TO authenticated
    USING (public.fn_is_gestor_or_higher() AND tenant_id = public.fn_get_auth_tenant_id() AND gestor_id = auth.uid())
    WITH CHECK (public.fn_is_gestor_or_higher() AND tenant_id = public.fn_get_auth_tenant_id() AND gestor_id = auth.uid());

-- 8.4 CLIENTES
CREATE POLICY "clientes_superadmin_all" ON public.clientes
    FOR ALL TO authenticated
    USING (public.fn_is_superadmin())
    WITH CHECK (public.fn_is_superadmin());

CREATE POLICY "clientes_members_select" ON public.clientes
    FOR SELECT TO authenticated
    USING (tenant_id = public.fn_get_auth_tenant_id());

CREATE POLICY "clientes_gestor_admin_insert" ON public.clientes
    FOR INSERT TO authenticated
    WITH CHECK (public.fn_is_gestor_or_higher() AND tenant_id = public.fn_get_auth_tenant_id());

CREATE POLICY "clientes_gestor_admin_update" ON public.clientes
    FOR UPDATE TO authenticated
    USING (public.fn_is_gestor_or_higher() AND tenant_id = public.fn_get_auth_tenant_id())
    WITH CHECK (public.fn_is_gestor_or_higher() AND tenant_id = public.fn_get_auth_tenant_id());

CREATE POLICY "clientes_admin_delete" ON public.clientes
    FOR DELETE TO authenticated
    USING (public.fn_is_admin_or_higher() AND tenant_id = public.fn_get_auth_tenant_id());

-- 8.5 PROJETOS
CREATE POLICY "projetos_superadmin_all" ON public.projetos
    FOR ALL TO authenticated
    USING (public.fn_is_superadmin())
    WITH CHECK (public.fn_is_superadmin());

CREATE POLICY "projetos_gestor_admin_select" ON public.projetos
    FOR SELECT TO authenticated
    USING (public.fn_is_gestor_or_higher() AND tenant_id = public.fn_get_auth_tenant_id());

CREATE POLICY "projetos_operador_select" ON public.projetos
    FOR SELECT TO authenticated
    USING (
        public.fn_get_auth_nivel_acesso() = 'operador'
        AND tenant_id = public.fn_get_auth_tenant_id()
        AND (
            created_by = auth.uid()
            OR gestor_id = auth.uid()
            OR EXISTS (
                SELECT 1 FROM public.tarefas t 
                WHERE t.projeto_id = projetos.id 
                  AND t.atribuido_para = auth.uid()
            )
        )
    );

CREATE POLICY "projetos_gestor_admin_insert" ON public.projetos
    FOR INSERT TO authenticated
    WITH CHECK (public.fn_is_gestor_or_higher() AND tenant_id = public.fn_get_auth_tenant_id());

CREATE POLICY "projetos_admin_update" ON public.projetos
    FOR UPDATE TO authenticated
    USING (public.fn_is_admin_or_higher() AND tenant_id = public.fn_get_auth_tenant_id())
    WITH CHECK (public.fn_is_admin_or_higher() AND tenant_id = public.fn_get_auth_tenant_id());

CREATE POLICY "projetos_gestor_update" ON public.projetos
    FOR UPDATE TO authenticated
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

CREATE POLICY "projetos_admin_delete" ON public.projetos
    FOR DELETE TO authenticated
    USING (public.fn_is_admin_or_higher() AND tenant_id = public.fn_get_auth_tenant_id());

-- 8.6 TAREFAS
CREATE POLICY "tarefas_superadmin_all" ON public.tarefas
    FOR ALL TO authenticated
    USING (public.fn_is_superadmin())
    WITH CHECK (public.fn_is_superadmin());

CREATE POLICY "tarefas_gestor_admin_select" ON public.tarefas
    FOR SELECT TO authenticated
    USING (public.fn_is_gestor_or_higher() AND tenant_id = public.fn_get_auth_tenant_id());

CREATE POLICY "tarefas_operador_select" ON public.tarefas
    FOR SELECT TO authenticated
    USING (
        public.fn_get_auth_nivel_acesso() = 'operador'
        AND tenant_id = public.fn_get_auth_tenant_id()
        AND (atribuido_para = auth.uid() OR created_by = auth.uid())
    );

CREATE POLICY "tarefas_gestor_admin_insert" ON public.tarefas
    FOR INSERT TO authenticated
    WITH CHECK (public.fn_is_gestor_or_higher() AND tenant_id = public.fn_get_auth_tenant_id());

CREATE POLICY "tarefas_gestor_admin_update" ON public.tarefas
    FOR UPDATE TO authenticated
    USING (public.fn_is_gestor_or_higher() AND tenant_id = public.fn_get_auth_tenant_id())
    WITH CHECK (public.fn_is_gestor_or_higher() AND tenant_id = public.fn_get_auth_tenant_id());

CREATE POLICY "tarefas_operador_update" ON public.tarefas
    FOR UPDATE TO authenticated
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

CREATE POLICY "tarefas_gestor_admin_delete" ON public.tarefas
    FOR DELETE TO authenticated
    USING (public.fn_is_gestor_or_higher() AND tenant_id = public.fn_get_auth_tenant_id());

-- 8.7 APONTAMENTOS DE HORAS
CREATE POLICY "apontamentos_superadmin_all" ON public.apontamentos_horas
    FOR ALL TO authenticated
    USING (public.fn_is_superadmin())
    WITH CHECK (public.fn_is_superadmin());

CREATE POLICY "apontamentos_gestor_admin_select" ON public.apontamentos_horas
    FOR SELECT TO authenticated
    USING (public.fn_is_gestor_or_higher() AND tenant_id = public.fn_get_auth_tenant_id());

CREATE POLICY "apontamentos_operador_select" ON public.apontamentos_horas
    FOR SELECT TO authenticated
    USING (
        public.fn_get_auth_nivel_acesso() = 'operador'
        AND tenant_id = public.fn_get_auth_tenant_id()
        AND usuario_id = auth.uid()
    );

CREATE POLICY "apontamentos_user_insert" ON public.apontamentos_horas
    FOR INSERT TO authenticated
    WITH CHECK (
        tenant_id = public.fn_get_auth_tenant_id()
        AND usuario_id = auth.uid()
        AND status_aprovacao = 'pendente'
        AND EXISTS (
            SELECT 1 FROM public.tarefas t 
            WHERE t.id = tarefa_id 
              AND t.tenant_id = public.fn_get_auth_tenant_id()
        )
    );

CREATE POLICY "apontamentos_operador_update_own" ON public.apontamentos_horas
    FOR UPDATE TO authenticated
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

CREATE POLICY "apontamentos_gestor_admin_update" ON public.apontamentos_horas
    FOR UPDATE TO authenticated
    USING (public.fn_is_gestor_or_higher() AND tenant_id = public.fn_get_auth_tenant_id())
    WITH CHECK (public.fn_is_gestor_or_higher() AND tenant_id = public.fn_get_auth_tenant_id());

CREATE POLICY "apontamentos_delete" ON public.apontamentos_horas
    FOR DELETE TO authenticated
    USING (
        (public.fn_is_gestor_or_higher() AND tenant_id = public.fn_get_auth_tenant_id())
        OR (usuario_id = auth.uid() AND status_aprovacao = 'pendente' AND tenant_id = public.fn_get_auth_tenant_id())
    );

-- 8.8 LOGS DE AUDITORIA
CREATE POLICY "auditoria_superadmin_select" ON public.logs_auditoria
    FOR SELECT TO authenticated
    USING (public.fn_is_superadmin());

CREATE POLICY "auditoria_admin_select" ON public.logs_auditoria
    FOR SELECT TO authenticated
    USING (public.fn_is_admin_or_higher() AND tenant_id = public.fn_get_auth_tenant_id());

CREATE POLICY "auditoria_gestor_select" ON public.logs_auditoria
    FOR SELECT TO authenticated
    USING (
        public.fn_get_auth_nivel_acesso() = 'gestor'
        AND tenant_id = public.fn_get_auth_tenant_id()
        AND nome_tabela IN ('projetos', 'tarefas', 'apontamentos_horas')
    );

CREATE POLICY "auditoria_system_insert" ON public.logs_auditoria
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- 9. DADOS DE TESTE (SEEDS)
INSERT INTO public.tenants (id, cnpj, razao_social, nome_fantasia, slug, plano, status)
VALUES 
    ('a0000000-0000-0000-0000-000000000001'::uuid, '12.345.678/0001-90', 'Vértice Engenharia e Tecnologia S.A.', 'Vértice Tech', 'vertice-tech', 'enterprise', 'ativo'),
    ('a0000000-0000-0000-0000-000000000002'::uuid, '98.765.432/0001-10', 'Nexus Soluções Corporativas Ltda', 'Nexus Corp', 'nexus-corp', 'pro', 'ativo')
ON CONFLICT (id) DO NOTHING;
`;

export const SQL_SECTIONS: SqlSection[] = [
  {
    id: 'sec-extensions',
    title: '1. Extensões do PostgreSQL',
    category: 'extensions',
    description: 'Habilita geradores criptográficos UUID e funções de hash essenciais.',
    sql: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";`
  },
  {
    id: 'sec-enums',
    title: '2. ENUMs & Tipos Customizados',
    category: 'enums',
    description: 'Define tipos fortemente tipados para níveis de acesso (RBAC), status operacional, prioridades e ciclo de vida.',
    sql: `CREATE TYPE nivel_acesso_enum AS ENUM ('superadmin', 'admin', 'gestor', 'operador');
CREATE TYPE status_geral_enum AS ENUM ('ativo', 'inativo', 'suspenso', 'cancelado');
CREATE TYPE status_usuario_enum AS ENUM ('ativo', 'inativo', 'pendente', 'bloqueado');
CREATE TYPE tipo_plano_enum AS ENUM ('starter', 'pro', 'enterprise', 'custom');
CREATE TYPE prioridade_enum AS ENUM ('baixa', 'media', 'alta', 'critica');
CREATE TYPE status_projeto_enum AS ENUM ('planejamento', 'em_andamento', 'em_revisao', 'pausado', 'concluido', 'cancelado');
CREATE TYPE status_tarefa_enum AS ENUM ('pendente', 'em_execucao', 'aguardando_aprovacao', 'concluida', 'bloqueada', 'cancelada');
CREATE TYPE status_aprovacao_enum AS ENUM ('pendente', 'aprovado', 'rejeitado');`
  },
  {
    id: 'sec-tables',
    title: '3. Tabelas Essenciais do Sistema',
    category: 'tables',
    description: 'Estrutura multi-tenant com tenants, perfis vinculados ao Supabase Auth, departamentos, clientes, projetos, tarefas, apontamentos e auditoria.',
    sql: `-- Tenants (Organizações)
CREATE TABLE public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cnpj VARCHAR(18) UNIQUE,
    razao_social VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    plano tipo_plano_enum NOT NULL DEFAULT 'starter',
    status status_geral_enum NOT NULL DEFAULT 'ativo',
    limite_usuarios INTEGER NOT NULL DEFAULT 10,
    configuracoes JSONB NOT NULL DEFAULT '{"notificacoes_email": true}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Departamentos
CREATE TABLE public.departamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    codigo VARCHAR(20),
    descricao TEXT,
    orcamento_anual NUMERIC(15,2) DEFAULT 0.00,
    gestor_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_departamento_tenant_nome UNIQUE (tenant_id, nome)
);

-- Perfis (RBAC & auth.users)
CREATE TABLE public.perfis (
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
    preferencias JSONB NOT NULL DEFAULT '{"idioma": "pt-BR"}'::jsonb,
    ultimo_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Clientes
CREATE TABLE public.clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    razao_social VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255),
    documento VARCHAR(20) NOT NULL,
    email_contato VARCHAR(255),
    telefone VARCHAR(20),
    endereco_completo JSONB DEFAULT '{}'::jsonb,
    status status_geral_enum NOT NULL DEFAULT 'ativo',
    responsavel_id UUID REFERENCES public.perfis(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_cliente_tenant_documento UNIQUE (tenant_id, documento)
);

-- Projetos
CREATE TABLE public.projetos (
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

-- Tarefas
CREATE TABLE public.tarefas (
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

-- Apontamentos de Horas
CREATE TABLE public.apontamentos_horas (
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

-- Logs de Auditoria
CREATE TABLE public.logs_auditoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES public.perfis(id) ON DELETE SET NULL,
    acao VARCHAR(50) NOT NULL,
    nome_tabela VARCHAR(50) NOT NULL,
    registro_id UUID,
    dados_anteriores JSONB,
    dados_novos JSONB,
    ip_origem INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);`
  },
  {
    id: 'sec-indexes',
    title: '4. Índices & Performance Multi-Tenant',
    category: 'indexes',
    description: 'Índices B-Tree compostos para tenant_id, chaves estrangeiras e filtros frequentes para alta performance.',
    sql: `-- Índices de FK e Scoping por Tenant
CREATE INDEX idx_perfis_tenant_id ON public.perfis(tenant_id);
CREATE INDEX idx_perfis_nivel_acesso ON public.perfis(nivel_acesso);
CREATE INDEX idx_perfis_tenant_status ON public.perfis(tenant_id, status);

CREATE INDEX idx_departamentos_tenant_id ON public.departamentos(tenant_id);
CREATE INDEX idx_clientes_tenant_id ON public.clientes(tenant_id);

CREATE INDEX idx_projetos_tenant_id ON public.projetos(tenant_id);
CREATE INDEX idx_projetos_status ON public.projetos(status);
CREATE INDEX idx_projetos_tenant_status ON public.projetos(tenant_id, status);

CREATE INDEX idx_tarefas_tenant_id ON public.tarefas(tenant_id);
CREATE INDEX idx_tarefas_projeto_id ON public.tarefas(projeto_id);
CREATE INDEX idx_tarefas_atribuido_para ON public.tarefas(atribuido_para);
CREATE INDEX idx_tarefas_tenant_atribuido ON public.tarefas(tenant_id, atribuido_para);

CREATE INDEX idx_apontamentos_tenant_id ON public.apontamentos_horas(tenant_id);
CREATE INDEX idx_apontamentos_tarefa_id ON public.apontamentos_horas(tarefa_id);
CREATE INDEX idx_apontamentos_usuario_id ON public.apontamentos_horas(usuario_id);
CREATE INDEX idx_apontamentos_tenant_usuario ON public.apontamentos_horas(tenant_id, usuario_id);

CREATE INDEX idx_auditoria_tenant_id ON public.logs_auditoria(tenant_id);
CREATE INDEX idx_auditoria_created_at ON public.logs_auditoria(created_at DESC);`
  },
  {
    id: 'sec-functions',
    title: '5. Funções Auxiliares de Segurança RLS',
    category: 'functions',
    description: 'Funções STABLE SECURITY DEFINER para checagem de tenant e validação dos 4 níveis de acesso no Supabase.',
    sql: `-- Tenant do Usuário Conectado
CREATE OR REPLACE FUNCTION public.fn_get_auth_tenant_id()
RETURNS UUID AS $$
    SELECT tenant_id FROM public.perfis WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Nível de Acesso do Usuário Conectado
CREATE OR REPLACE FUNCTION public.fn_get_auth_nivel_acesso()
RETURNS nivel_acesso_enum AS $$
    SELECT nivel_acesso FROM public.perfis WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Nível 1: Validação de Superadmin
CREATE OR REPLACE FUNCTION public.fn_is_superadmin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.perfis 
        WHERE id = auth.uid() AND nivel_acesso = 'superadmin' AND status = 'ativo'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Nível 2+: Admin do Tenant ou Superadmin
CREATE OR REPLACE FUNCTION public.fn_is_admin_or_higher()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.perfis 
        WHERE id = auth.uid() AND nivel_acesso IN ('superadmin', 'admin') AND status = 'ativo'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Nível 3+: Gestor, Admin ou Superadmin
CREATE OR REPLACE FUNCTION public.fn_is_gestor_or_higher()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.perfis 
        WHERE id = auth.uid() AND nivel_acesso IN ('superadmin', 'admin', 'gestor') AND status = 'ativo'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;`
  },
  {
    id: 'sec-triggers',
    title: '6. Triggers Automatizados',
    category: 'triggers',
    description: 'Automação de timestamps updated_at e sincronização automática entre auth.users e public.perfis.',
    sql: `-- Trigger de updated_at automático
CREATE OR REPLACE FUNCTION public.fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Sincronização automática com Supabase auth.users
CREATE OR REPLACE FUNCTION public.fn_handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.perfis (id, email, nome_completo, tenant_id, nivel_acesso, status)
    VALUES (
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

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.fn_handle_new_auth_user();`
  },
  {
    id: 'sec-rls',
    title: '7. Políticas RLS para os 4 Níveis de Acesso',
    category: 'rls_policies',
    description: 'Políticas granulares com isolamento total de dados e regras específicas por nível (Superadmin, Admin, Gestor, Operador).',
    sql: `-- Habilitar RLS em todas as tabelas
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apontamentos_horas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs_auditoria ENABLE ROW LEVEL SECURITY;

-- Exemplo RLS Tarefas: Operador enxerga apenas o que foi atribuído a ele
CREATE POLICY "tarefas_operador_select" ON public.tarefas
    FOR SELECT TO authenticated
    USING (
        public.fn_get_auth_nivel_acesso() = 'operador'
        AND tenant_id = public.fn_get_auth_tenant_id()
        AND (atribuido_para = auth.uid() OR created_by = auth.uid())
    );

-- Exemplo RLS Tarefas: Gestor e Admin visualizam todo o tenant
CREATE POLICY "tarefas_gestor_admin_select" ON public.tarefas
    FOR SELECT TO authenticated
    USING (
        public.fn_is_gestor_or_higher() 
        AND tenant_id = public.fn_get_auth_tenant_id()
    );

-- Exemplo RLS Tarefas: Superadmin possui bypass global
CREATE POLICY "tarefas_superadmin_all" ON public.tarefas
    FOR ALL TO authenticated
    USING (public.fn_is_superadmin())
    WITH CHECK (public.fn_is_superadmin());`
  }
];
