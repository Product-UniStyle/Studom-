import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Award, Landmark, Info, Star, MapPin, Mail, Phone } from 'lucide-react'
import PageShell from '../components/layout/PageShell'
import SelectField from '../components/form/SelectField'
import TextField from '../components/form/TextField'
import SafeImage from '../components/ui/SafeImage'
import Avatar from '../components/ui/Avatar'
import { getInclusionIcon } from '../lib/inclusionIcons'
import {
  getPublicUniversity,
  listPublicUniversities,
  listPublicUniversityReviews,
} from '../lib/publicApi'
import type {
  PublicUniversityDetail,
  PublicUniversityListItem,
  PublicUniversityReview,
} from '../lib/publicApi'
import { getStudentToken, getStudentMe } from '../lib/studentApi'
import type { StudentProfile } from '../lib/studentApi'

export default function UniversityDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [uni, setUni] = useState<PublicUniversityDetail | null>(null)
  const [reviews, setReviews] = useState<PublicUniversityReview[]>([])
  const [universityOptions, setUniversityOptions] = useState<PublicUniversityListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [student, setStudent] = useState<StudentProfile | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)
    setError(null)
    getPublicUniversity(id)
      .then((res) => {
        if (cancelled) return
        setUni(res)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'University not found')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    listPublicUniversityReviews(id)
      .then((res) => {
        if (!cancelled) setReviews(res.items)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [id])

  useEffect(() => {
    listPublicUniversities({ limit: 200 })
      .then((res) => setUniversityOptions(res.items))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!getStudentToken()) return
    let cancelled = false
    getStudentMe()
      .then((res) => {
        if (!cancelled) setStudent(res.student)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <PageShell>
        <div className="py-32 text-center font-poppins text-gray-400">Loading...</div>
      </PageShell>
    )
  }

  if (error || !uni) {
    return (
      <PageShell>
        <div className="py-32 text-center font-poppins text-gray-400">
          {error || 'University not found'}
        </div>
      </PageShell>
    )
  }

  const gallery = uni.detail?.gallery || []
  const about = uni.detail?.about || []
  const website = uni.detail?.website
  const poc = uni.detail?.poc
  const inclusions = uni.inclusions || []
  const avgRating = uni.aggregateRating
  const reviewCount = uni.aggregateReviewCount ?? reviews.length

  return (
    <PageShell>
      <div className="mx-auto max-w-[1440px] px-6 py-8 font-poppins lg:px-10">
        {/* Gallery */}
        {gallery.length > 0 && (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <SafeImage
              src={gallery[0]}
              alt={uni.name}
              className="h-64 w-full rounded-xl object-cover md:col-span-2 md:h-[22rem]"
            />
            <div className="grid grid-cols-2 gap-3">
              {gallery.slice(1, 5).map((src, i) => (
                <SafeImage
                  key={i}
                  src={src}
                  alt=""
                  className="h-32 w-full rounded-xl object-cover md:h-[10.25rem]"
                />
              ))}
            </div>
          </div>
        )}

        {/* Title + stats */}
        <div className="mt-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="flex items-center gap-4">
            <SafeImage
              src={uni.logo}
              alt=""
              className="h-14 w-14 rounded-md border border-gray-100 object-contain p-1"
            />
            <h1 className="font-georgia text-2xl font-semibold text-blue-900 sm:text-3xl">
              {uni.name}
            </h1>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-3 rounded-xl border border-gray-100 px-5 py-3">
              <Award className="h-6 w-6 text-blue-900" />
              <div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  QS Ranking <Info className="h-3 w-3" />
                </div>
                <div className="text-lg font-bold text-blue-900">
                  {uni.qsRank ?? 'Not Ranked'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-gray-100 px-5 py-3">
              <Landmark className="h-6 w-6 text-blue-900" />
              <div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  University Origin <Info className="h-3 w-3" />
                </div>
                <div className="text-lg font-bold text-blue-900">
                  {uni.origin || '-'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* About + quick apply */}
        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between border-b border-blue-600 pb-2">
              <h2 className="text-sm font-bold tracking-wide text-blue-900">
                ABOUT
              </h2>
              <span className="flex items-center gap-1 text-sm text-blue-600">
                <Info className="h-3.5 w-3.5" /> Become a Contributor
              </span>
            </div>
            <div className="mt-4 space-y-4 text-sm leading-relaxed text-gray-600">
              {about.length > 0 ? (
                about.map((p, i) => <p key={i}>{p}</p>)
              ) : (
                <p className="text-gray-400">No description available yet.</p>
              )}
            </div>
            {website && (
              <Link
                to={website}
                className="mt-4 inline-block text-sm font-medium text-blue-600"
              >
                View Website →
              </Link>
            )}
          </div>

          <div className="rounded-xl border border-gray-100 p-6 shadow-sm">
            <TextField label="Full Name" placeholder="Your name" defaultValue={student?.fullName} />
            <TextField
              label="Email"
              type="email"
              placeholder="you@example.com"
              defaultValue={student?.email}
              className="mt-4"
            />
            <SelectField
              label="Studying in School or University"
              options={['School', 'University']}
              defaultValue={student?.currentStage === 'School Student' ? 'School' : 'University'}
              className="mt-4"
            />
            <SelectField
              label="Select University"
              placeholder="Select a university"
              options={universityOptions.map((u) => u.name)}
              defaultValue={uni?.name}
              className="mt-4"
            />
            <Link
              to="/profile/build"
              className="mt-6 block w-full rounded-lg bg-blue-900 py-3 text-center text-sm font-semibold text-white hover:bg-blue-800"
            >
              Build Your Profile
            </Link>
          </div>
        </div>

        {/* Inclusions */}
        {inclusions.length > 0 && (
          <div className="mt-14">
            <h2 className="mb-6 text-base font-bold text-black">
              What inclusions does it offer
            </h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3 md:grid-cols-5">
              {inclusions.map((item) => {
                const Icon = getInclusionIcon(item.label)
                return (
                  <div key={item._id} className="flex items-center gap-3">
                    <Icon className="h-6 w-6 shrink-0 text-black" strokeWidth={1.5} />
                    <span className="text-sm text-gray-700">{item.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className="mt-14">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-bold text-black">
              Student Reviews
              {avgRating != null && (
                <span className="flex items-center gap-1 text-yellow-500">
                  <Star className="h-4 w-4 fill-current" /> {avgRating}
                </span>
              )}
              <span className="text-sm font-normal text-gray-400">
                ({reviewCount} reviews)
              </span>
            </h2>
            <button className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-black hover:bg-gray-50">
              + Add Review
            </button>
          </div>
          {reviews.length === 0 ? (
            <p className="mt-6 text-sm text-gray-400">No reviews yet.</p>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {reviews.map((r) => (
                <div key={r._id}>
                  <div className="flex items-center gap-2">
                    <Avatar src={r.reviewerAvatar} name={r.reviewerName} className="h-8 w-8 text-xs" />
                    <div>
                      <div className="text-sm font-semibold text-black">
                        {r.reviewerName}
                      </div>
                      <div className="text-xs text-gray-400">
                        {r.reviewerMeta || r.platform || ''}
                      </div>
                    </div>
                  </div>
                  {r.rating != null && (
                    <div className="mt-2 flex text-yellow-500">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star
                          key={s}
                          className={`h-3 w-3 ${s < r.rating! ? 'fill-current' : ''}`}
                        />
                      ))}
                    </div>
                  )}
                  <p className="mt-2 text-xs leading-relaxed text-gray-600">
                    {r.text}
                  </p>
                  <div className="mt-2 text-xs text-gray-400">
                    {new Date(r.date).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Map */}
        <div className="mt-14">
          <h2 className="mb-4 text-sm font-bold tracking-wide text-black">
            WHERE YOU'LL BE
          </h2>
          <div className="h-96 w-full overflow-hidden rounded-xl border border-purple-200">
            <iframe
              title="map"
              className="h-full w-full"
              loading="lazy"
              src={`https://www.google.com/maps?q=${encodeURIComponent(
                uni.name + ' ' + (uni.city || '')
              )}&output=embed`}
            />
          </div>
        </div>

        {/* POC + Connect */}
        <div className="mt-14 grid grid-cols-1 gap-10 pb-16 lg:grid-cols-2">
          <div>
            <h2 className="mb-4 text-sm font-bold tracking-wide text-black">
              UNIVERSITY POC DETAILS
            </h2>
            <div className="flex items-start gap-4">
              <SafeImage
                src={uni.logo}
                alt=""
                className="h-14 w-14 rounded-md border border-gray-100 object-contain p-1"
              />
              <div className="space-y-3 text-sm text-gray-600">
                {poc?.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                    {poc.address}
                  </div>
                )}
                {poc?.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 shrink-0 text-gray-400" />
                    {poc.email}
                  </div>
                )}
                {poc?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 shrink-0 text-gray-400" />
                    {poc.phone}
                  </div>
                )}
                {!poc?.address && !poc?.email && !poc?.phone && (
                  <p className="text-gray-400">No contact details available yet.</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-sm font-bold tracking-wide text-black">
              CONNECT WITH US
            </h2>
            <p className="mb-4 text-sm text-gray-500">
              Have questions or need more information? Reach out to the
              university team directly.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField label="Full Name" placeholder="" />
              <TextField label="Email" type="email" placeholder="" />
            </div>
            <div className="mt-4">
              <label className="mb-1.5 block text-sm font-medium text-gray-900">
                Your Message
              </label>
              <textarea
                rows={4}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <button className="mt-4 w-full rounded-full bg-blue-500 py-3 text-sm font-semibold text-white hover:bg-blue-600">
              Send Message
            </button>
          </div>
        </div>
      </div>
    </PageShell>
  )
}
