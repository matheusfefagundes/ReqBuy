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
                  {logs.map((log) => {
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
          </div>
        )}
      </div>
    </Layout>
  )
}
