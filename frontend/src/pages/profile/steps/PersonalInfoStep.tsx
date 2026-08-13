import TextField from '../../../components/form/TextField'
import type { ProfileData } from '../profileTypes'

interface Props {
  data: ProfileData
  update: (patch: Partial<ProfileData['personal']>) => void
}

export default function PersonalInfoStep({ data, update }: Props) {
  const p = data.personal
  return (
    <div>
      <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
        <TextField
          label="Full Name"
          required
          value={p.fullName}
          onChange={(e) => update({ fullName: e.target.value })}
        />
        <TextField
          label="Email"
          type="email"
          value={p.email}
          disabled
          hint="Contact support to change your login email."
          onChange={(e) => update({ email: e.target.value })}
        />
        <TextField
          label="Mobile Number"
          required
          value={p.mobile}
          onChange={(e) => update({ mobile: e.target.value })}
        />
        <TextField
          label="Country of Residence"
          required
          value={p.countryOfResidence}
          onChange={(e) => update({ countryOfResidence: e.target.value })}
        />
        <TextField
          label="School Name"
          required
          value={p.schoolName}
          onChange={(e) => update({ schoolName: e.target.value })}
        />
        <TextField
          label="Current Grade / Year"
          required
          value={p.currentGrade}
          onChange={(e) => update({ currentGrade: e.target.value })}
        />
      </div>

      <label className="mt-8 flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={p.confirmed}
          onChange={(e) => update({ confirmed: e.target.checked })}
          className="h-4 w-4 rounded border-gray-300"
        />
        I confirm that the information provided is accurate.
      </label>
    </div>
  )
}
