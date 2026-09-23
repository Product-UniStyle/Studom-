import { useEffect, useRef, useState } from 'react'
import { UploadCloud, Plus, FileCheck2, Loader2 } from 'lucide-react'
import { BUILD_PROFILE_DOCUMENT_FOLDER, REQUIRED_DOCUMENTS, type ProfileData } from '../profileTypes'
import { listStudentDocuments, uploadStudentDocument } from '../../../lib/studentApi'

interface Props {
  data: ProfileData
  update: (patch: Record<string, string | null>) => void
}

export default function DocumentsStep({ data, update }: Props) {
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    listStudentDocuments({ folder: BUILD_PROFILE_DOCUMENT_FOLDER })
      .then((res) => {
        if (cancelled) return
        const patch: Record<string, string | null> = {}
        for (const doc of REQUIRED_DOCUMENTS) {
          const match = res.items.find((d) => d.category === doc)
          if (match) patch[doc] = match.name
        }
        if (Object.keys(patch).length > 0) update(patch)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleUpload(doc: string, file: File) {
    setUploadingDoc(doc)
    setError(null)
    try {
      const res = await uploadStudentDocument(file, doc, doc, BUILD_PROFILE_DOCUMENT_FOLDER)
      update({ [doc]: res.document.name })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploadingDoc(null)
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-black">Documents</h2>
      <p className="mt-1 text-sm text-gray-500">
        Upload the required documents. You can add more later.
      </p>

      <div className="mt-8">
        <div className="mb-4 text-sm font-semibold text-black">
          Required Documents
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {REQUIRED_DOCUMENTS.map((doc) => {
            const uploaded = data.documents[doc]
            const uploading = uploadingDoc === doc
            return (
              <button
                key={doc}
                type="button"
                disabled={uploading}
                onClick={() => inputRefs.current[doc]?.click()}
                className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 px-4 py-8 text-center hover:border-blue-300 disabled:opacity-60"
              >
                <input
                  ref={(el) => {
                    inputRefs.current[doc] = el
                  }}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    e.target.value = ''
                    if (file) handleUpload(doc, file)
                  }}
                />
                {uploading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                ) : uploaded ? (
                  <FileCheck2 className="h-6 w-6 text-green-500" />
                ) : (
                  <UploadCloud className="h-6 w-6 text-gray-400" />
                )}
                <div className="mt-3 text-sm font-medium text-black">
                  {doc}
                </div>
                <div className="mt-1 text-xs text-gray-400">
                  {uploading ? 'Uploading...' : uploaded ? uploaded : 'Upload PDF, JPG or PNG'}
                </div>
                {!uploaded && !uploading && (
                  <div className="text-xs text-gray-400">Max size 10MB</div>
                )}
              </button>
            )
          })}
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <button
          type="button"
          className="mt-6 flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-black hover:bg-gray-50"
        >
          <Plus className="h-4 w-4" /> Add another document (Optional)
        </button>
        <p className="mt-2 text-xs text-gray-400">
          You can add more documents later if needed.
        </p>
      </div>
    </div>
  )
}
