import { Link, useLocation } from 'react-router-dom'
import { Headphones } from 'lucide-react'
import Header from './Header'
import { cn } from '../../lib/utils'
import type { LucideIcon } from 'lucide-react'

export interface DashboardNavItem {
  label: string
  to: string
  icon: LucideIcon
}

interface DashboardLayoutProps {
  navItems: DashboardNavItem[]
  userName: string
  userRole: string
  contentClassName?: string
  children: React.ReactNode
}

export default function DashboardLayout({
  navItems,
  userName,
  userRole,
  contentClassName,
  children,
}: DashboardLayoutProps) {
  const location = useLocation()

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <div className="mx-auto flex w-full max-w-[1440px] flex-1 gap-8 px-6 py-8 lg:px-10">
        <aside className="hidden w-64 shrink-0 flex-col md:flex">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <span className="text-lg font-semibold">
                {userName.charAt(0)}
              </span>
            </div>
            <div>
              <div className="font-semibold text-black">{userName}</div>
              <div className="text-sm text-gray-500">{userRole}</div>
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-1">
            {navItems.map((item) => {
              const active = location.pathname === item.to
              const Icon = item.icon
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50',
                    active && 'bg-blue-50 text-blue-600'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="mt-8 rounded-xl border border-gray-200 p-4">
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <Headphones className="h-4 w-4" />
            </div>
            <div className="text-sm font-semibold text-black">Need Help?</div>
            <div className="mt-1 text-xs text-gray-500">
              Our support team is here to help you with anything.
            </div>
            <div className="mt-2 text-xs font-medium text-blue-600">
              Contact Support &gt;
            </div>
          </div>
        </aside>

        <main className={cn('min-w-0 flex-1', contentClassName)}>{children}</main>
      </div>
    </div>
  )
}
