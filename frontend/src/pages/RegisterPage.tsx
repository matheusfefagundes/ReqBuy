import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Card from '../components/ui/Card'
import InputField from '../components/ui/InputField'
import Button from '../components/ui/Button'
import { toast } from 'sonner'
import { ShoppingCart, User, Mail, Lock, ArrowRight } from 'lucide-react'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await register({ name, email, password })
      toast.success('Conta criada com sucesso! Faça login para continuar.')
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

        <Card padding="lg">
          <h2 className="text-xl font-semibold text-text-primary mb-1">Cadastre-se</h2>
          <p className="text-text-muted text-sm mb-6">Preencha os dados para criar sua conta</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              id="register-name"
              label="Nome completo"
              as="input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={3}
              placeholder="Seu nome completo"
              icon={<User size={18} />}
            />

            <InputField
              id="register-email"
              label="E-mail"
              as="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="seu@email.com"
              icon={<Mail size={18} />}
            />

            <InputField
              id="register-password"
              label="Senha"
              as="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="Mínimo 6 caracteres"
              icon={<Lock size={18} />}
            />

            <Button
              id="register-submit"
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              icon={<ArrowRight size={18} />}
              className="mt-2"
            >
              {!loading && 'Criar conta'}
            </Button>
          </form>

          <p className="text-center text-sm text-text-muted mt-6">
            Já tem conta?{' '}
            <Link
              to="/login"
              className="text-accent hover:text-accent-hover font-medium transition-colors no-underline"
            >
              Entrar
            </Link>
          </p>
        </Card>
      </div>
    </div>
  )
}
