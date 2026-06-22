import { useEffect, useState } from 'react'
import api from '../services/api'
import Layout from '../components/Layout'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ErrorState from '../components/ui/ErrorState'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import Badge from '../components/ui/Badge'
import {
  ShieldCheck,
  User,
  Globe,
  Activity,
  Hash,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

interface LogAuditoria {
  id: number
  user_name: string | null
  user_email: string | null
  action: string
  resource: string | null
  resource_id: number | null
  ip_address: string | null
  created_at: string
}

type ActionVariant = 'info' | 'danger' | 'accent' | 'success' | 'neutral'

const actionConfig: Record<string, { variant: ActionVariant }> = {
  LOGIN:                  { variant: 'info'    },
  LOGIN_FALHOU:           { variant: 'danger'  },
  CADASTRO:               { variant: 'accent'  },
  CRIAR_REQUISICAO:       { variant: 'success' },
  APROVADO_REQUISICAO:    { variant: 'success' },
  REJEITADO_REQUISICAO:   { variant: 'danger'  },
  ACESSO_NAO_AUTORIZADO:  { variant: 'danger'  },
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<LogAuditoria[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const itemsPerPage = 10
  const totalPages = Math.ceil(logs.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentLogs = logs.slice(startIndex, startIndex + itemsPerPage)

  useEffect(() => {
    api
      .get<LogAuditoria[]>('/audit')
      .then((res) => setLogs(res.data))
      .catch(() => setError('Erro ao carregar logs de auditoria.'))
      .finally(() => setLoading(false))
  }, [])

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
          icon={<ShieldCheck size={22} />}
          title="Logs de Auditoria"
          subtitle={`${logs.length} ${logs.length === 1 ? 'registro encontrado' : 'registros encontrados'}`}
        />

        {logs.length === 0 ? (
          <EmptyState
            icon={<Activity size={28} />}
            title="Nenhum log de auditoria encontrado"
            description="Os logs aparecerão conforme ações são realizadas no sistema"
          />
        ) : (
          <div className="glass overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} /> Data
                      </div>
                    </th>
                    <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <User size={12} /> Usuário
                      </div>
                    </th>
                    <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <Activity size={12} /> Ação
                      </div>
                    </th>
                    <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <Hash size={12} /> Recurso
                      </div>
                    </th>
                    <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <Globe size={12} /> IP
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {currentLogs.map((log) => {
                    const config = actionConfig[log.action] ?? { variant: 'neutral' as ActionVariant }
                    return (
                      <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-4">
                          <span className="text-sm text-text-secondary whitespace-nowrap">
                            {new Date(log.created_at).toLocaleString('pt-BR')}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm font-medium text-text-primary">
                            {log.user_name ?? '—'}
                          </p>
                          {log.user_email && (
                            <p className="text-xs text-text-muted">{log.user_email}</p>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <Badge variant={config.variant}>{log.action}</Badge>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-text-secondary">
                            {log.resource ?? '—'}
                            {log.resource_id != null && (
                              <span className="ml-1 text-text-muted">#{log.resource_id}</span>
                            )}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-text-muted font-mono">
                            {log.ip_address ?? '—'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-border">
                <span className="text-sm text-text-secondary">
                  Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, logs.length)} de {logs.length}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Página anterior"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="text-sm text-text-primary font-medium px-2">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Próxima página"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}
