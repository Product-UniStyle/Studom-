export interface InstitutionApplicant {
  name: string
  email: string
  course: string
  status: 'Pending Review' | 'Under Review' | 'Shortlisted' | 'Accepted' | 'Rejected'
  date: string
  lastViewed: string
}

export const institutionApplicants: InstitutionApplicant[] = [
  { name: 'Aisha Khan', email: 'aisha.khan@email.com', course: 'BSc Business Management', status: 'Pending Review', date: '21 Jul 2026', lastViewed: '22 Jul 2026' },
  { name: 'Mohammed Ali', email: 'm.ali@email.com', course: 'BSc Business Management', status: 'Under Review', date: '20 Jul 2026', lastViewed: '21 Jul 2026' },
  { name: 'Sara Ahmed', email: 'sara.ahmed@email.com', course: 'BSc Business Management', status: 'Accepted', date: '19 Jul 2026', lastViewed: '21 Jul 2026' },
  { name: 'Omar Farooq', email: 'omar.farooq@email.com', course: 'BSc Business Management', status: 'Pending Review', date: '18 Jul 2026', lastViewed: '20 Jul 2026' },
  { name: 'Fatima Noor', email: 'fatima.noor@email.com', course: 'BSc Business Management', status: 'Under Review', date: '17 Jul 2026', lastViewed: '19 Jul 2026' },
  { name: 'Daniel Lewis', email: 'daniel.lewis@email.com', course: 'BSc Business Management', status: 'Accepted', date: '16 Jul 2026', lastViewed: '18 Jul 2026' },
  { name: 'Zainab Hassan', email: 'zainab.hassan@email.com', course: 'BSc Business Management', status: 'Rejected', date: '15 Jul 2026', lastViewed: '17 Jul 2026' },
  { name: 'Bilal Mahmood', email: 'bilal.mahmood@email.com', course: 'BSc Business Management', status: 'Under Review', date: '14 Jul 2026', lastViewed: '16 Jul 2026' },
  { name: 'Hina Saeed', email: 'hina.saeed@email.com', course: 'BSc Business Management', status: 'Accepted', date: '13 Jul 2026', lastViewed: '15 Jul 2026' },
  { name: 'Yusuf Iqbal', email: 'yusuf.iqbal@email.com', course: 'BSc Business Management', status: 'Pending Review', date: '12 Jul 2026', lastViewed: '14 Jul 2026' },
]

export interface Contributor {
  name: string
  type: string
  date: string
  status: 'Pending Review' | 'Approved' | 'Rejected'
}

export const contributors: Contributor[] = [
  { name: 'Aarav Sharma', type: 'Student Review', date: 'May 12, 2025', status: 'Pending Review' },
  { name: 'Nisha Verma', type: 'Campus Life', date: 'May 11, 2025', status: 'Pending Review' },
  { name: 'Rohan Mehta', type: 'Facilities', date: 'May 10, 2025', status: 'Approved' },
  { name: 'Priya Nair', type: 'Academics', date: 'May 9, 2025', status: 'Approved' },
  { name: 'Karan Malhotra', type: 'Student Experience', date: 'May 8, 2025', status: 'Rejected' },
  { name: 'Simran Kaur', type: 'Campus Life', date: 'May 7, 2025', status: 'Approved' },
]
