import { useState } from 'react'
import { ChevronDown, Upload, X } from 'lucide-react'
import { submitContributorApplication } from '../../lib/publicApi'

const YEAR_OPTIONS = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Postgraduate']
const MAX_PROOF_SIZE = 4 * 1024 * 1024

const glassInput =
  'w-full rounded-xl border border-white/50 bg-white/60 px-3.5 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#1A1A1A]/40 outline-none focus:border-[#1A1A1A]/60'

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
  const [year, setYear] = useState('')
  const [yearOpen, setYearOpen] = useState(false)

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="animate-liquid-glass-in relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/40"
        style={{
          background: 'rgba(255,255,255,0.22)',
          backdropFilter: 'blur(48px)',
          WebkitBackdropFilter: 'blur(48px)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), 0 32px 64px rgba(0,0,0,0.22)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Specular rim highlights */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-3xl bg-gradient-to-r from-transparent via-white/80 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-12 rounded-t-3xl bg-gradient-to-b from-white/25 to-transparent" />

        <div className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#1A1A1A]">Become a Contributor</h3>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/40 transition-colors hover:bg-white/60"
            >
              <X size={16} className="text-[#1A1A1A]" />
            </button>
          </div>

          {submitted ? (
            <p className="py-8 text-center text-sm text-[#1A1A1A]/70">
              Thanks! Your application has been submitted for review. The {universityName} team will get back to you.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <p className="text-sm text-[#1A1A1A]/60">
                Fill in the details below to apply as a contributor for {universityName}.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#444]">
                    Full Name
                  </label>
                  <input name="name" required placeholder="Enter your full name" className={glassInput} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#444]">
                    Official University Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="name@university.edu"
                    className={glassInput}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#444]">
                    University
                  </label>
                  <input value={universityName} disabled className={`${glassInput} opacity-70`} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#444]">
                    Course / Programme
                  </label>
                  <input
                    name="courseOfStudy"
                    placeholder="Enter your course or programme"
                    className={glassInput}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#444]">
                    Year of Study
                  </label>
                  <div className="relative">
                    <input type="hidden" name="yearOfStudy" value={year} />
                    <button
                      type="button"
                      onClick={() => setYearOpen((v) => !v)}
                      className={`${glassInput} flex items-center justify-between text-left ${!year ? 'text-[#1A1A1A]/40' : ''}`}
                    >
                      {year || 'Select year'}
                      <ChevronDown className="h-4 w-4 shrink-0 text-[#1A1A1A]/50" />
                    </button>

                    {yearOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setYearOpen(false)} />
                        <div
                          className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-white/40 py-1"
                          style={{
                            background: 'rgba(255,255,255,0.55)',
                            backdropFilter: 'blur(32px)',
                            WebkitBackdropFilter: 'blur(32px)',
                            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), 0 16px 32px rgba(0,0,0,0.18)',
                          }}
                        >
                          {YEAR_OPTIONS.map((y) => (
                            <button
                              key={y}
                              type="button"
                              onClick={() => {
                                setYear(y)
                                setYearOpen(false)
                              }}
                              className={`block w-full px-3.5 py-2 text-left text-sm hover:bg-white/50 ${
                                y === year ? 'bg-white/40 font-semibold text-[#1A1A1A]' : 'text-[#1A1A1A]/80'
                              }`}
                            >
                              {y}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#444]">
                    Expected Graduation Year
                  </label>
                  <input name="expectedGraduationYear" placeholder="e.g. 2026" className={glassInput} />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#444]">
                  Why do you want to become a Contributor?
                </label>
                <textarea
                  name="reason"
                  rows={2}
                  placeholder="Share a short reason (1-2 lines)"
                  className={glassInput}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#444]">
                  Proof of university association
                </label>
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/60 bg-white/30 px-4 py-2.5 text-center text-sm text-[#1A1A1A]/60 hover:bg-white/45">
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
                  className="rounded-xl border border-white/50 bg-white/40 px-5 py-2.5 text-sm font-semibold text-[#1A1A1A] hover:bg-white/60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-[#1A1A1A] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#333] disabled:opacity-60"
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
