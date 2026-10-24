import { useEffect, useId, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'

export default function FloatingSelectField({ label, options, name, className = '' }: {
  label: string
  options: string[]
  name?: string
  className?: string
}) {
  const id = useId()
  const root = useRef<HTMLDivElement>(null)
  const [value, setValue] = useState('')
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const [active, setActive] = useState(0)
  const search = useRef({ text: '', time: 0 })

  useEffect(() => {
    if (!open) return
    const closeOutside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', closeOutside)
    return () => document.removeEventListener('pointerdown', closeOutside)
  }, [open])

  useEffect(() => {
    if (open) document.getElementById(`${id}-${active}`)?.scrollIntoView({ block: 'nearest' })
  }, [active, open, id])

  const choose = (index: number) => {
    setValue(options[index])
    setOpen(false)
  }

  return (
    <div ref={root} className={`relative pt-5 ${className}`}>
      {name && <input type="hidden" name={name} value={value} />}
      <button
        type="button"
        role="combobox"
        aria-labelledby={`${id}-label`}
        aria-controls={`${id}-list`}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-activedescendant={open ? `${id}-${active}` : undefined}
        onFocus={() => setFocused(true)}
        onBlur={() => { setFocused(false); setOpen(false) }}
        onClick={() => {
          setActive(Math.max(0, options.indexOf(value)))
          setOpen(!open)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Tab') { setOpen(false); return }
          if (event.key === 'Escape') { event.preventDefault(); setOpen(false); return }
          if (['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', ' '].includes(event.key)) {
            event.preventDefault()
            if (!open) { setActive(Math.max(0, options.indexOf(value))); setOpen(true); return }
            if (event.key === 'Enter' || event.key === ' ') choose(active)
            else if (event.key === 'Home') setActive(0)
            else if (event.key === 'End') setActive(options.length - 1)
            else setActive((index) => Math.max(0, Math.min(options.length - 1, index + (event.key === 'ArrowDown' ? 1 : -1))))
          } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
            event.preventDefault()
            const now = Date.now()
            search.current = { text: (now - search.current.time < 700 ? search.current.text : '') + event.key.toLowerCase(), time: now }
            const index = options.findIndex((option) => option.toLowerCase().startsWith(search.current.text))
            if (index >= 0) { setActive(index); setOpen(true) }
          }
        }}
        className="relative flex min-h-11 w-full items-center justify-between gap-2 border-b-2 border-gray-200 bg-transparent py-2.5 text-left text-sm text-gray-800 focus:border-brand-blue focus:outline-none"
      >
        <span
          id={`${id}-label`}
          className={`pointer-events-none absolute left-0 font-medium transition-all duration-150 ${focused || value ? '-top-5' : 'top-2.5'} ${focused ? 'text-brand-blue' : 'text-gray-400'}`}
        >{label}</span>
        <span className="truncate">{value || '\u00a0'}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <ul id={`${id}-list`} role="listbox" aria-label={label} className="absolute left-0 top-full z-30 mt-2 max-h-60 w-full min-w-24 overflow-y-auto rounded-xl border border-gray-200 bg-white p-1.5 text-sm shadow-lg">
          {options.map((option, index) => (
            <li
              key={option}
              id={`${id}-${index}`}
              role="option"
              aria-selected={value === option}
              onPointerDown={(event) => event.preventDefault()}
              onMouseEnter={() => setActive(index)}
              onClick={() => choose(index)}
              className={`flex cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-2 ${active === index ? 'bg-blue-50 text-brand-blue' : 'text-gray-700'} ${value === option ? 'font-semibold' : ''}`}
            >
              {option}
              {value === option && <Check className="h-4 w-4 shrink-0" aria-hidden="true" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
