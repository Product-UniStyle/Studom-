import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

export interface EssayQuestion {
  id: string
  question: string
  universities: string[]
  answer: string
}

export interface SelectedUniversity {
  id: string
  slug?: string
  name: string
  city?: string
  country?: string
  logo?: string
}

interface ApplyFlowState {
  selectedUniversities: SelectedUniversity[]
  toggleUniversity: (university: SelectedUniversity) => void
  essays: EssayQuestion[]
  updateEssay: (id: string, answer: string) => void
  profileCompleted: boolean
}

const ApplyFlowContext = createContext<ApplyFlowState | null>(null)

const DEFAULT_ESSAYS: EssayQuestion[] = [
  {
    id: 'who-are-you',
    question: 'Who are you?',
    universities: ['University of Birmingham Dubai'],
    answer: '',
  },
  {
    id: 'interests',
    question: 'What are your interests?',
    universities: [
      'University of Birmingham Dubai',
      'University of Wollongong in Dubai',
    ],
    answer: '',
  },
  {
    id: 'what-do-you-do',
    question: 'What do you do?',
    universities: ['Heriot-Watt University Dubai'],
    answer: '',
  },
]

export function ApplyFlowProvider({ children }: { children: ReactNode }) {
  const [selectedUniversities, setSelectedUniversities] = useState<SelectedUniversity[]>([])
  const [essays, setEssays] = useState<EssayQuestion[]>(DEFAULT_ESSAYS)
  const [profileCompleted] = useState(true)

  const toggleUniversity = (university: SelectedUniversity) =>
    setSelectedUniversities((list) =>
      list.some((u) => u.id === university.id)
        ? list.filter((u) => u.id !== university.id)
        : [...list, university]
    )

  const updateEssay = (id: string, answer: string) =>
    setEssays((qs) => qs.map((q) => (q.id === id ? { ...q, answer } : q)))

  const value = useMemo(
    () => ({ selectedUniversities, toggleUniversity, essays, updateEssay, profileCompleted }),
    [selectedUniversities, essays, profileCompleted]
  )

  return (
    <ApplyFlowContext.Provider value={value}>
      {children}
    </ApplyFlowContext.Provider>
  )
}

export function useApplyFlow() {
  const ctx = useContext(ApplyFlowContext)
  if (!ctx) throw new Error('useApplyFlow must be used within ApplyFlowProvider')
  return ctx
}
