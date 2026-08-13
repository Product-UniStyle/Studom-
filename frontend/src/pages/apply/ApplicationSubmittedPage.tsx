import { Link } from 'react-router-dom'
import {
  CheckCircle2,
  FileText,
  Download,
  Mail,
  Bell,
  MessageSquare,
  ClipboardCheck,
  Heart,
} from 'lucide-react'
import PageShell from '../../components/layout/PageShell'
import SafeImage from '../../components/ui/SafeImage'
import { useApplyFlow } from '../../context/ApplyFlowContext'

const NEXT_STEPS = [
  {
    icon: Mail,
    title: 'Application Under Review',
    text: 'Your application has been sent to the selected universities. They will review your profile and essays.',
  },
  {
    icon: Bell,
    title: 'Updates & Notifications',
    text: 'You will receive email and in-app notifications about any updates or requests.',
  },
  {
    icon: MessageSquare,
    title: 'University Response',
    text: 'Universities may reach out for additional information or to schedule interviews.',
  },
  {
    icon: ClipboardCheck,
    title: 'Decision',
    text: 'You will be notified once a decision is made. Good luck!',
  },
]

export default function ApplicationSubmittedPage() {
  const { selectedUniversities, essays } = useApplyFlow()
  const selectedUnis = selectedUniversities

  return (
    <PageShell hideFooter>
      <div className="mx-auto max-w-5xl px-6 py-14 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
          <CheckCircle2 className="h-9 w-9 text-green-500" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-black sm:text-3xl">
          Your application has been submitted!
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-gray-500">
          Thank you for applying through Studom. We've received your
          application and sent a confirmation email to{' '}
          <span className="font-medium text-blue-600">
            kabir.shaikh@gmail.com
          </span>
          .
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700">
            <FileText className="h-4 w-4" /> View Application Summary
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-black hover:bg-gray-50">
            <Download className="h-4 w-4" /> Download Application (PDF)
          </button>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 text-left lg:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 p-6">
            <div className="mb-4 font-semibold text-black">
              What happens next?
            </div>
            <div className="space-y-5">
              {NEXT_STEPS.map((s) => (
                <div key={s.title} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                    <s.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-black">
                      {s.title}
                    </div>
                    <div className="mt-0.5 text-sm text-gray-500">
                      {s.text}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 p-6">
            <div className="mb-4 font-semibold text-black">
              Submission Summary
            </div>
            <SummaryRow label="Application ID" value="STDM-2025-000482" link />
            <SummaryRow label="Date of Submission" value="02 May 2025, 04:20 PM" link />
            <SummaryRow
              label="Universities Applied"
              value={String(selectedUnis.length)}
            />
            <SummaryRow label="Essay Responses" value={String(essays.length)} />
            <SummaryRow label="Documents Uploaded" value="7" />
            <SummaryRow label="Profile Completion" value="100%" />
            <div className="mt-4 rounded-lg bg-blue-50 px-3 py-2.5 text-xs text-blue-700">
              You can track the status of your application anytime from your
              dashboard.
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 p-6">
            <div className="mb-4 font-semibold text-black">
              Universities Applied To
            </div>
            <div className="space-y-4">
              {selectedUnis.map((u) => (
                <div key={u.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <SafeImage
                      src={u.logo}
                      alt=""
                      className="h-9 w-9 rounded-md border border-gray-100 object-contain p-1"
                    />
                    <div>
                      <div className="text-sm font-medium text-black">
                        {u.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {u.city}, UAE
                      </div>
                    </div>
                  </div>
                  <Link
                    to={`/universities/${u.id}`}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-black hover:bg-gray-50"
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
            <Link
              to="/student/applications"
              className="mt-4 inline-block text-sm font-medium text-blue-600"
            >
              View all applications →
            </Link>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl bg-gray-50 p-6 text-left sm:flex-row">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <Heart className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold text-black">
                Join the Studom Community
              </div>
              <div className="text-sm text-gray-500">
                Connect with students, share experiences, get advice and
                stay updated on events and opportunities.
              </div>
            </div>
          </div>
          <button className="shrink-0 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700">
            Explore Community
          </button>
        </div>
      </div>
    </PageShell>
  )
}

function SummaryRow({
  label,
  value,
  link,
}: {
  label: string
  value: string
  link?: boolean
}) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 py-2.5 text-sm last:border-0">
      <span className="text-gray-500">{label}</span>
      <span className={link ? 'font-medium text-blue-600' : 'text-black'}>
        {value}
      </span>
    </div>
  )
}
