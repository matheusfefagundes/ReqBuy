-- =============================================
-- ReqBuy — Schema inicial do banco de dados
-- =============================================

CREATE TABLE departments (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(150) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT        NOT NULL,
  role          VARCHAR(20) NOT NULL CHECK (role IN ('solicitante', 'aprovador', 'financeiro')),
  department_id INTEGER     REFERENCES departments(id),
  created_at    TIMESTAMP   DEFAULT NOW()
);

CREATE TABLE purchase_requests (
  id            SERIAL PRIMARY KEY,
  title         VARCHAR(200)   NOT NULL,
  description   TEXT           NOT NULL,
  amount        DECIMAL(12, 2) NOT NULL,
  status        VARCHAR(30)    NOT NULL DEFAULT 'pendente'
                  CHECK (status IN (
                    'pendente',
                    'aprovado_gestor',    'rejeitado_gestor',
                    'aprovado_financeiro','rejeitado_financeiro'
                  )),
  requester_id  INTEGER NOT NULL REFERENCES users(id),
  department_id INTEGER NOT NULL REFERENCES departments(id),
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE request_actions (
  id         SERIAL PRIMARY KEY,
  request_id INTEGER NOT NULL REFERENCES purchase_requests(id),
  user_id    INTEGER NOT NULL REFERENCES users(id),
  action     VARCHAR(30) NOT NULL CHECK (action IN ('aprovado', 'rejeitado')),
  comment    TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE audit_logs (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER     REFERENCES users(id),
  action      VARCHAR(100) NOT NULL,
  resource    VARCHAR(100),
  resource_id INTEGER,
  ip_address  VARCHAR(45),
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Dados iniciais de exemplo
INSERT INTO departments (name) VALUES ('TI'), ('RH'), ('Financeiro'), ('Operações');
