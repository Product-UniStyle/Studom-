import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'

export default function FilterDropdown({
  label,
  value,
  placeholder,
  options,
  onChange,
}: {
  label: string
  value: string
  placeholder: string
  options: string[]
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div ref={containerRef} className="relative flex-1 px-0 md:px-6">
      <div className="text-sm font-semibold text-black">{label}</div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-0.5 flex w-full items-center justify-between gap-2 truncate bg-transparent text-left text-sm text-gray-500 focus:outline-none"
      >
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-20 mt-2 max-h-64 w-full min-w-[12rem] overflow-auto rounded-xl border border-gray-100 bg-white p-1.5 text-sm shadow-lg">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt)
                setOpen(false)
              }}
              className={`block w-full truncate rounded-lg px-3 py-2 text-left hover:bg-gray-50 ${
                opt === value ? 'bg-blue-50 font-medium text-blue-600' : 'text-black'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
