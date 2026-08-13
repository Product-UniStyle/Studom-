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

const INTAKES = ['Fall 2026', 'Spring 2027', 'Fall 2027', 'Spring 2028']
const NOTIFICATION_OPTIONS = ['Email + In-app', 'Email only', 'In-app only', 'Off']

export default function EditPreferencesForm({ student, onCancel, onSaved }: Props) {
  const preferences = student.preferences
  const [preferredIntake, setPreferredIntake] = useState(preferences?.preferredIntake || '')
  const [preferredCountry, setPreferredCountry] = useState(preferences?.preferredCountry || '')
  const [preferredCity, setPreferredCity] = useState(preferences?.preferredCity || '')
  const [notificationPreference, setNotificationPreference] = useState(preferences?.notificationPreference || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await updateStudentMe({
        preferences: { preferredIntake, preferredCountry, preferredCity, notificationPreference },
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
        <SelectField
          label="Preferred Intake"
          placeholder="Select intake"
          options={INTAKES}
          defaultValue={preferredIntake}
          onChange={(e) => setPreferredIntake(e.target.value)}
        />
        <TextField label="Preferred Country" value={preferredCountry} onChange={(e) => setPreferredCountry(e.target.value)} />
        <TextField label="Preferred City" value={preferredCity} onChange={(e) => setPreferredCity(e.target.value)} />
        <SelectField
          label="Notifications"
          placeholder="Select notification preference"
          options={NOTIFICATION_OPTIONS}
          defaultValue={notificationPreference}
          onChange={(e) => setNotificationPreference(e.target.value)}
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
