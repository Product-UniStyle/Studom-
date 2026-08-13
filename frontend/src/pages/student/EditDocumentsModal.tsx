import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Upload, FileText, Check } from 'lucide-react'
import { uploadStudentDocument } from '../../lib/studentApi'
import type { StudentDocumentItem } from '../../lib/studentApi'

interface Props {
  documents: StudentDocumentItem[]
  onCancel: () => void
  onSaved: () => void
}

export default function EditDocumentsModal({ documents, onCancel, onSaved }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [changed, setChanged] = useState(false)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const name = file.name.replace(/\.[^./]+$/, '')
      await uploadStudentDocument(file, name)
      setChanged(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-5">
      {documents.length === 0 ? (
        <p className="text-sm text-gray-400">No documents uploaded yet.</p>
      ) : (
        <ul className="max-h-64 space-y-2 overflow-y-auto text-sm">
          {documents.map((d) => (
            <li key={d._id} className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2">
              <span className="flex items-center gap-2 text-gray-700">
                <FileText className="h-4 w-4 text-gray-400" /> {d.name}
              </span>
              <span className="flex items-center gap-1 text-xs font-medium text-green-600">
                <Check className="h-3.5 w-3.5" /> {d.status || 'Uploaded'}
              </span>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        <Upload className="h-4 w-4" /> {uploading ? 'Uploading...' : 'Upload New Document'}
      </button>
      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Link to="/student/documents" className="block text-sm font-medium text-blue-600">
        Manage all documents →
      </Link>

      <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
        <button
          type="button"
          onClick={() => (changed ? onSaved() : onCancel())}
          className="rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
        >
          Done
        </button>
      </div>
    </div>
  )
}
