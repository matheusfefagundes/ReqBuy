import { Toaster } from 'sonner'

export default function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast: 'bg-[#111111] text-[#f5f5f5] border border-[rgba(255,255,255,0.08)] rounded-xl font-sans',
          success: '!bg-[#22c55e] !text-white !border-none',
          error: '!bg-[#ef4444] !text-white !border-none',
          warning: '!bg-[#f59e0b] !text-white !border-none',
        },
      }}
    />
  )
}
