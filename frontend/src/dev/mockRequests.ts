export interface MockRequest {
  id: number
  title: string
  description: string
  amount: number
  status: string
  requester_name: string
  department_name: string
  requester_id: number
  department_id: number
  created_at: string
}

const store: MockRequest[] = [
  {
    id: 1,
    title: 'Compra de notebooks',
    description: 'Aquisição de 3 notebooks para a equipe de desenvolvimento.',
    amount: 12000,
    status: 'pendente',
    requester_name: 'Ana Solicitante',
    department_name: 'TI',
    requester_id: 1,
    department_id: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'Licença de software',
    description: 'Renovação anual da licença do pacote Adobe Creative Cloud.',
    amount: 3500,
    status: 'aprovado_gestor',
    requester_name: 'Ana Solicitante',
    department_name: 'TI',
    requester_id: 1,
    department_id: 1,
    created_at: new Date().toISOString(),
  },
]

let nextId = 3

export const mockRequests = {
  list(userId: number, role: string, departmentId: number): MockRequest[] {
    if (role === 'solicitante') return store.filter((r) => r.requester_id === userId)
    if (role === 'aprovador') return store.filter((r) => r.department_id === departmentId)
    return [...store]
  },

  create(data: { title: string; description: string; amount: number }, user: { id: number; name: string; departmentId: number }): MockRequest {
    const req: MockRequest = {
      id: nextId++,
      title: data.title,
      description: data.description,
      amount: data.amount,
      status: 'pendente',
      requester_name: user.name,
      department_name: 'TI',
      requester_id: user.id,
      department_id: user.departmentId,
      created_at: new Date().toISOString(),
    }
    store.push(req)
    return req
  },

  action(id: number, action: 'aprovado' | 'rejeitado', role: string): string {
    const req = store.find((r) => r.id === id)
    if (!req) throw new Error('Não encontrada')
    req.status =
      role === 'aprovador'
        ? action === 'aprovado' ? 'aprovado_gestor' : 'rejeitado_gestor'
        : action === 'aprovado' ? 'aprovado_financeiro' : 'rejeitado_financeiro'
    return req.status
  },
}
