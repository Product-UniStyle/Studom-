import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Tag,
  Bookmark,
  Navigation,
  User,
  Package,
  ClipboardList,
  Mail,
} from 'lucide-react'
import PageShell from '../components/layout/PageShell'
import SafeImage from '../components/ui/SafeImage'
import { getPublicEvent } from '../lib/publicApi'
import type { PublicEventDetail } from '../lib/publicApi'

function fmtDate(value: string): string {
  return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [event, setEvent] = useState<PublicEventDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)
    setError(null)
    getPublicEvent(id)
      .then((res) => {
        if (!cancelled) setEvent(res)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load event')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return (
      <PageShell>
        <p className="mx-auto max-w-6xl px-6 py-20 text-center text-gray-400">Loading...</p>
      </PageShell>
    )
  }

  if (error || !event) {
    return (
      <PageShell>
        <p className="mx-auto max-w-6xl px-6 py-20 text-center text-red-600">{error || 'Event not found.'}</p>
      </PageShell>
    )
  }

  const registrationOpen = !event.registrationDeadline || new Date(event.registrationDeadline).getTime() >= Date.now()
  const mapQuery = event.latitude != null && event.longitude != null
    ? `${event.latitude},${event.longitude}`
    : [event.venue, event.venueAddress, event.universityId?.name].filter(Boolean).join(', ')

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-6 py-8 lg:px-10">
        <div className="text-sm text-gray-500">
          <Link to="/events" className="text-blue-600 hover:underline">
            Events
          </Link>{' '}
          / {event.title}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
          <div className="rounded-2xl border border-gray-200 p-4 sm:p-6">
            <SafeImage src={event.coverImage} alt="" className="h-72 w-full rounded-xl object-cover sm:h-96" />

            <h1 className="mt-6 text-2xl font-bold text-black sm:text-3xl">{event.title}</h1>
            {event.universityId && (
              <p className="mt-1 text-sm text-gray-500">
                Hosted by{' '}
                <Link to={`/universities/${event.universityId._id}`} className="font-medium text-blue-600 hover:underline">
                  {event.universityId.name}
                </Link>
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3 border-t border-gray-100 pt-4 text-sm">
              <InfoItem icon={<Calendar className="h-4 w-4" />} label="Date" value={fmtDate(event.date)} />
              {event.time && <InfoItem icon={<Clock className="h-4 w-4" />} label="Time" value={event.time} />}
              <InfoItem
                icon={<MapPin className="h-4 w-4" />}
                label="Location"
                value={event.venue || event.universityId?.city || (event.mode === 'Online' ? 'Online' : '-')}
              />
              <InfoItem icon={<Users className="h-4 w-4" />} label="Mode" value={event.mode} />
              {event.category && <InfoItem icon={<Tag className="h-4 w-4" />} label="Category" value={event.category} />}
            </div>
          </div>

          <aside className="h-fit rounded-2xl border border-gray-200 p-5">
            <button className="w-full rounded-lg bg-black py-3 text-sm font-semibold text-white hover:bg-gray-800">
              Register
            </button>
            <button
              onClick={() => setSaved((s) => !s)}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 py-3 text-sm font-medium text-black hover:bg-gray-50"
            >
              <Bookmark className={`h-4 w-4 ${saved ? 'fill-black' : ''}`} /> {saved ? 'Saved' : 'Save Event'}
            </button>

            <div className="mt-4 divide-y divide-gray-100 border-t border-gray-100">
              <SidebarRow icon={<Calendar className="h-4 w-4" />} label="Registration">
                <span className={registrationOpen ? 'font-medium text-green-600' : 'font-medium text-red-500'}>
                  {registrationOpen ? 'Open' : 'Closed'}
                </span>
              </SidebarRow>
              <SidebarRow icon={<Users className="h-4 w-4" />} label="Seats">
                {event.seatsInfo || '-'}
              </SidebarRow>
              {event.registrationDeadline && (
                <SidebarRow icon={<Calendar className="h-4 w-4" />} label="Deadline">
                  {fmtDate(event.registrationDeadline)}
                </SidebarRow>
              )}
            </div>
          </aside>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card title="About this event">
            {event.aboutDescription ? (
              <p className="text-sm leading-relaxed text-gray-600">{event.aboutDescription}</p>
            ) : (
              <p className="text-sm text-gray-400">No description provided.</p>
            )}
          </Card>

          <Card title="Event details">
            <dl className="space-y-2 text-sm">
              <Row label="Date" value={fmtDate(event.date)} />
              {event.time && <Row label="Time" value={event.time} />}
              {event.venue && <Row label="Venue" value={event.venue} />}
              {event.universityId && <Row label="Organiser" value={event.universityId.name} />}
              {event.category && <Row label="Category" value={event.category} />}
              {event.language && <Row label="Language" value={event.language} />}
              <Row label="Price" value={event.price || 'Free'} />
            </dl>
          </Card>

          <Card title="What to expect">
            {event.whatToExpect.length === 0 ? (
              <p className="text-sm text-gray-400">No details provided.</p>
            ) : (
              <ul className="space-y-3 text-sm text-gray-600">
                {event.whatToExpect.map((w, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                    {w.text}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card title="Location">
            <div className="h-56 w-full overflow-hidden rounded-lg border border-gray-100">
              {mapQuery ? (
                <iframe
                  title="event-location"
                  className="h-full w-full"
                  loading="lazy"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-gray-400">
                  No location provided
                </div>
              )}
            </div>
            {(event.venue || event.venueAddress) && (
              <div className="mt-3 flex items-start justify-between gap-3">
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                  <div>
                    {event.venue && <div className="font-medium text-black">{event.venue}</div>}
                    {event.venueAddress && <div>{event.venueAddress}</div>}
                  </div>
                </div>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapQuery)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-black hover:bg-gray-50"
                >
                  <Navigation className="h-3.5 w-3.5" /> Get directions
                </a>
              </div>
            )}
          </Card>

          <Card title="Important information">
            <div className="space-y-3 text-sm">
              {event.whoCanAttend && (
                <ImportantRow icon={<User className="h-4 w-4" />} label="Who can attend" value={event.whoCanAttend} />
              )}
              {event.whatToBring && (
                <ImportantRow icon={<Package className="h-4 w-4" />} label="What to bring" value={event.whatToBring} />
              )}
              {event.registrationInfo && (
                <ImportantRow icon={<ClipboardList className="h-4 w-4" />} label="Registration" value={event.registrationInfo} />
              )}
              {(event.organiserContactEmail || event.organiserContactPhone) && (
                <ImportantRow
                  icon={<Mail className="h-4 w-4" />}
                  label="Contact"
                  value={[event.organiserContactEmail, event.organiserContactPhone].filter(Boolean).join(' | ')}
                />
              )}
            </div>
          </Card>
        </div>
      </div>
    </PageShell>
  )
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-gray-600">
      <span className="text-gray-400">{icon}</span>
      <div>
        <div className="text-xs text-gray-400">{label}</div>
        <div className="font-medium text-black">{value}</div>
      </div>
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 p-5">
      <h2 className="mb-3 font-semibold text-black">{title}</h2>
      {children}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-gray-400">{label}</dt>
      <dd className="font-medium text-black">{value}</dd>
    </div>
  )
}

function ImportantRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 text-gray-400">{icon}</span>
      <div>
        <div className="text-xs font-medium text-gray-400">{label}:</div>
        <div className="text-gray-700">{value}</div>
      </div>
    </div>
  )
}

function SidebarRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3 text-sm">
      <span className="flex items-center gap-2 text-gray-500">
        {icon} {label}
      </span>
      {children}
    </div>
  )
}
