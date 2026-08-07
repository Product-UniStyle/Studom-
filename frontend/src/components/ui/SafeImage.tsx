import { useState } from 'react'
import type { ImgHTMLAttributes } from 'react'
import { Image as ImageIcon } from 'lucide-react'
import { cn } from '../../lib/utils'

interface SafeImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallbackClassName?: string
}

export default function SafeImage({
  className,
  fallbackClassName,
  alt,
  ...rest
}: SafeImageProps) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400',
          className,
          fallbackClassName
        )}
      >
        <ImageIcon className="h-1/4 w-1/4 min-h-6 min-w-6" strokeWidth={1.5} />
      </div>
    )
  }

  return (
    <img
      {...rest}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  )
}
