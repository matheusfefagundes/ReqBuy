import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'

interface PurchaseRequest {
  id: number
  title: string
  amount: number
  status: string
  requester_name: string
  department_name: string
  created_at: string
}

const statusLabel: Record<string, string> = {
  pendente: 'Pendente',
  aprovado_gestor: 'Aprovado pelo Gestor',
  rejeitado_gestor: 'Rejeitado pelo Gestor',
  aprovado_financeiro: 'Aprovado pelo Financeiro',
  rejeitado_financeiro: 'Rejeitado pelo Financeiro',
}

export default function RequestsPage() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<PurchaseRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get<PurchaseRequest[]>('/requests')
      .then((res) => setRequests(res.data))
      .catch(() => setError('Erro ao carregar requisições.'))
      .finally(() => setLoading(false))
  }, [])

  async function handleAction(id: number, action: 'aprovado' | 'rejeitado') {
    const comment = window.prompt(`Comentário para ${action} (opcional):`) ?? undefined
    try {
      await api.post(`/requests/${id}/action`, { action, comment })
      setRequests((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                status:
                  user?.role === 'aprovador'
                    ? action === 'aprovado'
                      ? 'aprovado_gestor'
                      : 'rejeitado_gestor'
                    : action === 'aprovado'
                    ? 'aprovado_financeiro'
                    : 'rejeitado_financeiro',
              }
            : r
        )
      )
    } catch {
      alert('Erro ao processar ação.')
    }
  }

  if (loading) return <p>Carregando...</p>
  if (error) return <p style={{ color: 'red' }}>{error}</p>

  return (
    <main style={{ maxWidth: 800, margin: '40px auto', padding: '0 16px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Requisições</h1>
        <Link to="/requests/new">Nova Requisição</Link>
      </header>

      {requests.length === 0 ? (
        <p>Nenhuma requisição encontrada.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '8px 4px' }}>Título</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '8px 4px' }}>Valor</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '8px 4px' }}>Status</th>
              {(user?.role === 'aprovador' || user?.role === 'financeiro') && (
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '8px 4px' }}>Ações</th>
              )}
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id}>
                <td style={{ padding: '8px 4px' }}>{r.title}</td>
                <td style={{ padding: '8px 4px' }}>
                  {r.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
                <td style={{ padding: '8px 4px' }}>{statusLabel[r.status] ?? r.status}</td>
                {(user?.role === 'aprovador' || user?.role === 'financeiro') && (
                  <td style={{ padding: '8px 4px', display: 'flex', gap: 8 }}>
                    {((user.role === 'aprovador' && r.status === 'pendente') ||
                      (user.role === 'financeiro' && r.status === 'aprovado_gestor')) && (
                      <>
                        <button onClick={() => handleAction(r.id, 'aprovado')}>Aprovar</button>
                        <button onClick={() => handleAction(r.id, 'rejeitado')}>Rejeitar</button>
                      </>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p style={{ marginTop: 16 }}>
        <Link to="/dashboard">← Voltar</Link>
      </p>
    </main>
  )
}
