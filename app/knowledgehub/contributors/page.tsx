'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import { useContentAccess } from '@/lib/hooks/useContentAccess'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { ExternalLink } from 'lucide-react'

type SubmissionStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'published'

type Submission = {
  _id: string
  title: string
  status: SubmissionStatus
  submissionType: string
  excerpt?: string
  contentSnapshot?: string
  draftWordCount?: number
  submittedAt?: string
  approvedAt?: string
  publishedAt?: string
  linkedInsight?: { slug?: string | null }
  reviewNotes?: Array<{
    _type: 'note'
    author?: string
    createdAt: string
    message: string
  }>
}

const submissionTypeLabels: Record<string, string> = {
  insight: 'Insight Article',
  bestPractice: 'Best Practice',
  research: 'Research Summary',
  whitepaper: 'Whitepaper',
}

const statusDescription: Record<SubmissionStatus, string> = {
  draft: 'Draft saved locally',
  submitted: 'Waiting for editor review',
  approved: 'Approved for publication',
  rejected: 'Changes requested',
  published: 'Published on Knowledge Hub',
}

export default function ContributorPortalPage() {
  const { user, loading } = useContentAccess()
  const router = useRouter()

  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [isLoadingSubmissions, setLoadingSubmissions] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeSubmission, setActiveSubmission] = useState<Submission | null>(null)
  const [isReviewNotesOpen, setReviewNotesOpen] = useState(false)

  useEffect(() => {
    if (!user || !user.email) return

    const fetchSubmissions = async () => {
      try {
        setLoadingSubmissions(true)
        setError(null)
        const response = await fetch(`/api/knowledge-hub/contributors/list?email=${encodeURIComponent(user.email!)}`)
        if (!response.ok) {
          throw new Error('Failed to load submissions')
        }
        const data = await response.json()
        setSubmissions(data.submissions || [])
      } catch (err) {
        console.error(err)
        setError('We could not load your submissions. Please retry or contact support.')
      } finally {
        setLoadingSubmissions(false)
      }
    }

    fetchSubmissions()
  }, [user])

  const groupedSubmissions = useMemo(() => {
    return submissions.reduce(
      (acc, submission) => {
        acc[submission.status] = acc[submission.status] || []
        acc[submission.status].push(submission)
        return acc
      },
      {
        draft: [] as Submission[],
        submitted: [] as Submission[],
        approved: [] as Submission[],
        rejected: [] as Submission[],
        published: [] as Submission[],
      }
    )
  }, [submissions])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading contributor portal…</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 text-center">
        <h1 className="text-2xl font-semibold text-foreground">Sign in to submit content</h1>
        <p className="max-w-md text-muted-foreground">
          You need an AgriPro Knowledge Hub account to submit articles. Please log in or contact the editorial team for access.
        </p>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/auth/login?redirect=/knowledgehub/contributors">Sign in</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/auth/signup?redirectTo=/knowledgehub/contributors">Create account</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/knowledgehub">Back to Knowledge Hub</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/40 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4">
        <header className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.3em] text-emerald-700">
                Contributor workspace
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-emerald-950 md:text-4xl">
                Submit and track your Knowledge Hub articles
              </h1>
            </div>
            <Button onClick={() => router.push('/knowledgehub/contributors/start')}>New submission</Button>
          </div>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Save a draft, submit for review, and monitor editor feedback as your article advances toward publication. We’ll notify you by email when the status changes.
          </p>
        </header>

        {error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {isLoadingSubmissions ? (
          <div className="flex min-h-[200px] items-center justify-center rounded-3xl border border-emerald-100 bg-white">
            <p className="text-sm text-muted-foreground">Loading your submissions…</p>
          </div>
        ) : (
          <Tabs defaultValue="draft" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 md:w-auto md:grid-cols-5">
              <TabsTrigger value="draft">Drafts</TabsTrigger>
              <TabsTrigger value="submitted">Submitted</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="published">Published</TabsTrigger>
              <TabsTrigger value="rejected">Needs updates</TabsTrigger>
            </TabsList>

            <TabsContent value="draft">
              <SubmissionSection
                submissions={groupedSubmissions.draft}
                emptyTitle="No drafts yet"
                emptyDescription="Start a new article to see it appear here."
                primaryAction={{ label: 'Create submission', href: '/knowledgehub/contributors/start' }}
              />
            </TabsContent>

            <TabsContent value="submitted">
              <SubmissionSection
                submissions={groupedSubmissions.submitted}
                emptyTitle="No submissions in review"
                emptyDescription="When you submit an article, it will show up here while the editorial team reviews it."
              />
            </TabsContent>

            <TabsContent value="approved">
              <SubmissionSection
                submissions={groupedSubmissions.approved}
                emptyTitle="Nothing approved yet"
                emptyDescription="Approved articles are queued for publishing."
              />
            </TabsContent>

            <TabsContent value="published">
              <SubmissionSection
                submissions={groupedSubmissions.published}
                emptyTitle="No published articles yet"
                emptyDescription="Once your article goes live on the Knowledge Hub, it will appear here."
              />
            </TabsContent>

            <TabsContent value="rejected">
              <SubmissionSection
                submissions={groupedSubmissions.rejected}
                emptyTitle="No update requests"
                emptyDescription="If the editors need changes, the article will move here with notes."
                onOpenNotes={(submission) => {
                  setActiveSubmission(submission)
                  setReviewNotesOpen(true)
                }}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>

      <AlertDialog open={isReviewNotesOpen} onOpenChange={setReviewNotesOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reviewer notes</AlertDialogTitle>
            <AlertDialogDescription>{activeSubmission?.title}</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            {activeSubmission?.reviewNotes?.length ? (
              <ul className="space-y-3">
                {activeSubmission.reviewNotes.map((note) => (
                  <li
                    key={note.createdAt}
                    className="rounded-lg border border-emerald-100 bg-emerald-50/60 p-3 text-sm text-emerald-900"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-medium">{note.author || 'Editor'}</span>
                      <span className="text-xs text-emerald-700/70">
                        {new Date(note.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-2 whitespace-pre-line">{note.message}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No notes yet.</p>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogAction>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function SubmissionSection({
  submissions,
  emptyTitle,
  emptyDescription,
  primaryAction,
  onOpenNotes,
}: {
  submissions: Submission[]
  emptyTitle: string
  emptyDescription: string
  primaryAction?: { label: string; href: string }
  onOpenNotes?: (submission: Submission) => void
}) {
  if (!submissions.length) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-emerald-200 bg-white/60 p-10 text-center">
        <p className="text-base font-semibold text-emerald-900">{emptyTitle}</p>
        <p className="max-w-md text-sm text-muted-foreground">{emptyDescription}</p>
        {primaryAction ? (
          <Button asChild>
            <Link href={primaryAction.href}>{primaryAction.label}</Link>
          </Button>
        ) : null}
      </div>
    )
  }

  return (
    <ul className="space-y-4">
      {submissions.map((submission) => {
        const isEditable = submission.status === 'draft' || submission.status === 'rejected'
        const openHref = `/knowledgehub/contributors/write?draft=${submission._id}`
        const buttonLabel = isEditable ? 'Edit draft' : 'View submission'

        return (
          <li
            key={submission._id}
            className="rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold text-emerald-950">{submission.title}</h3>
                  <Badge variant="outline">
                    {submissionTypeLabels[submission.submissionType] || submission.submissionType}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{submission.excerpt}</p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-3 py-1 font-medium',
                      statusClass(submission.status)
                    )}
                  >
                    {statusDescription[submission.status]}
                  </span>
                  {submission.submittedAt ? (
                    <span>Submitted {new Date(submission.submittedAt).toLocaleDateString()}</span>
                  ) : null}
                  {submission.contentSnapshot ? (
                    <span className="hidden max-w-xs truncate text-xs text-muted-foreground sm:inline">
                      {submission.contentSnapshot}
                    </span>
                  ) : null}
                  {submission.draftWordCount ? (
                    <span className="text-xs text-muted-foreground">{submission.draftWordCount} words</span>
                  ) : null}
                  {submission.publishedAt && submission.linkedInsight?.slug ? (
                    <Link
                      href={`/knowledgehub/insights/${submission.linkedInsight.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1 font-medium text-white hover:bg-emerald-700 transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      View published article
                    </Link>
                  ) : null}
                </div>
              </div>

              <div className="flex gap-3">
                {onOpenNotes && submission.reviewNotes?.length ? (
                  <Button variant="outline" onClick={() => onOpenNotes(submission)}>
                    View notes
                  </Button>
                ) : null}
                <Button asChild variant="secondary">
                  <Link href={openHref}>{buttonLabel}</Link>
                </Button>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

function statusClass(status: SubmissionStatus) {
  switch (status) {
    case 'draft':
      return 'bg-emerald-100/70 text-emerald-800'
    case 'submitted':
      return 'bg-amber-100 text-amber-700'
    case 'approved':
      return 'bg-blue-100 text-blue-700'
    case 'published':
      return 'bg-emerald-600 text-white'
    case 'rejected':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}
