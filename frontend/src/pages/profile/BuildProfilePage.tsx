import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import PageShell from '../../components/layout/PageShell'
import ProfileStepper from './ProfileStepper'
import PersonalInfoStep from './steps/PersonalInfoStep'
import EducationInfoStep from './steps/EducationInfoStep'
import ActivitiesStep from './steps/ActivitiesStep'
import DocumentsStep from './steps/DocumentsStep'
import ReviewStep from './steps/ReviewStep'
import { initialProfileData, type ProfileData } from './profileTypes'

export default function BuildProfilePage() {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<ProfileData>(initialProfileData)
  const navigate = useNavigate()

  const goToStep = (s: number) => {
    setStep(s)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const next = () => goToStep(Math.min(5, step + 1))
  const back = () => goToStep(Math.max(1, step - 1))

  const updatePersonal = (patch: Partial<ProfileData['personal']>) =>
    setData((d) => ({ ...d, personal: { ...d.personal, ...patch } }))
  const updateEducation = (patch: Partial<ProfileData['education']>) =>
    setData((d) => ({ ...d, education: { ...d.education, ...patch } }))
  const updateActivities = (
    patch: Partial<Pick<ProfileData, 'activities' | 'achievements'>>
  ) => setData((d) => ({ ...d, ...patch }))
  const updateDocuments = (patch: Record<string, string | null>) =>
    setData((d) => ({ ...d, documents: { ...d.documents, ...patch } }))

  return (
    <PageShell hideFooter>
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-black">
            Build Your Student Profile
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Complete your profile once and use it to apply to multiple
            universities through Studom.
          </p>
        </div>

        <div className="mt-10">
          <ProfileStepper current={step} />
        </div>

        <div className="mt-10 rounded-2xl border border-gray-200 p-8">
          {step === 1 && (
            <PersonalInfoStep data={data} update={updatePersonal} />
          )}
          {step === 2 && (
            <EducationInfoStep data={data} update={updateEducation} />
          )}
          {step === 3 && (
            <ActivitiesStep data={data} update={updateActivities} />
          )}
          {step === 4 && (
            <DocumentsStep data={data} update={updateDocuments} />
          )}
          {step === 5 && <ReviewStep data={data} goToStep={goToStep} />}

          <div className="mt-10 flex items-center justify-between border-t border-gray-100 pt-6">
            <div>
              {step > 1 && (
                <button
                  onClick={back}
                  className="flex items-center gap-2 rounded-full border border-gray-300 px-5 py-2.5 text-sm font-medium text-black hover:bg-gray-50"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
              )}
            </div>
            <div className="flex items-center gap-4">
              {step === 1 && (
                <button className="rounded-full border border-gray-300 px-5 py-2.5 text-sm font-medium text-black hover:bg-gray-50">
                  Save Draft
                </button>
              )}
              {(step === 3 || step === 4) && (
                <button
                  onClick={next}
                  className="text-sm font-medium text-gray-500 underline"
                >
                  Skip for now
                </button>
              )}
              {step < 5 ? (
                <button
                  onClick={next}
                  className="flex items-center gap-2 rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
                >
                  {step === 1 ? 'Continue' : 'Next'}
                  {step > 1 && <ArrowRight className="h-4 w-4" />}
                </button>
              ) : (
                <button
                  onClick={() => navigate('/apply/select')}
                  className="flex items-center gap-2 rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
                >
                  Save Profile <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  )
}
