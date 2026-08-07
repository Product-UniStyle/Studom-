export interface ActivityItem {
  id: string
  name: string
  role: string
  year: string
  description: string
}

export interface AchievementItem {
  id: string
  title: string
  level: string
  year: string
  description: string
}

export interface ProfileData {
  personal: {
    fullName: string
    email: string
    mobile: string
    countryOfResidence: string
    schoolName: string
    currentGrade: string
    confirmed: boolean
  }
  education: {
    curriculum: string
    gradYear: string
    subjects: string
    latestGrades: string
    predictedGrades: string
    englishTest: string
    standardizedTest: string
    intendedCourse: string
  }
  activities: ActivityItem[]
  achievements: AchievementItem[]
  documents: Record<string, string | null>
}

export const REQUIRED_DOCUMENTS = [
  'Passport / ID Proof',
  'Academic Transcripts',
  'Standardized Test Scores',
  'Letter of Recommendation',
  'Statement of Purpose',
  'Resume / CV',
  'Other Documents (Optional)',
]

export const initialProfileData: ProfileData = {
  personal: {
    fullName: '',
    email: '',
    mobile: '',
    countryOfResidence: '',
    schoolName: '',
    currentGrade: '',
    confirmed: false,
  },
  education: {
    curriculum: '',
    gradYear: '',
    subjects: '',
    latestGrades: '',
    predictedGrades: '',
    englishTest: '',
    standardizedTest: '',
    intendedCourse: '',
  },
  activities: [{ id: crypto.randomUUID(), name: '', role: '', year: '', description: '' }],
  achievements: [
    { id: crypto.randomUUID(), title: '', level: '', year: '', description: '' },
  ],
  documents: Object.fromEntries(REQUIRED_DOCUMENTS.map((d) => [d, null])),
}
