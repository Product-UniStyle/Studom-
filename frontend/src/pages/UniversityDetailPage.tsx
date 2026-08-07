import { useParams, Link } from 'react-router-dom'
import { Award, Landmark, Info, Star, MapPin, Mail, Phone } from 'lucide-react'
import PageShell from '../components/layout/PageShell'
import SelectField from '../components/form/SelectField'
import TextField from '../components/form/TextField'
import SafeImage from '../components/ui/SafeImage'
import Avatar from '../components/ui/Avatar'
import { getUniversityById, universities } from '../data/universities'
import { getUniversityDetail } from '../data/universityDetails'
import { universityInclusions } from '../data/inclusions'
import { universityReviews } from '../data/testimonials'

export default function UniversityDetailPage() {
  const { id } = useParams<{ id: string }>()
  const uni = getUniversityById(id ?? '') ?? universities[0]
  const detail = getUniversityDetail(uni.id, uni.name)

  return (
    <PageShell>
      <div className="mx-auto max-w-[1440px] px-6 py-8 lg:px-10">
        {/* Gallery */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <SafeImage
            src={detail.gallery[0]}
            alt={uni.name}
            className="h-64 w-full rounded-xl object-cover md:col-span-2 md:h-[22rem]"
          />
          <div className="grid grid-cols-2 gap-3">
            {detail.gallery.slice(1, 5).map((src, i) => (
              <SafeImage
                key={i}
                src={src}
                alt=""
                className="h-32 w-full rounded-xl object-cover md:h-[10.25rem]"
              />
            ))}
          </div>
        </div>

        {/* Title + stats */}
        <div className="mt-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="flex items-center gap-4">
            <SafeImage
              src={uni.logo}
              alt=""
              className="h-14 w-14 rounded-md border border-gray-100 object-contain p-1"
            />
            <h1 className="text-2xl font-semibold text-blue-900 sm:text-3xl">
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
                  {detail.qsRanking}
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
                  {detail.origin}
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
              {detail.about.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <Link
              to={detail.website}
              className="mt-4 inline-block text-sm font-medium text-blue-600"
            >
              View Website →
            </Link>
          </div>

          <div className="rounded-xl border border-gray-100 p-6 shadow-sm">
            <TextField label="Full Name" placeholder="Your name" />
            <TextField
              label="Email"
              type="email"
              placeholder="you@example.com"
              className="mt-4"
            />
            <SelectField
              label="Studying in School or University"
              options={['School', 'University']}
              defaultValue="University"
              className="mt-4"
            />
            <SelectField
              label="Select University"
              placeholder="Select a university"
              options={universities.map((u) => u.name)}
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
        <div className="mt-14">
          <h2 className="mb-6 text-base font-bold text-black">
            What inclusions does it offer
          </h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3 md:grid-cols-5">
            {universityInclusions.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <item.icon className="h-6 w-6 shrink-0 text-black" strokeWidth={1.5} />
                <span className="text-sm text-gray-700">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-14">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-bold text-black">
              Student Reviews
              <span className="flex items-center gap-1 text-yellow-500">
                <Star className="h-4 w-4 fill-current" /> 4.7
              </span>
              <span className="text-sm font-normal text-gray-400">
                (128 reviews)
              </span>
            </h2>
            <button className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-black hover:bg-gray-50">
              + Add Review
            </button>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {universityReviews.map((r, i) => (
              <div key={i}>
                <div className="flex items-center gap-2">
                  <Avatar src={r.avatar} name={r.name} className="h-8 w-8 text-xs" />
                  <div>
                    <div className="text-sm font-semibold text-black">
                      {r.name}
                    </div>
                    <div className="text-xs text-gray-400">{r.meta}</div>
                  </div>
                </div>
                <div className="mt-2 flex text-yellow-500">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className="h-3 w-3 fill-current" />
                  ))}
                </div>
                <p className="mt-2 text-xs leading-relaxed text-gray-600">
                  {r.text}
                </p>
                <div className="mt-2 text-xs text-gray-400">{r.date}</div>
              </div>
            ))}
          </div>
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
                uni.name + ' ' + uni.city
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
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                  {detail.poc.address}
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0 text-gray-400" />
                  {detail.poc.email}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0 text-gray-400" />
                  {detail.poc.phone}
                </div>
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
