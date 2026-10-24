import { useState } from 'react'
import type { SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils'

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  required?: boolean
  placeholder?: string
  options: string[]
  labelClassName?: string
  /** Label floats above the field once a value is chosen, instead of sitting above it always (matches TextField). */
  floatingLabel?: boolean
}

export default function SelectField({
  label,
  required,
  placeholder,
  options,
  className,
  labelClassName,
  defaultValue,
  floatingLabel = false,
  onChange,
  ...rest
}: SelectFieldProps) {
  const [value, setValue] = useState(defaultValue ?? '')

  if (floatingLabel) {
    const hasValue = Boolean(value)
    return (
      <div className={className}>
        {label && <div className="h-5" aria-hidden="true" />}
        <div className="relative">
          <select
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              onChange?.(e)
            }}
            className={cn(
              'w-full appearance-none rounded-none border-0 border-b-2 border-gray-200 bg-transparent px-0 py-2.5 pr-6 text-sm focus:border-brand-blue focus:outline-none',
              hasValue ? 'text-gray-700' : 'text-transparent'
            )}
            {...rest}
          >
            <option value="" disabled hidden />
            {options.map((opt) => (
              <option key={opt} value={opt} className="text-gray-800">
                {opt}
              </option>
            ))}
          </select>
          {label && (
            <label
              className={cn(
                'pointer-events-none absolute left-0 text-sm font-medium duration-150',
                hasValue ? '-top-5' : 'top-2.5',
                labelClassName
              )}
            >
              {label} {required && <span className="text-red-500">*</span>}
            </label>
          )}
          <ChevronDown className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      {label && (
        <label className={cn('mb-1.5 block text-sm font-medium text-gray-900', labelClassName)}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          defaultValue={defaultValue ?? ''}
          onChange={onChange}
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
