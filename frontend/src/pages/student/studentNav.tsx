import { Landmark, User, FileText, Folder, Settings } from 'lucide-react'
import type { DashboardNavItem } from '../../components/layout/DashboardLayout'

export const studentNav: DashboardNavItem[] = [
  { label: 'Dashboard', to: '/student/dashboard', icon: Landmark },
  { label: 'My Profile', to: '/student/profile', icon: User },
  { label: 'My Applications', to: '/student/applications', icon: FileText },
  { label: 'Documents', to: '/student/documents', icon: Folder },
  { label: 'Settings', to: '/student/settings', icon: Settings },
]
