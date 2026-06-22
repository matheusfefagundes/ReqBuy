import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import Layout from '../components/Layout'
import Card from '../components/ui/Card'
import InputField from '../components/ui/InputField'
import Button from '../components/ui/Button'
import PageHeader from '../components/ui/PageHeader'
import { toast } from 'sonner'
import { FileText, AlignLeft, DollarSign, Send, ArrowLeft } from 'lucide-react'

export default function NewRequestPage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/requests', {
        title,
        description,
        amount: parseFloat(amount),
      })
      toast.success('Requisição criada com sucesso!')
      navigate('/requests')
    } catch {
      toast.error('Erro ao criar requisição. Verifique os dados e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        {/* Voltar */}
        <Link
          to="/requests"
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary
            transition-colors mb-6 no-underline"
        >
          <ArrowLeft size={16} />
          Voltar para requisições
        </Link>

        <PageHeader
          title="Nova Requisição"
          subtitle="Preencha os dados da requisição de compra"
        />

        <Card padding="lg">
          <form onSubmit={handleSubmit} className="space-y-5">
            <InputField
              id="new-request-title"
              label="Título"
              as="input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              minLength={3}
              maxLength={200}
              placeholder="Ex: Compra de notebooks"
              icon={<FileText size={18} />}
            />

            <InputField
              id="new-request-description"
              label="Descrição / Justificativa"
              as="textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              minLength={10}
              rows={4}
              placeholder="Descreva a justificativa para esta compra..."
              icon={<AlignLeft size={18} />}
            />

            <InputField
              id="new-request-amount"
              label="Valor (R$)"
              as="input"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="0.01"
              step="0.01"
              placeholder="0,00"
              icon={<DollarSign size={18} />}
            />

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                id="new-request-submit"
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                icon={<Send size={18} />}
              >
                {!loading && 'Criar Requisição'}
              </Button>
              <Link
                to="/requests"
                className="flex items-center justify-center py-3 px-6 rounded-xl text-sm font-medium
                  text-text-secondary bg-white/5 hover:bg-white/10 transition-colors duration-200 no-underline"
              >
                Cancelar
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  )
}
