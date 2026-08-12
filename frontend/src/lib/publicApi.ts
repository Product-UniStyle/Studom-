const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

async function publicFetch(path: string) {
  const res = await fetch(`${API_URL}${path}`)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

export interface PublicUniversityListItem {
  _id: string
  name: string
  city?: string
  country?: string
  type: string
  image?: string
  logo?: string
  qsRank?: number
  origin?: string
  aggregateRating?: number
  aggregateReviewCount?: number
}

export interface PublicUniversityListResponse {
  items: PublicUniversityListItem[]
  total: number
  page: number
  limit: number
}

export async function listPublicUniversities(params: {
  search?: string
  type?: string
  city?: string
  country?: string
  fieldOfStudy?: string
  page?: number
  limit?: number
}): Promise<PublicUniversityListResponse> {
  const query = new URLSearchParams()
  if (params.search) query.set('search', params.search)
  if (params.type) query.set('type', params.type)
  if (params.city) query.set('city', params.city)
  if (params.country) query.set('country', params.country)
  if (params.fieldOfStudy) query.set('fieldOfStudy', params.fieldOfStudy)
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  return publicFetch(`/api/public/universities?${query.toString()}`)
}

export interface PublicUniversityFacets {
  countries: string[]
  cities: string[]
  fieldsOfStudy: string[]
}

export async function getPublicUniversityFacets(params: {
  type?: string
  country?: string
}): Promise<PublicUniversityFacets> {
  const query = new URLSearchParams()
  if (params.type) query.set('type', params.type)
  if (params.country) query.set('country', params.country)
  return publicFetch(`/api/public/universities/facets?${query.toString()}`)
}

export interface PublicUniversityDetail extends PublicUniversityListItem {
  area?: string
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
  inclusions?: { _id: string; label: string; icon?: string }[]
}

export async function getPublicUniversity(id: string): Promise<PublicUniversityDetail> {
  return publicFetch(`/api/public/universities/${id}`)
}

export interface PublicUniversityReview {
  _id: string
  reviewerName: string
  text: string
  date: string
  rating?: number
  platform?: string
  reviewerMeta?: string
  reviewerAvatar?: string
}

export async function listPublicUniversityReviews(
  id: string
): Promise<{ items: PublicUniversityReview[]; total: number }> {
  return publicFetch(`/api/public/universities/${id}/reviews`)
}
