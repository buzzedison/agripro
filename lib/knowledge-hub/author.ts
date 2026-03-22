import { randomUUID } from 'crypto'

import { getSanityWriteClient } from '@/sanity/lib/serverClient'
import { client as readClient } from '@/sanity/lib/client'
import { getAdminAccessByEmail } from '@/lib/knowledge-hub/admin'

const writeClient = getSanityWriteClient()

type AuthorDoc = {
  _id: string
  _type: 'author' | 'expert'
  name?: string
  role?: string | null
}

type SubmissionDoc = {
  _id: string
  primaryAuthor?: { _ref?: string }
  linkedInsight?: { _ref?: string }
}

type InsightAuthorRef = {
  _key?: string
  _ref?: string
  _type?: 'reference'
}

type InsightDoc = {
  _id: string
  authors?: InsightAuthorRef[]
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 96)
}

function shouldReplaceName(currentName?: string, nextName?: string) {
  if (!nextName?.trim()) return false
  if (!currentName?.trim()) return true

  const normalizedCurrent = currentName.trim().toLowerCase()
  const normalizedNext = nextName.trim().toLowerCase()

  if (normalizedCurrent === normalizedNext) return false

  return !normalizedCurrent.includes('admin') && normalizedCurrent.includes('@')
}

function dedupeAuthorRefs(authorRefs: InsightAuthorRef[]) {
  const seen = new Set<string>()

  return authorRefs.filter((ref) => {
    const key = ref._ref
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

async function getOrCreateCanonicalAuthor(email: string, name?: string) {
  const adminAccess = await getAdminAccessByEmail(email)
  const matchingPeople = await readClient.fetch<AuthorDoc[]>(
    `*[_type in ["author", "expert"] && contact.email == $email] | order(_updatedAt desc){
      _id,
      _type,
      name,
      role
    }`,
    { email }
  )

  const existingAuthors = matchingPeople.filter((person) => person._type === 'author')
  let canonicalAuthor = existingAuthors[0]

  if (!canonicalAuthor) {
    const authorId = `author-${randomUUID()}`
    canonicalAuthor = await writeClient.create({
      _id: authorId,
      _type: 'author',
      name: name?.trim() || email.split('@')[0],
      slug: { _type: 'slug', current: slugify(name?.trim() || email.split('@')[0]) },
      role: adminAccess.roleLabel || 'Contributor',
      contact: { email },
    })
  } else {
    const nextName = name?.trim()
    const nextRole = adminAccess.isAdmin ? (adminAccess.roleLabel || 'Admin') : canonicalAuthor.role || 'Contributor'
    const patch = writeClient.patch(canonicalAuthor._id)
    let hasChanges = false

    if (shouldReplaceName(canonicalAuthor.name, nextName)) {
      patch.set({
        name: nextName,
        slug: { _type: 'slug', current: slugify(nextName!) },
      })
      hasChanges = true
    }

    if (!canonicalAuthor.role || (adminAccess.isAdmin && canonicalAuthor.role === 'Contributor')) {
      patch.set({ role: nextRole })
      hasChanges = true
    }

    if (hasChanges) {
      await patch.commit()
    }
  }

  return {
    canonicalAuthorId: canonicalAuthor._id,
    duplicateAuthorIds: existingAuthors
      .map((author) => author._id)
      .filter((authorId) => authorId !== canonicalAuthor._id),
    adminAccess,
  }
}

export async function syncAuthorIdentityByEmail(email: string, name?: string) {
  const normalizedEmail = email.trim().toLowerCase()
  const { canonicalAuthorId, duplicateAuthorIds, adminAccess } = await getOrCreateCanonicalAuthor(normalizedEmail, name)

  const submissions = await readClient.fetch<SubmissionDoc[]>(
    `*[_type == "contributorSubmission" && supabaseUserEmail == $email]{
      _id,
      primaryAuthor,
      linkedInsight
    }`,
    { email: normalizedEmail }
  )

  let syncedSubmissions = 0
  const insightIdsFromSubmissions = new Set<string>()

  for (const submission of submissions) {
    if (submission.linkedInsight?._ref) {
      insightIdsFromSubmissions.add(submission.linkedInsight._ref)
    }

    if (submission.primaryAuthor?._ref === canonicalAuthorId) {
      continue
    }

    await writeClient.patch(submission._id).set({
      primaryAuthor: {
        _type: 'reference',
        _ref: canonicalAuthorId,
      },
    }).commit()
    syncedSubmissions += 1
  }

  const insightIds = Array.from(insightIdsFromSubmissions)
  let syncedInsights = 0

  if (insightIds.length > 0) {
    const insights = await readClient.fetch<InsightDoc[]>(
      `*[_type == "insight" && _id in $insightIds]{
        _id,
        authors
      }`,
      { insightIds }
    )

    const duplicateIds = new Set(duplicateAuthorIds)

    for (const insight of insights) {
      const currentAuthors = Array.isArray(insight.authors) ? insight.authors : []
      const normalizedAuthors = currentAuthors.map((author) => {
        if (author?._ref && duplicateIds.has(author._ref)) {
          return {
            _type: 'reference' as const,
            _key: author._key || randomUUID(),
            _ref: canonicalAuthorId,
          }
        }

        return author
      })

      const hasCanonicalAuthor = normalizedAuthors.some((author) => author?._ref === canonicalAuthorId)
      const nextAuthors = dedupeAuthorRefs(
        hasCanonicalAuthor
          ? normalizedAuthors
          : [{ _type: 'reference', _key: randomUUID(), _ref: canonicalAuthorId }, ...normalizedAuthors]
      )

      const changed =
        nextAuthors.length !== currentAuthors.length ||
        nextAuthors.some((author, index) => author._ref !== currentAuthors[index]?._ref)

      if (!changed) {
        continue
      }

      await writeClient.patch(insight._id).set({ authors: nextAuthors }).commit()
      syncedInsights += 1
    }
  }

  return {
    canonicalAuthorId,
    isAdmin: adminAccess.isAdmin,
    roleLabel: adminAccess.roleLabel || null,
    syncedSubmissions,
    syncedInsights,
  }
}
