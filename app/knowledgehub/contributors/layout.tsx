import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contributor Portal | AgriPro Knowledge Hub',
  description: 'Submit, track, and manage Knowledge Hub articles as an AgriPro contributor.',
}

export default function ContributorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}


