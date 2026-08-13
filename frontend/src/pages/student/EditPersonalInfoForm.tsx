import { useState } from 'react'
import TextField from '../../components/form/TextField'
import { updateStudentMe } from '../../lib/studentApi'
import type { StudentProfile } from '../../lib/studentApi'

interface Props {
  student: StudentProfile
  onCancel: () => void
  onSaved: () => void
}

export default function EditPersonalInfoForm({ student, onCancel, onSaved }: Props) {
  const [fullName, setFullName] = useState(student.fullName)
  const [birthdate, setBirthdate] = useState(student.birthdate ? student.birthdate.slice(0, 10) : '')
  const [nationality, setNationality] = useState(student.nationality || '')
  const [mobile, setMobile] = useState(student.profile?.personal?.mobile || '')
  const [currentLocation, setCurrentLocation] = useState(student.currentLocation || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await updateStudentMe({
        fullName,
        birthdate: birthdate || undefined,
        nationality,
        currentLocation,
        personal: { mobile },
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
        <TextField label="Full Name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <TextField label="Date of Birth" type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} />
        <TextField label="Nationality" value={nationality} onChange={(e) => setNationality(e.target.value)} />
        <TextField label="Mobile Number" value={mobile} onChange={(e) => setMobile(e.target.value)} />
        <TextField label="Current Location" value={currentLocation} onChange={(e) => setCurrentLocation(e.target.value)} />
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
