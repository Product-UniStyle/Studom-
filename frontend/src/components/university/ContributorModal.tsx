import { useState } from 'react'
import { Upload } from 'lucide-react'
import Modal from '../ui/Modal'
import TextField from '../form/TextField'
import SelectField from '../form/SelectField'
import { submitContributorApplication } from '../../lib/publicApi'

const YEAR_OPTIONS = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Postgraduate']
const MAX_PROOF_SIZE = 4 * 1024 * 1024

interface ContributorModalProps {
  universityId: string
  universityName: string
  onClose: () => void
}

export default function ContributorModal({ universityId, universityName, onClose }: ContributorModalProps) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [proofFile, setProofFile] = useState<File | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    try {
      await submitContributorApplication({
        universityId,
        name: (fd.get('name') as string) || '',
        email: (fd.get('email') as string) || '',
        courseOfStudy: (fd.get('courseOfStudy') as string) || undefined,
        yearOfStudy: (fd.get('yearOfStudy') as string) || undefined,
        expectedGraduationYear: (fd.get('expectedGraduationYear') as string) || undefined,
        reason: (fd.get('reason') as string) || undefined,
        proof: proofFile || undefined,
      })
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title="Become a Contributor" onClose={onClose}>
      {submitted ? (
        <p className="py-8 text-center text-sm text-gray-500">
          Thanks! Your application has been submitted for review. The {universityName} team will get back to you.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-gray-500">
            Fill in the details below to apply as a contributor for {universityName}.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <TextField label="Full Name" name="name" required placeholder="Enter your full name" />
            <TextField
              label="Official University Email"
              name="email"
              type="email"
              required
              placeholder="name@university.edu"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <TextField label="University" value={universityName} disabled />
            <TextField
              label="Course / Programme"
              name="courseOfStudy"
              placeholder="Enter your course or programme"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label="Year of Study"
              name="yearOfStudy"
              placeholder="Select year"
              options={YEAR_OPTIONS}
            />
            <TextField
              label="Expected Graduation Year"
              name="expectedGraduationYear"
              placeholder="e.g. 2026"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-900">
              Why do you want to become a Contributor?
            </label>
            <textarea
              name="reason"
              rows={2}
              placeholder="Share a short reason (1-2 lines)"
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-900">
              Proof of university association
            </label>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 px-4 py-2.5 text-center text-sm text-gray-500 hover:border-blue-400">
              <Upload className="h-4 w-4 shrink-0" />
              {proofFile ? proofFile.name : 'Upload Student ID or official proof (JPG, PNG or PDF, max 4MB)'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null
                  if (file && file.size > MAX_PROOF_SIZE) {
                    setError('File is too large. Maximum size is 4MB.')
                    e.target.value = ''
                    return
                  }
                  setError(null)
                  setProofFile(file)
                }}
              />
            </label>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}
