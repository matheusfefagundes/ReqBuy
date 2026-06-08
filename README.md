## ReqBuy - Sistema de Requisições Internas (P08-A)

Projeto desenvolvido para a Avaliação N3 da disciplina de Segurança da Informação do curso de Engenharia de Software (Católica SC).

**Professor:** Edson Vaz Lopes  
**Tema-base:** P08-A - Compras internas (Requisição de compra)

## Equipe
* Roger Klock
* Miguel David Hort
* Lucas Klug Sebastião
* Kauã Martins Bassan
* Matheus Ferreira Fagundes

---

## Sobre o Projeto

O **ReqBuy** é uma aplicação web focada na gestão segura de requisições de compras internas. O sistema permite que solicitantes registrem pedidos, aprovadores analisem as requisições de seus respectivos setores, e o setor financeiro faça a auditoria e aprovação final do fluxo.

O foco principal do desenvolvimento é a aplicação prática de controles de **Segurança da Informação**, incluindo:

* **Autenticação Segura:** Senhas armazenadas com bcrypt (hash + salt).
* **Autorização (RBAC):** Controle estrito de acesso baseado em perfis; usuários comuns visualizam apenas seus próprios dados.
* **Trilhas de Auditoria:** Registro de ações críticas (login, criação, aprovação, rejeição e tentativas de acesso não autorizado).
* **Gestão de Segredos:** Variáveis sensíveis isoladas em `.env` (não versionado).
* **Validação no Servidor:** Sanitização e validação de entradas via Zod antes de qualquer operação no banco.

---

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Front-end | React 19 + Vite 8 + TypeScript |
| Back-end | Node.js + Express 5 + TypeScript |
| Banco de Dados | PostgreSQL |
| Autenticação | JWT (jsonwebtoken) + bcrypt |
| Validação de entrada | Zod |
| HTTP Client | Axios |
| Query / Driver BD | node-postgres (pg) |
| Logger HTTP | Morgan |

---

## Perfis de Acesso

O sistema implementa três níveis de privilégio:

| Perfil | Papel no sistema |
|---|---|
| **Solicitante** | Registra requisições e acompanha apenas o status dos próprios pedidos. |
| **Aprovador** | Analisa, aprova ou rejeita requisições do seu setor antes do envio ao financeiro. |
| **Setor Financeiro** | Possui visão global, realiza a aprovação final e acessa os logs de auditoria. |

---

## Funcionalidades Mínimas Previstas

1. Cadastro e autenticação de usuários com senhas protegidas por bcrypt.
2. Geração e validação de tokens JWT para sessões autenticadas (8h de validade).
3. Criação de requisição de compra (título, descrição, valor, setor).
4. Listagem de requisições filtrada por perfil (próprias / setor / todas).
5. Aprovação ou rejeição pelo aprovador do setor (com comentário opcional).
6. Aprovação ou rejeição final pelo setor financeiro (com comentário opcional).
7. Registro automático de logs de auditoria para todas as ações relevantes.
8. Consulta de logs de auditoria, exclusiva ao perfil Financeiro.

---

## Matriz de Permissões

| Funcionalidade | Solicitante | Aprovador | Financeiro |
|---|:---:|:---:|:---:|
| Criar requisição | ✅ | ✅ | ✅ |
| Ver próprias requisições | ✅ | ✅ | ✅ |
| Ver requisições do setor | ❌ | ✅ | ✅ |
| Ver todas as requisições | ❌ | ❌ | ✅ |
| Aprovar / Rejeitar (nível gestor) | ❌ | ✅ | ❌ |
| Aprovar / Rejeitar (nível financeiro) | ❌ | ❌ | ✅ |
| Visualizar logs de auditoria | ❌ | ❌ | ✅ |
| Gerenciar usuários | ❌ | ❌ | ✅ |

---

## Entidades Principais

| Entidade | Descrição |
|---|---|
| `users` | Usuários do sistema com perfil RBAC e setor associado. |
| `departments` | Setores / departamentos da organização. |
| `purchase_requests` | Requisições de compra com status de aprovação em duas etapas (gestor → financeiro). |
| `request_actions` | Histórico de ações (aprovação / rejeição) realizadas sobre cada requisição. |
| `audit_logs` | Trilha de auditoria de todas as ações relevantes do sistema. |

---

## Modelo de Dados Inicial

```sql
-- Setores da organização
CREATE TABLE departments (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

-- Usuários com perfil RBAC
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(150) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT        NOT NULL,
  role          VARCHAR(20) NOT NULL CHECK (role IN ('solicitante', 'aprovador', 'financeiro')),
  department_id INTEGER     REFERENCES departments(id),
  created_at    TIMESTAMP   DEFAULT NOW()
);

-- Requisições de compra (fluxo de duas aprovações)
CREATE TABLE purchase_requests (
  id            SERIAL PRIMARY KEY,
  title         VARCHAR(200)    NOT NULL,
  description   TEXT            NOT NULL,
  amount        DECIMAL(12, 2)  NOT NULL,
  status        VARCHAR(30)     NOT NULL DEFAULT 'pendente'
                  CHECK (status IN (
                    'pendente',
                    'aprovado_gestor', 'rejeitado_gestor',
                    'aprovado_financeiro', 'rejeitado_financeiro'
                  )),
  requester_id  INTEGER NOT NULL REFERENCES users(id),
  department_id INTEGER NOT NULL REFERENCES departments(id),
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

-- Histórico de ações sobre cada requisição
CREATE TABLE request_actions (
  id         SERIAL PRIMARY KEY,
  request_id INTEGER NOT NULL REFERENCES purchase_requests(id),
  user_id    INTEGER NOT NULL REFERENCES users(id),
  action     VARCHAR(30) NOT NULL CHECK (action IN ('aprovado', 'rejeitado')),
  comment    TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Trilha de auditoria
CREATE TABLE audit_logs (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER     REFERENCES users(id),
  action      VARCHAR(100) NOT NULL,
  resource    VARCHAR(100),
  resource_id INTEGER,
  ip_address  VARCHAR(45),
  created_at  TIMESTAMP DEFAULT NOW()
);
```

---

## Arquitetura Inicial

```
┌──────────────────────┐        HTTP / HTTPS        ┌────────────────────────────┐
│  Frontend            │ ─────────────────────────► │  Backend                   │
│  React + Vite + TS   │ ◄───────────────────────── │  Node.js + Express 5 + TS  │
│  :5173 (dev)         │      JSON  (REST API)       │  :3001                     │
└──────────────────────┘                            └────────────────┬───────────┘
                                                                     │
                                                          node-postgres (pg)
                                                                     │
                                                                     ▼
                                                    ┌────────────────────────────┐
                                                    │  PostgreSQL                │
                                                    │  :5432                     │
                                                    └────────────────────────────┘

Fluxo de autenticação
  1. Cliente envia e-mail + senha  →  POST /api/auth/login
  2. Backend valida credenciais e retorna JWT assinado (8h)
  3. Cliente armazena token em memória (sessionStorage em fallback)
  4. Toda rota protegida exige header: Authorization: Bearer <token>
  5. Middleware verifica e decodifica o JWT antes de cada handler
  6. Todas as ações críticas são registradas em audit_logs

Segurança em camadas
  • CORS restrito à origem do frontend
  • Validação de entrada via Zod (antes do banco)
  • RBAC aplicado no middleware de autorização
  • Verificação de dono do recurso nas rotas de listagem
  • Variáveis sensíveis isoladas em .env (não versionado)
```

---

## Ativos e Dados Sensíveis

| Ativo | Localização | Risco | Controle aplicado |
|---|---|---|---|
| Hashes de senha | Tabela `users` | Comprometimento de conta | bcrypt com salt automático |
| Segredo JWT | Variável `JWT_SECRET` | Forja de tokens | `.env` não versionado |
| Valores financeiros | Tabela `purchase_requests` | Exposição de dados internos | RBAC + autenticação obrigatória |
| Logs de auditoria | Tabela `audit_logs` | Rastreabilidade de usuários | Acesso restrito ao perfil Financeiro |
| Credenciais do banco | Variável `DATABASE_URL` | Acesso direto ao BD | `.env` não versionado |
| Endereços IP | Tabela `audit_logs` | Privacidade dos usuários | Acesso restrito ao perfil Financeiro |
