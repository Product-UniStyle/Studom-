import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UploadCloud, LogOut } from 'lucide-react'
import { clearAdminToken, getAdminToken } from '../../lib/adminApi'
import AdminUniversityTable from './AdminUniversityTable'
import AdminImportAllModal from './AdminImportAllModal'

export default function AdminUploadPage() {
  const navigate = useNavigate()
  const [showImportModal, setShowImportModal] = useState(false)
  const [tableRefreshKey, setTableRefreshKey] = useState(0)

  useEffect(() => {
    if (!getAdminToken()) navigate('/admin/login', { replace: true })
  }, [navigate])

  function handleLogout() {
    clearAdminToken()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-8 py-4">
        <h1 className="text-lg font-semibold text-black">Studom Admin</h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-black"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-black">University Data Upload</h2>
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
          >
            <UploadCloud className="h-4 w-4" /> Import Data Sheet
          </button>
        </div>

        <AdminUniversityTable refreshKey={tableRefreshKey} />
      </main>

      {showImportModal && (
        <AdminImportAllModal
          onClose={() => setShowImportModal(false)}
          onImported={() => setTableRefreshKey((k) => k + 1)}
        />
      )}
    </div>
  )
}
