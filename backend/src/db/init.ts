import { Client } from 'pg'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config()

async function init() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error('Erro: DATABASE_URL não está definida no .env')
    process.exit(1)
  }

  // Substitui /reqbuy na URL de conexão por /postgres para conectar ao banco padrão e poder criar o reqbuy
  const defaultDbUrl = connectionString.replace(/\/reqbuy(\?.*)?$/, '/postgres')

  console.log('Conectando ao banco de dados padrão para verificar/criar o banco "reqbuy"...')
  const client = new Client({ connectionString: defaultDbUrl })
  
  try {
    await client.connect()
    const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'reqbuy'")
    if (res.rows.length === 0) {
      console.log('Banco de dados "reqbuy" não existe. Criando...')
      await client.query('CREATE DATABASE reqbuy')
      console.log('Banco de dados "reqbuy" criado com sucesso.')
    } else {
      console.log('Banco de dados "reqbuy" já existe.')
    }
  } catch (err: any) {
    console.error('Erro ao verificar/criar o banco de dados:', err.message || err)
    console.log('\nCertifique-se de que o PostgreSQL está rodando localmente na porta 5432.')
    process.exit(1)
  } finally {
    await client.end()
  }

  console.log('Conectando ao banco de dados "reqbuy" para criar as tabelas...')
  const targetClient = new Client({ connectionString })
  try {
    await targetClient.connect()
    
    // Lê o schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql')
    const schemaSql = fs.readFileSync(schemaPath, 'utf8')
    
    console.log('Executando o schema.sql...')
    await targetClient.query(schemaSql)
    console.log('Tabelas e dados iniciais criados com sucesso!')
  } catch (err: any) {
    console.error('Erro ao executar o schema:', err.message || err)
    process.exit(1)
  } finally {
    await targetClient.end()
  }
}

init()
