import { useEffect, useState } from 'react'
import api from '../services/api'
import Layout from '../components/Layout'
import { mockAuditLogs } from '../dev/mockAuditLogs'
import type { MockAuditLog } from '../dev/mockAuditLogs'
import {
  ShieldCheck,
  Loader2,
  AlertCircle,
  User,
  Globe,
  Activity,
  Hash,
  Calendar,
} from 'lucide-react'

const actionConfig: Record<string, { color: string; bg: string }> = {
  LOGIN: { color: 'text-info', bg: 'bg-info-soft' },
  LOGIN_FALHOU: { color: 'text-danger', bg: 'bg-danger-soft' },
  CADASTRO: { color: 'text-accent', bg: 'bg-accent/10' },
  CRIAR_REQUISICAO: { color: 'text-success', bg: 'bg-success-soft' },
  APROVADO_REQUISICAO: { color: 'text-success', bg: 'bg-success-soft' },
  REJEITADO_REQUISICAO: { color: 'text-danger', bg: 'bg-danger-soft' },
  ACESSO_NAO_AUTORIZADO: { color: 'text-danger', bg: 'bg-danger-soft' },
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<MockAuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (import.meta.env.DEV) {
      setLogs(mockAuditLogs.list())
      setLoading(false)
      return
    }
    api
      .get<MockAuditLog[]>('/audit')
      .then((res) => setLogs(res.data))
      .catch(() => setError('Erro ao carregar logs de auditoria.'))
      .finally(() => setLoading(false))
  }, [])

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
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Logs de Auditoria</h1>
              <p className="text-sm text-text-secondary">
                {logs.length} {logs.length === 1 ? 'registro encontrado' : 'registros encontrados'}
              </p>
            </div>
          </div>
        </div>

        {/* Table */}
        {logs.length === 0 ? (
          <div className="glass p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <Activity size={28} className="text-accent" />
            </div>
            <p className="text-text-primary font-medium">Nenhum log de auditoria encontrado</p>
            <p className="text-text-muted text-sm mt-1">Os logs aparecerao conforme acoes sao realizadas no sistema</p>
          </div>
        ) : (
          <div className="glass overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-5 py-4">
                      <div className="flex items-center gap-1.5"><Calendar size={12} /> Data</div>
                    </th>
                    <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-5 py-4">
                      <div className="flex items-center gap-1.5"><User size={12} /> Usuario</div>
                    </th>
                    <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-5 py-4">
                      <div className="flex items-center gap-1.5"><Activity size={12} /> Acao</div>
                    </th>
                    <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-5 py-4">
                      <div className="flex items-center gap-1.5"><Hash size={12} /> Recurso</div>
                    </th>
                    <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-5 py-4">
                      <div className="flex items-center gap-1.5"><Globe size={12} /> IP</div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {logs.map((log) => {
                    const actionStyle = actionConfig[log.action] ?? { color: 'text-text-secondary', bg: 'bg-white/5' }
                    return (
                      <tr
                        key={log.id}
                        className="hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-5 py-4">
                          <span className="text-sm text-text-secondary whitespace-nowrap">
                            {new Date(log.created_at).toLocaleString('pt-BR')}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div>
                            <p className="text-sm font-medium text-text-primary">{log.user_name ?? '—'}</p>
                            {log.user_email && (
                              <p className="text-xs text-text-muted">{log.user_email}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${actionStyle.color} ${actionStyle.bg}`}>
                            {log.action}
                          </span>
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
