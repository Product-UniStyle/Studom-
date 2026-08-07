export interface UniversityDetail {
  gallery: string[]
  qsRanking: number
  origin: string
  about: string[]
  website: string
  poc: {
    address: string
    email: string
    phone: string
  }
}

const defaultDetail = (name: string): UniversityDetail => ({
  gallery: [
    'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?auto=format&fit=crop&w=600&q=80',
  ],
  qsRanking: 3,
  origin: 'British',
  about: [
    `${name} offers a world-class campus designed to accommodate thousands of students with state-of-the-art laboratories, learning spaces, and facilities.`,
    `${name} offers undergraduate and postgraduate programs across business, engineering, computer science, education, and social sciences, all taught to the same high academic standards as the home campus.`,
    `Students graduate with a globally recognised degree, opening pathways to global careers and further study.`,
    `The campus blends international academic excellence with a diverse and future-focused community.`,
  ],
  website: '#',
  poc: {
    address: 'Dubai International Academic City, Dubai, UAE',
    email: 'admissions@university.ac.uk',
    phone: '+971 4 123 4657',
  },
})

const details: Record<string, UniversityDetail> = {
  'university-of-birmingham-dubai': {
    gallery: [
      'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=600&q=80',
    ],
    qsRanking: 3,
    origin: 'British',
    about: [
      'The University of Birmingham established its Dubai campus in 2018, becoming the first top 100 global university and the first Russell Group institution to open in the UAE. In 2022, the university moved into its purpose-built campus at Dubai International Academic City, designed to accommodate around 3,000 students with state-of-the-art laboratories, learning spaces, and facilities.',
      'UoB Dubai offers undergraduate and postgraduate programs across business, engineering, computer science, education, and social sciences, all taught to the same high academic standards as the UK campus.',
      'Students graduate with a University of Birmingham UK degree, opening pathways to global careers and further study.',
      "The campus blends international academic excellence with Dubai's innovative environment, creating a diverse and future-focused community.",
    ],
    website: '#',
    poc: {
      address: 'Dubai International Academic City, Dubai, UAE',
      email: 'admissions@bham.ac.uk',
      phone: '+971 4 123 4657',
    },
  },
}

export const getUniversityDetail = (id: string, name: string) =>
  details[id] ?? defaultDetail(name)
