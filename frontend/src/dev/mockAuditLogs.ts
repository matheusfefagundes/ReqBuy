export interface MockAuditLog {
  id: number
  user_name: string | null
  user_email: string | null
  action: string
  resource: string | null
  resource_id: number | null
  ip_address: string | null
  created_at: string
}

const store: MockAuditLog[] = [
  {
    id: 1,
    user_name: 'Ana Solicitante',
    user_email: 'solicitante@reqbuy.dev',
    action: 'LOGIN',
    resource: 'auth',
    resource_id: null,
    ip_address: '127.0.0.1',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 2,
    user_name: 'Ana Solicitante',
    user_email: 'solicitante@reqbuy.dev',
    action: 'CRIAR_REQUISICAO',
    resource: 'purchase_requests',
    resource_id: 1,
    ip_address: '127.0.0.1',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 3,
    user_name: 'Ana Solicitante',
    user_email: 'solicitante@reqbuy.dev',
    action: 'CRIAR_REQUISICAO',
    resource: 'purchase_requests',
    resource_id: 2,
    ip_address: '127.0.0.1',
    created_at: new Date(Date.now() - 3600000 * 3.5).toISOString(),
  },
  {
    id: 4,
    user_name: 'Bruno Aprovador',
    user_email: 'aprovador@reqbuy.dev',
    action: 'LOGIN',
    resource: 'auth',
    resource_id: null,
    ip_address: '192.168.1.10',
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 5,
    user_name: 'Bruno Aprovador',
    user_email: 'aprovador@reqbuy.dev',
    action: 'APROVADO_REQUISICAO',
    resource: 'purchase_requests',
    resource_id: 2,
    ip_address: '192.168.1.10',
    created_at: new Date(Date.now() - 3600000 * 2.5).toISOString(),
  },
  {
    id: 6,
    user_name: null,
    user_email: 'desconhecido@teste.com',
    action: 'LOGIN_FALHOU',
    resource: 'auth',
    resource_id: null,
    ip_address: '10.0.0.55',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 7,
    user_name: 'Carla Financeiro',
    user_email: 'financeiro@reqbuy.dev',
    action: 'LOGIN',
    resource: 'auth',
    resource_id: null,
    ip_address: '192.168.1.20',
    created_at: new Date(Date.now() - 3600000 * 1.5).toISOString(),
  },
  {
    id: 8,
    user_name: 'Carla Financeiro',
    user_email: 'financeiro@reqbuy.dev',
    action: 'APROVADO_REQUISICAO',
    resource: 'purchase_requests',
    resource_id: 2,
    ip_address: '192.168.1.20',
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 9,
    user_name: 'Bruno Aprovador',
    user_email: 'aprovador@reqbuy.dev',
    action: 'ACESSO_NAO_AUTORIZADO',
    resource: 'audit_logs',
    resource_id: null,
    ip_address: '192.168.1.10',
    created_at: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 10,
    user_name: 'Ana Solicitante',
    user_email: 'solicitante@reqbuy.dev',
    action: 'CADASTRO',
    resource: 'users',
    resource_id: 4,
    ip_address: '127.0.0.1',
    created_at: new Date(Date.now() - 900000).toISOString(),
  },
]

let nextId = 11

export const mockAuditLogs = {
  list(): MockAuditLog[] {
    return [...store].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  },

  add(entry: Omit<MockAuditLog, 'id' | 'created_at'>): void {
    store.push({
      ...entry,
      id: nextId++,
      created_at: new Date().toISOString(),
    })
  },
}
