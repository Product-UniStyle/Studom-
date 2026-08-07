import TextField from '../../../components/form/TextField'
import SelectField from '../../../components/form/SelectField'
import type { ProfileData } from '../profileTypes'

interface Props {
  data: ProfileData
  update: (patch: Partial<ProfileData['education']>) => void
}

const YEARS = ['2025', '2026', '2027', '2028', '2029']

export default function EducationInfoStep({ data, update }: Props) {
  const e = data.education
  return (
    <div>
      <h2 className="text-xl font-semibold text-black">Education Info</h2>
      <p className="mt-1 text-sm text-gray-500">
        Please provide your academic details.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
        <SelectField
          label="1. Curriculum / Board"
          required
          placeholder="Select curriculum / board"
          options={['CBSE', 'ICSE', 'IB', 'IGCSE', 'A-Levels', 'American Diploma']}
          value={e.curriculum}
          onChange={(ev) => update({ curriculum: ev.target.value })}
        />
        <SelectField
          label="2. Expected Graduation Year"
          required
          placeholder="Select year"
          options={YEARS}
          value={e.gradYear}
          onChange={(ev) => update({ gradYear: ev.target.value })}
        />
        <TextField
          label="3. Subjects Currently Studying"
          required
          placeholder="Enter subjects (comma separated)"
          value={e.subjects}
          onChange={(ev) => update({ subjects: ev.target.value })}
        />
        <TextField
          label="4. Latest Grades / GPA / Percentage"
          required
          placeholder="Enter your latest result (e.g., 3.8 GPA or 92%)"
          value={e.latestGrades}
          onChange={(ev) => update({ latestGrades: ev.target.value })}
        />
        <TextField
          label="5. Predicted Final Grades"
          required
          placeholder="Enter predicted grades or GPA"
          value={e.predictedGrades}
          onChange={(ev) => update({ predictedGrades: ev.target.value })}
        />
        <SelectField
          label="6. English Proficiency Test (Optional)"
          placeholder="Select test (e.g., IELTS, TOEFL, PTE)"
          options={['IELTS', 'TOEFL', 'PTE', 'Duolingo']}
          value={e.englishTest}
          onChange={(ev) => update({ englishTest: ev.target.value })}
        />
        <SelectField
          label="7. Standardised Test Scores (Optional)"
          placeholder="Select test (e.g., SAT, ACT)"
          options={['SAT', 'ACT']}
          value={e.standardizedTest}
          onChange={(ev) => update({ standardizedTest: ev.target.value })}
        />
        <SelectField
          label="8. Intended Course / Field of Study"
          required
          placeholder="Select your intended course"
          options={[
            'Business Management',
            'Engineering',
            'Computer Science',
            'Medicine',
            'Law',
          ]}
          value={e.intendedCourse}
          onChange={(ev) => update({ intendedCourse: ev.target.value })}
        />
      </div>
    </div>
  )
}
