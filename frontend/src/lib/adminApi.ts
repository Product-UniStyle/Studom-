const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '')
const TOKEN_KEY = 'studom-admin-token'
const ROLE_KEY = 'studom-admin-role'

export type StaffRole = 'admin' | 'editor'

export function getAdminToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setAdminToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function getAdminRole(): StaffRole | null {
  return localStorage.getItem(ROLE_KEY) as StaffRole | null
}

export function clearAdminToken(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(ROLE_KEY)
}

function isUnauthorized(res: Response): boolean {
  if (res.status !== 401) return false
  clearAdminToken()
  if (window.location.pathname !== '/admin/login') {
    window.location.href = '/admin/login'
  }
  return true
}

export async function adminLogin(email: string, password: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Login failed')
  setAdminToken(data.token)
  localStorage.setItem(ROLE_KEY, data.role)
}

export interface ImportRowResult {
  row: number
  sourceId?: string
  name?: string
  action: 'create' | 'update' | 'skip'
  reason?: string
}

export interface ImportReport {
  write: boolean
  totalRows: number
  created: number
  updated: number
  skipped: number
  warnings: string[]
  rows: ImportRowResult[]
}

async function importSheet(path: string, file: File, write: boolean): Promise<ImportReport> {
  const token = getAdminToken()
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`${API_URL}${path}?write=${write}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })
  if (isUnauthorized(res)) throw new Error('Session expired. Please log in again.')
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Import failed')
  return data as ImportReport
}

export function importMainSheet(file: File, write: boolean): Promise<ImportReport> {
  return importSheet('/api/imports/main-sheet', file, write)
}

export function importPocSheet(file: File, write: boolean): Promise<ImportReport> {
  return importSheet('/api/imports/poc-sheet', file, write)
}

export function importReviewsSheet(file: File, write: boolean): Promise<ImportReport> {
  return importSheet('/api/imports/reviews-sheet', file, write)
}

export interface UniversityListItem {
  _id: string
  sourceId?: string
  name: string
  city?: string
  country?: string
  type: string
  qsRank?: number
  aggregateRating?: number
  aggregateReviewCount?: number
  logo?: string
  updatedAt?: string
}

export interface UniversityListResponse {
  items: UniversityListItem[]
  total: number
  page: number
  limit: number
}

async function adminFetch(path: string, init?: RequestInit) {
  const token = getAdminToken()
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  })
  if (isUnauthorized(res)) throw new Error('Session expired. Please log in again.')
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

export async function listUniversities(params: {
  search?: string
  type?: string
  page?: number
  limit?: number
}): Promise<UniversityListResponse> {
  const query = new URLSearchParams()
  if (params.search) query.set('search', params.search)
  if (params.type) query.set('type', params.type)
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  return adminFetch(`/api/universities?${query.toString()}`)
}

export interface UniversityDetail extends UniversityListItem {
  area?: string
  image?: string
  origin?: string
  course?: string
  uaeRank?: number
  uaeScore?: number
  overallScore?: number
  latitude?: number
  longitude?: number
  googleMapLink?: string
  costOfLiving?: number
  studentPopulation?: number
  fieldsOfStudy?: string[]
  board?: string
  grade?: string
  subjects?: string[]
  performance?: string
  locality?: string
  mode?: string
  detail?: {
    gallery?: string[]
    about?: string[]
    website?: string
    poc?: { name?: string; address?: string; email?: string; phone?: string; fax?: string }
  }
  inclusions?: { _id: string; label: string }[]
  essayQuestions?: { question: string }[]
}

export async function getUniversity(id: string): Promise<UniversityDetail> {
  return adminFetch(`/api/universities/${id}`)
}

export async function updateUniversity(
  id: string,
  data: Record<string, unknown>
): Promise<UniversityDetail> {
  return adminFetch(`/api/universities/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function deleteUniversity(id: string): Promise<void> {
  const token = getAdminToken()
  const res = await fetch(`${API_URL}/api/universities/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (isUnauthorized(res)) throw new Error('Session expired. Please log in again.')
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Delete failed')
  }
}

export type ImageUploadType = 'logo' | 'image' | 'gallery' | 'cover'

export async function uploadImage(file: File, universityName: string, type: ImageUploadType): Promise<string> {
  const token = getAdminToken()
  const formData = new FormData()
  formData.append('file', file)
  formData.append('universityName', universityName)
  formData.append('type', type)

  const res = await fetch(`${API_URL}/api/uploads/image`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })
  if (isUnauthorized(res)) throw new Error('Session expired. Please log in again.')
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Upload failed')
  return data.url as string
}

export type UploadContentKind = 'news' | 'blogs' | 'events'

export async function uploadArticleCoverImage(file: File, articleTitle: string, kind: UploadContentKind): Promise<string> {
  const token = getAdminToken()
  const formData = new FormData()
  formData.append('file', file)
  formData.append('articleTitle', articleTitle)
  formData.append('articleKind', kind)
  formData.append('type', 'cover')

  const res = await fetch(`${API_URL}/api/uploads/image`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })
  if (isUnauthorized(res)) throw new Error('Session expired. Please log in again.')
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Upload failed')
  return data.url as string
}

export async function uploadArticleSectionImage(file: File, articleTitle: string, kind: ArticleKind): Promise<string> {
  const token = getAdminToken()
  const formData = new FormData()
  formData.append('file', file)
  formData.append('articleTitle', articleTitle)
  formData.append('articleKind', kind)
  formData.append('type', 'section')

  const res = await fetch(`${API_URL}/api/uploads/image`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })
  if (isUnauthorized(res)) throw new Error('Session expired. Please log in again.')
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Upload failed')
  return data.url as string
}

export interface UniversityReview {
  _id: string
  reviewerName: string
  text: string
  date: string
  rating?: number
  platform?: string
  link?: string
  reviewerMeta?: string
}

export async function listUniversityReviews(universityId: string): Promise<{ items: UniversityReview[]; total: number }> {
  return adminFetch(`/api/universities/${universityId}/reviews`)
}

export interface StaffUser {
  _id: string
  email: string
  role: StaffRole
  firstName?: string
  lastName?: string
  createdAt: string
}

export async function listStaffUsers(): Promise<{ users: StaffUser[] }> {
  return adminFetch('/api/admin/users')
}

export async function createStaffUser(data: {
  email: string
  password: string
  role: StaffRole
  firstName?: string
  lastName?: string
}): Promise<{ user: StaffUser }> {
  return adminFetch('/api/admin/users', { method: 'POST', body: JSON.stringify(data) })
}

export async function updateStaffUserRole(id: string, role: StaffRole): Promise<{ user: StaffUser }> {
  return adminFetch(`/api/admin/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) })
}

export async function deleteStaffUser(id: string): Promise<void> {
  const token = getAdminToken()
  const res = await fetch(`${API_URL}/api/admin/users/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (isUnauthorized(res)) throw new Error('Session expired. Please log in again.')
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Delete failed')
  }
}

export function importNewsSheet(file: File, write: boolean): Promise<ImportReport> {
  return importSheet('/api/imports/news-sheet', file, write)
}

export function importBlogSheet(file: File, write: boolean): Promise<ImportReport> {
  return importSheet('/api/imports/blog-sheet', file, write)
}

export interface ArticleSection {
  order: number
  title?: string
  image?: string
  content: string
}

export interface ArticleListItem {
  _id: string
  title: string
  coverImage?: string
  author?: string
  source?: string
  destination?: string
  publishedDate?: string
  type?: string
  sourceLink?: string
  updatedAt?: string
}

export interface ArticleDetail extends ArticleListItem {
  content: string
  sections: ArticleSection[]
  universityIds?: { _id: string; name: string }[]
}

export type ArticleKind = 'news' | 'blogs'

export async function listArticles(
  kind: ArticleKind,
  params: { search?: string; page?: number; limit?: number }
): Promise<{ items: ArticleListItem[]; total: number; page: number; limit: number }> {
  const query = new URLSearchParams()
  if (params.search) query.set('search', params.search)
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  return adminFetch(`/api/${kind}?${query.toString()}`)
}

export async function getArticle(kind: ArticleKind, id: string): Promise<ArticleDetail> {
  return adminFetch(`/api/${kind}/${id}`)
}

export async function updateArticle(
  kind: ArticleKind,
  id: string,
  data: Record<string, unknown>
): Promise<ArticleDetail> {
  return adminFetch(`/api/${kind}/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
}

export async function deleteArticle(kind: ArticleKind, id: string): Promise<void> {
  const token = getAdminToken()
  const res = await fetch(`${API_URL}/api/${kind}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (isUnauthorized(res)) throw new Error('Session expired. Please log in again.')
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Delete failed')
  }
}

export type EventMode = 'In-person' | 'Online'

export interface EventExpectation {
  icon?: string
  text: string
}

export interface EventListItem {
  _id: string
  title: string
  coverImage?: string
  date: string
  mode: EventMode
  category?: string
  venue?: string
  registrationDeadline?: string
  universityId?: { _id: string; name: string }
  updatedAt?: string
}

export interface EventDetail extends EventListItem {
  time?: string
  venueAddress?: string
  latitude?: number
  longitude?: number
  language?: string
  price?: string
  seatsInfo?: string
  aboutDescription?: string
  whatToExpect: EventExpectation[]
  whoCanAttend?: string
  whatToBring?: string
  registrationInfo?: string
  organiserContactEmail?: string
  organiserContactPhone?: string
}

export async function listEvents(params: {
  search?: string
  page?: number
  limit?: number
}): Promise<{ items: EventListItem[]; total: number; page: number; limit: number }> {
  const query = new URLSearchParams()
  if (params.search) query.set('search', params.search)
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  return adminFetch(`/api/events?${query.toString()}`)
}

export async function getEvent(id: string): Promise<EventDetail> {
  return adminFetch(`/api/events/${id}`)
}

export async function createEvent(data: Record<string, unknown>): Promise<EventDetail> {
  return adminFetch('/api/events', { method: 'POST', body: JSON.stringify(data) })
}

export async function updateEvent(id: string, data: Record<string, unknown>): Promise<EventDetail> {
  return adminFetch(`/api/events/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
}

export async function deleteEvent(id: string): Promise<void> {
  const token = getAdminToken()
  const res = await fetch(`${API_URL}/api/events/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (isUnauthorized(res)) throw new Error('Session expired. Please log in again.')
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Delete failed')
  }
}
