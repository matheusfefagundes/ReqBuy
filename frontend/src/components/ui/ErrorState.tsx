import { AlertCircle } from 'lucide-react'

interface ErrorStateProps {
  message?: string
}

export default function ErrorState({ message = 'Ocorreu um erro ao carregar os dados.' }: ErrorStateProps) {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex items-center gap-3 text-danger bg-danger-soft px-6 py-4 rounded-xl">
        <AlertCircle size={20} />
        {message}
      </div>
    </div>
  )
}
