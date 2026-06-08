import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const roleLabel: Record<string, string> = {
  solicitante: 'Solicitante',
  aprovador: 'Aprovador',
  financeiro: 'Setor Financeiro',
}

export default function DashboardPage() {
  const { user, logout } = useAuth()

  return (
    <main style={{ maxWidth: 600, margin: '40px auto', padding: '0 16px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>ReqBuy</h1>
        <button onClick={logout}>Sair</button>
      </header>

      <p>
        Bem-vindo, <strong>{user?.name}</strong> — {roleLabel[user?.role ?? '']}
      </p>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 }}>
        <Link to="/requests">Ver Requisições</Link>
        <Link to="/requests/new">Nova Requisição</Link>
        {user?.role === 'financeiro' && <Link to="/audit">Logs de Auditoria</Link>}
      </nav>
    </main>
  )
}
