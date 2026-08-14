import { Link } from 'react-router-dom'
import { School, GraduationCap, BookOpen, ArrowRight, Star } from 'lucide-react'
import PageShell from '../components/layout/PageShell'
import SafeImage from '../components/ui/SafeImage'
import Avatar from '../components/ui/Avatar'
import { homeInclusions } from '../data/inclusions'
import { testimonials } from '../data/testimonials'

const categories = [
  {
    label: 'Schools',
    sub: 'Nursery to Secondary',
    icon: School,
    to: '/search?type=schools',
  },
  {
    label: 'Universities',
    sub: 'Undergraduate & Postgraduate',
    icon: GraduationCap,
    to: '/search?type=universities',
  },
  {
    label: 'Tuition Centres',
    sub: 'All Subjects & Exams',
    icon: BookOpen,
    to: '/search?type=tuition',
  },
]

export default function HomePage() {
  return (
    <PageShell>
      {/* Hero */}
      <section className="mx-auto max-w-[1440px] px-6 pb-10 pt-14 lg:px-10">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <h1 className="font-script text-4xl leading-[1.5] text-blue-600 sm:text-5xl sm:leading-[1.5]">
            One platform to discover, plan &amp; apply to institutions while
            building the Middle East's largest student community.
          </h1>
          <SafeImage
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"
            alt="Students collaborating"
            className="h-72 w-full rounded-2xl object-cover shadow-sm sm:h-96"
          />
        </div>
      </section>

      {/* Category cards */}
      <section className="mx-auto max-w-[1440px] px-6 pb-10 lg:px-10">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.label}
              to={cat.to}
              className="rounded-2xl border border-gray-100 p-6 shadow-sm transition hover:shadow-md"
            >
              <cat.icon className="h-8 w-8 text-black" strokeWidth={1.5} />
              <div className="mt-4 font-script text-xl font-semibold text-black">
                {cat.label}
              </div>
              <div className="mt-1 font-script text-sm text-gray-500">{cat.sub}</div>
              <ArrowRight className="mt-4 h-5 w-5 text-black" />
            </Link>
          ))}
        </div>
      </section>

      <p className="mx-auto whitespace-nowrap px-6 pb-14 text-center font-script text-sm text-blue-600 lg:px-10">
        Of the students, by the students, for the students. All information
        has been obtained from open sources.
      </p>

      {/* CTA */}
      <section className="mx-auto max-w-[1440px] px-6 pb-16 lg:px-10">
        <div className="rounded-3xl bg-gray-50 px-6 py-16 text-center">
          <h2 className="font-script text-3xl text-blue-600 sm:text-4xl">
            Apply to any university at once
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-gray-600">
            Build your profile once and use it to apply to multiple
            universities through Studom.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/profile/build"
              className="rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800"
            >
              Build Your Profile
            </Link>
            <Link
              to="/apply/select"
              className="rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800"
            >
              Apply to Universities
            </Link>
          </div>
        </div>
      </section>

      {/* Platform inclusions */}
      <section className="mx-auto max-w-[1440px] px-6 pb-16 lg:px-10">
        <h2 className="mb-8 font-forum text-3xl font-medium text-gray-800">
          Platform inclusions.
        </h2>
        <div className="grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-3 md:grid-cols-5">
          {homeInclusions.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <item.icon className="h-6 w-6 shrink-0 text-black" strokeWidth={1.5} />
              <span className="font-forum text-sm text-gray-700">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Happy Students */}
      <section className="mx-auto max-w-[1440px] px-6 pb-20 lg:px-10">
        <h2 className="mb-8 font-forum text-3xl font-medium text-gray-800">
          Happy Students!
        </h2>
        <div className="grid grid-cols-1 gap-8 font-poppins sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <div key={i}>
              <div className="flex items-center gap-3">
                <Avatar src={t.avatar} name={t.name} className="h-10 w-10 text-sm" />
                <div>
                  <div className="text-sm font-semibold text-black">
                    {t.name}
                  </div>
                  <div className="text-xs text-gray-500">{t.meta}</div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex text-yellow-500">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <span className="text-xs text-gray-400">{t.time}</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {t.text}
              </p>
              <button className="mt-2 text-sm font-medium text-black underline underline-offset-2">
                Show more
              </button>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  )
}
