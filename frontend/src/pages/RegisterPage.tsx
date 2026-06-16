import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const DEPARTMENTS = [
  { id: 1, name: 'TI' },
  { id: 2, name: 'RH' },
  { id: 3, name: 'Financeiro' },
  { id: 4, name: 'Operações' },
]

const ROLES = [
  { value: 'solicitante', label: 'Solicitante' },
  { value: 'aprovador', label: 'Aprovador' },
  { value: 'financeiro', label: 'Setor Financeiro' },
]

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'solicitante' | 'aprovador' | 'financeiro'>('solicitante')
  const [departmentId, setDepartmentId] = useState(1)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register({ name, email, password, role, departmentId })
      navigate('/dashboard')
    } catch {
      setError('Erro ao criar conta. Verifique os dados e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ maxWidth: 380, margin: '60px auto', padding: '0 16px' }}>
      <h1>ReqBuy</h1>
      <p>Criar conta</p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20 }}>
        <label>
          Nome completo
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={3}
            style={{ display: 'block', width: '100%', marginTop: 4 }}
          />
        </label>

        <label>
          E-mail
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            style={{ display: 'block', width: '100%', marginTop: 4 }}
          />
        </label>

        <label>
          Senha
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
            style={{ display: 'block', width: '100%', marginTop: 4 }}
          />
        </label>

        <label>
          Perfil
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as typeof role)}
            style={{ display: 'block', width: '100%', marginTop: 4 }}
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </label>

        <label>
          Setor
          <select
            value={departmentId}
            onChange={(e) => setDepartmentId(Number(e.target.value))}
            style={{ display: 'block', width: '100%', marginTop: 4 }}
          >
            {DEPARTMENTS.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </label>

        {error && <p style={{ color: 'red', margin: 0 }}>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Criando conta...' : 'Criar conta'}
        </button>

        <p style={{ textAlign: 'center', margin: 0 }}>
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </form>
    </main>
  )
}
