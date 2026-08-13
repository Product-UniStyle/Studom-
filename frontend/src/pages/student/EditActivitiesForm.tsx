import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import TextField from '../../components/form/TextField'
import SelectField from '../../components/form/SelectField'
import { updateStudentMe } from '../../lib/studentApi'
import type { StudentProfile, StudentActivity, StudentAchievement } from '../../lib/studentApi'

interface Props {
  student: StudentProfile
  onCancel: () => void
  onSaved: () => void
}

interface DraftActivity extends StudentActivity {
  key: string
}
interface DraftAchievement extends StudentAchievement {
  key: string
}

const YEARS = ['2023', '2024', '2025', '2026', '2027']
const LEVELS = ['School', 'City', 'State', 'National', 'International']

export default function EditActivitiesForm({ student, onCancel, onSaved }: Props) {
  const [activities, setActivities] = useState<DraftActivity[]>(
    (student.profile?.activities || []).map((a) => ({ ...a, key: crypto.randomUUID() }))
  )
  const [achievements, setAchievements] = useState<DraftAchievement[]>(
    (student.profile?.achievements || []).map((a) => ({ ...a, key: crypto.randomUUID() }))
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const setActivity = (key: string, patch: Partial<StudentActivity>) =>
    setActivities((list) => list.map((a) => (a.key === key ? { ...a, ...patch } : a)))
  const addActivity = () =>
    setActivities((list) => [...list, { key: crypto.randomUUID(), name: '', role: '', year: '', description: '' }])
  const removeActivity = (key: string) => setActivities((list) => list.filter((a) => a.key !== key))

  const setAchievement = (key: string, patch: Partial<StudentAchievement>) =>
    setAchievements((list) => list.map((a) => (a.key === key ? { ...a, ...patch } : a)))
  const addAchievement = () =>
    setAchievements((list) => [...list, { key: crypto.randomUUID(), title: '', level: '', year: '', description: '' }])
  const removeAchievement = (key: string) => setAchievements((list) => list.filter((a) => a.key !== key))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await updateStudentMe({
        activities: activities
          .filter((a) => a.name.trim())
          .map(({ name, role, year, description }) => ({ name, role, year, description })),
        achievements: achievements
          .filter((a) => a.title.trim())
          .map(({ title, level, year, description }) => ({ title, level, year, description })),
      })
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="space-y-5">
          <div className="text-sm font-semibold text-black">Activities</div>
          {activities.map((a, i) => (
            <div key={a.key} className="rounded-lg border border-gray-100 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">Activity {i + 1}</span>
                <button
                  type="button"
                  onClick={() => removeActivity(a.key)}
                  className="rounded-md border border-gray-200 p-1.5 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="space-y-2">
                <TextField
                  label=""
                  placeholder="Activity name"
                  value={a.name}
                  onChange={(e) => setActivity(a.key, { name: e.target.value })}
                />
                <TextField
                  label=""
                  placeholder="Role"
                  value={a.role || ''}
                  onChange={(e) => setActivity(a.key, { role: e.target.value })}
                />
                <SelectField
                  placeholder="Year"
                  options={YEARS}
                  defaultValue={a.year}
                  onChange={(e) => setActivity(a.key, { year: e.target.value })}
                />
                <TextField
                  label=""
                  placeholder="One-line description"
                  value={a.description || ''}
                  onChange={(e) => setActivity(a.key, { description: e.target.value })}
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addActivity}
            className="flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-black hover:bg-gray-50"
          >
            <Plus className="h-4 w-4" /> Add activity
          </button>
        </div>

        <div className="space-y-5">
          <div className="text-sm font-semibold text-black">Achievements</div>
          {achievements.map((a, i) => (
            <div key={a.key} className="rounded-lg border border-gray-100 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">Achievement {i + 1}</span>
                <button
                  type="button"
                  onClick={() => removeAchievement(a.key)}
                  className="rounded-md border border-gray-200 p-1.5 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="space-y-2">
                <TextField
                  label=""
                  placeholder="Achievement title"
                  value={a.title}
                  onChange={(e) => setAchievement(a.key, { title: e.target.value })}
                />
                <SelectField
                  placeholder="Level"
                  options={LEVELS}
                  defaultValue={a.level}
                  onChange={(e) => setAchievement(a.key, { level: e.target.value })}
                />
                <SelectField
                  placeholder="Year"
                  options={YEARS}
                  defaultValue={a.year}
                  onChange={(e) => setAchievement(a.key, { year: e.target.value })}
                />
                <TextField
                  label=""
                  placeholder="One-line description"
                  value={a.description || ''}
                  onChange={(e) => setAchievement(a.key, { description: e.target.value })}
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addAchievement}
            className="flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-black hover:bg-gray-50"
          >
            <Plus className="h-4 w-4" /> Add achievement
          </button>
        </div>
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
