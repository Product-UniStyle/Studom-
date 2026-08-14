import { useRef, useState } from 'react'
import { UploadCloud, X } from 'lucide-react'
import Modal from '../../components/ui/Modal'
import type { ImportReport } from '../../lib/adminApi'

interface AdminImportModalProps {
  title: string
  description: React.ReactNode
  importFn: (file: File, write: boolean) => Promise<ImportReport>
  onClose: () => void
  onImported: () => void
}

// Warnings arrive as pre-formatted strings like "Row 220 (EdFlik): missing
// City or Country" — parsed back out so identical reasons can be grouped
// instead of repeating the same sentence dozens of times for a large sheet.
function parseWarning(raw: string): { row: string; reason: string } {
  const match = raw.match(/^Row (.+?): (.+)$/)
  if (!match) return { row: '', reason: raw }
  return { row: match[1], reason: match[2] }
}

function groupByReason<T>(items: T[], getReason: (item: T) => string): Map<string, T[]> {
  const groups = new Map<string, T[]>()
  for (const item of items) {
    const reason = getReason(item)
    const existing = groups.get(reason)
    if (existing) existing.push(item)
    else groups.set(reason, [item])
  }
  return groups
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

  function removeFile(e: React.MouseEvent) {
    e.stopPropagation()
    setFile(null)
    setReport(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
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

  const skippedRows = report?.rows.filter((r) => r.action === 'skip') || []
  const warningGroups = report
    ? groupByReason(report.warnings.map(parseWarning), (w) => w.reason)
    : new Map<string, { row: string; reason: string }[]>()
  const skippedGroups = groupByReason(skippedRows, (r) => r.reason || 'Unknown reason')

  return (
    <Modal title={title} onClose={onClose}>
      <p className="text-sm text-gray-500">{description}</p>

      <div
        onClick={() => fileInputRef.current?.click()}
        className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-10 text-center hover:border-blue-400"
      >
        <UploadCloud className="h-8 w-8 text-gray-400" />
        {file ? (
          <div className="mt-2 flex items-center gap-2">
            <p className="text-sm text-gray-600">{file.name}</p>
            <button
              type="button"
              onClick={removeFile}
              className="rounded-full p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              title="Remove file"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <p className="mt-2 text-sm text-gray-600">Click to choose an .xlsx file</p>
        )}
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
          {loading ? 'Working...' : '1. Preview (dry run)'}
        </button>
        <button
          onClick={() => runImport(true)}
          disabled={!file || loading || !report}
          className={`flex-1 rounded-lg py-3 text-sm font-semibold disabled:opacity-40 ${
            report
              ? 'bg-black text-white hover:bg-gray-800'
              : 'bg-gray-100 text-gray-400'
          }`}
        >
          {loading ? 'Working...' : '2. Confirm & Write'}
        </button>
      </div>
      {!report && !loading && (
        <p className="mt-2 text-xs text-gray-400">Run a preview first to review changes before writing.</p>
      )}

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

          {warningGroups.size > 0 && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <p className="text-sm font-medium text-yellow-800">Warnings ({report!.warnings.length})</p>
              <p className="mt-0.5 text-xs text-yellow-700/80">
                These rows were still imported, but double-check the noted issue.
              </p>
              <div className="mt-2 max-h-48 space-y-2 overflow-y-auto">
                {[...warningGroups.entries()].map(([reason, items]) => (
                  <details key={reason} open={items.length <= 3} className="text-xs text-yellow-700">
                    <summary className="cursor-pointer font-medium">
                      {reason} ({items.length} row{items.length === 1 ? '' : 's'})
                    </summary>
                    <ul className="mt-1 space-y-0.5 pl-4">
                      {items.map((w, i) => (
                        <li key={i}>Row {w.row}</li>
                      ))}
                    </ul>
                  </details>
                ))}
              </div>
            </div>
          )}

          {skippedRows.length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">Skipped rows ({skippedRows.length})</p>
              <p className="mt-0.5 text-xs text-red-700/80">
                These rows were not imported at all.
              </p>
              <div className="mt-2 max-h-48 space-y-2 overflow-y-auto">
                {[...skippedGroups.entries()].map(([reason, items]) => (
                  <details key={reason} open={items.length <= 3} className="text-xs text-red-700">
                    <summary className="cursor-pointer font-medium">
                      {reason} ({items.length} row{items.length === 1 ? '' : 's'})
                    </summary>
                    <ul className="mt-1 space-y-0.5 pl-4">
                      {items.map((r) => (
                        <li key={r.row}>
                          Row {r.row} ({r.name || r.sourceId || 'unknown'})
                        </li>
                      ))}
                    </ul>
                  </details>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}
