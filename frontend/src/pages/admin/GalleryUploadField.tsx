import { useRef, useState } from 'react'
import { Upload, X } from 'lucide-react'
import { uploadImage } from '../../lib/adminApi'

interface GalleryUploadFieldProps {
  name: string
  defaultValue?: string[]
  universityName: string
}

export default function GalleryUploadField({ name, defaultValue, universityName }: GalleryUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [urls, setUrls] = useState<string[]>(defaultValue || [])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    if (files.length === 0) return
    setUploading(true)
    setError(null)
    try {
      const uploaded = await Promise.all(files.map((f) => uploadImage(f, universityName, 'gallery')))
      setUrls((prev) => [...prev, ...uploaded])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  function removeAt(index: number) {
    setUrls((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-900">Gallery</label>
      <input type="hidden" name={name} value={urls.join(',')} readOnly />

      <div className="flex flex-wrap gap-3">
        {urls.map((url, i) => (
          <div key={url + i} className="group relative h-20 w-20">
            <img src={url} alt="" className="h-20 w-20 rounded-lg border border-gray-100 object-cover" />
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-black text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-200 text-gray-400 hover:border-blue-400 disabled:opacity-50"
        >
          <Upload className="h-4 w-4" />
          <span className="text-[10px]">{uploading ? 'Uploading...' : 'Add'}</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFilesChange}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
