'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

import { useContentAccess } from '@/lib/hooks/useContentAccess'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const submissionTypes = [
  { value: 'insight', label: 'Insight Article' },
  { value: 'bestPractice', label: 'Best Practice' },
  { value: 'research', label: 'Research Summary' },
  { value: 'whitepaper', label: 'Whitepaper' },
]

export default function ContributorWritePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, loading } = useContentAccess()

  const [submissionId, setSubmissionId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [submissionType, setSubmissionType] = useState('insight')
  const [topics, setTopics] = useState('')
  const [tags, setTags] = useState('')
  const [body, setBody] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const wordCount = useMemo(() => body.trim().split(/\s+/).filter(Boolean).length, [body])

  useEffect(() => {
    const initialTitle = searchParams.get('title') || ''
    const initialExcerpt = searchParams.get('excerpt') || ''
    const initialType = searchParams.get('submissionType') || 'insight'
    const initialTopics = searchParams.get('topics') || ''

    setTitle(initialTitle)
    setExcerpt(initialExcerpt)
    setSubmissionType(initialType)
    setTopics(initialTopics)
  }, [searchParams])

  useEffect(() => {
    if (!user) return

    const draftId = searchParams.get('draft')
    if (!draftId) return

    const fetchDraft = async () => {
      try {
        const response = await fetch(`/api/knowledge-hub/contributors/list?email=${encodeURIComponent(user.email!)}`)
        if (response.ok) {
          const data = await response.json()
          const draft = (data.submissions as any[]).find((item) => item._id === draftId)
          if (draft) {
            setSubmissionId(draft._id)
            setTitle(draft.title)
            setExcerpt(draft.excerpt || '')
            setSubmissionType(draft.submissionType || 'insight')
            setTopics((draft.topics || []).join(', '))
            setTags((draft.tags || []).join(', '))
            setBody(draft.contentText || '')
            setNotes(draft.submissionNotes || '')
          }
        }
      } catch (err) {
        console.error('Failed to hydrate draft', err)
      }
    }

    fetchDraft()
  }, [user, searchParams])

  const canSubmit = useMemo(() => {
    return title.trim().length >= 6 && excerpt.trim().length >= 40 && body.trim().length >= 200
  }, [title, excerpt, body])

  const handleSave = async (final: boolean) => {
    if (!user) {
      setError('You must be logged in to save.')
      return
    }

    setSaving(true)
    setError(null)
    setMessage(null)

    try {
      const response = await fetch('/api/knowledge-hub/contributors/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId,
          title,
          excerpt,
          submissionType,
          topics: topics.split(',').map((item) => item.trim()).filter(Boolean),
          tags: tags.split(',').map((item) => item.trim()).filter(Boolean),
          contentText: body,
          submissionNotes: notes,
          supabaseUserId: user.id,
          supabaseUserEmail: user.email!,
          isFinal: final,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save submission')
      }

      const data = await response.json()
      if (!submissionId && data.submissionId) {
        setSubmissionId(data.submissionId)
      }

      setMessage(final ? 'Submission sent for review. We’ll email you once it’s reviewed.' : 'Draft saved.')

      if (final) {
        router.replace('/knowledgehub/contributors?submitted=1')
      }
    } catch (err) {
      console.error(err)
      setError('Could not save submission. Please try again.')
    } finally {
      setSaving(false)
      setShowSubmitConfirm(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading editor…</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 text-center">
        <h1 className="text-2xl font-semibold text-foreground">Sign in to continue</h1>
        <p className="max-w-md text-muted-foreground">
          Your session expired. Sign in again to continue editing your submission.
        </p>
        <Button asChild>
          <Link href="/auth/login?redirect=/knowledgehub/contributors/write">Sign in</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4">
        <header className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700">Drafting workspace</p>
          <h1 className="text-3xl font-semibold text-emerald-950 md:text-4xl">Build your article</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Draft your article, add quotes or data, and track revisions before submitting for review. You can save as a draft and return later.
          </p>
        </header>

        {error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {message ? (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            {message}
          </div>
        ) : null}

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={title} onChange={(event) => setTitle(event.target.value)} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea id="excerpt" value={excerpt} onChange={(event) => setExcerpt(event.target.value)} rows={4} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="body">Article body</Label>
                  <Textarea
                    id="body"
                    value={body}
                    onChange={(event) => setBody(event.target.value)}
                    rows={18}
                    placeholder="Write your article here. Include headings, bullet points, and key takeaways."
                    required
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Tip: aim for 800–1,200 words.</span>
                    <span>{wordCount} words</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-emerald-900">Submission details</h2>
              <div className="mt-4 space-y-3 text-sm">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={submissionType} onValueChange={setSubmissionType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {submissionTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topics">Topics</Label>
                  <Input
                    id="topics"
                    value={topics}
                    onChange={(event) => setTopics(event.target.value)}
                    placeholder="Comma-separated"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    value={tags}
                    onChange={(event) => setTags(event.target.value)}
                    placeholder="Comma-separated"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Note to editor (optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    rows={3}
                    placeholder="Context, data sources, or special details we should know."
                  />
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-emerald-900">Review checklist</h2>
              <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
                <li>✔ Title captures the core insight.</li>
                <li>✔ Excerpt summarises the key outcome.</li>
                <li>✔ Body includes sections, data, or examples.</li>
                <li>✔ Topics and tags help route to the right editors.</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-emerald-900">Preview</h2>
              <p className="mt-3 text-base font-semibold text-emerald-950">{title || 'Untitled submission'}</p>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {submissionTypes.find((type) => type.value === submissionType)?.label || 'Choose type'}
              </p>
              <p className="mt-2 line-clamp-4 text-sm text-muted-foreground">{excerpt || 'Add a short excerpt to describe the piece.'}</p>
              <div className="mt-3 text-xs text-muted-foreground">{wordCount} words</div>
            </div>

            <div className="flex flex-col gap-3">
              <Button onClick={() => handleSave(false)} disabled={saving}>
                Save draft
              </Button>
              <Button variant="secondary" onClick={() => setShowSubmitConfirm(true)} disabled={saving || !canSubmit}>
                Submit for review
              </Button>
              <Button asChild variant="ghost">
                <Link href="/knowledgehub/contributors">Back to dashboard</Link>
              </Button>
            </div>
          </aside>
        </div>
      </div>

      {showSubmitConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-md rounded-3xl border border-emerald-100 bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-emerald-950">Submit for review?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We’ll lock this draft, notify the editorial team, and email you when it’s reviewed. You can follow up with additional context if needed.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowSubmitConfirm(false)}>
                Not yet
              </Button>
              <Button onClick={() => handleSave(true)} disabled={saving}>
                {saving ? 'Submitting…' : 'Submit'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

