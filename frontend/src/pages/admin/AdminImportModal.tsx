import { useRef, useState } from 'react'
import { UploadCloud } from 'lucide-react'
import Modal from '../../components/ui/Modal'
import type { ImportReport } from '../../lib/adminApi'

interface AdminImportModalProps {
  title: string
  description: React.ReactNode
  importFn: (file: File, write: boolean) => Promise<ImportReport>
  onClose: () => void
  onImported: () => void
}

export default function AdminImportModal({ title, description, importFn, onClose, onImported }: AdminImportModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [report, setReport] = useState<ImportReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFile(e.target.files?.[0] ?? null)
    setReport(null)
    setError(null)
  }

  async function runImport(write: boolean) {
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const result = await importFn(file, write)
      setReport(result)
      if (write) onImported()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title={title} onClose={onClose}>
      <p className="text-sm text-gray-500">{description}</p>

      <div
        onClick={() => fileInputRef.current?.click()}
        className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-10 text-center hover:border-blue-400"
      >
        <UploadCloud className="h-8 w-8 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          {file ? file.name : 'Click to choose an .xlsx file'}
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={() => runImport(false)}
          disabled={!file || loading}
          className="flex-1 rounded-lg border border-gray-300 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-50"
        >
          {loading ? 'Working...' : 'Preview (dry run)'}
        </button>
        <button
          onClick={() => runImport(true)}
          disabled={!file || loading || !report}
          className="flex-1 rounded-lg bg-black py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? 'Working...' : 'Confirm & Write'}
        </button>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {report && (
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="rounded-lg bg-gray-50 py-3">
              <div className="text-xl font-semibold text-black">{report.totalRows}</div>
              <div className="text-xs text-gray-500">Total rows</div>
            </div>
            <div className="rounded-lg bg-green-50 py-3">
              <div className="text-xl font-semibold text-green-700">{report.created}</div>
              <div className="text-xs text-gray-500">To create</div>
            </div>
            <div className="rounded-lg bg-blue-50 py-3">
              <div className="text-xl font-semibold text-blue-700">{report.updated}</div>
              <div className="text-xs text-gray-500">To update</div>
            </div>
            <div className="rounded-lg bg-red-50 py-3">
              <div className="text-xl font-semibold text-red-700">{report.skipped}</div>
              <div className="text-xs text-gray-500">Skipped</div>
            </div>
          </div>

          {report.write && (
            <p className="rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">
              Written to the database.
            </p>
          )}
          {!report.write && (
            <p className="rounded-lg bg-yellow-50 px-4 py-2 text-sm text-yellow-700">
              Preview only — nothing written yet. Click "Confirm & Write" to commit.
            </p>
          )}

          {report.warnings.length > 0 && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <p className="text-sm font-medium text-yellow-800">Warnings</p>
              <ul className="mt-1 max-h-40 space-y-1 overflow-y-auto text-xs text-yellow-700">
                {report.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {report.rows.some((r) => r.action === 'skip') && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">Skipped rows</p>
              <ul className="mt-1 max-h-40 space-y-1 overflow-y-auto text-xs text-red-700">
                {report.rows
                  .filter((r) => r.action === 'skip')
                  .map((r) => (
                    <li key={r.row}>
                      Row {r.row} ({r.name || r.sourceId || 'unknown'}): {r.reason}
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}
