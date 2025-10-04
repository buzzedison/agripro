'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import clsx from 'clsx'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/app/components/ui/alert-dialog'
import { urlForImage } from '@/lib/image'

export type AuthorPerson = {
  id: string
  type: 'author' | 'expert'
  name: string
  roleLabel?: string
  avatar?: any
  profileUrl?: string
  bio?: string
  contact?: {
    email?: string
    linkedin?: string
    twitter?: string
    website?: string
  }
  expertise?: string
  specializations?: string[]
  yearsOfExperience?: number
}

type AuthorBadgeProps = {
  person: AuthorPerson
  label?: string
}

export default function AuthorBadge({ person, label }: AuthorBadgeProps) {
  const [open, setOpen] = useState(false)

  const avatarUrl = person.avatar ? urlForImage(person.avatar).width(200).height(200).fit('crop').url() : null
  const initials = person.name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const triggerContent = (
    <div
      className={clsx(
        'flex items-center gap-3 rounded-full border border-gray-200 bg-white/90 px-4 py-2 shadow-sm transition hover:border-green-200 hover:bg-white hover:shadow-lg',
        'cursor-pointer'
      )}
    >
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={person.name}
          width={48}
          height={48}
          className="h-12 w-12 rounded-full object-cover"
        />
      ) : (
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-green-600 text-sm font-semibold uppercase text-white">
          {initials}
        </span>
      )}
      <div className="leading-tight">
        <p className="text-sm font-semibold text-gray-900">{person.name}</p>
        <p className="text-xs text-gray-500">
          {label ?? person.roleLabel ?? (person.type === 'expert' ? 'Expert Contributor' : 'Author')}
        </p>
      </div>
    </div>
  )

  return (
    <AlertDialog>
      <div onClick={() => setOpen(true)}>{triggerContent}</div>
      <AlertDialogContent isOpen={open} onClose={() => setOpen(false)}>
        <AlertDialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={person.name}
                  width={72}
                  height={72}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-green-600 text-lg font-semibold uppercase text-white">
                  {initials}
                </span>
              )}
              <div>
                <AlertDialogTitle>{person.name}</AlertDialogTitle>
                <AlertDialogDescription>
                  {person.roleLabel ?? (person.type === 'expert' ? 'Expert Contributor' : 'Author')}
                </AlertDialogDescription>
              </div>
            </div>

            {person.bio && (
              <p className="text-sm leading-relaxed text-gray-600">{person.bio}</p>
            )}

            <div className="grid gap-3 text-sm text-gray-600">
              {person.expertise && (
                <div>
                  <p className="font-semibold text-gray-700">Expertise</p>
                  <p>{person.expertise}</p>
                </div>
              )}
              {person.specializations && person.specializations.length > 0 && (
                <div>
                  <p className="font-semibold text-gray-700">Specializations</p>
                  <p>{person.specializations.join(', ')}</p>
                </div>
              )}
              {typeof person.yearsOfExperience === 'number' && (
                <div>
                  <p className="font-semibold text-gray-700">Experience</p>
                  <p>{person.yearsOfExperience}+ years</p>
                </div>
              )}
            </div>

            {person.profileUrl && (
              <Link
                href={person.profileUrl}
                className="inline-flex w-fit items-center gap-2 rounded-full border border-green-200 bg-white px-4 py-2 text-sm font-medium text-green-700 transition hover:bg-green-50"
                onClick={() => setOpen(false)}
              >
                View full profile
              </Link>
            )}

            {person.contact && (
              <div className="mt-2 grid gap-2 text-xs text-gray-500">
                {person.contact.email && <p>Email: {person.contact.email}</p>}
                {person.contact.linkedin && (
                  <Link href={person.contact.linkedin} target="_blank" className="text-green-600 hover:underline">
                    LinkedIn
                  </Link>
                )}
                {person.contact.twitter && (
                  <Link href={person.contact.twitter} target="_blank" className="text-green-600 hover:underline">
                    Twitter
                  </Link>
                )}
                {person.contact.website && (
                  <Link href={person.contact.website} target="_blank" className="text-green-600 hover:underline">
                    Website
                  </Link>
                )}
              </div>
            )}
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setOpen(false)}>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
