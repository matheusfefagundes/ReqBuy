import { Router, Response } from 'express'
import { pool } from '../db/connection'
import { authenticate, authorize, AuthRequest } from '../middleware/auth'

const router = Router()

router.get('/', authenticate, authorize('financeiro'), async (_req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT al.*, u.name AS user_name, u.email AS user_email
       FROM logs_auditoria al
       LEFT JOIN usuarios u ON al.user_id = u.id
       ORDER BY al.created_at DESC
       LIMIT 500`
    )
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

export default router
