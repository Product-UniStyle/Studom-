import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { universities as ALL_UNIVERSITIES } from '../data/universities'

export interface EssayQuestion {
  id: string
  question: string
  universities: string[]
  answer: string
}

interface ApplyFlowState {
  selectedIds: string[]
  toggleUniversity: (id: string) => void
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
  const [selectedIds, setSelectedIds] = useState<string[]>([
    ALL_UNIVERSITIES[0].id,
    ALL_UNIVERSITIES[1].id,
    ALL_UNIVERSITIES[2].id,
    ALL_UNIVERSITIES[3].id,
  ])
  const [essays, setEssays] = useState<EssayQuestion[]>(DEFAULT_ESSAYS)
  const [profileCompleted] = useState(true)

  const toggleUniversity = (id: string) =>
    setSelectedIds((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]
    )

  const updateEssay = (id: string, answer: string) =>
    setEssays((qs) => qs.map((q) => (q.id === id ? { ...q, answer } : q)))

  const value = useMemo(
    () => ({ selectedIds, toggleUniversity, essays, updateEssay, profileCompleted }),
    [selectedIds, essays, profileCompleted]
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
