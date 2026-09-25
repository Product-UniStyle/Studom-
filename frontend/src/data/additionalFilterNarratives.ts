export interface NarrativeSegment {
  text: string
  bold?: boolean
}

export interface AdditionalFilterNarrative {
  intro: NarrativeSegment[]
  powered: NarrativeSegment[]
  cta: NarrativeSegment[]
}

function powered(prioritising: string): NarrativeSegment[] {
  return [
    { text: 'Powered by ' },
    { text: 'Studom’s intelligence model', bold: true },
    { text: ', prioritising: ' },
    { text: prioritising, bold: true },
    { text: '.' },
  ]
}

function cta(text: string): NarrativeSegment[] {
  return [{ text: `→ ${text}`, bold: true }]
}

export const ADDITIONAL_FILTER_NARRATIVES: Record<string, AdditionalFilterNarrative> = {
  All: {
    intro: [
      {
        text: 'Curated below are universities that best match your overall preferences across ranking, affordability, student environment and opportunities.',
      },
    ],
    powered: powered(
      'QS Ranking, Tuition Fees, Student Population, Student-to-Faculty Ratio, International Student %, and Scholarships'
    ),
    cta: cta('Compare the strongest overall matches in one place.'),
  },
  'QS Ranking': {
    intro: [
      {
        text: 'Curated below are universities with the strongest global academic rankings based on your preference for recognised institutions.',
      },
    ],
    powered: powered('QS Ranking and global academic standing'),
    cta: cta('Discover universities recognised worldwide.'),
  },
  'Tuition Fees': {
    intro: [
      { text: 'Curated below are universities based on your preference for more affordable tuition fees.' },
    ],
    powered: powered('Tuition Fees and overall study affordability'),
    cta: cta('Find universities that better fit your budget.'),
  },
  'Student Population': {
    intro: [
      {
        text: 'Curated below are universities based on your preference for campus size and student community.',
      },
    ],
    powered: powered('Total Student Population and campus scale'),
    cta: cta('Choose the university environment that suits you.'),
  },
  'Student-to-Faculty Ratio': {
    intro: [
      { text: 'Curated below are universities offering a stronger balance between students and faculty.' },
    ],
    powered: powered('Student-to-Faculty Ratio and access to academic support'),
    cta: cta('Find a more personalised learning environment.'),
  },
  'International Student %': {
    intro: [
      { text: 'Curated below are universities with a stronger international student community.' },
    ],
    powered: powered('International Student Percentage and campus diversity'),
    cta: cta('Study in a more globally diverse community.'),
  },
  Scholarships: {
    intro: [
      {
        text: 'Curated below are universities offering stronger scholarship opportunities for students.',
      },
    ],
    powered: powered('Scholarship availability and funding opportunities'),
    cta: cta('Explore universities that can make studying more affordable.'),
  },
}
