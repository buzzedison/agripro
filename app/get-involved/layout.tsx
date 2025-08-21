import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Get Involved - Agripro',
  description: 'Join our agricultural community and make a difference in African agriculture.',
}

export default function GetInvolvedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 