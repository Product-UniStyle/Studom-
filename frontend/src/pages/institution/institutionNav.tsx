import { LayoutGrid, FileText, Users, Landmark, Settings } from 'lucide-react'
import type { DashboardNavItem } from '../../components/layout/DashboardLayout'

export const institutionNav: DashboardNavItem[] = [
  { label: 'Dashboard', to: '/institution/dashboard', icon: LayoutGrid },
  { label: 'Applications', to: '/institution/applications', icon: FileText },
  { label: 'Contributors', to: '/institution/contributors', icon: Users },
  { label: 'University Page', to: '/institution/university-page', icon: Landmark },
  { label: 'Settings', to: '/institution/settings', icon: Settings },
]
