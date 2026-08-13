import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getInstitutionToken } from '../../lib/institutionApi'

export default function RequireInstitutionAuth({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (!getInstitutionToken()) {
      navigate('/institution/login', { replace: true })
    } else {
      setChecked(true)
    }
  }, [navigate])

  if (!checked) return null
  return <>{children}</>
}
