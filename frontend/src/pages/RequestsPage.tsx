import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { mockRequests } from '../dev/mockRequests'
import type { MockRequest } from '../dev/mockRequests'
import Layout from '../components/Layout'
import { toast } from 'sonner'
import {
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
  X,
  MessageSquare,
} from 'lucide-react'

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pendente: {
    label: 'Pendente',
    color: 'text-warning',
    bg: 'bg-warning-soft',
    icon: <Clock size={14} />,
  },
  aprovado_gestor: {
    label: 'Aprov. Gestor',
    color: 'text-success',
    bg: 'bg-success-soft',
    icon: <CheckCircle2 size={14} />,
  },
  rejeitado_gestor: {
    label: 'Rejeit. Gestor',
    color: 'text-danger',
    bg: 'bg-danger-soft',
    icon: <XCircle size={14} />,
  },
  aprovado_financeiro: {
    label: 'Aprov. Final',
    color: 'text-success',
    bg: 'bg-success-soft',
    icon: <CheckCircle2 size={14} />,
  },
  rejeitado_financeiro: {
    label: 'Rejeit. Final',
    color: 'text-danger',
    bg: 'bg-danger-soft',
    icon: <XCircle size={14} />,
  },
}

export default function RequestsPage() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<MockRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Modal state for action comment
  const [modalOpen, setModalOpen] = useState(false)
  const [modalAction, setModalAction] = useState<'aprovado' | 'rejeitado'>('aprovado')
  const [modalRequestId, setModalRequestId] = useState<number>(0)
  const [modalComment, setModalComment] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (import.meta.env.DEV) {
      setRequests(mockRequests.list(user!.id, user!.role, 1))
      setLoading(false)
      return
    }
    api
      .get<MockRequest[]>('/requests')
      .then((res) => setRequests(res.data))
      .catch(() => setError('Erro ao carregar requisicoes.'))
      .finally(() => setLoading(false))
  }, [user])

  function openActionModal(id: number, action: 'aprovado' | 'rejeitado') {
    setModalRequestId(id)
    setModalAction(action)
    setModalComment('')
    setModalOpen(true)
  }

  async function handleAction() {
    setActionLoading(true)
    try {
      if (import.meta.env.DEV) {
        const newStatus = mockRequests.action(modalRequestId, modalAction, user!.role)
        setRequests((prev) =>
          prev.map((r) => (r.id === modalRequestId ? { ...r, status: newStatus } : r))
        )
      } else {
        await api.post(`/requests/${modalRequestId}/action`, {
          action: modalAction,
          comment: modalComment || undefined,
        })
        const { data } = await api.get<MockRequest[]>('/requests')
        setRequests(data)
      }
      toast.success(
        modalAction === 'aprovado'
          ? 'Requisicao aprovada com sucesso!'
          : 'Requisicao rejeitada.'
      )
    } catch {
      toast.error('Erro ao processar acao.')
    } finally {
      setActionLoading(false)
      setModalOpen(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-accent" />
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3 text-danger bg-danger-soft px-6 py-4 rounded-xl">
            <AlertCircle size={20} />
            {error}
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Requisicoes</h1>
            <p className="text-sm text-text-secondary mt-1">
              {requests.length} {requests.length === 1 ? 'requisicao encontrada' : 'requisicoes encontradas'}
            </p>
          </div>
          <Link
            to="/requests/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
              bg-accent text-black font-semibold text-sm
              hover:bg-accent-hover
              transition-colors duration-200 no-underline"
          >
            <Plus size={18} />
            Nova Requisicao
          </Link>
        </div>

        {/* Table */}
        {requests.length === 0 ? (
          <div className="glass p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <Clock size={28} className="text-accent" />
            </div>
            <p className="text-text-primary font-medium">Nenhuma requisicao encontrada</p>
            <p className="text-text-muted text-sm mt-1">Crie sua primeira requisicao de compra</p>
            <Link
              to="/requests/new"
              className="inline-flex items-center gap-2 mt-4 px-5 py-2 rounded-xl
                bg-accent/10 text-accent text-sm font-medium hover:bg-accent/20 transition-colors no-underline"
            >
              <Plus size={16} /> Criar Requisicao
            </Link>
          </div>
        ) : (
          <div className="glass overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-5 py-4">Titulo</th>
                    <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-5 py-4">Valor</th>
                    <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-5 py-4">Data</th>
                    <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-5 py-4">Status</th>
                    {(user?.role === 'aprovador' || user?.role === 'financeiro') && (
                      <th className="text-right text-xs font-semibold text-text-muted uppercase tracking-wider px-5 py-4">Acoes</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {requests.map((r) => {
                    const status = statusConfig[r.status] ?? {
                      label: r.status,
                      color: 'text-text-secondary',
                      bg: 'bg-white/5',
                      icon: <Clock size={14} />,
                    }
                    const canAct =
                      (user?.role === 'aprovador' && r.status === 'pendente') ||
                      (user?.role === 'financeiro' && r.status === 'aprovado_gestor')

                    return (
                      <tr
                        key={r.id}
                        className="hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-5 py-4">
                          <p className="text-sm font-medium text-text-primary">{r.title}</p>
                          <p className="text-xs text-text-muted mt-0.5 max-w-xs truncate">{r.description}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm font-semibold text-text-primary">
                            {r.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-text-secondary whitespace-nowrap">
                            {new Date(r.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${status.color} ${status.bg}`}>
                            {status.icon}
                            {status.label}
                          </span>
                        </td>
                        {(user?.role === 'aprovador' || user?.role === 'financeiro') && (
                          <td className="px-5 py-4">
                            {canAct && (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => openActionModal(r.id, 'aprovado')}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                                    text-success bg-success-soft hover:bg-success/20 transition-colors duration-200
                                    cursor-pointer border-0"
                                >
                                  <CheckCircle2 size={14} /> Aprovar
                                </button>
                                <button
                                  onClick={() => openActionModal(r.id, 'rejeitado')}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                                    text-danger bg-danger-soft hover:bg-danger/20 transition-colors duration-200
                                    cursor-pointer border-0"
                                >
                                  <XCircle size={14} /> Rejeitar
                                </button>
                              </div>
                            )}
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !actionLoading && setModalOpen(false)}
          />
          <div className="relative glass p-6 w-full max-w-md">
            <button
              onClick={() => setModalOpen(false)}
              disabled={actionLoading}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/5 transition-colors
                cursor-pointer bg-transparent border-0 text-text-muted hover:text-text-primary"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                modalAction === 'aprovado' ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'
              }`}>
                {modalAction === 'aprovado' ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary">
                  {modalAction === 'aprovado' ? 'Aprovar' : 'Rejeitar'} Requisicao
                </h3>
                <p className="text-xs text-text-muted">Adicione um comentario (opcional)</p>
              </div>
            </div>

            <div className="relative mb-4">
              <MessageSquare size={18} className="absolute left-3 top-3 text-text-muted" />
              <textarea
                value={modalComment}
                onChange={(e) => setModalComment(e.target.value)}
                placeholder="Comentario..."
                rows={3}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-bg-input border border-border text-text-primary
                  placeholder:text-text-muted/50 text-sm resize-none
                  focus:outline-none focus:border-border-focus focus:ring-2 focus:ring-accent/20
                  transition-colors duration-200"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setModalOpen(false)}
                disabled={actionLoading}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-text-secondary
                  bg-white/5 hover:bg-white/10 transition-colors duration-200
                  cursor-pointer border-0"
              >
                Cancelar
              </button>
              <button
                onClick={handleAction}
                disabled={actionLoading}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white
                  transition-colors duration-200 cursor-pointer border-0
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${modalAction === 'aprovado'
                    ? 'bg-success hover:bg-success/90'
                    : 'bg-danger hover:bg-danger/90'
                  }`}
              >
                {actionLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>{modalAction === 'aprovado' ? 'Confirmar Aprovacao' : 'Confirmar Rejeicao'}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
