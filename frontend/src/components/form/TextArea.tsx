import { useId } from 'react'
import type { TextareaHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  required?: boolean
  hint?: string
}

export default function TextArea({
  label,
  required,
  hint,
  className,
  id,
  placeholder,
  rows = 4,
  ...rest
}: TextAreaProps) {
  const autoId = useId()
  const inputId = id ?? autoId

  return (
    <div className={className}>
      {label && <div className="h-5" aria-hidden="true" />}
      <div className="relative">
        <textarea
          id={inputId}
          rows={rows}
          placeholder={label ? ' ' : placeholder ?? ' '}
          className="peer block w-full appearance-none rounded-none border-0 border-b-2 border-gray-200 bg-transparent px-0 py-2.5 text-sm text-gray-800 focus:border-brand-blue focus:outline-none focus:ring-0"
          {...rest}
        />
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'pointer-events-none absolute -top-5 left-0 text-sm font-medium text-gray-900 duration-150 peer-placeholder-shown:top-2.5 peer-focus:-top-5 peer-focus:text-brand-blue'
            )}
          >
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
      </div>
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  )
}
