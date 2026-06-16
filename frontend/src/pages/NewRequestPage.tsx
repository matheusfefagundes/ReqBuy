import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { mockRequests } from '../dev/mockRequests'

export default function NewRequestPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (import.meta.env.DEV) {
        mockRequests.create(
          { title, description, amount: parseFloat(amount) },
          { id: user!.id, name: user!.name, departmentId: 1 }
        )
        navigate('/requests')
        return
      }
      await api.post('/requests', { title, description, amount: parseFloat(amount) })
      navigate('/requests')
    } catch {
      setError('Erro ao criar requisição. Verifique os dados e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ maxWidth: 480, margin: '40px auto', padding: '0 16px' }}>
      <h1>Nova Requisição</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
        <label>
          Título
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            minLength={3}
            maxLength={200}
            style={{ display: 'block', width: '100%', marginTop: 4 }}
          />
        </label>
        <label>
          Descrição / Justificativa
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            minLength={10}
            rows={4}
            style={{ display: 'block', width: '100%', marginTop: 4 }}
          />
        </label>
        <label>
          Valor (R$)
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            min="0.01"
            step="0.01"
            style={{ display: 'block', width: '100%', marginTop: 4 }}
          />
        </label>
        {error && <p style={{ color: 'red', margin: 0 }}>{error}</p>}
        <div style={{ display: 'flex', gap: 12 }}>
          <button type="submit" disabled={loading}>
            {loading ? 'Enviando...' : 'Criar Requisição'}
          </button>
          <Link to="/requests">Cancelar</Link>
        </div>
      </form>
    </main>
  )
}
