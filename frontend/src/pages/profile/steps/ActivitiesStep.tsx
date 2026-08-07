import { Plus, Trash2 } from 'lucide-react'
import TextField from '../../../components/form/TextField'
import SelectField from '../../../components/form/SelectField'
import type { ActivityItem, AchievementItem, ProfileData } from '../profileTypes'

interface Props {
  data: ProfileData
  update: (patch: Partial<Pick<ProfileData, 'activities' | 'achievements'>>) => void
}

const YEARS = ['2023', '2024', '2025', '2026']
const LEVELS = ['School', 'City', 'State', 'National', 'International']

export default function ActivitiesStep({ data, update }: Props) {
  const setActivity = (id: string, patch: Partial<ActivityItem>) => {
    update({
      activities: data.activities.map((a) =>
        a.id === id ? { ...a, ...patch } : a
      ),
    })
  }

  const addActivity = () => {
    update({
      activities: [
        ...data.activities,
        { id: crypto.randomUUID(), name: '', role: '', year: '', description: '' },
      ],
    })
  }

  const removeActivity = (id: string) => {
    update({ activities: data.activities.filter((a) => a.id !== id) })
  }

  const setAchievement = (id: string, patch: Partial<AchievementItem>) => {
    update({
      achievements: data.achievements.map((a) =>
        a.id === id ? { ...a, ...patch } : a
      ),
    })
  }

  const addAchievement = () => {
    update({
      achievements: [
        ...data.achievements,
        { id: crypto.randomUUID(), title: '', level: '', year: '', description: '' },
      ],
    })
  }

  const removeAchievement = (id: string) => {
    update({ achievements: data.achievements.filter((a) => a.id !== id) })
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-black">
        Activities &amp; Achievements
      </h2>
      <p className="mt-1 text-sm text-gray-500">
        Add your key activities and achievements. You can always add more
        later.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-10 md:grid-cols-2">
        {/* Activities */}
        <div className="space-y-6">
          {data.activities.map((a, i) => (
            <div key={a.id}>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-black">
                  {i + 1}. Activity
                </span>
                {data.activities.length > 1 && (
                  <button
                    onClick={() => removeActivity(a.id)}
                    className="rounded-md border border-gray-200 p-1.5 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="space-y-3">
                <TextField
                  label=""
                  placeholder="Activity name"
                  value={a.name}
                  onChange={(e) => setActivity(a.id, { name: e.target.value })}
                  className="[&>label]:hidden"
                />
                <TextField
                  label=""
                  placeholder="Role"
                  value={a.role}
                  onChange={(e) => setActivity(a.id, { role: e.target.value })}
                  className="[&>label]:hidden"
                />
                <SelectField
                  placeholder="Year"
                  options={YEARS}
                  value={a.year}
                  onChange={(e) => setActivity(a.id, { year: e.target.value })}
                />
                <TextField
                  label=""
                  placeholder="One-line description"
                  value={a.description}
                  onChange={(e) =>
                    setActivity(a.id, { description: e.target.value })
                  }
                  className="[&>label]:hidden"
                />
              </div>
            </div>
          ))}
          <button
            onClick={addActivity}
            className="flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-black hover:bg-gray-50"
          >
            <Plus className="h-4 w-4" /> Add another activity
          </button>
        </div>

        {/* Achievements */}
        <div className="space-y-6">
          {data.achievements.map((a, i) => (
            <div key={a.id}>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-black">
                  {i + 1}. Achievement
                </span>
                {data.achievements.length > 1 && (
                  <button
                    onClick={() => removeAchievement(a.id)}
                    className="rounded-md border border-gray-200 p-1.5 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="space-y-3">
                <TextField
                  label=""
                  placeholder="Achievement title"
                  value={a.title}
                  onChange={(e) =>
                    setAchievement(a.id, { title: e.target.value })
                  }
                  className="[&>label]:hidden"
                />
                <SelectField
                  placeholder="Level"
                  options={LEVELS}
                  value={a.level}
                  onChange={(e) =>
                    setAchievement(a.id, { level: e.target.value })
                  }
                />
                <SelectField
                  placeholder="Year"
                  options={YEARS}
                  value={a.year}
                  onChange={(e) => setAchievement(a.id, { year: e.target.value })}
                />
                <TextField
                  label=""
                  placeholder="One-line description"
                  value={a.description}
                  onChange={(e) =>
                    setAchievement(a.id, { description: e.target.value })
                  }
                  className="[&>label]:hidden"
                />
              </div>
            </div>
          ))}
          <button
            onClick={addAchievement}
            className="flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-black hover:bg-gray-50"
          >
            <Plus className="h-4 w-4" /> Add another achievement
          </button>
        </div>
      </div>
    </div>
  )
}
