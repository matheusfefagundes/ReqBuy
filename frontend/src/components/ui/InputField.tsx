import type { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface BaseProps {
  label: string
  icon?: ReactNode
  error?: string
  hint?: string
}

interface InputFieldProps extends BaseProps, InputHTMLAttributes<HTMLInputElement> {
  as?: 'input'
}

interface TextareaFieldProps extends BaseProps, TextareaHTMLAttributes<HTMLTextAreaElement> {
  as: 'textarea'
  rows?: number
}

type Props = InputFieldProps | TextareaFieldProps

const inputClass =
  'w-full pl-10 pr-4 py-3 rounded-xl bg-bg-input border border-border text-text-primary ' +
  'placeholder:text-text-muted/50 text-sm ' +
  'focus:outline-none focus:border-border-focus focus:ring-2 focus:ring-accent/20 ' +
  'transition-colors duration-200'

const inputClassNoIcon =
  'w-full px-4 py-3 rounded-xl bg-bg-input border border-border text-text-primary ' +
  'placeholder:text-text-muted/50 text-sm ' +
  'focus:outline-none focus:border-border-focus focus:ring-2 focus:ring-accent/20 ' +
  'transition-colors duration-200'

export default function InputField(props: Props) {
  const { label, icon, error, hint, as = 'input', ...rest } = props
  const [showPassword, setShowPassword] = useState(false)

  const id = (rest as { id?: string }).id ?? label.toLowerCase().replace(/\s+/g, '-')

  const inputRest = rest as InputHTMLAttributes<HTMLInputElement>
  const isPassword = as === 'input' && inputRest.type === 'password'
  const currentType = isPassword ? (showPassword ? 'text' : 'password') : inputRest.type

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-text-secondary mb-2">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
            {icon}
          </span>
        )}
        {as === 'textarea' ? (
          <textarea
            id={id}
            className={[
              icon ? inputClass : inputClassNoIcon,
              'resize-none',
              error ? 'border-danger focus:border-danger focus:ring-danger/20' : '',
            ].join(' ')}
            style={icon ? { paddingLeft: '2.5rem', paddingTop: '0.75rem' } : undefined}
            {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <>
            <input
              id={id}
              {...(rest as InputHTMLAttributes<HTMLInputElement>)}
              type={currentType}
              className={[
                icon ? inputClass : inputClassNoIcon,
                isPassword ? 'pr-11' : '',
                error ? 'border-danger focus:border-danger focus:ring-danger/20' : '',
              ].join(' ')}
            />
            {isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors focus:outline-none"
                tabIndex={-1}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            )}
          </>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-xs text-text-muted">{hint}</p>}
    </div>
  )
}
