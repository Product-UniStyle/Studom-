import { useEffect, useRef, useState } from 'react'
import { Upload } from 'lucide-react'

interface ImageUploadFieldProps {
  label: string
  name: string
  defaultValue?: string
  onUpload: (file: File) => Promise<string>
  onChange?: (url: string) => void
}

export default function ImageUploadField({ label, name, defaultValue, onUpload, onChange }: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState(defaultValue || '')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDraggingFile, setIsDraggingFile] = useState(false)

  // Keeps the preview correct when this instance is reused for a different
  // logical item (e.g. reordering a list of index-keyed rows), since a
  // useState initializer only reads defaultValue on first mount otherwise.
  useEffect(() => {
    setValue(defaultValue || '')
  }, [defaultValue])

  async function uploadFile(file: File) {
    if (!file.type.startsWith('image/')) return
    setUploading(true)
    setError(null)
    try {
      const url = await onUpload(file)
      setValue(url)
      onChange?.(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    uploadFile(file)
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-900">{label}</label>
      <input type="hidden" name={name} value={value} readOnly />

      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          if (e.dataTransfer.types.includes('Files')) setIsDraggingFile(true)
        }}
        onDragLeave={(e) => {
          if (e.currentTarget === e.target) setIsDraggingFile(false)
        }}
        onDrop={(e) => {
          e.preventDefault()
          setIsDraggingFile(false)
          const file = e.dataTransfer.files?.[0]
          if (file) uploadFile(file)
        }}
        className={`flex h-28 w-28 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition-colors ${
          isDraggingFile ? 'border-blue-400 bg-blue-50 ring-2 ring-blue-300' : 'border-gray-200 hover:border-blue-400'
        }`}
      >
        {value ? (
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-1 text-gray-400">
            <Upload className="h-5 w-5" />
            <span className="text-[10px]">{uploading ? 'Uploading...' : 'Drag or click'}</span>
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
