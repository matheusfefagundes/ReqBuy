import { Router, Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { pool } from '../db/connection'
import { logAudit } from '../services/audit'

const router = Router()

const registerSchema = z.object({
  name: z.string().min(3).max(150),
  email: z.email(),
  password: z.string().min(6),
  role: z.enum(['solicitante', 'aprovador', 'financeiro']),
  departmentId: z.number().int().positive(),
})

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
})

router.post('/register', async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() })
    return
  }

  const { name, email, password, role, departmentId } = parsed.data
  const ip = req.ip ?? 'unknown'

  try {
    const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email])
    if (exists.rows.length > 0) {
      res.status(409).json({ error: 'E-mail já cadastrado' })
      return
    }

    const password_hash = await bcrypt.hash(password, 12)
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, department_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role`,
      [name, email, password_hash, role, departmentId]
    )

    const user = result.rows[0]
    const token = jwt.sign(
      { id: user.id, role: user.role, departmentId },
      process.env.JWT_SECRET!,
      { expiresIn: '8h' }
    )

    await logAudit({ userId: user.id, action: 'CADASTRO', resource: 'users', resourceId: user.id, ip })

    res.status(201).json({ token, user })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

router.post('/login', async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() })
    return
  }

  const { email, password } = parsed.data
  const ip = req.ip ?? 'unknown'

  try {
    const result = await pool.query(
      'SELECT id, name, email, password_hash, role, department_id FROM users WHERE email = $1',
      [email]
    )

    const user = result.rows[0]
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      await logAudit({ userId: null, action: 'LOGIN_FALHOU', resource: 'users', ip })
      res.status(401).json({ error: 'Credenciais inválidas' })
      return
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, departmentId: user.department_id },
      process.env.JWT_SECRET!,
      { expiresIn: '8h' }
    )

    await logAudit({ userId: user.id, action: 'LOGIN', resource: 'users', ip })

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

export default router
