const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '')
const TOKEN_KEY = 'studom-admin-token'

export function getAdminToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setAdminToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearAdminToken(): void {
  localStorage.removeItem(TOKEN_KEY)
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

export type ImageUploadType = 'logo' | 'image' | 'gallery'

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
