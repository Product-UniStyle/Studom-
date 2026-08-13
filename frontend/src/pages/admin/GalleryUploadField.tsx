import { useRef, useState } from 'react'
import { GripVertical, Upload, X } from 'lucide-react'
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
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [isDraggingFiles, setIsDraggingFiles] = useState(false)

  async function uploadFiles(files: File[]) {
    const imageFiles = files.filter((f) => f.type.startsWith('image/'))
    if (imageFiles.length === 0) return
    setUploading(true)
    setError(null)
    try {
      const uploaded = await Promise.all(imageFiles.map((f) => uploadImage(f, universityName, 'gallery')))
      setUrls((prev) => [...prev, ...uploaded])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    if (files.length === 0) return
    await uploadFiles(files)
  }

  function removeAt(index: number) {
    setUrls((prev) => prev.filter((_, i) => i !== index))
  }

  function moveImage(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return
    setUrls((prev) => {
      const next = [...prev]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      return next
    })
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-900">Gallery</label>
      <input type="hidden" name={name} value={urls.join(',')} readOnly />

      <div
        className={`flex flex-wrap gap-3 rounded-lg p-2 transition-colors ${isDraggingFiles ? 'bg-blue-50 ring-2 ring-blue-300' : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          if (e.dataTransfer.types.includes('Files')) setIsDraggingFiles(true)
        }}
        onDragLeave={(e) => {
          if (e.currentTarget === e.target) setIsDraggingFiles(false)
        }}
        onDrop={(e) => {
          e.preventDefault()
          setIsDraggingFiles(false)
          if (e.dataTransfer.files.length > 0) uploadFiles(Array.from(e.dataTransfer.files))
        }}
      >
        {urls.map((url, i) => (
          <div
            key={url + i}
            draggable
            onDragStart={() => setDraggedIndex(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              if (draggedIndex !== null) moveImage(draggedIndex, i)
              setDraggedIndex(null)
            }}
            onDragEnd={() => setDraggedIndex(null)}
            className={`group relative h-20 w-20 cursor-grab active:cursor-grabbing ${draggedIndex === i ? 'opacity-50' : ''}`}
          >
            <img src={url} alt="" className="h-20 w-20 rounded-lg border border-gray-100 object-cover" />
            <span className="absolute bottom-1 left-1 flex h-5 w-5 items-center justify-center rounded bg-black/60 text-white">
              <GripVertical className="h-3 w-3" />
            </span>
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
