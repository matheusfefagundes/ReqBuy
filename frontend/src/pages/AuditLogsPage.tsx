import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

interface AuditLog {
  id: number
  user_name: string | null
  user_email: string | null
  action: string
  resource: string | null
  resource_id: number | null
  ip_address: string | null
  created_at: string
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get<AuditLog[]>('/audit')
      .then((res) => setLogs(res.data))
      .catch(() => setError('Erro ao carregar logs de auditoria.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Carregando...</p>
  if (error) return <p style={{ color: 'red' }}>{error}</p>

  return (
    <main style={{ maxWidth: 900, margin: '40px auto', padding: '0 16px' }}>
      <h1>Logs de Auditoria</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16, fontSize: 13 }}>
        <thead>
          <tr>
            {['Data', 'Usuário', 'Ação', 'Recurso', 'ID', 'IP'].map((h) => (
              <th key={h} style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '6px 4px' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td style={{ padding: '6px 4px', whiteSpace: 'nowrap' }}>
                {new Date(log.created_at).toLocaleString('pt-BR')}
              </td>
              <td style={{ padding: '6px 4px' }}>{log.user_name ?? '—'}</td>
              <td style={{ padding: '6px 4px' }}>{log.action}</td>
              <td style={{ padding: '6px 4px' }}>{log.resource ?? '—'}</td>
              <td style={{ padding: '6px 4px' }}>{log.resource_id ?? '—'}</td>
              <td style={{ padding: '6px 4px' }}>{log.ip_address ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ marginTop: 16 }}>
        <Link to="/dashboard">← Voltar</Link>
      </p>
    </main>
  )
}
