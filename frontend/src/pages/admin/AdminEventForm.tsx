import { useState } from 'react'
import TextField from '../../components/form/TextField'
import SelectField from '../../components/form/SelectField'
import ImageUploadField from './ImageUploadField'
import UniversityPicker from './UniversityPicker'
import { createEvent, updateEvent, uploadArticleCoverImage } from '../../lib/adminApi'
import type { EventDetail, EventMode } from '../../lib/adminApi'

const EVENT_MODES: EventMode[] = ['In-person', 'Online']

interface AdminEventFormProps {
  event: EventDetail | null
  onSaved: () => void
  onCancel: () => void
}

function toDateInputValue(iso?: string): string | undefined {
  return iso ? iso.slice(0, 10) : undefined
}

export default function AdminEventForm({ event, onSaved, onCancel }: AdminEventFormProps) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

    const universityId = fd.get('universityId') as string
    if (!universityId) {
      setError('Please select a host university')
      setSaving(false)
      return
    }

    const payload = {
      universityId,
      title: str('title'),
      coverImage: str('coverImage'),
      date: str('date'),
      time: str('time'),
      venue: str('venue'),
      venueAddress: str('venueAddress'),
      latitude: num('latitude'),
      longitude: num('longitude'),
      mode: str('mode'),
      category: str('category'),
      language: str('language'),
      price: str('price'),
      seatsInfo: str('seatsInfo'),
      registrationDeadline: str('registrationDeadline'),
      aboutDescription: str('aboutDescription'),
      whoCanAttend: str('whoCanAttend'),
      whatToBring: str('whatToBring'),
      registrationInfo: str('registrationInfo'),
      organiserContactEmail: str('organiserContactEmail'),
      organiserContactPhone: str('organiserContactPhone'),
    }

    try {
      if (event) {
        await updateEvent(event._id, payload)
      } else {
        await createEvent(payload)
      }
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextField label="Title" name="title" defaultValue={event?.title} required />

      <UniversityPicker name="universityId" defaultValue={event?.universityId} required />

      <div className="grid grid-cols-2 gap-4">
        <ImageUploadField
          label="Cover Image"
          name="coverImage"
          defaultValue={event?.coverImage}
          onUpload={(file) => uploadArticleCoverImage(file, event?.title || 'untitled-event')}
        />
        <div className="space-y-4">
          <SelectField label="Mode" name="mode" options={EVENT_MODES} defaultValue={event?.mode || 'In-person'} required />
          <TextField label="Category" name="category" defaultValue={event?.category} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <TextField label="Date" name="date" type="date" defaultValue={toDateInputValue(event?.date)} required />
        <TextField label="Time" name="time" defaultValue={event?.time} placeholder="e.g. 6:00 PM" />
        <TextField label="Registration Deadline" name="registrationDeadline" type="date" defaultValue={toDateInputValue(event?.registrationDeadline)} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <TextField label="Venue" name="venue" defaultValue={event?.venue} />
        <TextField label="Venue Address" name="venueAddress" defaultValue={event?.venueAddress} />
      </div>

      <div className="grid grid-cols-4 gap-4">
        <TextField label="Latitude" name="latitude" type="number" defaultValue={event?.latitude} />
        <TextField label="Longitude" name="longitude" type="number" defaultValue={event?.longitude} />
        <TextField label="Language" name="language" defaultValue={event?.language} />
        <TextField label="Price" name="price" defaultValue={event?.price} placeholder="Free / AED 50" />
      </div>

      <TextField label="Seats Info" name="seatsInfo" defaultValue={event?.seatsInfo} placeholder="e.g. Limited seats" />

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-900">About / Description</label>
        <textarea
          name="aboutDescription"
          rows={5}
          defaultValue={event?.aboutDescription}
          className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-800 focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <TextField label="Who Can Attend" name="whoCanAttend" defaultValue={event?.whoCanAttend} />
        <TextField label="What to Bring" name="whatToBring" defaultValue={event?.whatToBring} />
        <TextField label="Registration Info" name="registrationInfo" defaultValue={event?.registrationInfo} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <TextField label="Organiser Contact Email" name="organiserContactEmail" type="email" defaultValue={event?.organiserContactEmail} />
        <TextField label="Organiser Contact Phone" name="organiserContactPhone" defaultValue={event?.organiserContactPhone} />
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
          {saving ? 'Saving...' : event ? 'Save changes' : 'Create Event'}
        </button>
      </div>
    </form>
  )
}
