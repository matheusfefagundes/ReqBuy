import { Router, Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { pool } from '../db/connection'
import { logAudit } from '../services/audit'

const router = Router()

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
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
