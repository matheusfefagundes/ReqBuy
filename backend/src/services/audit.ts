import { pool } from '../db/connection'

interface AuditEntry {
  userId: number | null
  action: string
  resource?: string
  resourceId?: number
  ip?: string
}

export async function logAudit({ userId, action, resource, resourceId, ip }: AuditEntry) {
  await pool.query(
    `INSERT INTO logs_auditoria (user_id, action, resource, resource_id, ip_address)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId ?? null, action, resource ?? null, resourceId ?? null, ip ?? null]
  )
}
