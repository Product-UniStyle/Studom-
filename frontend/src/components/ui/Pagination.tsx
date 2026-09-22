import { useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number
  totalPages: number
  onChange: (p: number) => void
}) {
  const pages = useMemo(() => {
    const nums = new Set<number>([1, 2, 3, 4, 5, totalPages])
    return Array.from(nums)
      .filter((n) => n >= 1 && n <= totalPages)
      .sort((a, b) => a - b)
  }, [totalPages])

  return (
    <div className="mt-10 flex items-center justify-center gap-2">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {pages.map((n, i) => (
        <span key={n} className="flex items-center gap-2">
          {i > 0 && n - pages[i - 1] > 1 && (
            <span className="text-gray-400">...</span>
          )}
          <button
            onClick={() => onChange(n)}
            className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium ${
              n === page
                ? 'bg-red-500 text-white'
                : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {n}
          </button>
        </span>
      ))}
      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}
