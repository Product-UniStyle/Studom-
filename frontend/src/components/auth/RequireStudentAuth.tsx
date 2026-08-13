import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStudentToken } from '../../lib/studentApi'

export default function RequireStudentAuth({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (!getStudentToken()) {
      navigate('/student/login', { replace: true })
    } else {
      setChecked(true)
    }
  }, [navigate])

  if (!checked) return null
  return <>{children}</>
}
