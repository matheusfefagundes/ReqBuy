import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'

import authRoutes from './routes/auth'
import requestRoutes from './routes/requests'
import auditRoutes from './routes/audit'

dotenv.config()

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:5173' }))
app.use(express.json())
app.use(morgan('dev'))

app.use('/api/auth', authRoutes)
app.use('/api/requests', requestRoutes)
app.use('/api/audit', auditRoutes)

app.listen(PORT, () => {
  console.log(`[ReqBuy] Backend rodando em http://localhost:${PORT}`)
})
