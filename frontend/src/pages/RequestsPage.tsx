import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../contexts/useAuth'
import Layout from '../components/Layout'
import StatusBadge from '../components/ui/StatusBadge'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ErrorState from '../components/ui/ErrorState'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import { toast } from 'sonner'
import {
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  Pencil,
  Trash2,
  AlertTriangle,
  FileText,
  AlignLeft,
  DollarSign,
} from 'lucide-react'

interface Requisicao {
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

export default function RequestsPage() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<Requisicao[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Modal de ação (aprovar/rejeitar)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalAction, setModalAction] = useState<'aprovado' | 'rejeitado'>('aprovado')
  const [modalRequestId, setModalRequestId] = useState<number>(0)
  const [modalComment, setModalComment] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  // Modal de edição
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editId, setEditId] = useState<number>(0)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editAmount, setEditAmount] = useState('')
  const [editLoading, setEditLoading] = useState(false)

  // Modal de exclusão
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number>(0)
  const [deleteTitle, setDeleteTitle] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)

  function fetchRequests(showLoading = true) {
    if (showLoading) setLoading(true)
    api
      .get<Requisicao[]>('/requests')
      .then((res) => setRequests(res.data))
      .catch(() => setError('Erro ao carregar requisições.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    let active = true

    api
      .get<Requisicao[]>('/requests')
      .then((res) => {
        if (active) setRequests(res.data)
      })
      .catch(() => {
        if (active) setError('Erro ao carregar requisições.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  // ─── Aprovar / Rejeitar ────────────────────────────────────────────────────
  function openActionModal(id: number, action: 'aprovado' | 'rejeitado') {
    setModalRequestId(id)
    setModalAction(action)
    setModalComment('')
    setModalOpen(true)
  }

  async function handleAction() {
    setActionLoading(true)
    try {
      await api.post(`/requests/${modalRequestId}/action`, {
        action: modalAction,
        comment: modalComment || undefined,
      })
      toast.success(
        modalAction === 'aprovado'
          ? 'Requisição aprovada com sucesso!'
          : 'Requisição rejeitada.'
      )
      fetchRequests(false)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { error?: string } } }
      if (axiosErr?.response?.status === 403) {
        toast.error(axiosErr.response.data?.error ?? 'Você não tem permissão para esta ação.')
      } else {
        toast.error('Erro ao processar ação.')
      }
    } finally {
      setActionLoading(false)
      setModalOpen(false)
    }
  }

  // ─── Editar ────────────────────────────────────────────────────────────────
  function openEditModal(r: Requisicao) {
    setEditId(r.id)
    setEditTitle(r.title)
    setEditDescription(r.description)
    setEditAmount(String(r.amount))
    setEditModalOpen(true)
  }

  async function handleEdit() {
    setEditLoading(true)
    try {
      await api.put(`/requests/${editId}`, {
        title: editTitle,
        description: editDescription,
        amount: parseFloat(editAmount),
      })
      toast.success('Requisição atualizada com sucesso!')
      fetchRequests(false)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { error?: string } } }
      if (axiosErr?.response?.status === 403) {
        toast.error(axiosErr.response.data?.error ?? 'Você não tem permissão para editar esta requisição.')
      } else if (axiosErr?.response?.status === 400) {
        toast.error(axiosErr.response.data?.error ?? 'Não foi possível editar a requisição.')
      } else {
        toast.error('Erro ao atualizar requisição.')
      }
    } finally {
      setEditLoading(false)
      setEditModalOpen(false)
    }
  }

  // ─── Excluir ───────────────────────────────────────────────────────────────
  function openDeleteModal(r: Requisicao) {
    setDeleteId(r.id)
    setDeleteTitle(r.title)
    setDeleteModalOpen(true)
  }

  async function handleDelete() {
    setDeleteLoading(true)
    try {
      await api.delete(`/requests/${deleteId}`)
      toast.success('Requisição excluída com sucesso!')
      fetchRequests(false)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { error?: string } } }
      if (axiosErr?.response?.status === 403) {
        toast.error(axiosErr.response.data?.error ?? 'Você não tem permissão para excluir esta requisição.')
      } else if (axiosErr?.response?.status === 400) {
        toast.error(axiosErr.response.data?.error ?? 'Não foi possível excluir a requisição.')
      } else {
        toast.error('Erro ao excluir requisição.')
      }
    } finally {
      setDeleteLoading(false)
      setDeleteModalOpen(false)
    }
  }

  // ─── Permissões para botões ────────────────────────────────────────────────
  const canActOnRequest = (r: Requisicao) =>
    (user?.role === 'aprovador' && r.status === 'pendente') ||
    (user?.role === 'financeiro' && r.status === 'aprovado_gestor')

  const canEditRequest = (r: Requisicao) =>
    r.requester_id === user?.id && r.status === 'pendente'

  const canDeleteRequest = (r: Requisicao) =>
    (r.requester_id === user?.id && r.status === 'pendente') ||
    user?.role === 'financeiro'

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <ErrorState message={error} />
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="Requisições"
          subtitle={`${requests.length} ${requests.length === 1 ? 'requisição encontrada' : 'requisições encontradas'}`}
          action={
            <Link
              to="/requests/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
                bg-accent text-black font-semibold text-sm
                hover:bg-accent-hover
                transition-colors duration-200 no-underline"
            >
              <Plus size={18} />
              Nova Requisição
            </Link>
          }
        />

        {requests.length === 0 ? (
          <EmptyState
            icon={<Clock size={28} />}
            title="Nenhuma requisição encontrada"
            description="Crie sua primeira requisição de compra"
            action={
              <Link
                to="/requests/new"
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl
                  bg-accent/10 text-accent text-sm font-medium hover:bg-accent/20
                  transition-colors no-underline"
              >
                <Plus size={16} /> Criar Requisição
              </Link>
            }
          />
        ) : (
          <div className="glass overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-5 py-4">
                      Título
                    </th>
                    {(user?.role === 'aprovador' || user?.role === 'financeiro') && (
                      <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-5 py-4">
                        Solicitante
                      </th>
                    )}
                    <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-5 py-4">
                      Valor
                    </th>
                    <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-5 py-4">
                      Data
                    </th>
                    <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-5 py-4">
                      Status
                    </th>
                    <th className="text-right text-xs font-semibold text-text-muted uppercase tracking-wider px-5 py-4">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {requests.map((r) => (
                    <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-text-primary">{r.title}</p>
                        <p className="text-xs text-text-muted mt-0.5 max-w-xs truncate">
                          {r.description}
                        </p>
                      </td>
                      {(user?.role === 'aprovador' || user?.role === 'financeiro') && (
                        <td className="px-5 py-4">
                          <p className="text-sm text-text-secondary">{r.requester_name}</p>
                          <p className="text-xs text-text-muted">{r.department_name}</p>
                        </td>
                      )}
                      <td className="px-5 py-4">
                        <span className="text-sm font-semibold text-text-primary">
                          {Number(r.amount).toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          })}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-text-secondary whitespace-nowrap">
                          {new Date(r.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {/* Editar — só o dono com status pendente */}
                          {canEditRequest(r) && (
                            <button
                              onClick={() => openEditModal(r)}
                              title="Editar requisição"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                                text-info bg-info-soft hover:bg-info/20 transition-colors
                                cursor-pointer border-0"
                            >
                              <Pencil size={14} /> Editar
                            </button>
                          )}

                          {/* Excluir — dono (pendente) ou financeiro */}
                          {canDeleteRequest(r) && (
                            <button
                              onClick={() => openDeleteModal(r)}
                              title="Excluir requisição"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                                text-danger bg-danger-soft hover:bg-danger/20 transition-colors
                                cursor-pointer border-0"
                            >
                              <Trash2 size={14} /> Excluir
                            </button>
                          )}

                          {/* Aprovar / Rejeitar — aprovador e financeiro */}
                          {canActOnRequest(r) && (
                            <>
                              <button
                                onClick={() => openActionModal(r.id, 'aprovado')}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                                  text-success bg-success-soft hover:bg-success/20 transition-colors
                                  cursor-pointer border-0"
                              >
                                <CheckCircle2 size={14} /> Aprovar
                              </button>
                              <button
                                onClick={() => openActionModal(r.id, 'rejeitado')}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                                  text-danger bg-danger-soft hover:bg-danger/20 transition-colors
                                  cursor-pointer border-0"
                              >
                                <XCircle size={14} /> Rejeitar
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ─── Modal de Aprovar / Rejeitar ──────────────────────────────────────── */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        disabled={actionLoading}
      >
        <div className="flex items-center gap-3 mb-4 pr-8">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              modalAction === 'aprovado'
                ? 'bg-success-soft text-success'
                : 'bg-danger-soft text-danger'
            }`}
          >
            {modalAction === 'aprovado' ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary">
              {modalAction === 'aprovado' ? 'Aprovar' : 'Rejeitar'} Requisição
            </h3>
            <p className="text-xs text-text-muted">Adicione um comentário (opcional)</p>
          </div>
        </div>

        <div className="relative mb-4">
          <MessageSquare size={18} className="absolute left-3 top-3 text-text-muted" />
          <textarea
            value={modalComment}
            onChange={(e) => setModalComment(e.target.value)}
            placeholder="Comentário..."
            rows={3}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-bg-input border border-border text-text-primary
              placeholder:text-text-muted/50 text-sm resize-none
              focus:outline-none focus:border-border-focus focus:ring-2 focus:ring-accent/20
              transition-colors duration-200"
          />
        </div>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            size="md"
            fullWidth
            onClick={() => setModalOpen(false)}
            disabled={actionLoading}
          >
            Cancelar
          </Button>
          <Button
            variant={modalAction === 'aprovado' ? 'success' : 'danger'}
            size="md"
            fullWidth
            loading={actionLoading}
            onClick={handleAction}
          >
            {!actionLoading &&
              (modalAction === 'aprovado' ? 'Confirmar Aprovação' : 'Confirmar Rejeição')}
          </Button>
        </div>
      </Modal>

      {/* ─── Modal de Edição ──────────────────────────────────────────────────── */}
      <Modal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        disabled={editLoading}
      >
        <div className="flex items-center gap-3 mb-5 pr-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-info-soft text-info">
            <Pencil size={22} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary">
              Editar Requisição
            </h3>
            <p className="text-xs text-text-muted">Altere os dados da requisição pendente</p>
          </div>
        </div>

        <div className="space-y-4 mb-5">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Título</label>
            <div className="relative">
              <FileText size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
                minLength={3}
                maxLength={200}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-bg-input border border-border text-text-primary
                  placeholder:text-text-muted/50 text-sm
                  focus:outline-none focus:border-border-focus focus:ring-2 focus:ring-accent/20
                  transition-colors duration-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Descrição / Justificativa</label>
            <div className="relative">
              <AlignLeft size={18} className="absolute left-3 top-3 text-text-muted" />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                required
                minLength={10}
                rows={3}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-bg-input border border-border text-text-primary
                  placeholder:text-text-muted/50 text-sm resize-none
                  focus:outline-none focus:border-border-focus focus:ring-2 focus:ring-accent/20
                  transition-colors duration-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Valor (R$)</label>
            <div className="relative">
              <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="number"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                required
                min="0.01"
                step="0.01"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-bg-input border border-border text-text-primary
                  placeholder:text-text-muted/50 text-sm
                  focus:outline-none focus:border-border-focus focus:ring-2 focus:ring-accent/20
                  transition-colors duration-200"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            size="md"
            fullWidth
            onClick={() => setEditModalOpen(false)}
            disabled={editLoading}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="md"
            fullWidth
            loading={editLoading}
            onClick={handleEdit}
          >
            {!editLoading && 'Salvar Alterações'}
          </Button>
        </div>
      </Modal>

      {/* ─── Modal de Exclusão ────────────────────────────────────────────────── */}
      <Modal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        disabled={deleteLoading}
      >
        <div className="flex items-center gap-3 mb-4 pr-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-danger-soft text-danger">
            <AlertTriangle size={22} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary">
              Excluir Requisição
            </h3>
            <p className="text-xs text-text-muted">Esta ação não pode ser desfeita</p>
          </div>
        </div>

        <div className="glass p-4 rounded-xl mb-5">
          <p className="text-sm text-text-secondary">
            Tem certeza que deseja excluir a requisição{' '}
            <strong className="text-text-primary">"{deleteTitle}"</strong>?
          </p>
          <p className="text-xs text-text-muted mt-2">
            Todos os dados e ações associadas a esta requisição serão removidos permanentemente.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            size="md"
            fullWidth
            onClick={() => setDeleteModalOpen(false)}
            disabled={deleteLoading}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            size="md"
            fullWidth
            loading={deleteLoading}
            onClick={handleDelete}
          >
            {!deleteLoading && 'Confirmar Exclusão'}
          </Button>
        </div>
      </Modal>
    </Layout>
  )
}
