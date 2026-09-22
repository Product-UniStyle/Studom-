import { Landmark, User, UserPlus, FileText, Folder, Heart, Settings } from 'lucide-react'
import type { DashboardNavItem } from '../../components/layout/DashboardLayout'

export const studentNav: DashboardNavItem[] = [
  { label: 'Dashboard', to: '/student/dashboard', icon: Landmark },
  { label: 'My Profile', to: '/student/profile', icon: User },
  { label: 'Build Your Profile', to: '/profile/build', icon: UserPlus },
  { label: 'My Applications', to: '/student/applications', icon: FileText },
  { label: 'Favorites', to: '/student/favorites', icon: Heart },
  { label: 'Documents', to: '/student/documents', icon: Folder },
  { label: 'Settings', to: '/student/settings', icon: Settings },
]
