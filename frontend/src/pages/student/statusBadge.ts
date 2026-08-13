export function statusBadgeClass(status: string) {
  switch (status) {
    case 'Submitted':
      return 'bg-green-100 text-green-700'
    case 'Under Review':
      return 'bg-blue-100 text-blue-700'
    case 'Shortlisted':
      return 'bg-indigo-100 text-indigo-700'
    case 'Offer Received':
      return 'bg-purple-100 text-purple-700'
    case 'Rejected':
      return 'bg-red-100 text-red-700'
    case 'Accepted':
      return 'bg-green-100 text-green-700'
    case 'Pending Review':
      return 'bg-yellow-100 text-yellow-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}
