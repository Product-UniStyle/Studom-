import { useState } from 'react'
import {
  User,
  GraduationCap,
  Trophy,
  FileText,
  Pencil,
  ChevronDown,
  ShieldCheck,
} from 'lucide-react'
import { cn } from '../../../lib/utils'
import type { ProfileData } from '../profileTypes'

interface Props {
  data: ProfileData
  goToStep: (step: number) => void
}

export default function ReviewStep({ data, goToStep }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null)

  const documentsUploaded = Object.values(data.documents).filter(Boolean).length

  const sections = [
    {
      key: 'personal',
      icon: User,
      title: 'Personal Information',
      summary:
        [
          data.personal.fullName,
          data.personal.email,
          data.personal.mobile,
          data.personal.countryOfResidence,
        ]
          .filter(Boolean)
          .join(' • ') || 'Not provided yet',
      step: 1,
      detail: (
        <ul className="space-y-1 text-sm text-gray-600">
          <li>School: {data.personal.schoolName || '—'}</li>
          <li>Current Grade / Year: {data.personal.currentGrade || '—'}</li>
        </ul>
      ),
    },
    {
      key: 'education',
      icon: GraduationCap,
      title: 'Education Information',
      summary:
        [
          data.education.curriculum,
          data.personal.schoolName,
          data.education.gradYear && `Pass Year: ${data.education.gradYear}`,
          data.education.latestGrades && `Grades: ${data.education.latestGrades}`,
        ]
          .filter(Boolean)
          .join(' • ') || 'Not provided yet',
      step: 2,
      detail: (
        <ul className="space-y-1 text-sm text-gray-600">
          <li>Subjects: {data.education.subjects || '—'}</li>
          <li>Intended Course: {data.education.intendedCourse || '—'}</li>
        </ul>
      ),
    },
    {
      key: 'activities',
      icon: Trophy,
      title: 'Activities & Achievements',
      summary: `${data.activities.filter((a) => a.name).length} Activity • ${
        data.achievements.filter((a) => a.title).length
      } Achievements`,
      step: 3,
      detail: (
        <ul className="space-y-1 text-sm text-gray-600">
          {data.activities
            .filter((a) => a.name)
            .map((a) => (
              <li key={a.id}>Activity: {a.name}</li>
            ))}
          {data.achievements
            .filter((a) => a.title)
            .map((a) => (
              <li key={a.id}>Achievement: {a.title}</li>
            ))}
        </ul>
      ),
    },
    {
      key: 'documents',
      icon: FileText,
      title: 'Documents',
      summary: `${documentsUploaded} Documents Uploaded`,
      step: 4,
      detail: (
        <ul className="space-y-1 text-sm text-gray-600">
          {Object.entries(data.documents).map(([name, val]) => (
            <li key={name}>
              {name}: {val ? 'Uploaded' : 'Not uploaded'}
            </li>
          ))}
        </ul>
      ),
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-black">Review &amp; Save</h2>
          <p className="mt-1 text-sm text-gray-500">
            Please review your information carefully before saving your
            profile.
          </p>
        </div>
        <button
          onClick={() => goToStep(1)}
          className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-black hover:bg-gray-50"
        >
          <Pencil className="h-4 w-4" /> Edit All Sections
        </button>
      </div>

      <div className="mt-8 space-y-4">
        {sections.map((s) => (
          <div key={s.key} className="rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                <s.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-black">{s.title}</div>
                <div className="truncate text-sm text-gray-500">
                  {s.summary}
                </div>
              </div>
              <button
                onClick={() => goToStep(s.step)}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-black hover:bg-gray-50"
              >
                <Pencil className="h-3.5 w-3.5" /> Edit
              </button>
              <button
                onClick={() =>
                  setExpanded(expanded === s.key ? null : s.key)
                }
                className="p-1 text-gray-400"
              >
                <ChevronDown
                  className={cn(
                    'h-5 w-5 transition-transform',
                    expanded === s.key && 'rotate-180'
                  )}
                />
              </button>
            </div>
            {expanded === s.key && (
              <div className="ml-14 mt-4 border-t border-gray-100 pt-4">
                {s.detail}
              </div>
            )}
          </div>
        ))}

        <div className="flex items-start gap-3 rounded-xl bg-blue-50 p-4">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
          <div>
            <div className="text-sm font-semibold text-black">
              Your information is safe with us.
            </div>
            <div className="mt-0.5 text-sm text-gray-600">
              We use industry-standard encryption to protect your data. You
              can update your profile anytime before applying to
              universities.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
