import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'sonner'
import { ShoppingCart, User, Mail, Lock, Briefcase, Building2, ArrowRight, Loader2 } from 'lucide-react'

const DEPARTMENTS = [
  { id: 1, name: 'TI' },
  { id: 2, name: 'RH' },
  { id: 3, name: 'Financeiro' },
  { id: 4, name: 'Operacoes' },
]

const ROLES = [
  { value: 'solicitante', label: 'Solicitante' },
  { value: 'aprovador', label: 'Aprovador' },
  { value: 'financeiro', label: 'Setor Financeiro' },
]

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'solicitante' | 'aprovador' | 'financeiro'>('solicitante')
  const [departmentId, setDepartmentId] = useState(1)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await register({ name, email, password, role, departmentId })
      toast.success('Conta criada com sucesso! Faca login para continuar.')
      navigate('/login')
    } catch {
      toast.error('Erro ao criar conta. Verifique os dados e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-bg-primary">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent mb-4">
            <ShoppingCart size={28} className="text-black" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">ReqBuy</h1>
          <p className="text-text-secondary mt-1 text-sm">Criar sua conta</p>
        </div>

        {/* Card */}
        <div className="glass p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-text-primary mb-1">Cadastre-se</h2>
          <p className="text-text-muted text-sm mb-6">Preencha os dados para criar sua conta</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Nome completo</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  id="register-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={3}
                  placeholder="Seu nome completo"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-bg-input border border-border text-text-primary
                    placeholder:text-text-muted/50 text-sm
                    focus:outline-none focus:border-border-focus focus:ring-2 focus:ring-accent/20
                    transition-colors duration-200"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">E-mail</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="seu@email.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-bg-input border border-border text-text-primary
                    placeholder:text-text-muted/50 text-sm
                    focus:outline-none focus:border-border-focus focus:ring-2 focus:ring-accent/20
                    transition-colors duration-200"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Senha</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  id="register-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="Minimo 6 caracteres"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-bg-input border border-border text-text-primary
                    placeholder:text-text-muted/50 text-sm
                    focus:outline-none focus:border-border-focus focus:ring-2 focus:ring-accent/20
                    transition-colors duration-200"
                />
              </div>
            </div>

            {/* Role and Department row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Perfil</label>
                <div className="relative">
                  <Briefcase size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                  <select
                    id="register-role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as typeof role)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-bg-input border border-border text-text-primary text-sm
                      appearance-none cursor-pointer
                      focus:outline-none focus:border-border-focus focus:ring-2 focus:ring-accent/20
                      transition-colors duration-200"
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Setor</label>
                <div className="relative">
                  <Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                  <select
                    id="register-department"
                    value={departmentId}
                    onChange={(e) => setDepartmentId(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-bg-input border border-border text-text-primary text-sm
                      appearance-none cursor-pointer
                      focus:outline-none focus:border-border-focus focus:ring-2 focus:ring-accent/20
                      transition-colors duration-200"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              id="register-submit"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl
                bg-accent text-black font-semibold text-sm
                hover:bg-accent-hover
                active:scale-[0.98] transition-colors duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
                cursor-pointer border-0 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Criando conta...
                </>
              ) : (
                <>
                  Criar conta
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Login link */}
          <p className="text-center text-sm text-text-muted mt-6">
            Ja tem conta?{' '}
            <Link
              to="/login"
              className="text-accent hover:text-accent-hover font-medium transition-colors no-underline"
            >
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
