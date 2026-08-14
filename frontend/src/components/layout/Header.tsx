import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { User, Landmark } from 'lucide-react'
import { cn } from '../../lib/utils'
import { getStudentToken, getStudentMe, clearStudentToken } from '../../lib/studentApi'
import { getInstitutionToken, getInstitutionMe, clearInstitutionToken } from '../../lib/institutionApi'

const NAV_LINKS = [
  { label: 'HOME', to: '/' },
  { label: 'EVENTS', to: '/events' },
  { label: 'NEWS', to: '/news' },
  { label: 'BLOG', to: '/blog' },
]

export default function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  // Read synchronously at mount so the header never has to guess "logged
  // out" while the name is still loading — that guess was flashing the
  // Login button for a moment on every page even when a token exists.
  const [hasStudentToken, setHasStudentToken] = useState(() => Boolean(getStudentToken()))
  const [hasInstitutionToken, setHasInstitutionToken] = useState(() => Boolean(getInstitutionToken()))
  const [studentName, setStudentName] = useState<string | null>(null)
  const [institutionName, setInstitutionName] = useState<string | null>(null)

  useEffect(() => {
    if (!hasStudentToken) return
    let cancelled = false
    getStudentMe()
      .then((res) => {
        if (!cancelled) setStudentName(res.student.fullName)
      })
      .catch(() => {
        if (!cancelled) setStudentName(null)
      })
    return () => {
      cancelled = true
    }
  }, [hasStudentToken])

  useEffect(() => {
    if (!hasInstitutionToken) return
    let cancelled = false
    getInstitutionMe()
      .then((res) => {
        if (!cancelled) setInstitutionName(res.account.universityName)
      })
      .catch(() => {
        if (!cancelled) setInstitutionName(null)
      })
    return () => {
      cancelled = true
    }
  }, [hasInstitutionToken])

  return (
    <header className="w-full border-b border-gray-200 bg-white">
      <div className="mx-auto grid max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center px-6 py-4 lg:px-10">
        <Link to="/" className="justify-self-start font-logo text-3xl text-black shrink-0">
          Studom
        </Link>

        <nav className="hidden items-center gap-8 justify-self-center md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                'text-sm font-medium tracking-wide text-gray-800 hover:text-black',
                location.pathname === link.to && 'text-black font-semibold'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-self-end gap-4">
          <div className="hidden h-6 w-px bg-gray-300 lg:block" />

          {hasStudentToken ? (
            <AccountMenu
              name={studentName || ''}
              profileTo="/student/profile"
              icon={<User className="h-4 w-4" />}
              iconBg="bg-blue-50"
              iconColor="text-blue-600"
              onLogout={() => {
                clearStudentToken()
                setStudentName(null)
                setHasStudentToken(false)
                navigate('/')
              }}
            />
          ) : !hasInstitutionToken ? (
            <Link
              to="/student/login"
              className="flex items-center gap-1.5 rounded-full border border-gray-300 px-4 py-2 font-script text-sm font-medium text-black hover:bg-gray-50"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Student Login</span>
            </Link>
          ) : null}

          {hasInstitutionToken ? (
            <AccountMenu
              name={institutionName || ''}
              profileTo="/institution/settings"
              icon={<Landmark className="h-4 w-4" />}
              iconBg="bg-black"
              iconColor="text-white"
              onLogout={() => {
                clearInstitutionToken()
                setInstitutionName(null)
                setHasInstitutionToken(false)
                navigate('/')
              }}
            />
          ) : !hasStudentToken ? (
            <Link
              to="/institution/login"
              className="flex items-center gap-1.5 rounded-full bg-black px-4 py-2 font-script text-sm font-medium text-white hover:bg-gray-800"
            >
              <Landmark className="h-4 w-4" />
              <span className="hidden sm:inline">Institution Login</span>
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  )
}

function AccountMenu({
  name,
  profileTo,
  icon,
  iconBg,
  iconColor,
  onLogout,
}: {
  name: string
  profileTo: string
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  onLogout: () => void
}) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <button onClick={() => setOpen((o) => !o)} className="flex flex-col items-center gap-1">
        <div className={cn('flex h-9 w-9 items-center justify-center rounded-full', iconBg, iconColor)}>{icon}</div>
        <span className="hidden max-w-[110px] truncate text-xs font-medium text-gray-700 sm:inline">{name}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-2 w-44 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          <Link
            to={profileTo}
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            View Profile
          </Link>
          <button
            onClick={() => {
              setOpen(false)
              onLogout()
            }}
            className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  )
}
