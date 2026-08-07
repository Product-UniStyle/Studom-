import { useState } from 'react'
import { cn } from '../../lib/utils'

const COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-green-100 text-green-700',
  'bg-orange-100 text-orange-700',
  'bg-pink-100 text-pink-700',
]

function colorFor(name: string) {
  const idx = name.charCodeAt(0) % COLORS.length
  return COLORS[idx]
}

export default function Avatar({
  src,
  name,
  className,
}: {
  src?: string
  name: string
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  const initial = name.trim().charAt(0).toUpperCase() || '?'

  if (!src || failed) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-full font-semibold',
          colorFor(name),
          className
        )}
      >
        {initial}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={name}
      className={cn('rounded-full object-cover', className)}
      onError={() => setFailed(true)}
    />
  )
}
