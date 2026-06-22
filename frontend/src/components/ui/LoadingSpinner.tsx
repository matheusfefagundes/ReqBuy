import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: number
  className?: string
  fullPage?: boolean
}

export default function LoadingSpinner({ size = 32, className = '', fullPage = true }: LoadingSpinnerProps) {
  if (fullPage) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={size} className={`animate-spin text-accent ${className}`} />
      </div>
    )
  }
  return <Loader2 size={size} className={`animate-spin text-accent ${className}`} />
}
