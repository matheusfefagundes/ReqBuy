import { Client } from 'pg'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config()

async function init() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error('❌ Erro: DATABASE_URL não está definida no .env')
    process.exit(1)
  }

  // Conecta ao banco padrão "postgres" para verificar/criar o banco "reqbuy"
  const defaultDbUrl = connectionString.replace(/\/reqbuy(\?.*)?$/, '/postgres')

  console.log('🔌 Conectando ao banco padrão para verificar/criar "reqbuy"...')
  const client = new Client({ connectionString: defaultDbUrl })

  try {
    await client.connect()
    const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'reqbuy'")
    if (res.rows.length === 0) {
      console.log('📦 Banco "reqbuy" não existe. Criando...')
      await client.query('CREATE DATABASE reqbuy')
      console.log('✅ Banco "reqbuy" criado com sucesso.')
    } else {
      console.log('✅ Banco "reqbuy" já existe.')
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('❌ Erro ao verificar/criar o banco:', msg)
    console.log('\n💡 Certifique-se de que o PostgreSQL está rodando (docker compose up -d)')
    process.exit(1)
  } finally {
    await client.end()
  }

  // Conecta ao banco "reqbuy" e aplica o schema (idempotente)
  console.log('📋 Aplicando schema no banco "reqbuy"...')
  const targetClient = new Client({ connectionString })
  try {
    await targetClient.connect()

    const schemaPath = path.join(__dirname, 'schema.sql')
    const schemaSql = fs.readFileSync(schemaPath, 'utf8')

    await targetClient.query(schemaSql)
    console.log('✅ Tabelas e dados iniciais criados/verificados com sucesso!')
    console.log('\n💡 Para popular o banco com dados de teste, execute:')
    console.log('   npm run db:seed')
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('❌ Erro ao executar o schema:', msg)
    process.exit(1)
  } finally {
    await targetClient.end()
  }
}

init()
