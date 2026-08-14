import { useState } from 'react'
import TextField from '../../components/form/TextField'
import { updateInstitutionAccount } from '../../lib/institutionApi'
import type { InstitutionAccount } from '../../lib/institutionApi'

interface Props {
  account: InstitutionAccount
  onCancel: () => void
  onSaved: (account: InstitutionAccount) => void
}

export default function EditAccountDetailsForm({ account, onCancel, onSaved }: Props) {
  const [universityName, setUniversityName] = useState(account.universityName)
  const [fullName, setFullName] = useState(account.fullName)
  const [designation, setDesignation] = useState(account.designation || '')
  const [email, setEmail] = useState(account.email)
  const [phone, setPhone] = useState(account.phone || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const res = await updateInstitutionAccount({ universityName, fullName, designation, email, phone })
      onSaved(res.account)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
        <TextField
          label="University Name"
          required
          value={universityName}
          onChange={(e) => setUniversityName(e.target.value)}
        />
        <TextField label="Administrator Name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <TextField label="Designation" value={designation} onChange={(e) => setDesignation(e.target.value)} />
        <TextField label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <TextField
          label="Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="sm:col-span-2"
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
