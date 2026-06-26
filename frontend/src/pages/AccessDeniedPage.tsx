import { Link } from 'react-router-dom'
import { ShieldX, ArrowLeft } from 'lucide-react'

export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-bg-primary">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-danger-soft mb-6">
          <ShieldX size={36} className="text-danger" />
        </div>

        <h1 className="text-2xl font-bold text-text-primary mb-2">
          Acesso Negado
        </h1>
        <p className="text-text-secondary text-sm mb-8 leading-relaxed">
          Você não tem permissão para acessar esta página.
          Seu perfil de acesso não possui os privilégios necessários.
        </p>

        <div className="glass p-4 rounded-xl mb-8">
          <p className="text-xs text-text-muted">
            Esta tentativa de acesso foi registrada nos logs de auditoria do sistema.
          </p>
        </div>

        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl
            bg-accent text-black font-semibold text-sm
            hover:bg-accent-hover transition-colors duration-200 no-underline"
        >
          <ArrowLeft size={18} />
          Voltar ao Dashboard
        </Link>
      </div>
    </div>
  )
}
