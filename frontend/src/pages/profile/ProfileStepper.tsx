import { Check } from 'lucide-react'
import { cn } from '../../lib/utils'

const STEPS = [
  'Personal Info',
  'Education Info',
  'Activities & Achievements',
  'Documents',
  'Review & Save',
]

export default function ProfileStepper({ current }: { current: number }) {
  return (
    <div className="mx-auto flex max-w-3xl items-start justify-between">
      {STEPS.map((label, i) => {
        const step = i + 1
        const done = step < current
        const active = step === current
        return (
          <div key={label} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              <div
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold',
                  done && 'border-green-500 bg-green-500 text-white',
                  active && 'border-blue-500 text-blue-600',
                  !done && !active && 'border-gray-300 text-gray-400'
                )}
              >
                {done ? <Check className="h-4 w-4" /> : step}
              </div>
              {step < STEPS.length && (
                <div
                  className={cn(
                    'mx-1 h-0.5 flex-1',
                    step < current ? 'bg-blue-500' : 'bg-gray-200'
                  )}
                />
              )}
            </div>
            <div
              className={cn(
                'mt-2 max-w-[6.5rem] text-center text-xs font-medium',
                active ? 'text-blue-600' : done ? 'text-black' : 'text-gray-400'
              )}
            >
              {label}
            </div>
          </div>
        )
      })}
    </div>
  )
}
