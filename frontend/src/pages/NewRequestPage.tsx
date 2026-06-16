import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { mockRequests } from '../dev/mockRequests'
import Layout from '../components/Layout'
import { toast } from 'sonner'
import {
  FileText,
  AlignLeft,
  DollarSign,
  Loader2,
  Send,
  ArrowLeft,
} from 'lucide-react'

export default function NewRequestPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      if (import.meta.env.DEV) {
        mockRequests.create(
          { title, description, amount: parseFloat(amount) },
          { id: user!.id, name: user!.name, departmentId: 1 }
        )
        toast.success('Requisicao criada com sucesso!')
        navigate('/requests')
        return
      }
      await api.post('/requests', { title, description, amount: parseFloat(amount) })
      toast.success('Requisicao criada com sucesso!')
      navigate('/requests')
    } catch {
      toast.error('Erro ao criar requisicao. Verifique os dados e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        {/* Back link */}
        <Link
          to="/requests"
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary
            transition-colors mb-6 no-underline"
        >
          <ArrowLeft size={16} />
          Voltar para requisicoes
        </Link>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary">Nova Requisicao</h1>
          <p className="text-sm text-text-secondary mt-1">Preencha os dados da requisicao de compra</p>
        </div>

        {/* Form Card */}
        <div className="glass p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Titulo</label>
              <div className="relative">
                <FileText size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  id="new-request-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  minLength={3}
                  maxLength={200}
                  placeholder="Ex: Compra de notebooks"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-bg-input border border-border text-text-primary
                    placeholder:text-text-muted/50 text-sm
                    focus:outline-none focus:border-border-focus focus:ring-2 focus:ring-accent/20
                    transition-colors duration-200"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Descricao / Justificativa</label>
              <div className="relative">
                <AlignLeft size={18} className="absolute left-3 top-3 text-text-muted" />
                <textarea
                  id="new-request-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  minLength={10}
                  rows={4}
                  placeholder="Descreva a justificativa para esta compra..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-bg-input border border-border text-text-primary
                    placeholder:text-text-muted/50 text-sm resize-none
                    focus:outline-none focus:border-border-focus focus:ring-2 focus:ring-accent/20
                    transition-colors duration-200"
                />
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Valor (R$)</label>
              <div className="relative">
                <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  id="new-request-amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  min="0.01"
                  step="0.01"
                  placeholder="0,00"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-bg-input border border-border text-text-primary
                    placeholder:text-text-muted/50 text-sm
                    focus:outline-none focus:border-border-focus focus:ring-2 focus:ring-accent/20
                    transition-colors duration-200"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                id="new-request-submit"
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl
                  bg-accent text-black font-semibold text-sm
                  hover:bg-accent-hover
                  active:scale-[0.98] transition-colors duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed
                  cursor-pointer border-0"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Criar Requisicao
                  </>
                )}
              </button>
              <Link
                to="/requests"
                className="flex items-center justify-center py-3 px-6 rounded-xl text-sm font-medium
                  text-text-secondary bg-white/5 hover:bg-white/10 transition-colors duration-200 no-underline"
              >
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  )
}
