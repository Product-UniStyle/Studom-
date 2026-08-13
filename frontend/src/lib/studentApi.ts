const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '')
const TOKEN_KEY = 'studom-student-token'

export function getStudentToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setStudentToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearStudentToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

function isUnauthorized(res: Response): boolean {
  if (res.status !== 401) return false
  clearStudentToken()
  if (window.location.pathname !== '/student/login') {
    window.location.href = '/student/login'
  }
  return true
}

async function studentFetch(path: string, init?: RequestInit) {
  const token = getStudentToken()
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...(init?.body && !(init.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  })
  if (isUnauthorized(res)) throw new Error('Session expired. Please log in again.')
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

export type CurrentStage = 'School Student' | 'Undergraduate' | 'Postgraduate' | 'Working Professional'

export async function studentSignup(input: {
  fullName: string
  email: string
  password: string
  birthdate?: string
  currentStage: CurrentStage
}): Promise<void> {
  const res = await fetch(`${API_URL}/api/student/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Signup failed')
  setStudentToken(data.token)
}

export async function studentLogin(email: string, password: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/student/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Login failed')
  setStudentToken(data.token)
}

export interface StudentActivity {
  name: string
  role?: string
  year?: string
  description?: string
}

export interface StudentAchievement {
  title: string
  level?: string
  year?: string
  description?: string
}

export interface StudentProfile {
  fullName: string
  email: string
  birthdate?: string
  currentStage: CurrentStage
  avatar?: string
  nationality?: string
  currentLocation?: string
  profile: {
    personal: {
      mobile?: string
      countryOfResidence?: string
      schoolName?: string
      currentGrade?: string
      confirmed: boolean
      gender?: string
    }
    education: {
      curriculum?: string
      gradYear?: string
      subjects?: string[]
      latestGrades?: string
      predictedGrades?: string
      englishTest?: string
      standardizedTest?: string
      intendedCourse?: string
    }
    activities: StudentActivity[]
    achievements: StudentAchievement[]
  }
  preferences: {
    preferredIntake?: string
    preferredCountry?: string
    preferredCity?: string
    notificationPreference?: string
  }
}

export interface StudentStats {
  applicationsCount: number
  documentsCount: number
  profileCompletion: number
}

export async function getStudentMe(): Promise<{ student: StudentProfile; stats: StudentStats }> {
  return studentFetch('/api/student/me')
}

export interface StudentProfilePatch {
  fullName?: string
  birthdate?: string
  nationality?: string
  currentLocation?: string
  personal?: Partial<StudentProfile['profile']['personal']>
  education?: Partial<StudentProfile['profile']['education']>
  activities?: StudentActivity[]
  achievements?: StudentAchievement[]
  preferences?: Partial<StudentProfile['preferences']>
}

export async function updateStudentMe(patch: StudentProfilePatch): Promise<{ student: StudentProfile }> {
  return studentFetch('/api/student/me', {
    method: 'PATCH',
    body: JSON.stringify(patch),
  })
}

export type ApplicationStatus = 'Submitted' | 'Under Review' | 'Shortlisted' | 'Offer Received' | 'Rejected'

export interface StudentApplicationItem {
  _id: string
  universityId: { _id: string; name: string; city?: string; country?: string; logo?: string }
  applicationRef: string
  appliedOn: string
  status: ApplicationStatus
  course?: string
  lastViewed?: string
}

export async function listStudentApplications(): Promise<{ items: StudentApplicationItem[]; total: number }> {
  return studentFetch('/api/student/applications')
}

export interface StudentTaskItem {
  _id: string
  title: string
  due?: string
  applicationId: string
  university?: string
}

export async function listStudentTasks(): Promise<{ items: StudentTaskItem[]; total: number }> {
  return studentFetch('/api/student/tasks')
}

export type DocumentStatus = 'Uploaded' | 'Pending' | 'Requested'

export interface StudentDocumentItem {
  _id: string
  name: string
  fileUrl: string
  category?: string
  status?: DocumentStatus
  date?: string
}

export async function listStudentDocuments(): Promise<{ items: StudentDocumentItem[]; total: number }> {
  return studentFetch('/api/student/documents')
}

export async function uploadStudentDocument(
  file: File,
  name: string,
  category?: string
): Promise<{ document: StudentDocumentItem }> {
  const token = getStudentToken()
  const formData = new FormData()
  formData.append('file', file)
  formData.append('name', name)
  if (category) formData.append('category', category)

  const res = await fetch(`${API_URL}/api/student/documents`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })
  if (isUnauthorized(res)) throw new Error('Session expired. Please log in again.')
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Upload failed')
  return data
}
