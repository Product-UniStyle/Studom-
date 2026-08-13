import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UploadCloud, LogOut, Landmark, Newspaper, Users, CalendarDays } from 'lucide-react'
import {
  clearAdminToken,
  getAdminToken,
  importMainSheet,
  importPocSheet,
  importReviewsSheet,
} from '../../lib/adminApi'
import AdminUniversityTable from './AdminUniversityTable'
import AdminImportModal from './AdminImportModal'
import AdminArticlesTab from './AdminArticlesTab'
import AdminEventsTab from './AdminEventsTab'
import AdminUsersTab from './AdminUsersTab'

type ImportKind = 'main' | 'poc' | 'reviews'
type Tab = 'university' | 'articles' | 'events' | 'users'

export default function AdminUploadPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('university')
  const [activeImport, setActiveImport] = useState<ImportKind | null>(null)
  const [tableRefreshKey, setTableRefreshKey] = useState(0)

  useEffect(() => {
    if (!getAdminToken()) navigate('/admin/login', { replace: true })
  }, [navigate])

  function handleLogout() {
    clearAdminToken()
    navigate('/admin/login', { replace: true })
  }

  const tabs: { key: Tab; label: string; icon: typeof Landmark }[] = [
    { key: 'university', label: 'University', icon: Landmark },
    { key: 'articles', label: 'News & Blogs', icon: Newspaper },
    { key: 'events', label: 'Events', icon: CalendarDays },
    { key: 'users', label: 'Users', icon: Users },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-lg font-semibold text-black">Studom Admin</h1>
            <nav className="flex gap-1">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    tab === t.key ? 'bg-black text-white' : 'text-gray-500 hover:text-black'
                  }`}
                >
                  <t.icon className="h-4 w-4" /> {t.label}
                </button>
              ))}
            </nav>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-black"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        {tab === 'university' && (
          <>
            <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-black">University Data Upload</h2>
              <div className="flex gap-3">
                <button
                  onClick={() => setActiveImport('main')}
                  className="flex items-center gap-1.5 rounded-lg bg-black px-3.5 py-2 text-xs font-semibold text-white hover:bg-gray-800"
                >
                  <UploadCloud className="h-3.5 w-3.5" /> Import MAIN Sheet
                </button>
                <button
                  onClick={() => setActiveImport('poc')}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3.5 py-2 text-xs font-semibold text-gray-800 hover:bg-gray-50"
                >
                  <UploadCloud className="h-3.5 w-3.5" /> Import POC
                </button>
                <button
                  onClick={() => setActiveImport('reviews')}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3.5 py-2 text-xs font-semibold text-gray-800 hover:bg-gray-50"
                >
                  <UploadCloud className="h-3.5 w-3.5" /> Import Reviews
                </button>
              </div>
            </div>

            <AdminUniversityTable refreshKey={tableRefreshKey} />
          </>
        )}

        {tab === 'articles' && <AdminArticlesTab />}
        {tab === 'events' && <AdminEventsTab />}
        {tab === 'users' && <AdminUsersTab />}
      </main>

      {activeImport === 'main' && (
        <AdminImportModal
          title="Import MAIN Sheet"
          description={
            <>
              Upload the data team's <code>Tech_UAE_All_Data.xlsx</code> file. The MAIN tab is
              imported into the University collection, matched by each row's sheet ID so
              re-uploads update existing records instead of duplicating them.
            </>
          }
          importFn={importMainSheet}
          onClose={() => setActiveImport(null)}
          onImported={() => setTableRefreshKey((k) => k + 1)}
        />
      )}

      {activeImport === 'poc' && (
        <AdminImportModal
          title="Import POC Sheet"
          description={
            <>
              Upload the same workbook's <code>POC</code> tab. Each row is matched to its
              university by the shared sheet ID and fills in the area, POC name, address, email,
              phone, and fax — this only works after the MAIN sheet has been imported first.
            </>
          }
          importFn={importPocSheet}
          onClose={() => setActiveImport(null)}
          onImported={() => setTableRefreshKey((k) => k + 1)}
        />
      )}

      {activeImport === 'reviews' && (
        <AdminImportModal
          title="Import Reviews Sheet"
          description={
            <>
              Upload the same workbook's <code>Reviews</code> tab. Each review is matched to its
              university by the shared sheet ID, so this only works after the MAIN sheet has been
              imported first. Re-uploads update existing reviews instead of duplicating them.
            </>
          }
          importFn={importReviewsSheet}
          onClose={() => setActiveImport(null)}
          onImported={() => setTableRefreshKey((k) => k + 1)}
        />
      )}
    </div>
  )
}
