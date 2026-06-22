import { CheckCircle2, XCircle, Clock } from 'lucide-react'
import Badge from './Badge'

interface StatusConfig {
  label: string
  variant: 'success' | 'warning' | 'danger' | 'neutral'
  icon: React.ReactNode
}

const statusMap: Record<string, StatusConfig> = {
  pendente: {
    label: 'Pendente',
    variant: 'warning',
    icon: <Clock size={12} />,
  },
  aprovado_gestor: {
    label: 'Aprov. Gestor',
    variant: 'success',
    icon: <CheckCircle2 size={12} />,
  },
  rejeitado_gestor: {
    label: 'Rejeit. Gestor',
    variant: 'danger',
    icon: <XCircle size={12} />,
  },
  aprovado_financeiro: {
    label: 'Aprovado',
    variant: 'success',
    icon: <CheckCircle2 size={12} />,
  },
  rejeitado_financeiro: {
    label: 'Rejeitado',
    variant: 'danger',
    icon: <XCircle size={12} />,
  },
}

interface StatusBadgeProps {
  status: string
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusMap[status] ?? {
    label: status,
    variant: 'neutral' as const,
    icon: <Clock size={12} />,
  }

  return (
    <Badge variant={config.variant}>
      {config.icon}
      {config.label}
    </Badge>
  )
}
