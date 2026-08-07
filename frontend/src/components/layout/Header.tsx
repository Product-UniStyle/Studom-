import { Link, useLocation } from 'react-router-dom'
import { User, Landmark } from 'lucide-react'
import { cn } from '../../lib/utils'

const NAV_LINKS = [
  { label: 'HOME', to: '/' },
  { label: 'EVENTS', to: '/events' },
  { label: 'NEWS', to: '/news' },
  { label: 'BLOG', to: '/blog' },
]

export default function Header() {
  const location = useLocation()

  return (
    <header className="w-full border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-4 lg:px-10">
        <Link to="/" className="font-script text-3xl font-bold text-black shrink-0">
          Studom
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
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

        <div className="flex items-center gap-3">
          <div className="hidden h-6 w-px bg-gray-300 lg:block" />
          <Link
            to="/student/login"
            className="flex items-center gap-1.5 rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-black hover:bg-gray-50"
          >
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Student Login</span>
          </Link>
          <Link
            to="/institution/login"
            className="flex items-center gap-1.5 rounded-full bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            <Landmark className="h-4 w-4" />
            <span className="hidden sm:inline">Institution Login</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
