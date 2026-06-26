/**
 * ReqBuy — Script de Seed
 * Popula o banco com usuários de teste e dados realistas.
 * Seguro para re-executar: usa ON CONFLICT DO NOTHING nos usuários.
 *
 * Usuários criados:
 *   solicitante@reqbuy.dev  |  Senha@123  |  Perfil: solicitante  |  Depto: TI
 *   aprovador@reqbuy.dev    |  Senha@123  |  Perfil: aprovador    |  Depto: TI
 *   financeiro@reqbuy.dev   |  Senha@123  |  Perfil: financeiro   |  Depto: Financeiro
 */

import { Pool } from 'pg'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'

dotenv.config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL?.trim(),
})

const HASH_ROUNDS = 12
const DEFAULT_PASSWORD = 'Senha@123'

async function seed() {
  const client = await pool.connect()

  try {
    console.log('🌱 Iniciando seed do banco de dados ReqBuy...\n')

    // ─── Buscar IDs de departamentos ────────────────────────────────────────
    const deptResult = await client.query(
      "SELECT id, name FROM departamentos WHERE name IN ('TI', 'Financeiro')"
    )
    const deptMap: Record<string, number> = {}
    for (const row of deptResult.rows) {
      deptMap[row.name] = row.id
    }

    if (!deptMap['TI'] || !deptMap['Financeiro']) {
      console.error('❌ Departamentos não encontrados. Execute primeiro: npm run db:init')
      process.exit(1)
    }

    const tiId = deptMap['TI']
    const finId = deptMap['Financeiro']

    // ─── Criar usuários de teste ─────────────────────────────────────────────
    console.log('👤 Criando usuários de teste...')

    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, HASH_ROUNDS)

    const users: { name: string; email: string; role: string; department_id: number }[] = [
      { name: 'Ana Solicitante',  email: 'solicitante@reqbuy.dev', role: 'solicitante', department_id: tiId  },
      { name: 'Bruno Aprovador',  email: 'aprovador@reqbuy.dev',   role: 'aprovador',   department_id: tiId  },
      { name: 'Carla Financeiro', email: 'financeiro@reqbuy.dev',  role: 'financeiro',  department_id: finId },
    ]

    const userIds: Record<string, number> = {}

    for (const u of users) {
      const res = await client.query(
        `INSERT INTO usuarios (name, email, password_hash, role, department_id)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (email) DO UPDATE
           SET name = EXCLUDED.name,
               password_hash = EXCLUDED.password_hash,
               role = EXCLUDED.role,
               department_id = EXCLUDED.department_id
         RETURNING id, email`,
        [u.name, u.email, passwordHash, u.role, u.department_id]
      )
      userIds[u.email] = res.rows[0].id
      console.log(`  ✅ ${u.name} (${u.role}) — ${u.email}`)
    }

    const solicitanteId = userIds['solicitante@reqbuy.dev']
    const aprovadorId   = userIds['aprovador@reqbuy.dev']
    const financeiroId  = userIds['financeiro@reqbuy.dev']

    // ─── Limpar dados anteriores (requisições e ações) ───────────────────────
    await client.query('DELETE FROM acoes_solicitacao')
    await client.query('DELETE FROM solicitacoes_compra')
    await client.query('DELETE FROM logs_auditoria')
    console.log('\n🧹 Dados anteriores removidos (requisições, ações, logs)')

    // ─── Criar requisições de compra ─────────────────────────────────────────
    console.log('\n📋 Criando requisições de compra...')

    const requests: {
      title: string
      description: string
      amount: number
      status: string
      requester_id: number
      department_id: number
    }[] = [
      {
        title: 'Compra de 5 notebooks Dell',
        description: 'Aquisição de notebooks Dell Inspiron 15 para a equipe de desenvolvimento de software. Necessário para novos contratados.',
        amount: 22500.00,
        status: 'pendente',
        requester_id: solicitanteId,
        department_id: tiId,
      },
      {
        title: 'Licença Adobe Creative Cloud — Anual',
        description: 'Renovação anual das 3 licenças Adobe Creative Cloud para a equipe de design. Vencimento em 30/07/2026.',
        amount: 4800.00,
        status: 'aprovado_gestor',
        requester_id: solicitanteId,
        department_id: tiId,
      },
      {
        title: 'Headsets com cancelamento de ruído',
        description: 'Aquisição de 10 headsets Jabra Evolve2 55 para reuniões remotas e melhor produtividade da equipe.',
        amount: 9800.00,
        status: 'aprovado_financeiro',
        requester_id: solicitanteId,
        department_id: tiId,
      },
      {
        title: 'Upgrade de memória RAM — Servidores',
        description: 'Expansão de memória RAM dos 3 servidores de homologação de 32GB para 64GB cada.',
        amount: 6750.00,
        status: 'rejeitado_gestor',
        requester_id: solicitanteId,
        department_id: tiId,
      },
      {
        title: 'Software de gestão de projetos — Jira',
        description: 'Assinatura anual do Jira Software para equipe de 25 usuários. Plano Standard.',
        amount: 3200.00,
        status: 'rejeitado_financeiro',
        requester_id: solicitanteId,
        department_id: tiId,
      },
      {
        title: 'Monitor 4K 27" — Estações de trabalho',
        description: 'Aquisição de monitores 4K Samsung 27" para 5 estações de trabalho da equipe sênior.',
        amount: 7500.00,
        status: 'pendente',
        requester_id: solicitanteId,
        department_id: tiId,
      },
      {
        title: 'Treinamento — Segurança da Informação',
        description: 'Curso de capacitação em segurança da informação para toda a equipe de TI (12 pessoas). Inclui certificação.',
        amount: 18000.00,
        status: 'aprovado_gestor',
        requester_id: solicitanteId,
        department_id: tiId,
      },
      {
        title: 'Switch gerenciável 48 portas',
        description: 'Substituição do switch de núcleo da sala de servidores. Equipamento atual com 7 anos de uso.',
        amount: 12400.00,
        status: 'pendente',
        requester_id: solicitanteId,
        department_id: tiId,
      },
    ]

    const requestIds: number[] = []
    for (const r of requests) {
      const res = await client.query(
        `INSERT INTO solicitacoes_compra
           (title, description, amount, status, requester_id, department_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [r.title, r.description, r.amount, r.status, r.requester_id, r.department_id]
      )
      requestIds.push(res.rows[0].id)
      console.log(`  ✅ #${res.rows[0].id} "${r.title}" — ${r.status}`)
    }

    // ─── Criar ações de aprovação/rejeição ───────────────────────────────────
    console.log('\n🔄 Criando ações de aprovação/rejeição...')

    // Req índice 1 (aprovado_gestor) — aprovada pelo aprovador
    await client.query(
      `INSERT INTO acoes_solicitacao (request_id, user_id, action, comment)
       VALUES ($1, $2, $3, $4)`,
      [requestIds[1], aprovadorId, 'aprovado', 'Licença necessária para manter continuidade dos projetos de design.']
    )

    // Req índice 2 (aprovado_financeiro) — aprovada em dois passos
    await client.query(
      `INSERT INTO acoes_solicitacao (request_id, user_id, action, comment)
       VALUES ($1, $2, $3, $4)`,
      [requestIds[2], aprovadorId, 'aprovado', 'Equipamentos essenciais para home office e reuniões.']
    )
    await client.query(
      `INSERT INTO acoes_solicitacao (request_id, user_id, action, comment)
       VALUES ($1, $2, $3, $4)`,
      [requestIds[2], financeiroId, 'aprovado', 'Aprovado. Dentro do orçamento previsto para Q3.']
    )

    // Req índice 3 (rejeitado_gestor)
    await client.query(
      `INSERT INTO acoes_solicitacao (request_id, user_id, action, comment)
       VALUES ($1, $2, $3, $4)`,
      [requestIds[3], aprovadorId, 'rejeitado', 'Budget do trimestre já está comprometido. Revisar para próximo ciclo.']
    )

    // Req índice 4 (rejeitado_financeiro)
    await client.query(
      `INSERT INTO acoes_solicitacao (request_id, user_id, action, comment)
       VALUES ($1, $2, $3, $4)`,
      [requestIds[4], aprovadorId, 'aprovado', 'Ferramenta essencial para gestão ágil.']
    )
    await client.query(
      `INSERT INTO acoes_solicitacao (request_id, user_id, action, comment)
       VALUES ($1, $2, $3, $4)`,
      [requestIds[4], financeiroId, 'rejeitado', 'Já temos Microsoft Planner disponível. Solicitar reavaliação da necessidade.']
    )

    // Req índice 6 (aprovado_gestor)
    await client.query(
      `INSERT INTO acoes_solicitacao (request_id, user_id, action, comment)
       VALUES ($1, $2, $3, $4)`,
      [requestIds[6], aprovadorId, 'aprovado', 'Treinamento alinhado com o plano anual de capacitação da equipe.']
    )

    console.log('  ✅ Ações registradas')

    // ─── Criar logs de auditoria de exemplo ─────────────────────────────────
    console.log('\n📝 Criando logs de auditoria de exemplo...')

    const auditEntries = [
      { user_id: solicitanteId, action: 'LOGIN',                resource: 'usuarios',           resource_id: solicitanteId, ip_address: '192.168.1.5'  },
      { user_id: solicitanteId, action: 'CADASTRO',             resource: 'usuarios',           resource_id: solicitanteId, ip_address: '192.168.1.5'  },
      { user_id: solicitanteId, action: 'CRIAR_REQUISICAO',     resource: 'solicitacoes_compra', resource_id: requestIds[0], ip_address: '192.168.1.5' },
      { user_id: solicitanteId, action: 'CRIAR_REQUISICAO',     resource: 'solicitacoes_compra', resource_id: requestIds[1], ip_address: '192.168.1.5' },
      { user_id: solicitanteId, action: 'EDITAR_REQUISICAO',    resource: 'solicitacoes_compra', resource_id: requestIds[0], ip_address: '192.168.1.5' },
      { user_id: aprovadorId,   action: 'LOGIN',                resource: 'usuarios',           resource_id: aprovadorId,   ip_address: '192.168.1.10' },
      { user_id: aprovadorId,   action: 'APROVADO_REQUISICAO',  resource: 'solicitacoes_compra', resource_id: requestIds[1], ip_address: '192.168.1.10' },
      { user_id: aprovadorId,   action: 'APROVADO_REQUISICAO',  resource: 'solicitacoes_compra', resource_id: requestIds[2], ip_address: '192.168.1.10' },
      { user_id: aprovadorId,   action: 'REJEITADO_REQUISICAO', resource: 'solicitacoes_compra', resource_id: requestIds[3], ip_address: '192.168.1.10' },
      { user_id: aprovadorId,   action: 'ACESSO_NAO_AUTORIZADO',resource: 'solicitacoes_compra', resource_id: null,          ip_address: '192.168.1.10' },
      { user_id: financeiroId,  action: 'LOGIN',                resource: 'usuarios',           resource_id: financeiroId,  ip_address: '192.168.1.20' },
      { user_id: financeiroId,  action: 'APROVADO_REQUISICAO',  resource: 'solicitacoes_compra', resource_id: requestIds[2], ip_address: '192.168.1.20' },
      { user_id: financeiroId,  action: 'REJEITADO_REQUISICAO', resource: 'solicitacoes_compra', resource_id: requestIds[4], ip_address: '192.168.1.20' },
      { user_id: financeiroId,  action: 'EXCLUIR_REQUISICAO',   resource: 'solicitacoes_compra', resource_id: 999,           ip_address: '192.168.1.20' },
      { user_id: null,          action: 'LOGIN_FALHOU',          resource: 'usuarios',           resource_id: null,          ip_address: '10.0.0.99'    },
    ]

    for (const entry of auditEntries) {
      await client.query(
        `INSERT INTO logs_auditoria (user_id, action, resource, resource_id, ip_address)
         VALUES ($1, $2, $3, $4, $5)`,
        [entry.user_id, entry.action, entry.resource, entry.resource_id, entry.ip_address]
      )
    }
    console.log(`  ✅ ${auditEntries.length} logs de auditoria criados`)

    // ─── Resumo ─────────────────────────────────────────────────────────────
    console.log('\n' + '─'.repeat(50))
    console.log('🎉 Seed concluído com sucesso!\n')
    console.log('👥 Usuários de teste:')
    console.log(`   📧 solicitante@reqbuy.dev  |  🔑 ${DEFAULT_PASSWORD}  |  Perfil: Solicitante`)
    console.log(`   📧 aprovador@reqbuy.dev    |  🔑 ${DEFAULT_PASSWORD}  |  Perfil: Aprovador`)
    console.log(`   📧 financeiro@reqbuy.dev   |  🔑 ${DEFAULT_PASSWORD}  |  Perfil: Financeiro`)
    console.log('─'.repeat(50))

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('\n❌ Erro durante o seed:', msg)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

seed()
