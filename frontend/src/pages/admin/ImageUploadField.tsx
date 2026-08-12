import { useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { uploadImage } from '../../lib/adminApi'
import type { ImageUploadType } from '../../lib/adminApi'

interface ImageUploadFieldProps {
  label: string
  name: string
  defaultValue?: string
  universityName: string
  type: ImageUploadType
}

export default function ImageUploadField({ label, name, defaultValue, universityName, type }: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState(defaultValue || '')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const url = await uploadImage(file, universityName, type)
      setValue(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-900">{label}</label>
      <input type="hidden" name={name} value={value} readOnly />

      <div
        onClick={() => fileInputRef.current?.click()}
        className="flex h-28 w-28 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-200 hover:border-blue-400"
      >
        {value ? (
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-1 text-gray-400">
            <Upload className="h-5 w-5" />
            <span className="text-[10px]">{uploading ? 'Uploading...' : 'Upload'}</span>
          </div>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
