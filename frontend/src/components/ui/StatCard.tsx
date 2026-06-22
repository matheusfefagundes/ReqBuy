import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string | number
  icon: ReactNode
  iconColor: string
  iconBg: string
}

export default function StatCard({ label, value, icon, iconColor, iconBg }: StatCardProps) {
  return (
    <div className="glass p-5 hover:bg-bg-card-hover transition-colors duration-200">
      <div className="flex items-center justify-between mb-3">
        <span className="text-text-muted text-sm">{label}</span>
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center ${iconColor}`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-text-primary">{value}</p>
    </div>
  )
}
