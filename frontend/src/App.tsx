import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import StudentSignup from './pages/auth/StudentSignup'
import StudentLogin from './pages/auth/StudentLogin'
import InstitutionSignup from './pages/auth/InstitutionSignup'
import InstitutionLogin from './pages/auth/InstitutionLogin'
import UniversitySearchPage from './pages/UniversitySearchPage'
import UniversityDetailPage from './pages/UniversityDetailPage'
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

      <Route path="/profile/build" element={<BuildProfilePage />} />

      <Route
        path="/apply/*"
        element={
          <ApplyFlowProvider>
            <Routes>
              <Route path="select" element={<SelectUniversitiesPage />} />
              <Route path="essays" element={<EssayQuestionsPage />} />
              <Route path="review" element={<ReviewApplicationPage />} />
              <Route path="submitted" element={<ApplicationSubmittedPage />} />
            </Routes>
          </ApplyFlowProvider>
        }
      />

      <Route path="/student/dashboard" element={<StudentDashboardPage />} />
      <Route path="/student/profile" element={<MyProfilePage />} />
      <Route path="/student/applications" element={<MyApplicationsPage />} />
      <Route path="/student/documents" element={<DocumentsPage />} />
      <Route path="/student/settings" element={<SettingsPage />} />

      <Route path="/institution/dashboard" element={<InstitutionDashboardPage />} />
      <Route path="/institution/applications" element={<InstitutionApplicationsPage />} />
      <Route path="/institution/contributors" element={<InstitutionContributorsPage />} />
      <Route path="/institution/university-page" element={<InstitutionUniversityPagePage />} />
      <Route path="/institution/settings" element={<InstitutionSettingsPage />} />

      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<AdminUploadPage />} />
    </Routes>
  )
}

export default App
