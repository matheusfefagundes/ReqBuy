import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { mockRequests } from '../dev/mockRequests'
import type { MockRequest } from '../dev/mockRequests'
import Layout from '../components/Layout'
import {
  FileText,
  FilePlus,
  Clock,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Loader2,
} from 'lucide-react'

const roleLabel: Record<string, string> = {
  solicitante: 'Solicitante',
  aprovador: 'Aprovador',
  financeiro: 'Financeiro',
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<MockRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (import.meta.env.DEV) {
      setRequests(mockRequests.list(user!.id, user!.role, 1))
      setLoading(false)
      return
    }
    api
      .get<MockRequest[]>('/requests')
      .then((res) => setRequests(res.data))
      .finally(() => setLoading(false))
  }, [user])

  const totalRequests = requests.length
  const pendingRequests = requests.filter((r) => r.status === 'pendente').length
  const approvedRequests = requests.filter((r) =>
    r.status === 'aprovado_gestor' || r.status === 'aprovado_financeiro'
  ).length
  const totalValue = requests.reduce((acc, r) => acc + r.amount, 0)

  const stats = [
    {
      label: 'Total de Requisicoes',
      value: totalRequests,
      icon: <FileText size={22} />,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      label: 'Pendentes',
      value: pendingRequests,
      icon: <Clock size={22} />,
      color: 'text-warning',
      bgColor: 'bg-warning-soft',
    },
    {
      label: 'Aprovadas',
      value: approvedRequests,
      icon: <CheckCircle2 size={22} />,
      color: 'text-success',
      bgColor: 'bg-success-soft',
    },
    {
      label: 'Valor Total',
      value: totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      icon: <TrendingUp size={22} />,
      color: 'text-info',
      bgColor: 'bg-info-soft',
    },
  ]

  const quickActions = [
    {
      to: '/requests/new',
      icon: <FilePlus size={24} />,
      title: 'Nova Requisicao',
      description: 'Criar uma nova requisicao de compra',
    },
    {
      to: '/requests',
      icon: <FileText size={24} />,
      title: 'Ver Requisicoes',
      description: 'Acompanhar status dos seus pedidos',
    },
  ]

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-1">
            Ola, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-text-secondary text-sm">
            {roleLabel[user?.role ?? '']} - Aqui esta o resumo das suas requisicoes
          </p>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={32} className="animate-spin text-accent" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="glass p-5 hover:bg-bg-card-hover transition-colors duration-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-text-muted text-sm">{stat.label}</span>
                    <div className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center ${stat.color}`}>
                      {stat.icon}
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-text-primary mb-4">Acoes Rapidas</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickActions.map((action) => (
                  <Link
                    key={action.to}
                    to={action.to}
                    className="group glass p-5 flex items-center gap-4
                      hover:bg-bg-card-hover transition-colors duration-200
                      no-underline"
                  >
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                      {action.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-text-primary">{action.title}</p>
                      <p className="text-xs text-text-muted mt-0.5">{action.description}</p>
                    </div>
                    <ArrowRight size={18} className="text-text-muted group-hover:text-accent transition-colors duration-200" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Requests */}
            {requests.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-text-primary">Requisicoes Recentes</h2>
                  <Link
                    to="/requests"
                    className="text-sm text-accent hover:text-accent-hover transition-colors no-underline flex items-center gap-1"
                  >
                    Ver todas <ArrowRight size={14} />
                  </Link>
                </div>
                <div className="glass overflow-hidden">
                  <div className="divide-y divide-border">
                    {requests.slice(0, 5).map((req) => (
                      <div
                        key={req.id}
                        className="flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-2 h-2 rounded-full shrink-0"
                            style={{
                              backgroundColor:
                                req.status === 'pendente' ? '#f59e0b' :
                                req.status.includes('aprovado') ? '#22c55e' : '#ef4444'
                            }}
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-text-primary truncate">{req.title}</p>
                            <p className="text-xs text-text-muted mt-0.5">
                              {new Date(req.created_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-text-primary shrink-0 ml-4">
                          {req.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}
