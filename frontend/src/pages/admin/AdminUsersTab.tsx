import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import TextField from '../../components/form/TextField'
import SelectField from '../../components/form/SelectField'
import Modal from '../../components/ui/Modal'
import {
  createStaffUser,
  deleteStaffUser,
  getAdminRole,
  listStaffUsers,
  updateStaffUserRole,
} from '../../lib/adminApi'
import type { StaffRole, StaffUser } from '../../lib/adminApi'

const ROLES: StaffRole[] = ['admin', 'editor']

export default function AdminUsersTab() {
  const currentRole = getAdminRole()
  const [users, setUsers] = useState<StaffUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [formOpen, setFormOpen] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [createdEmail, setCreatedEmail] = useState<string | null>(null)

  const [deleting, setDeleting] = useState<StaffUser | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await listStaffUsers()
      setUsers(res.users)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError(null)
    setFormLoading(true)

    const fd = new FormData(e.currentTarget)
    const email = fd.get('email') as string
    const password = fd.get('password') as string
    const role = fd.get('role') as StaffRole
    const firstName = (fd.get('firstName') as string) || undefined
    const lastName = (fd.get('lastName') as string) || undefined

    try {
      await createStaffUser({ email, password, role, firstName, lastName })
      setCreatedEmail(email)
      await load()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create user')
    } finally {
      setFormLoading(false)
    }
  }

  async function handleRoleChange(user: StaffUser, role: StaffRole) {
    try {
      await updateStaffUserRole(user._id, role)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role')
    }
  }

  async function handleDelete() {
    if (!deleting) return
    try {
      await deleteStaffUser(deleting._id)
      setDeleting(null)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user')
    }
  }

  function closeForm() {
    setFormOpen(false)
    setFormError(null)
    setCreatedEmail(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-black">Staff Users</h2>
        <button
          onClick={() => setFormOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-black px-3.5 py-2 text-xs font-semibold text-white hover:bg-gray-800"
        >
          <Plus className="h-3.5 w-3.5" /> Add User
        </button>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-gray-500">
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Role</th>
              <th className="p-4 font-medium">Created</th>
              <th className="p-4 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-gray-400">
                  No staff users yet.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u._id} className="border-b border-gray-50 text-gray-800">
                  <td className="p-4 font-medium">{u.email}</td>
                  <td className="p-4">{[u.firstName, u.lastName].filter(Boolean).join(' ') || '-'}</td>
                  <td className="p-4">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u, e.target.value as StaffRole)}
                      disabled={currentRole !== 'admin'}
                      className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm disabled:opacity-50"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setDeleting(u)}
                      className="rounded-lg border border-gray-200 p-2 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {formOpen && (
        <Modal title="Add Staff User" onClose={closeForm}>
          {createdEmail ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-gray-700">
                Created <strong>{createdEmail}</strong>. Their login credentials have been emailed to them.
              </p>
              <button
                onClick={closeForm}
                className="rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <TextField label="First Name" name="firstName" />
                <TextField label="Last Name" name="lastName" />
              </div>
              <TextField label="Email" name="email" type="email" required />
              <TextField label="Temporary Password" name="password" type="password" hint="At least 6 characters" required />
              <SelectField label="Role" name="role" options={ROLES} defaultValue="editor" required />

              {formError && <p className="text-sm text-red-600">{formError}</p>}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
                >
                  {formLoading ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}

      {deleting && (
        <Modal title={`Delete ${deleting.email}?`} onClose={() => setDeleting(null)}>
          <p className="text-sm text-gray-600">This cannot be undone.</p>
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setDeleting(null)}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
