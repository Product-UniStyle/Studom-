import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import StudentSignup from './pages/auth/StudentSignup'
import StudentLogin from './pages/auth/StudentLogin'
import InstitutionSignup from './pages/auth/InstitutionSignup'
import InstitutionLogin from './pages/auth/InstitutionLogin'
import UniversitySearchPage from './pages/UniversitySearchPage'
import UniversityDetailPage from './pages/UniversityDetailPage'
import NewsListPage from './pages/NewsListPage'
import NewsDetailPage from './pages/NewsDetailPage'
import BlogListPage from './pages/BlogListPage'
import BlogDetailPage from './pages/BlogDetailPage'
import EventsListPage from './pages/EventsListPage'
import EventDetailPage from './pages/EventDetailPage'
import BuildProfilePage from './pages/profile/BuildProfilePage'
import { ApplyFlowProvider } from './context/ApplyFlowContext'
import SelectUniversitiesPage from './pages/apply/SelectUniversitiesPage'
import EssayQuestionsPage from './pages/apply/EssayQuestionsPage'
import ReviewApplicationPage from './pages/apply/ReviewApplicationPage'
import ApplicationSubmittedPage from './pages/apply/ApplicationSubmittedPage'
import StudentDashboardPage from './pages/student/StudentDashboardPage'
import MyProfilePage from './pages/student/MyProfilePage'
import MyApplicationsPage from './pages/student/MyApplicationsPage'
import DocumentsPage from './pages/student/DocumentsPage'
import SettingsPage from './pages/student/SettingsPage'
import InstitutionDashboardPage from './pages/institution/InstitutionDashboardPage'
import InstitutionApplicationsPage from './pages/institution/InstitutionApplicationsPage'
import InstitutionContributorsPage from './pages/institution/InstitutionContributorsPage'
import InstitutionUniversityPagePage from './pages/institution/InstitutionUniversityPagePage'
import InstitutionSettingsPage from './pages/institution/InstitutionSettingsPage'
import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminUploadPage from './pages/admin/AdminUploadPage'
import RequireStudentAuth from './components/auth/RequireStudentAuth'
import RequireInstitutionAuth from './components/auth/RequireInstitutionAuth'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route path="/student/signup" element={<StudentSignup />} />
      <Route path="/student/login" element={<StudentLogin />} />
      <Route path="/institution/signup" element={<InstitutionSignup />} />
      <Route path="/institution/login" element={<InstitutionLogin />} />

      <Route path="/search" element={<UniversitySearchPage />} />
      <Route path="/universities/:id" element={<UniversityDetailPage />} />

      <Route path="/news" element={<NewsListPage />} />
      <Route path="/news/:id" element={<NewsDetailPage />} />
      <Route path="/blog" element={<BlogListPage />} />
      <Route path="/blog/:id" element={<BlogDetailPage />} />
      <Route path="/events" element={<EventsListPage />} />
      <Route path="/events/:id" element={<EventDetailPage />} />

      <Route path="/profile/build" element={<RequireStudentAuth><BuildProfilePage /></RequireStudentAuth>} />

      <Route
        path="/apply/*"
        element={
          <RequireStudentAuth>
            <ApplyFlowProvider>
              <Routes>
                <Route path="select" element={<SelectUniversitiesPage />} />
                <Route path="essays" element={<EssayQuestionsPage />} />
                <Route path="review" element={<ReviewApplicationPage />} />
                <Route path="submitted" element={<ApplicationSubmittedPage />} />
              </Routes>
            </ApplyFlowProvider>
          </RequireStudentAuth>
        }
      />

      <Route path="/student/dashboard" element={<RequireStudentAuth><StudentDashboardPage /></RequireStudentAuth>} />
      <Route path="/student/profile" element={<RequireStudentAuth><MyProfilePage /></RequireStudentAuth>} />
      <Route path="/student/applications" element={<RequireStudentAuth><MyApplicationsPage /></RequireStudentAuth>} />
      <Route path="/student/documents" element={<RequireStudentAuth><DocumentsPage /></RequireStudentAuth>} />
      <Route path="/student/settings" element={<RequireStudentAuth><SettingsPage /></RequireStudentAuth>} />

      <Route path="/institution/dashboard" element={<RequireInstitutionAuth><InstitutionDashboardPage /></RequireInstitutionAuth>} />
      <Route path="/institution/applications" element={<RequireInstitutionAuth><InstitutionApplicationsPage /></RequireInstitutionAuth>} />
      <Route path="/institution/contributors" element={<RequireInstitutionAuth><InstitutionContributorsPage /></RequireInstitutionAuth>} />
      <Route path="/institution/university-page" element={<RequireInstitutionAuth><InstitutionUniversityPagePage /></RequireInstitutionAuth>} />
      <Route path="/institution/settings" element={<RequireInstitutionAuth><InstitutionSettingsPage /></RequireInstitutionAuth>} />

      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<AdminUploadPage />} />
    </Routes>
  )
}

export default App
