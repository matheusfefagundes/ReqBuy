import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'sonner'
import { ShoppingCart, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      toast.success('Login realizado com sucesso!')
      navigate('/dashboard')
    } catch {
      toast.error('E-mail ou senha invalidos.')
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
          <p className="text-text-secondary mt-1 text-sm">Sistema de Requisicoes de Compra</p>
        </div>

        {/* Card */}
        <div className="glass p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-text-primary mb-1">Bem-vindo de volta</h2>
          <p className="text-text-muted text-sm mb-6">Entre com suas credenciais para continuar</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">E-mail</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  id="login-email"
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
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="********"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-bg-input border border-border text-text-primary
                    placeholder:text-text-muted/50 text-sm
                    focus:outline-none focus:border-border-focus focus:ring-2 focus:ring-accent/20
                    transition-colors duration-200"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl
                bg-accent text-black font-semibold text-sm
                hover:bg-accent-hover
                active:scale-[0.98] transition-colors duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
                cursor-pointer border-0"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  Entrar
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Register link */}
          <p className="text-center text-sm text-text-muted mt-6">
            Nao tem conta?{' '}
            <Link
              to="/register"
              className="text-accent hover:text-accent-hover font-medium transition-colors no-underline"
            >
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
