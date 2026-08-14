import { useState } from 'react'
import { Star } from 'lucide-react'
import Modal from '../ui/Modal'
import { submitReview } from '../../lib/studentApi'

interface AddReviewModalProps {
  universityId: string
  universityName: string
  onClose: () => void
  onSaved: () => void
}

export default function AddReviewModal({ universityId, universityName, onClose, onSaved }: AddReviewModalProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) {
      setError('Please select a star rating')
      return
    }
    if (!text.trim()) {
      setError('Please write a short review')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await submitReview(universityId, rating, text.trim())
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title="Add Your Review" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-gray-500">
          Share your experience at {universityName}. Your review will be posted publicly under your name.
        </p>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-900">Rating</label>
          <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                onMouseEnter={() => setHoverRating(n)}
                className="p-0.5"
              >
                <Star
                  className={`h-7 w-7 ${
                    n <= (hoverRating || rating) ? 'fill-yellow-500 text-yellow-500' : 'text-gray-200'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-900">Your Review</label>
          <textarea
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What did you like or dislike? What should other students know?"
            className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
