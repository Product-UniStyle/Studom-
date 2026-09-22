import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, MapPin } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import SafeImage from '../../components/ui/SafeImage'
import { studentNav } from './studentNav'
import { getStudentMe } from '../../lib/studentApi'
import type { StudentProfile } from '../../lib/studentApi'
import { getPublicUniversity } from '../../lib/publicApi'
import type { PublicUniversityDetail } from '../../lib/publicApi'
import { getFavoriteIds, setFavoriteIds } from '../../lib/favorites'

export default function FavoritesPage() {
  const [student, setStudent] = useState<StudentProfile | null>(null)
  const [universities, setUniversities] = useState<PublicUniversityDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const ids = getFavoriteIds()
    Promise.all([
      getStudentMe(),
      Promise.all(
        ids.map((id) => getPublicUniversity(id).catch(() => null))
      ),
    ])
      .then(([me, results]) => {
        if (cancelled) return
        setStudent(me.student)
        const found = results.filter((u): u is PublicUniversityDetail => u !== null)
        setUniversities(found)
        // Drop ids that no longer resolve (deleted/renamed universities) so
        // the favorites list stays in sync with what's actually shown.
        if (found.length !== ids.length) {
          setFavoriteIds(found.map((u) => u._id))
        }
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Failed to load favorites')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const removeFavorite = (id: string) => {
    setUniversities((prev) => {
      const next = prev.filter((u) => u._id !== id)
      setFavoriteIds(next.map((u) => u._id))
      return next
    })
  }

  if (loading || !student) {
    return (
      <DashboardLayout navItems={studentNav} userName={student?.fullName || ''} userRole="Student">
        <p className="mt-10 text-center text-gray-400">{error || 'Loading...'}</p>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout navItems={studentNav} userName={student.fullName} userRole="Student">
      <h1 className="text-2xl font-bold text-black">Favorites</h1>
      <p className="mt-1 text-sm text-gray-500">
        Universities you've saved for later.
      </p>

      {error && <p className="mt-6 text-sm text-red-600">{error}</p>}

      {universities.length === 0 ? (
        <div className="mt-10 text-center text-gray-400">
          <p>You haven't favorited any universities yet.</p>
          <Link to="/search?type=universities" className="mt-2 inline-block text-sm font-medium text-blue-600 hover:underline">
            Browse universities →
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {universities.map((u) => (
            <Link
              to={`/universities/${u.slug || u._id}`}
              key={u._id}
              className="group relative aspect-square overflow-hidden rounded-xl"
            >
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  removeFavorite(u._id)
                }}
                aria-label="Remove from favourites"
                className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow hover:bg-gray-50"
              >
                <Heart className="h-4 w-4 fill-red-500 text-red-500" />
              </button>
              <SafeImage
                src={u.image}
                alt={u.name}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <div className="truncate text-sm font-semibold leading-snug">
                  {u.name}
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {u.city || u.country || '-'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
