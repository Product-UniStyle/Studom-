import { useEffect, useState } from 'react'
import type { AdditionalFilterNarrative, NarrativeSegment } from '../data/additionalFilterNarratives'

// Mirrors the Nomads project's `animateTypedText` (AiSearchResults.jsx): a
// plain setInterval-driven character reveal, chained line-by-line via
// onComplete callbacks rather than a single combined timer.
const TYPING_INTERVAL_MS = 12

export function segmentsLength(segments: NarrativeSegment[]): number {
  return segments.reduce((sum, s) => sum + s.text.length, 0)
}

function typeLine(length: number, setLength: (n: number) => void, onDone?: () => void): number {
  setLength(0)
  if (length === 0) {
    onDone?.()
    return -1
  }
  let i = 0
  const id = window.setInterval(() => {
    i += 1
    setLength(i)
    if (i >= length) {
      window.clearInterval(id)
      onDone?.()
    }
  }, TYPING_INTERVAL_MS)
  return id
}

export function useTypedNarrative(narrative: AdditionalFilterNarrative | null) {
  const [introLen, setIntroLen] = useState(0)
  const [poweredLen, setPoweredLen] = useState(0)
  const [ctaLen, setCtaLen] = useState(0)
  // Tracks which narrative finished typing, so `done` is derived per-narrative
  // and can't leak `true` from a previous narrative for a frame after a switch.
  const [doneFor, setDoneFor] = useState<AdditionalFilterNarrative | null>(null)

  useEffect(() => {
    if (!narrative) return

    let poweredId = -1
    let ctaId = -1
    setPoweredLen(0)
    setCtaLen(0)

    const introId = typeLine(segmentsLength(narrative.intro), setIntroLen, () => {
      poweredId = typeLine(segmentsLength(narrative.powered), setPoweredLen, () => {
        ctaId = typeLine(segmentsLength(narrative.cta), setCtaLen, () => setDoneFor(narrative))
      })
    })

    return () => {
      window.clearInterval(introId)
      window.clearInterval(poweredId)
      window.clearInterval(ctaId)
    }
  }, [narrative])

  return { introLen, poweredLen, ctaLen, done: narrative !== null && doneFor === narrative }
}

export function renderTypedSegments(segments: NarrativeSegment[], revealedLength: number) {
  let consumed = 0
  return segments.map((s, i) => {
    const visible = Math.max(0, Math.min(s.text.length, revealedLength - consumed))
    consumed += s.text.length
    if (visible <= 0) return null
    return (
      <span key={i} className={s.bold ? 'font-semibold text-black' : undefined}>
        {s.text.slice(0, visible)}
      </span>
    )
  })
}
