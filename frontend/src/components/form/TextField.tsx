import { useId, useState } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '../../lib/utils'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  required?: boolean
  icon?: ReactNode
  hint?: string
  rightIcon?: ReactNode
}

export default function TextField({
  label,
  required,
  icon,
  hint,
  rightIcon,
  className,
  type = 'text',
  id,
  placeholder,
  ...rest
}: TextFieldProps) {
  const [show, setShow] = useState(false)
  const autoId = useId()
  const inputId = id ?? autoId
  const isPassword = type === 'password'
  const inputType = isPassword ? (show ? 'text' : 'password') : type

  return (
    <div className={className}>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          type={inputType}
          placeholder={placeholder ?? ' '}
          className={cn(
            'peer block w-full appearance-none rounded-none border-0 border-b-2 border-gray-200 bg-transparent py-2.5 text-sm text-gray-800 focus:border-brand-blue focus:outline-none focus:ring-0',
            icon ? 'pl-8' : 'px-0',
            (isPassword || rightIcon) && 'pr-8'
          )}
          {...rest}
        />
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'pointer-events-none absolute top-2.5 -z-10 origin-[0] -translate-y-4 scale-75 text-sm text-gray-500 duration-150 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-brand-blue',
              icon ? 'left-8' : 'left-0'
            )}
          >
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400"
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
        {!isPassword && rightIcon && (
          <span className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400">
            {rightIcon}
          </span>
        )}
      </div>
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  )
}
