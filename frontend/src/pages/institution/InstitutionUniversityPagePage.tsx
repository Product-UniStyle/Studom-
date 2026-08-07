import { Link } from 'react-router-dom'
import {
  Eye,
  Mail,
  Star,
  UserPlus,
  Image,
  ShieldCheck,
  FileText,
  GraduationCap,
  MapPin,
  Contact,
  Users,
  Eye as EyeIcon,
} from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import SafeImage from '../../components/ui/SafeImage'
import { institutionNav } from './institutionNav'
import { getUniversityById } from '../../data/universities'

const SECTIONS = [
  { icon: Image, title: 'Hero Images & Gallery', sub: 'Manage hero image and gallery photos.', action: 'Edit' },
  { icon: ShieldCheck, title: 'University Identity', sub: 'Update logo, name, location and overall score.', action: 'Edit' },
  { icon: FileText, title: 'About University', sub: 'Update the university overview and description.', action: 'Edit' },
  { icon: GraduationCap, title: 'What the University Offers / Inclusions', sub: 'Manage courses, facilities, and inclusions.', action: 'Edit' },
  { icon: Star, title: 'Student Reviews', sub: 'Manage and respond to student reviews.', action: 'Manage' },
  { icon: MapPin, title: 'Map & Location', sub: 'Update the map and university location.', action: 'Edit' },
  { icon: Contact, title: 'University POC Details', sub: 'Update university contact and POC information.', action: 'Edit' },
  { icon: Mail, title: 'Connect With Us Form', sub: 'Manage the contact form shown on your page.', action: 'Edit' },
  { icon: Users, title: 'Contributors', sub: 'Manage contributor information and requests.', action: 'Manage' },
  { icon: EyeIcon, title: 'Preview Public Page', sub: 'Preview how your page appears to students.', action: 'Preview' },
]

export default function InstitutionUniversityPagePage() {
  const uni = getUniversityById('university-of-birmingham-dubai')!

  return (
    <DashboardLayout
      navItems={institutionNav}
      userName="University of Birmingham Dubai"
      userRole="Institution"
    >
      <h1 className="text-2xl font-bold text-black">University Page</h1>
      <p className="mt-1 text-sm text-gray-500">
        Manage the information shown on your public Studom page.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={Eye} value="12,450" label="Page Views" sub="This month" />
        <StatCard icon={Mail} value="238" label="Contact Enquiries" sub="This month" />
        <StatCard icon={Star} value="98" label="Reviews" sub="Total" />
        <StatCard icon={UserPlus} value="15" label="Contributor Requests" sub="Pending" />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 p-6 lg:col-span-2">
          <h2 className="mb-1 font-semibold text-black">Public Page Sections</h2>
          <p className="mb-4 text-sm text-gray-500">
            Manage the content and sections displayed on your public page.
          </p>
          <div className="divide-y divide-gray-100">
            {SECTIONS.map((s) => (
              <div key={s.title} className="flex items-center justify-between gap-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-black">
                      {s.title}
                    </div>
                    <div className="text-xs text-gray-500">{s.sub}</div>
                  </div>
                </div>
                <button className="shrink-0 text-sm font-medium text-blue-600">
                  {s.action}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 p-6">
          <h2 className="mb-1 font-semibold text-black">Public Page Preview</h2>
          <p className="mb-4 text-sm text-gray-500">
            See how your university appears to students.
          </p>
          <SafeImage
            src="https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=600&q=80"
            alt=""
            className="h-40 w-full rounded-xl object-cover"
          />
          <div className="mt-4 flex items-center gap-3">
            <SafeImage src={uni.logo} alt="" className="h-10 w-10 rounded-md border border-gray-100 object-contain p-1" />
            <div className="font-semibold text-black">{uni.name}</div>
          </div>
          <div className="mt-2 flex items-center gap-1 text-sm text-gray-500">
            <MapPin className="h-4 w-4" /> Dubai, United Arab Emirates
          </div>
          <div className="mt-2 flex items-center gap-1 text-sm font-semibold text-black">
            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" /> 98.9 / 100{' '}
            <span className="font-normal text-gray-400">Overall Score</span>
          </div>
          <Link
            to={`/universities/${uni.id}`}
            className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Eye className="h-4 w-4" /> View Public Page
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}

function StatCard({
  icon: Icon,
  value,
  label,
  sub,
}: {
  icon: typeof Eye
  value: string
  label: string
  sub: string
}) {
  return (
    <div className="rounded-2xl border border-gray-200 p-5">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-2xl font-bold text-black">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-xs text-gray-400">{sub}</div>
    </div>
  )
}
