import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { getPublicUniversity } from '../lib/publicApi'
import { getStudentMe } from '../lib/studentApi'

export interface EssayQuestion {
  id: string
  question: string
  universityId: string
  universityName: string
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
  essaysLoading: boolean
  updateEssay: (id: string, answer: string) => void
  profileCompletion: number
  profileCompleted: boolean
  firstIncompleteStep: number | null
}

const ApplyFlowContext = createContext<ApplyFlowState | null>(null)

export function ApplyFlowProvider({ children }: { children: ReactNode }) {
  const [selectedUniversities, setSelectedUniversities] = useState<SelectedUniversity[]>([])
  const [essays, setEssays] = useState<EssayQuestion[]>([])
  const [essaysLoading, setEssaysLoading] = useState(false)
  const [profileCompletion, setProfileCompletion] = useState(0)
  const [firstIncompleteStep, setFirstIncompleteStep] = useState<number | null>(1)

  useEffect(() => {
    let cancelled = false
    getStudentMe()
      .then((res) => {
        if (cancelled) return
        setProfileCompletion(res.stats.profileCompletion)
        setFirstIncompleteStep(res.stats.firstIncompleteStep)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const toggleUniversity = (university: SelectedUniversity) =>
    setSelectedUniversities((list) =>
      list.some((u) => u.id === university.id)
        ? list.filter((u) => u.id !== university.id)
        : [...list, university]
    )

  const updateEssay = (id: string, answer: string) =>
    setEssays((qs) => qs.map((q) => (q.id === id ? { ...q, answer } : q)))

  // Essay questions are defined per-university by admins now (not hardcoded),
  // so refetch each selected university's questions whenever the selection
  // changes, carrying forward any answers already typed for a still-present
  // question.
  useEffect(() => {
    if (selectedUniversities.length === 0) {
      setEssays([])
      return
    }
    let cancelled = false
    setEssaysLoading(true)
    Promise.all(
      selectedUniversities.map((university) =>
        getPublicUniversity(university.id)
          .then((detail) => ({ university, questions: detail.essayQuestions || [] }))
          .catch(() => ({ university, questions: [] as { _id?: string; question: string }[] }))
      )
    ).then((results) => {
      if (cancelled) return
      setEssays((prev) => {
        const prevAnswers = new Map(prev.map((e) => [e.id, e.answer]))
        const next: EssayQuestion[] = []
        for (const { university, questions } of results) {
          questions.forEach((q, idx) => {
            const id = `${university.id}:${q._id || idx}`
            next.push({
              id,
              question: q.question,
              universityId: university.id,
              universityName: university.name,
              answer: prevAnswers.get(id) || '',
            })
          })
        }
        return next
      })
      setEssaysLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [selectedUniversities])

  const profileCompleted = profileCompletion >= 100

  const value = useMemo(
    () => ({
      selectedUniversities,
      toggleUniversity,
      essays,
      essaysLoading,
      updateEssay,
      profileCompletion,
      profileCompleted,
      firstIncompleteStep,
    }),
    [selectedUniversities, essays, essaysLoading, profileCompletion, profileCompleted, firstIncompleteStep]
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
