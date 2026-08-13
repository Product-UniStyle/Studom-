const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '')
const TOKEN_KEY = 'studom-institution-token'

export function getInstitutionToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setInstitutionToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearInstitutionToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

function isUnauthorized(res: Response): boolean {
  if (res.status !== 401) return false
  clearInstitutionToken()
  if (window.location.pathname !== '/institution/login') {
    window.location.href = '/institution/login'
  }
  return true
}

async function institutionFetch(path: string, init?: RequestInit) {
  const token = getInstitutionToken()
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

export async function institutionSignup(input: {
  fullName: string
  email: string
  universityId: string
  universityName: string
  designation?: string
  password: string
}): Promise<void> {
  const res = await fetch(`${API_URL}/api/institution/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Signup failed')
  setInstitutionToken(data.token)
}

export async function institutionLogin(email: string, password: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/institution/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Login failed')
  setInstitutionToken(data.token)
}

export interface InstitutionAccount {
  _id: string
  fullName: string
  email: string
  universityId: string
  universityName: string
  designation?: string
}

export interface InstitutionUniversity {
  _id: string
  name: string
  city?: string
  country?: string
  logo?: string
  image?: string
  overallScore?: number
}

export interface InstitutionStats {
  totalApplications: number
  pendingApplications: number
  offerApplications: number
  rejectedApplications: number
  totalContributors: number
  pendingContributors: number
  approvedContributors: number
  rejectedContributors: number
  contactEnquiries: number
  totalReviews: number
}

export async function getInstitutionMe(): Promise<{
  account: InstitutionAccount
  university: InstitutionUniversity | null
  stats: InstitutionStats
}> {
  return institutionFetch('/api/institution/me')
}

export type ApplicationStatus = 'Submitted' | 'Under Review' | 'Shortlisted' | 'Offer Received' | 'Rejected'

export interface InstitutionApplicationItem {
  _id: string
  studentId: { _id: string; fullName: string; email: string }
  applicationRef: string
  appliedOn: string
  status: ApplicationStatus
  course?: string
  lastViewed?: string
}

export async function listInstitutionApplications(): Promise<{
  items: InstitutionApplicationItem[]
  total: number
}> {
  return institutionFetch('/api/institution/applications')
}

export type ContributorStatus = 'Pending Review' | 'Approved' | 'Rejected'

export interface InstitutionContributorItem {
  _id: string
  name: string
  type?: string
  date: string
  status: ContributorStatus
  courseOfStudy?: string
  yearOfStudy?: string
}

export async function listInstitutionContributors(): Promise<{
  items: InstitutionContributorItem[]
  total: number
}> {
  return institutionFetch('/api/institution/contributors')
}
