import { useEffect, useState } from 'react'
import TextField from '../../components/form/TextField'
import SelectField from '../../components/form/SelectField'
import ImageUploadField from './ImageUploadField'
import GalleryUploadField from './GalleryUploadField'
import { listUniversityReviews, updateUniversity, uploadImage } from '../../lib/adminApi'
import type { UniversityDetail, UniversityReview } from '../../lib/adminApi'

const UNIVERSITY_TYPES = ['School', 'College', 'University', 'Tuition']

interface AdminUniversityFormProps {
  university: UniversityDetail
  onSaved: () => void
  onCancel: () => void
}

function splitCommaList(v: string): string[] {
  return v.split(',').map((s) => s.trim()).filter(Boolean)
}

function splitParagraphs(v: string): string[] {
  return v.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean)
}

function splitLines(v: string): string[] {
  return v.split('\n').map((s) => s.trim()).filter(Boolean)
}

export default function AdminUniversityForm({ university, onSaved, onCancel }: AdminUniversityFormProps) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reviews, setReviews] = useState<UniversityReview[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(true)

  const sheetEssayQuestions = (university.essayQuestions || []).filter((q) => q.sourceRowId)
  const manualEssayQuestions = (university.essayQuestions || []).filter((q) => !q.sourceRowId)

  useEffect(() => {
    listUniversityReviews(university._id)
      .then((res) => setReviews(res.items))
      .catch(() => setReviews([]))
      .finally(() => setReviewsLoading(false))
  }, [university._id])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const fd = new FormData(e.currentTarget)
    const str = (key: string) => (fd.get(key) as string) || undefined
    const num = (key: string) => {
      const v = fd.get(key) as string
      return v ? Number(v) : undefined
    }

    const payload = {
      name: str('name'),
      type: str('type'),
      city: str('city'),
      country: str('country'),
      area: str('area'),
      logo: str('logo'),
      image: str('image'),
      origin: str('origin'),
      course: str('course'),
      qsRank: num('qsRank'),
      uaeRank: num('uaeRank'),
      uaeScore: num('uaeScore'),
      overallScore: num('overallScore'),
      latitude: num('latitude'),
      longitude: num('longitude'),
      googleMapLink: str('googleMapLink'),
      costOfLiving: num('costOfLiving'),
      studentPopulation: num('studentPopulation'),
      aggregateRating: num('aggregateRating'),
      aggregateReviewCount: num('aggregateReviewCount'),
      board: str('board'),
      grade: str('grade'),
      performance: str('performance'),
      locality: str('locality'),
      mode: str('mode'),
      fieldsOfStudy: splitCommaList((fd.get('fieldsOfStudy') as string) || ''),
      subjects: splitCommaList((fd.get('subjects') as string) || ''),
      inclusionLabels: splitCommaList((fd.get('inclusionLabels') as string) || ''),
      essayQuestions: splitLines((fd.get('essayQuestions') as string) || '').map((question) => ({ question })),
      detail: {
        website: str('website'),
        about: splitParagraphs((fd.get('about') as string) || ''),
        gallery: splitCommaList((fd.get('gallery') as string) || ''),
        poc: {
          name: str('pocName'),
          address: str('pocAddress'),
          email: str('pocEmail'),
          phone: str('pocPhone'),
          fax: str('pocFax'),
        },
      },
    }

    try {
      await updateUniversity(university._id, payload)
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {university.sourceId && (
        <TextField label="Sheet ID" name="_sourceId" defaultValue={university.sourceId} disabled />
      )}

      <div className="grid grid-cols-2 gap-4">
        <TextField label="Name" name="name" defaultValue={university.name} required />
        <SelectField
          label="Type"
          name="type"
          options={UNIVERSITY_TYPES}
          defaultValue={university.type}
          required
        />
                <ImageUploadField label="Logo" name="logo" defaultValue={university.logo} onUpload={(file) => uploadImage(file, university.name, 'logo')} />
        <ImageUploadField label="Image" name="image" defaultValue={university.image} onUpload={(file) => uploadImage(file, university.name, 'image')} />
        <TextField label="City" name="city" defaultValue={university.city} />
        <TextField label="Country" name="country" defaultValue={university.country} />
        <TextField label="Area" name="area" defaultValue={university.area} />
        <TextField label="Origin" name="origin" defaultValue={university.origin} />
        <TextField label="Course" name="course" defaultValue={university.course} />
      </div>

      <div className="grid grid-cols-4 gap-4">
        <TextField label="QS Rank" name="qsRank" type="number" defaultValue={university.qsRank} />
        <TextField label="UAE Rank" name="uaeRank" type="number" defaultValue={university.uaeRank} />
        <TextField label="UAE Score" name="uaeScore" type="number" defaultValue={university.uaeScore} />
        <TextField label="Overall Score" name="overallScore" type="number" defaultValue={university.overallScore} />
      </div>

      <div className="grid grid-cols-4 gap-4">
        <TextField label="Latitude" name="latitude" type="number" defaultValue={university.latitude} />
        <TextField label="Longitude" name="longitude" type="number" defaultValue={university.longitude} />
        <TextField label="Cost of Living" name="costOfLiving" type="number" defaultValue={university.costOfLiving} />
        <TextField label="Student Population" name="studentPopulation" type="number" defaultValue={university.studentPopulation} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <TextField label="Aggregate Rating" name="aggregateRating" type="number" step="0.1" defaultValue={university.aggregateRating} />
        <TextField label="Aggregate Review Count" name="aggregateReviewCount" type="number" defaultValue={university.aggregateReviewCount} />
      </div>

      <TextField label="Google Map Link" name="googleMapLink" defaultValue={university.googleMapLink} />
      <TextField label="Website" name="website" defaultValue={university.detail?.website} />

      <div className="grid grid-cols-2 gap-4">
        <TextField label="Fields of Study (comma-separated)" name="fieldsOfStudy" defaultValue={university.fieldsOfStudy?.join(', ')} />
        <TextField label="Inclusions (comma-separated)" name="inclusionLabels" defaultValue={university.inclusions?.map((i) => i.label).join(', ')} />
      </div>

      <div className="grid grid-cols-5 gap-4">
        <TextField label="Board" name="board" defaultValue={university.board} />
        <TextField label="Grade" name="grade" defaultValue={university.grade} />
        <SelectField
          label="Performance"
          name="performance"
          placeholder="Select performance"
          options={['Outstanding', 'Very Good', 'Good', 'Acceptable', 'Weak']}
          defaultValue={university.performance}
        />
        <SelectField
          label="Locality"
          name="locality"
          placeholder="Select locality"
          options={['Local', 'Non Local']}
          defaultValue={university.locality}
        />
        <SelectField
          label="Mode"
          name="mode"
          placeholder="Select mode"
          options={['Online', 'Offline', 'Online/Offline', 'Home Tuition', 'Private Tutor']}
          defaultValue={university.mode}
        />
      </div>

      <TextField
        label="Subjects (comma-separated)"
        name="subjects"
        defaultValue={university.subjects?.join(', ')}
        hint="Split out from Grade — exam prep / subject lists that were mixed into that column (e.g. JEE, NEET, Maths & Science)"
      />

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-900">About (paragraphs, blank line between)</label>
        <textarea
          name="about"
          rows={5}
          defaultValue={university.detail?.about?.join('\n\n')}
          className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-800 focus:border-blue-500 focus:outline-none"
        />
      </div>

      <GalleryUploadField name="gallery" defaultValue={university.detail?.gallery} universityName={university.name} />

      {sheetEssayQuestions.length > 0 && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-900">
            Essay Questions from Sheet Import
          </label>
          <ul className="space-y-1 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-700">
            {sheetEssayQuestions.map((q, i) => (
              <li key={i}>{q.question}</li>
            ))}
          </ul>
          <p className="mt-1 text-xs text-gray-400">
            Managed by the Essay Questions sheet import — edit via the sheet, not here.
          </p>
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-900">Additional Essay Questions (one per line)</label>
        <textarea
          name="essayQuestions"
          rows={4}
          defaultValue={manualEssayQuestions.map((q) => q.question).join('\n')}
          placeholder="e.g. Who are you?&#10;What are your interests?"
          className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-800 focus:border-blue-500 focus:outline-none"
        />
        <p className="mt-1 text-xs text-gray-400">
          Shown to students applying to this university in the apply flow&apos;s Essay Questions step.
        </p>
      </div>

      <hr className="border-gray-100" />

      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
          From POC sheet import
        </p>
        <div className="grid grid-cols-3 gap-4">
          <TextField label="POC Name" name="pocName" defaultValue={university.detail?.poc?.name} />
          <TextField label="POC Address" name="pocAddress" defaultValue={university.detail?.poc?.address} />
          <TextField label="POC Email" name="pocEmail" defaultValue={university.detail?.poc?.email} />
          <TextField label="POC Phone" name="pocPhone" defaultValue={university.detail?.poc?.phone} />
          <TextField label="POC Fax" name="pocFax" defaultValue={university.detail?.poc?.fax} />
        </div>
      </div>

      <hr className="border-gray-100" />

      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
          From Reviews sheet import ({reviews.length})
        </p>
        {reviewsLoading ? (
          <p className="text-sm text-gray-400">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-gray-400">No reviews imported for this university yet.</p>
        ) : (
          <div className="max-h-64 space-y-3 overflow-y-auto rounded-lg border border-gray-100 p-4">
            {reviews.map((r) => (
              <div key={r._id} className="border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{r.reviewerName}</span>
                  <span className="text-xs text-gray-400">
                    {r.rating ? `${r.rating} ★` : ''} {r.platform ? `· ${r.platform}` : ''}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-gray-600">{r.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}
