'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { PortableText } from '@portabletext/react'
import { format } from 'date-fns'
import {
  ClipboardList,
  RefreshCw,
  Search,
  CheckCircle,
  XCircle,
  Send,
  ChevronRight,
  ArrowLeft,
  Loader2,
  FileText,
  ExternalLink,
} from 'lucide-react'

import { useContentAccess } from '@/lib/hooks/useContentAccess'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

type SubmissionStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'published'

type SubmissionSummary = {
  _id: string
  title: string
  excerpt?: string
  submissionType: string
  status: SubmissionStatus
  supabaseUserEmail?: string
  topics?: string[]
  tags?: string[]
  draftWordCount?: number
  submittedAt?: string
  approvedAt?: string
  publishedAt?: string
  _createdAt: string
  _updatedAt: string
  contentSnapshot?: string
  coverImage?: {
    asset?: { _id: string; url: string }
    alt?: string
    caption?: string
  } | null
  reviewNotes?: Array<{ createdAt?: string; author?: string; message?: string }>
  linkedInsight?: { _id?: string; title?: string; slug?: string }
}

type SubmissionDetail = SubmissionSummary & {
  contentBlocks?: any[]
  contentText?: string
}

type StatusTotals = {
  all: number
  draft: number
  submitted: number
  approved: number
  rejected: number
  published: number
}

const STATUS_LABELS: Record<'all' | SubmissionStatus, string> = {
  all: 'All',
  draft: 'Draft',
  submitted: 'Submitted',
  approved: 'Approved',
  rejected: 'Needs Changes',
  published: 'Published',
}

const STATUS_COLORS: Record<SubmissionStatus, string> = {
  draft: 'bg-slate-100 text-slate-700',
  submitted: 'bg-amber-100 text-amber-700',
  approved: 'bg-blue-100 text-blue-700',
  rejected: 'bg-red-100 text-red-700',
  published: 'bg-emerald-600 text-white',
}

const FILTERS: Array<'all' | SubmissionStatus> = ['submitted', 'all', 'approved', 'rejected', 'draft', 'published']

const statusActionOrder: SubmissionStatus[] = ['approved', 'published', 'rejected', 'draft']

const DEFAULT_NOTE_PLACEHOLDER = 'Share reviewer feedback, edits requested, or publication notes.'

export default function ContributorReviewDashboard() {
  const { user, loading: userLoading } = useContentAccess()

  const [statusFilter, setStatusFilter] = useState<'all' | SubmissionStatus>('submitted')
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [submissions, setSubmissions] = useState<SubmissionSummary[]>([])
  const [totals, setTotals] = useState<StatusTotals | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [note, setNote] = useState('')
  const [linkedInsightId, setLinkedInsightId] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string; link?: string } | null>(null)

  const searchTimeout = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current)
    }
    searchTimeout.current = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 300)

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current)
      }
    }
  }, [searchTerm])

  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      params.set('status', statusFilter)
      if (debouncedSearch) {
        params.set('q', debouncedSearch)
      }

      const response = await fetch(`/api/admin/knowledge-hub/contributors?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Failed to fetch submissions')
      }

      const data = await response.json()
      setSubmissions(data.submissions ?? [])
      setTotals(data.totals ?? null)
    } catch (err) {
      console.error(err)
      setError('Unable to load submissions. Please try again later.')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, debouncedSearch])

  useEffect(() => {
    if (!user || userLoading) return
    fetchSubmissions()
  }, [user, userLoading, fetchSubmissions])

  const refresh = () => {
    fetchSubmissions()
  }

  const openSubmission = async (id: string) => {
    setSelectedId(id)
    setSelectedSubmission(null)
    setDetailLoading(true)
    setNote('')
    setLinkedInsightId('')
    setAlert(null)

    try {
      const response = await fetch(`/api/knowledge-hub/contributors/${id}`)
      if (!response.ok) {
        throw new Error('Failed to load submission')
      }

      const data = await response.json()
      setSelectedSubmission(data.submission as SubmissionDetail)
      if (data.submission?.linkedInsight?._id) {
        setLinkedInsightId(data.submission.linkedInsight._id)
      }
    } catch (err) {
      console.error(err)
      setAlert({ type: 'error', message: 'Failed to load submission. Please try again.' })
    } finally {
      setDetailLoading(false)
    }
  }

  const closeSubmission = () => {
    setSelectedId(null)
    setSelectedSubmission(null)
    setNote('')
    setLinkedInsightId('')
    setAlert(null)
  }

  const handleStatusChange = async (targetStatus: SubmissionStatus) => {
    if (!selectedSubmission) return
    if (targetStatus === 'rejected' && !note.trim()) {
      setAlert({ type: 'error', message: 'Please add reviewer notes before requesting changes.' })
      return
    }

    setActionLoading(true)
    setAlert(null)

    try {
      // Use automated publish endpoint for publishing
      if (targetStatus === 'published') {
        const response = await fetch('/api/knowledge-hub/contributors/publish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            submissionId: selectedSubmission._id,
            note: note.trim() || undefined,
            reviewer: user?.email ?? 'Editor',
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to publish')
        }

        setAlert({
          type: 'success',
          message: `🎉 Article published successfully!`,
          link: `/knowledgehub/insights/${data.insightSlug}`,
        })
      } else {
        // Use regular status endpoint for other status changes
        const response = await fetch('/api/knowledge-hub/contributors/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            submissionId: selectedSubmission._id,
            status: targetStatus,
            note: note.trim() || undefined,
            linkedInsightId: linkedInsightId.trim() || undefined,
            reviewer: user?.email ?? 'Editor',
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to update status')
        }

        setAlert({
          type: 'success',
          message: `Submission marked as ${STATUS_LABELS[targetStatus].toLowerCase()}.`,
        })
      }

      setNote('')
      setLinkedInsightId('')
      await fetchSubmissions()
      await openSubmission(selectedSubmission._id)
    } catch (err) {
      console.error(err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to update submission status. Please try again.'
      setAlert({ type: 'error', message: errorMessage })
    } finally {
      setActionLoading(false)
    }
  }

  const activeTotals = useMemo(() => totals ?? { all: 0, draft: 0, submitted: 0, approved: 0, rejected: 0, published: 0 }, [totals])

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
          </div>
          <p className="mt-4 text-sm text-slate-600">Loading contributor submissions…</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-6 text-center">
        <ClipboardList className="h-12 w-12 text-emerald-600" />
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-slate-900">Sign in to view submissions</h1>
          <p className="max-w-sm text-sm text-slate-600">
            You need an editor account to manage Knowledge Hub contributor content.
          </p>
        </div>
        <Button asChild>
          <Link href="/auth/login?redirect=/admin/knowledge-hub/contributors">Sign in</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700">
              Editor Tools
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-emerald-950 md:text-4xl">Contributor Submissions</h1>
              <p className="mt-2 max-w-2xl text-sm text-emerald-900/80">
                Review expert drafts, leave notes, and move articles through approval and publication.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-emerald-900/70">
              <span>✅ Submitted drafts waiting for review: <strong>{activeTotals.submitted}</strong></span>
              <span>📝 Approval queue: <strong>{activeTotals.approved}</strong></span>
              <span>⚠️ Revisions needed: <strong>{activeTotals.rejected}</strong></span>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button variant="outline" className="gap-2" onClick={refresh}>
              <RefreshCw className="h-4 w-4" />
              Refresh list
            </Button>
            <Button asChild className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              <Link href="/knowledgehub/contributors" target="_blank" rel="noopener">
                View contributor portal
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {FILTERS.map((filter) => (
                <Button
                  key={filter}
                  type="button"
                  variant={filter === statusFilter ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(filter)}
                  className={
                    filter === statusFilter
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                  }
                >
                  {STATUS_LABELS[filter]}
                  <span className="ml-2 rounded-full bg-emerald-100 px-2 py-[1px] text-[11px] font-medium text-emerald-700">
                    {filter === 'all' ? activeTotals.all : activeTotals[filter]}
                  </span>
                </Button>
              ))}
            </div>

            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by title, email, or topic…"
                className="pl-9"
              />
            </div>
          </div>

          {error ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {!error && submissions.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/60 p-10 text-center">
              <FileText className="mx-auto h-8 w-8 text-emerald-500" />
              <h2 className="mt-4 text-sm font-medium text-emerald-900">
                No submissions match your filters.
              </h2>
              <p className="mt-2 text-xs text-emerald-900/70">
                Try a different status or search query to keep reviewing content.
              </p>
            </div>
          ) : null}

          <div className="mt-6 space-y-4">
            {submissions.map((submission) => (
              <article
                key={submission._id}
                className="rounded-3xl border border-emerald-100 bg-emerald-50/40 p-6 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-emerald-950">{submission.title}</h3>
                      <Badge variant="outline">{submission.submissionType}</Badge>
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[submission.status]}`}>
                        {STATUS_LABELS[submission.status]}
                      </span>
                    </div>
                    <p className="text-sm text-emerald-900/80">
                      {submission.excerpt || submission.contentSnapshot || 'No excerpt provided.'}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-emerald-900/70">
                      {submission.supabaseUserEmail ? <span>Author: {submission.supabaseUserEmail}</span> : null}
                      {submission.submittedAt ? <span>Submitted {format(new Date(submission.submittedAt), 'MMM d, yyyy')}</span> : null}
                      {submission.draftWordCount ? <span>{submission.draftWordCount} words</span> : null}
                      {submission.topics?.length ? <span>Topics: {submission.topics.join(', ')}</span> : null}
                      {submission.tags?.length ? <span>Tags: {submission.tags.join(', ')}</span> : null}
                    </div>
                    {submission.reviewNotes?.length ? (
                      <div className="rounded-xl border border-emerald-200 bg-white/60 p-3 text-xs text-emerald-900">
                        <p className="font-semibold text-emerald-800">Latest note</p>
                        <p className="mt-1 line-clamp-2">
                          {submission.reviewNotes[submission.reviewNotes.length - 1]?.message}
                        </p>
                      </div>
                    ) : null}
                  </div>
                  <div className="flex flex-col items-end gap-3 sm:flex-row sm:items-center">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => openSubmission(submission._id)}
                      className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      Review submission
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <span className="text-xs text-emerald-900/60">
                      Updated {format(new Date(submission._updatedAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      {selectedId ? (
        <div className="fixed inset-0 z-40 flex">
          <div className="hidden flex-1 bg-black/30 backdrop-blur-sm md:block" onClick={closeSubmission} />
          <div className="relative z-50 flex w-full flex-col overflow-y-auto bg-white shadow-2xl md:w-[480px]">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-emerald-100 bg-white px-5 py-4">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={closeSubmission} className="text-emerald-700 hover:bg-emerald-50">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <div>
                  <p className="text-xs uppercase tracking-wider text-emerald-500">Submission</p>
                  <h2 className="text-sm font-semibold text-emerald-900">
                    {selectedSubmission?.title || 'Loading…'}
                  </h2>
                </div>
              </div>
              {selectedSubmission ? (
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLORS[selectedSubmission.status]}`}>
                  {STATUS_LABELS[selectedSubmission.status]}
                </span>
              ) : null}
            </div>

            {detailLoading || !selectedSubmission ? (
              <div className="flex flex-1 items-center justify-center p-10">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
              </div>
            ) : (
              <div className="flex flex-1 flex-col gap-6 px-5 py-6">
                {alert ? (
                  <div
                    className={`rounded-2xl border px-4 py-3 text-sm ${
                      alert.type === 'success'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                        : 'border-red-200 bg-red-50 text-red-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span>{alert.message}</span>
                      {alert.link && (
                        <Link
                          href={alert.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          View Article
                        </Link>
                      )}
                    </div>
                  </div>
                ) : null}

                {selectedSubmission.coverImage?.asset?.url ? (
                  <div className="overflow-hidden rounded-2xl border border-emerald-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedSubmission.coverImage.asset.url}
                      alt={selectedSubmission.coverImage.alt || 'Cover image'}
                      className="h-48 w-full object-cover"
                    />
                  </div>
                ) : null}

                <section className="space-y-3">
                  <h3 className="text-sm font-semibold text-emerald-900">Overview</h3>
                  <div className="space-y-2 text-xs text-emerald-900/80">
                    <p>
                      <span className="font-semibold text-emerald-800">Title:</span> {selectedSubmission.title}
                    </p>
                    <p>
                      <span className="font-semibold text-emerald-800">Author:</span>{' '}
                      {selectedSubmission.supabaseUserEmail || 'Unknown'}
                    </p>
                    <p>
                      <span className="font-semibold text-emerald-800">Type:</span> {selectedSubmission.submissionType}
                    </p>
                    <p>
                      <span className="font-semibold text-emerald-800">Submitted:</span>{' '}
                      {selectedSubmission.submittedAt
                        ? format(new Date(selectedSubmission.submittedAt), 'MMM d, yyyy p')
                        : 'Not yet submitted'}
                    </p>
                    {selectedSubmission.approvedAt ? (
                      <p>
                        <span className="font-semibold text-emerald-800">Approved:</span>{' '}
                        {format(new Date(selectedSubmission.approvedAt), 'MMM d, yyyy p')}
                      </p>
                    ) : null}
                    {selectedSubmission.publishedAt ? (
                      <p>
                        <span className="font-semibold text-emerald-800">Published:</span>{' '}
                        {format(new Date(selectedSubmission.publishedAt), 'MMM d, yyyy p')}
                      </p>
                    ) : null}
                    {selectedSubmission.topics?.length ? (
                      <p>
                        <span className="font-semibold text-emerald-800">Topics:</span>{' '}
                        {selectedSubmission.topics.join(', ')}
                      </p>
                    ) : null}
                    {selectedSubmission.tags?.length ? (
                      <p>
                        <span className="font-semibold text-emerald-800">Tags:</span>{' '}
                        {selectedSubmission.tags.join(', ')}
                      </p>
                    ) : null}
                    {selectedSubmission.draftWordCount ? (
                      <p>
                        <span className="font-semibold text-emerald-800">Word count:</span>{' '}
                        {selectedSubmission.draftWordCount}
                      </p>
                    ) : null}
                    {selectedSubmission.linkedInsight?.slug ? (
                      <div className="mt-3 p-3 rounded-xl bg-emerald-100 border border-emerald-200">
                        <p className="text-xs font-semibold text-emerald-800 mb-2">Published Article</p>
                        <Link
                          href={`/knowledgehub/insights/${selectedSubmission.linkedInsight.slug}`}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white font-medium text-sm hover:bg-emerald-700 transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                          {selectedSubmission.linkedInsight.title ?? 'View published article'}
                        </Link>
                      </div>
                    ) : null}
                  </div>
                </section>

                <section className="space-y-3">
                  <h3 className="text-sm font-semibold text-emerald-900">Article preview</h3>
                  <div className="prose prose-sm max-w-none rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-emerald-900">
                    {selectedSubmission.contentBlocks?.length ? (
                      <PortableText
                        value={selectedSubmission.contentBlocks}
                        components={{
                          block: {
                            normal: ({ children }) => <p className="leading-6 text-emerald-900">{children}</p>,
                          },
                        }}
                      />
                    ) : (
                      <p className="text-xs text-emerald-800/70">
                        No formatted content available. Ask the contributor to resubmit with updated copy.
                      </p>
                    )}
                  </div>
                </section>

                <section className="space-y-3">
                  <h3 className="text-sm font-semibold text-emerald-900">Reviewer notes</h3>
                  {selectedSubmission.reviewNotes?.length ? (
                    <div className="space-y-3">
                      {selectedSubmission.reviewNotes.map((noteEntry) => (
                        <div key={`${noteEntry.createdAt}-${noteEntry.author}`} className="rounded-2xl border border-emerald-200 bg-white/80 p-3 text-xs text-emerald-900">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-emerald-800">{noteEntry.author || 'Editor'}</span>
                            {noteEntry.createdAt ? (
                              <span className="text-[11px] text-emerald-700/70">
                                {format(new Date(noteEntry.createdAt), 'MMM d, yyyy p')}
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-2 whitespace-pre-wrap text-emerald-900/90">{noteEntry.message}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-emerald-800/70">
                      No reviewer notes yet. Add your feedback before changing the status.
                    </p>
                  )}
                </section>

                <section className="space-y-4 rounded-3xl border border-emerald-200 bg-emerald-50/60 p-4">
                  <h3 className="text-sm font-semibold text-emerald-900">Update status</h3>
                  <Textarea
                    placeholder={DEFAULT_NOTE_PLACEHOLDER}
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    rows={4}
                    className="bg-white text-sm text-emerald-950"
                    disabled={actionLoading}
                  />
                  {/* Show linked insight ID field only for manual linking (legacy) */}
                  {selectedSubmission?.status === 'published' && !selectedSubmission?.linkedInsight?.slug && (
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-emerald-800">
                        Link to existing insight <span className="font-normal text-emerald-600">(optional, for manual linking)</span>
                      </label>
                      <Input
                        placeholder="e.g. insight-abc123 (from Sanity Studio)"
                        value={linkedInsightId}
                        onChange={(event) => setLinkedInsightId(event.target.value)}
                        className="bg-white text-sm text-emerald-950"
                        disabled={actionLoading}
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {statusActionOrder.map((targetStatus) => (
                      <Button
                        key={targetStatus}
                        type="button"
                        variant={targetStatus === 'rejected' ? 'destructive' : 'secondary'}
                        className={
                          targetStatus === 'rejected'
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : targetStatus === 'published'
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                              : 'bg-white text-emerald-700 hover:bg-emerald-100'
                        }
                        onClick={() => handleStatusChange(targetStatus)}
                        disabled={actionLoading}
                      >
                        {actionLoading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : targetStatus === 'approved' ? (
                          <CheckCircle className="mr-2 h-4 w-4" />
                        ) : targetStatus === 'rejected' ? (
                          <XCircle className="mr-2 h-4 w-4" />
                        ) : (
                          <Send className="mr-2 h-4 w-4" />
                        )}
                        {targetStatus === 'approved' && 'Approve for publishing'}
                        {targetStatus === 'published' && '🚀 Publish to Knowledge Hub'}
                        {targetStatus === 'rejected' && 'Request changes'}
                        {targetStatus === 'draft' && 'Return to draft'}
                      </Button>
                    ))}
                  </div>
                  <p className="text-[11px] text-emerald-700/70">
                    <strong>Publish</strong> creates the article on the Knowledge Hub automatically. Contributors receive email notifications.
                  </p>
                </section>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
