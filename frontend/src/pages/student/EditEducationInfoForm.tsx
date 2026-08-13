import { useState } from 'react'
import TextField from '../../components/form/TextField'
import SelectField from '../../components/form/SelectField'
import { updateStudentMe } from '../../lib/studentApi'
import type { StudentProfile } from '../../lib/studentApi'

interface Props {
  student: StudentProfile
  onCancel: () => void
  onSaved: () => void
}

const YEARS = ['2025', '2026', '2027', '2028', '2029']
const CURRICULUMS = ['CBSE', 'ICSE', 'IB', 'IGCSE', 'A-Levels', 'American Diploma']
const COURSES = ['Business Management', 'Engineering', 'Computer Science', 'Medicine', 'Law']

export default function EditEducationInfoForm({ student, onCancel, onSaved }: Props) {
  const personal = student.profile?.personal
  const education = student.profile?.education

  const [schoolName, setSchoolName] = useState(personal?.schoolName || '')
  const [currentGrade, setCurrentGrade] = useState(personal?.currentGrade || '')
  const [curriculum, setCurriculum] = useState(education?.curriculum || '')
  const [gradYear, setGradYear] = useState(education?.gradYear || '')
  const [subjects, setSubjects] = useState(education?.subjects?.join(', ') || '')
  const [intendedCourse, setIntendedCourse] = useState(education?.intendedCourse || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await updateStudentMe({
        personal: { schoolName, currentGrade },
        education: {
          curriculum,
          gradYear,
          subjects: subjects.split(',').map((s) => s.trim()).filter(Boolean),
          intendedCourse,
        },
      })
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
        <TextField label="School Name" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} />
        <SelectField
          label="Expected Graduation Year"
          placeholder="Select year"
          options={YEARS}
          defaultValue={gradYear}
          onChange={(e) => setGradYear(e.target.value)}
        />
        <SelectField
          label="Curriculum / Board"
          placeholder="Select curriculum / board"
          options={CURRICULUMS}
          defaultValue={curriculum}
          onChange={(e) => setCurriculum(e.target.value)}
        />
        <TextField
          label="Subjects"
          placeholder="Enter subjects (comma separated)"
          value={subjects}
          onChange={(e) => setSubjects(e.target.value)}
        />
        <TextField label="Current Grade / Year" value={currentGrade} onChange={(e) => setCurrentGrade(e.target.value)} />
        <SelectField
          label="Intended Field of Study"
          placeholder="Select your intended course"
          options={COURSES}
          defaultValue={intendedCourse}
          onChange={(e) => setIntendedCourse(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-black hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}
