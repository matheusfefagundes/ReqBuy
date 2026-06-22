import { Router, Response } from 'express'
import { pool } from '../db/connection'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()

/**
 * GET /api/departments
 * Lista todos os departamentos disponíveis.
 * Requer autenticação (qualquer perfil).
 */
router.get('/', authenticate, async (_req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query('SELECT id, name FROM departamentos ORDER BY name ASC')
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

export default router
