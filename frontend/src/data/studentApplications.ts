import { getUniversityById } from './universities'

export type ApplicationStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Offer Received'
  | 'Rejected'

export interface StudentApplication {
  universityId: string
  appliedOn: string
  status: ApplicationStatus
  course: string
}

export const studentApplications: StudentApplication[] = [
  {
    universityId: 'university-of-birmingham-dubai',
    appliedOn: '10 May 2025',
    status: 'Submitted',
    course: 'BSc Business Management',
  },
  {
    universityId: 'university-of-wollongong-in-dubai',
    appliedOn: '08 May 2025',
    status: 'Under Review',
    course: 'BSc Business Management with Finance',
  },
  {
    universityId: 'heriot-watt-university-dubai',
    appliedOn: '05 May 2025',
    status: 'Submitted',
    course: 'BSc Business Management',
  },
  {
    universityId: 'middlesex-university-dubai',
    appliedOn: '03 May 2025',
    status: 'Offer Received',
    course: 'BSc Business Management',
  },
]

export const studentApplicationsWithUni = studentApplications.map((a) => ({
  ...a,
  university: getUniversityById(a.universityId)!,
}))

export const upcomingTasks = [
  {
    title: 'Answer additional question',
    university: 'Heriot-Watt University Dubai',
    due: '12 May 2025',
  },
  {
    title: 'Upload supporting document',
    university: 'University of Birmingham Dubai',
    due: '10 May 2025',
  },
  {
    title: 'Pay application fee',
    university: 'Middlesex University Dubai',
    due: '15 May 2025',
  },
]

export interface StudentDocument {
  name: string
  category: string
  status: 'Uploaded' | 'Pending' | 'Requested'
  date: string
}

export const studentDocuments: StudentDocument[] = [
  { name: 'Passport / ID Proof', category: 'Identity', status: 'Uploaded', date: '02 May 2025' },
  { name: 'Academic Transcripts', category: 'Academics', status: 'Uploaded', date: '01 May 2025' },
  { name: 'Standardized Test Scores', category: 'Test Scores', status: 'Pending', date: '30 Apr 2025' },
  { name: 'Letter of Recommendation', category: 'Recommendation', status: 'Pending', date: '29 Apr 2025' },
  { name: 'Statement of Purpose', category: 'Essays', status: 'Uploaded', date: '28 Apr 2025' },
  { name: 'Resume / CV', category: 'Profile', status: 'Uploaded', date: '28 Apr 2025' },
  { name: 'Other Document', category: 'Supporting', status: 'Requested', date: '27 Apr 2025' },
]
