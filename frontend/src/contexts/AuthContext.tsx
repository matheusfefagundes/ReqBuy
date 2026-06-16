import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import api from '../services/api'

const DEV_USERS: Record<string, { password: string; user: User; token: string }> = {
  'solicitante@reqbuy.dev': {
    password: '123456',
    token: 'dev-token-solicitante',
    user: { id: 1, name: 'Ana Solicitante', email: 'solicitante@reqbuy.dev', role: 'solicitante' },
  },
  'aprovador@reqbuy.dev': {
    password: '123456',
    token: 'dev-token-aprovador',
    user: { id: 2, name: 'Bruno Aprovador', email: 'aprovador@reqbuy.dev', role: 'aprovador' },
  },
  'financeiro@reqbuy.dev': {
    password: '123456',
    token: 'dev-token-financeiro',
    user: { id: 3, name: 'Carla Financeiro', email: 'financeiro@reqbuy.dev', role: 'financeiro' },
  },
}

interface User {
  id: number
  name: string
  email: string
  role: 'solicitante' | 'aprovador' | 'financeiro'
}

interface RegisterData {
  name: string
  email: string
  password: string
  role: User['role']
  departmentId: number
}

interface AuthContextValue {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = sessionStorage.getItem('user')
    return stored ? (JSON.parse(stored) as User) : null
  })

  async function login(email: string, password: string) {
    if (import.meta.env.DEV && DEV_USERS[email]?.password === password) {
      const mock = DEV_USERS[email]
      sessionStorage.setItem('token', mock.token)
      sessionStorage.setItem('user', JSON.stringify(mock.user))
      setUser(mock.user)
      return
    }

    const { data } = await api.post<{ token: string; user: User }>('/auth/login', {
      email,
      password,
    })
    sessionStorage.setItem('token', data.token)
    sessionStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
  }

  async function register(data: RegisterData) {
    if (import.meta.env.DEV) {
      const newUser: User = { id: Date.now(), name: data.name, email: data.email, role: data.role }
      const token = `dev-token-${data.email}`
      DEV_USERS[data.email] = { password: data.password, token, user: newUser }
      sessionStorage.setItem('token', token)
      sessionStorage.setItem('user', JSON.stringify(newUser))
      setUser(newUser)
      return
    }

    const { data: resData } = await api.post<{ token: string; user: User }>('/auth/register', data)
    sessionStorage.setItem('token', resData.token)
    sessionStorage.setItem('user', JSON.stringify(resData.user))
    setUser(resData.user)
  }

  function logout() {
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
