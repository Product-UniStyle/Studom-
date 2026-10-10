import type { SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils'

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  required?: boolean
  placeholder?: string
  options: string[]
}

export default function SelectField({
  label,
  required,
  placeholder,
  options,
  className,
  defaultValue,
  ...rest
}: SelectFieldProps) {
  return (
    <div className={className}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-gray-900">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          defaultValue={defaultValue ?? ''}
          className={cn(
            'w-full appearance-none rounded-none border-0 border-b-2 border-gray-200 bg-transparent px-0 py-2.5 pr-6 text-sm text-gray-700 focus:border-brand-blue focus:outline-none',
            !defaultValue && 'text-gray-400'
          )}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt} value={opt} className="text-gray-800">
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      </div>
    </div>
  )
}
