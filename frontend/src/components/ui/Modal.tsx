import { X } from 'lucide-react'
import type { ReactNode } from 'react'

interface ModalProps {
  title: string
  onClose: () => void
  children: ReactNode
  maxWidthClassName?: string
  centerTitle?: boolean
}

export default function Modal({
  title,
  onClose,
  children,
  maxWidthClassName = 'max-w-4xl',
  centerTitle = false,
}: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        className={`max-h-[90vh] w-full ${maxWidthClassName} overflow-y-auto rounded-2xl bg-white shadow-xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`sticky top-0 flex items-center border-b border-gray-100 bg-white px-6 py-4 ${
            centerTitle ? 'relative justify-center' : 'justify-between'
          }`}
        >
          <h2 className="text-lg font-semibold text-black">{title}</h2>
          <button
            onClick={onClose}
            className={`text-gray-400 hover:text-black ${centerTitle ? 'absolute right-6 top-1/2 -translate-y-1/2' : ''}`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
