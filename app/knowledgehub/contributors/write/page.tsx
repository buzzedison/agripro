'use client'

import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Sparkles,
  AlignLeft,
  NotebookPen,
  ListChecks,
  Bold,
  Italic,
  Heading2,
  List as ListIcon,
  ListOrdered,
  Quote,
  Code,
  ImagePlus,
  Image as ImageIcon,
  X,
  Loader2,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { useContentAccess } from '@/lib/hooks/useContentAccess'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const submissionTypes = [
  { value: 'insight', label: 'Insight Article' },
  { value: 'bestPractice', label: 'Best Practice' },
  { value: 'research', label: 'Research Summary' },
  { value: 'whitepaper', label: 'Whitepaper' },
]

type SubmissionStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'published'

const statusStyles: Record<SubmissionStatus, string> = {
  draft: 'bg-emerald-100 text-emerald-800',
  submitted: 'bg-amber-100 text-amber-800',
  approved: 'bg-blue-100 text-blue-800',
  rejected: 'bg-red-100 text-red-800',
  published: 'bg-emerald-600 text-white',
}

const articleTemplate = `## Executive Summary

Summarise the insight in 3–4 sentences. Mention the outcome and why it matters.

## Context & Challenge

- Where is this happening? (Region, climate, farm/enterprise type)
- What pain point were farmers or operators facing?

> 💡 **Tip:** Use the Image button in the toolbar to add photos of your farm, process, or results.

## What We Tried

- Bullet the interventions, tools, or partnerships leveraged.
- Note timelines, costs, and decision-makers involved.

## Results & Evidence

- Quantify the impact: yields, costs, labour hours, adoption, revenue.
- Add a direct quote or testimonial if possible.

**Key metrics:**
| Metric | Before | After |
|--------|--------|-------|
| Yield  | X kg/ha | Y kg/ha |
| Cost   | $X | $Y |

## How To Reproduce

1. Step-by-step breakdown others can follow.
2. Highlight must-have prerequisites or partners.
3. Include any tools, inputs, or contacts needed.

## Lessons & Watch-outs

- What worked particularly well?
- What should readers tweak when adapting locally?
- Any risks or failures worth mentioning?

## Resources

- Link to spreadsheets, tools, calculators, or support programmes.
- Tag any experts or organisations readers can contact.`

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
  const [contributorName, setContributorName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminStatusResolved, setAdminStatusResolved] = useState(false)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const [hydratingDraft, setHydratingDraft] = useState(false)
  const [readOnly, setReadOnly] = useState(false)
  const [lockNotice, setLockNotice] = useState<string | null>(null)
  const [status, setStatus] = useState<SubmissionStatus | null>(null)
  const [coverImage, setCoverImage] = useState<{ assetId: string; url: string; alt?: string | null; caption?: string | null } | null>(null)
  const [coverImageUploading, setCoverImageUploading] = useState(false)
  const [coverImageError, setCoverImageError] = useState<string | null>(null)
  const [editorTab, setEditorTab] = useState<'write' | 'preview'>('write')
  const [authorSyncDone, setAuthorSyncDone] = useState(false)
  const wordCount = useMemo(() => body.trim().split(/\s+/).filter(Boolean).length, [body])
  const statusLabel = status ? status.charAt(0).toUpperCase() + status.slice(1) : null
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const inlineImageInputRef = useRef<HTMLInputElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const [inlineImageUploading, setInlineImageUploading] = useState(false)

  useEffect(() => {
    if (searchParams.get('draft')) {
      return
    }

    const initialTitle = searchParams.get('title') || ''
    const initialExcerpt = searchParams.get('excerpt') || ''
    const initialType = searchParams.get('submissionType') || 'insight'
    const initialTopics = searchParams.get('topics') || ''

    setTitle(initialTitle)
    setExcerpt(initialExcerpt)
    setSubmissionType(initialType)
    setTopics(initialTopics)
    setTags('')
    setBody('')
    setNotes('')
    setContributorName('')
    setSubmissionId(null)
    setReadOnly(false)
    setLockNotice(null)
    setStatus(null)
    setCoverImage(null)
    setCoverImageError(null)
  }, [searchParams])

  useEffect(() => {
    if (!user) {
      setIsAdmin(false)
      setAdminStatusResolved(false)
      setAuthorSyncDone(false)
      setSubmissionId(null)
      setReadOnly(false)
      setLockNotice(null)
      setStatus(null)
      return
    }

    let active = true
    const draftId = searchParams.get('draft')

    const fetchAdminStatus = async () => {
      if (!user.email) {
        if (active) {
          setIsAdmin(false)
          setAdminStatusResolved(true)
        }
        return
      }

      try {
        const response = await fetch('/api/admin/check-status')
        const data = await response.json()

        if (!active) return

        setIsAdmin(Boolean(response.ok && data?.isAdmin))
      } catch (err) {
        console.error('Failed to resolve admin status', err)
        if (active) {
          setIsAdmin(false)
        }
      } finally {
        if (active) {
          setAdminStatusResolved(true)
        }
      }
    }

    fetchAdminStatus()

    if (!draftId) {
      setSubmissionId(null)
      setReadOnly(false)
      setLockNotice(null)
      setStatus(null)
      return () => {
        active = false
      }
    }

    const controller = new AbortController()

    const fetchDraft = async () => {
      try {
        setHydratingDraft(true)
        setError(null)
        setMessage(null)
        setLockNotice(null)

        const response = await fetch(`/api/knowledge-hub/contributors/${draftId}`, {
          signal: controller.signal,
        })

        if (controller.signal.aborted) return

        if (!response.ok) {
          if (response.status === 404) {
            setError('We could not find that submission. It may have been removed.')
          } else {
            setError('We could not load this submission. Please try again.')
          }
          return
        }

        const data = await response.json()
        const submission = data.submission

        if (!submission) {
          setError('We could not find that submission. It may have been removed.')
          setReadOnly(true)
          setStatus(null)
          return
        }

        if (
          (submission.supabaseUserEmail && submission.supabaseUserEmail !== user.email) ||
          (submission.supabaseUserId && submission.supabaseUserId !== user.id)
        ) {
          setError('You do not have access to this submission.')
          setReadOnly(true)
          setStatus(submission?.status ?? null)
          return
        }

        setSubmissionId(submission._id)
        setStatus(submission.status ?? null)
        setTitle(submission.title ?? '')
        setExcerpt(submission.excerpt ?? '')
        setSubmissionType(submission.submissionType ?? 'insight')
        setTopics(Array.isArray(submission.topics) ? submission.topics.join(', ') : '')
        setTags(Array.isArray(submission.tags) ? submission.tags.join(', ') : '')
        setBody(submission.contentText ?? submission.contentSnapshot ?? '')
        setNotes(submission.submissionNotes ?? '')
        setContributorName(submission.contributorName ?? '')
        setCoverImage(submission.coverImage ?? null)
        setCoverImageError(null)

        const editable = submission.status === 'draft' || submission.status === 'rejected'
        setReadOnly(!editable)

        if (!editable) {
          const label = submission.status?.replace(/^\w/, (c: string) => c.toUpperCase()) ?? 'Submitted'
          setLockNotice(`This submission is currently ${label.toLowerCase()} and locked for editing. Contact the editorial team if you need to make changes.`)
        } else {
          setLockNotice(null)
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Failed to hydrate submission', err)
          setError('We could not load this submission. Please try again.')
        }
      } finally {
        setHydratingDraft(false)
      }
    }

    fetchDraft()

    return () => {
      active = false
      controller.abort()
    }
  }, [user, searchParams])

  useEffect(() => {
    if (!user?.email || !adminStatusResolved || !isAdmin || authorSyncDone) {
      return
    }

    let cancelled = false

    const syncAuthorIdentity = async () => {
      try {
        const response = await fetch('/api/knowledge-hub/contributors/sync-author', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            name: contributorName.trim() || user.user_metadata?.full_name || user.user_metadata?.name,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to sync author identity')
        }

        if (!cancelled) {
          setAuthorSyncDone(true)
        }
      } catch (err) {
        console.error('Failed to sync admin author identity', err)
      }
    }

    syncAuthorIdentity()

    return () => {
      cancelled = true
    }
  }, [user, isAdmin, adminStatusResolved, authorSyncDone, contributorName])

  const meetsReviewRequirements = useMemo(() => {
    return title.trim().length >= 6 && excerpt.trim().length >= 40 && body.trim().length >= 200
  }, [title, excerpt, body])

  const canSubmit = meetsReviewRequirements && !readOnly && !hydratingDraft

  const handleApplyTemplate = () => {
    if (readOnly || hydratingDraft) return

    setBody((prev) => {
      if (!prev.trim()) return articleTemplate
      return `${prev.trim()}\n\n${articleTemplate}`
    })
    setMessage('Added article structure template to the draft.')
  }

  const triggerCoverImageDialog = () => {
    if (readOnly || hydratingDraft || coverImageUploading) return
    fileInputRef.current?.click()
  }

  const handleCoverImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || readOnly) {
      return
    }

    setCoverImageError(null)

    if (file.size > 5 * 1024 * 1024) {
      setCoverImageError('Please choose an image under 5MB.')
      event.target.value = ''
      return
    }

    setCoverImageUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/knowledge-hub/contributors/upload-cover', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload image')
      }

      const data = await response.json()
      setCoverImage({
        assetId: data.assetId,
        url: data.url,
      })
    } catch (err) {
      console.error('Cover image upload failed', err)
      setCoverImageError('Failed to upload image. Please try again.')
    } finally {
      setCoverImageUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveCoverImage = () => {
    if (readOnly || coverImageUploading) return
    setCoverImage(null)
    setCoverImageError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const triggerInlineImageUpload = () => {
    if (readOnly || hydratingDraft || inlineImageUploading) return
    inlineImageInputRef.current?.click()
  }

  const handleInlineImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || readOnly) return

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB.')
      event.target.value = ''
      return
    }

    setInlineImageUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/knowledge-hub/contributors/upload-image', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload image')
      }

      const data = await response.json()
      
      // Insert markdown image at cursor position
      const textarea = textareaRef.current
      if (textarea) {
        const { selectionStart, value } = textarea
        const before = value.slice(0, selectionStart)
        const after = value.slice(selectionStart)
        const imageMarkdown = `\n\n![${file.name}](${data.url})\n\n`
        const nextValue = `${before}${imageMarkdown}${after}`
        
        setBody(nextValue)
        setMessage('Image uploaded and inserted.')
        
        requestAnimationFrame(() => {
          textarea.focus()
          const newPosition = selectionStart + imageMarkdown.length
          textarea.setSelectionRange(newPosition, newPosition)
        })
      }
    } catch (err) {
      console.error('Inline image upload failed', err)
      setError('Failed to upload image. Please try again.')
    } finally {
      setInlineImageUploading(false)
      if (inlineImageInputRef.current) {
        inlineImageInputRef.current.value = ''
      }
    }
  }

  type EditorAction = 'bold' | 'italic' | 'heading' | 'ul' | 'ol' | 'quote' | 'code'

  const applyWrap = (prefix: string, suffix = prefix, placeholder = 'Your text here') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const { selectionStart, selectionEnd, value } = textarea
    const selected = value.slice(selectionStart, selectionEnd) || placeholder
    const before = value.slice(0, selectionStart)
    const after = value.slice(selectionEnd)
    const nextValue = `${before}${prefix}${selected}${suffix}${after}`
    const start = selectionStart + prefix.length
    const end = start + selected.length

    setBody(nextValue)
    requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(start, end)
    })
  }

  const applyLinePrefix = (prefix: string | ((index: number) => string), placeholder = 'List item') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const { selectionStart, selectionEnd, value } = textarea
    const before = value.slice(0, selectionStart)
    const after = value.slice(selectionEnd)

    const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1
    const lineEnd = value.indexOf('\n', selectionEnd)
    const endPosition = lineEnd === -1 ? value.length : lineEnd
    const selectedText = value.slice(lineStart, endPosition) || placeholder
    const lines = selectedText.split('\n')

    const getPrefix = (index: number) => (typeof prefix === 'function' ? prefix(index) : prefix)
    const allPrefixed = lines.every((line, index) => line.startsWith(getPrefix(index)))
    const transformedLines = allPrefixed
      ? lines.map((line, index) => line.replace(new RegExp(`^${escapeRegExp(getPrefix(index))}`), ''))
      : lines.map((line, index) => {
          const currentPrefix = getPrefix(index)
          return line ? `${currentPrefix}${line}` : `${currentPrefix}${placeholder}`
        })

    const replacement = transformedLines.join('\n')
    const nextValue = `${before}${replacement}${after}`

    setBody(nextValue)
    requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(lineStart, lineStart + replacement.length)
    })
  }

  const handleFormat = (action: EditorAction) => {
    if (readOnly || hydratingDraft || editorTab !== 'write') return
    const textarea = textareaRef.current
    if (!textarea) return

    switch (action) {
      case 'bold':
        applyWrap('**')
        break
      case 'italic':
        applyWrap('*')
        break
      case 'heading': {
        const { selectionStart, value } = textarea
        const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1
        const lineEnd = value.indexOf('\n', selectionStart)
        const endPosition = lineEnd === -1 ? value.length : lineEnd
        const line = value.slice(lineStart, endPosition)
        const hasHeading = line.startsWith('## ')
        const replacement = hasHeading ? line.replace(/^##\s*/, '') : `## ${line || 'Heading'}`
        const nextValue = `${value.slice(0, lineStart)}${replacement}${value.slice(endPosition)}`

        setBody(nextValue)
        requestAnimationFrame(() => {
          textarea.focus()
          const start = hasHeading ? lineStart : lineStart + 3
          const end = start + (line || 'Heading').length
          textarea.setSelectionRange(start, end)
        })
        break
      }
      case 'ul':
        applyLinePrefix('- ')
        break
      case 'ol':
        applyLinePrefix((index) => `${index + 1}. `)
        break
      case 'quote':
        applyLinePrefix('> ')
        break
      case 'code':
        applyWrap('```\n', '\n```', 'code block')
        break
      default:
        break
    }
  }


  const formattingButtons: Array<{ action: EditorAction; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { action: 'bold', label: 'Bold', icon: Bold },
    { action: 'italic', label: 'Italic', icon: Italic },
    { action: 'heading', label: 'Heading', icon: Heading2 },
    { action: 'ul', label: 'Bullet list', icon: ListIcon },
    { action: 'ol', label: 'Numbered list', icon: ListOrdered },
    { action: 'quote', label: 'Quote', icon: Quote },
    { action: 'code', label: 'Code block', icon: Code },
  ]

  const handleSave = async (final: boolean) => {
    if (!user) {
      setError('You must be logged in to save.')
      return
    }

    if (readOnly) {
      setError('This submission is locked for editing while under review or already published.')
      return
    }

    if (hydratingDraft) {
      setError('Please wait for the submission to finish loading before saving.')
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
          contributorName: contributorName.trim() || undefined,
          isFinal: final,
          coverImageAssetId: coverImage?.assetId ?? null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save submission')
      }

      const data = await response.json()
      const nextSubmissionId = data.submissionId ?? submissionId

      if (!submissionId && data.submissionId) {
        setSubmissionId(data.submissionId)
      }

      if (typeof data.status === 'string') {
        setStatus(data.status as SubmissionStatus)
      }

      if (final && data.shouldPublishNow && nextSubmissionId) {
        const publishResponse = await fetch('/api/knowledge-hub/contributors/publish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            submissionId: nextSubmissionId,
            reviewer: user.email ?? 'Admin',
          }),
        })

        const publishData = await publishResponse.json()

        if (!publishResponse.ok) {
          throw new Error(publishData.error || 'Article was approved, but publishing failed.')
        }

        setStatus('published')
        setMessage('Article published successfully.')
        router.replace(`/knowledgehub/insights/${publishData.insightSlug}`)
        return
      }

      setMessage(
        final
          ? data.shouldPublishNow
            ? 'Article approved. Finishing publication...'
            : 'Submission sent for review. We’ll email you once it’s reviewed.'
          : 'Draft saved.'
      )

      if (final) {
        router.replace(data.shouldPublishNow ? '/knowledgehub/contributors?published=1' : '/knowledgehub/contributors?submitted=1')
      }
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Could not save submission. Please try again.')
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 py-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
        <header className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm">
          <div className="relative isolate overflow-hidden">
            <div className="absolute -left-24 top-12 h-56 w-56 rounded-full bg-emerald-100/70 blur-3xl" />
            <div className="absolute -right-16 bottom-0 h-48 w-48 rounded-full bg-lime-100/70 blur-3xl" />
            <div className="relative flex flex-col gap-6 px-8 py-10 sm:px-10">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-3">
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700">
                    <Sparkles className="h-3.5 w-3.5" />
                    Drafting workspace
                  </span>
                  <h1 className="text-3xl font-semibold text-emerald-950 md:text-4xl">Build your article</h1>
                  <p className="max-w-2xl text-sm text-emerald-900/80">
                    Capture the challenge, experiments, data, and lessons you want peers to act on. Editors will review, polish, and route it to the right audience.
                  </p>
                </div>
                {statusLabel && status ? (
                  <span
                    className={`inline-flex items-center justify-center rounded-full px-4 py-1 text-xs font-semibold ${statusStyles[status]}`}
                  >
                    Status: {statusLabel}
                  </span>
                ) : null}
              </div>
              <div className="grid gap-4 text-xs text-emerald-900/70 sm:grid-cols-3">
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 px-4 py-3">
                  ✅ Drafts & rejected pieces stay editable. Submitted or published entries are locked until the editorial team updates them.
                </div>
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 px-4 py-3">
                  ⏱ Aim for 800–1,200 words. Lead with outcomes, back up claims with evidence, and cite names readers can trust.
                </div>
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 px-4 py-3">
                  {isAdmin ? '🚀 Admin submissions publish immediately once you confirm.' : '📬 You’ll receive email notifications for reviewer notes, approvals, or publication.'}
                </div>
              </div>
            </div>
          </div>
        </header>

        {hydratingDraft ? (
          <div className="rounded-3xl border border-emerald-100 bg-white p-4 text-sm text-muted-foreground">
            Loading submission…
          </div>
        ) : null}

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

        {lockNotice ? (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            {lockNotice}
          </div>
        ) : null}

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm md:p-8">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-emerald-900">Article details</p>
                  <p className="text-xs text-muted-foreground">Update the headline, excerpt, and story body below.</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={readOnly || hydratingDraft || saving}
                  onClick={handleApplyTemplate}
                  className="gap-1 text-emerald-700 hover:bg-emerald-50"
                >
                  <AlignLeft className="h-4 w-4" />
                  Structure template
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium text-emerald-900">
                      Title
                    </Label>
                    <div className="relative">
                      <Input
                        id="title"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        required
                        disabled={readOnly || hydratingDraft || saving}
                        className="bg-white text-sm leading-6 text-emerald-950 shadow-sm focus-visible:ring-2 focus-visible:ring-emerald-500"
                      />
                      <NotebookPen className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contributorName" className="text-sm font-medium text-emerald-900">
                      Your Name <span className="font-normal text-muted-foreground">(as author)</span>
                    </Label>
                    <Input
                      id="contributorName"
                      value={contributorName}
                      onChange={(event) => setContributorName(event.target.value)}
                      placeholder="e.g. John Doe"
                      disabled={readOnly || hydratingDraft || saving}
                      className="bg-white text-sm leading-6 text-emerald-950 shadow-sm focus-visible:ring-2 focus-visible:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt" className="text-sm font-medium text-emerald-900">
                    Excerpt <span className="font-normal text-muted-foreground">(2-3 sentences that summarize the key insight)</span>
                  </Label>
                  <Textarea
                    id="excerpt"
                    value={excerpt}
                    onChange={(event) => setExcerpt(event.target.value)}
                    rows={3}
                    required
                    disabled={readOnly || hydratingDraft || saving}
                    placeholder="Summarize the main takeaway readers will get from this article..."
                    className="resize-none bg-white text-sm leading-6 text-emerald-950 shadow-sm focus-visible:ring-2 focus-visible:ring-emerald-500"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="body" className="text-sm font-medium text-emerald-900">
                      Article body
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      Supports Markdown: **bold**, *italic*, ## headings, - lists
                    </span>
                  </div>
                  <Tabs value={editorTab} onValueChange={(value) => setEditorTab(value as 'write' | 'preview')} className="w-full">
                    <div className="space-y-3">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <TabsList className="w-fit rounded-full bg-emerald-100/60 p-1">
                          <TabsTrigger value="write" className="rounded-full px-4 py-1 text-xs">
                            Write
                          </TabsTrigger>
                          <TabsTrigger value="preview" className="rounded-full px-4 py-1 text-xs">
                            Preview
                          </TabsTrigger>
                        </TabsList>
                        <div className="flex flex-wrap gap-2">
                          {formattingButtons.map(({ action, label, icon: Icon }) => (
                            <Button
                              key={action}
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={readOnly || hydratingDraft || editorTab !== 'write'}
                              onClick={() => handleFormat(action)}
                              className="h-8 w-8 p-0 text-emerald-700 hover:bg-emerald-50"
                              title={label}
                              aria-label={label}
                            >
                              <Icon className="h-4 w-4" />
                            </Button>
                          ))}
                          <div className="mx-1 h-8 w-px bg-emerald-200" />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={readOnly || hydratingDraft || inlineImageUploading || editorTab !== 'write'}
                            onClick={triggerInlineImageUpload}
                            className="h-8 gap-1 px-2 text-emerald-700 hover:bg-emerald-50"
                            title="Insert image"
                            aria-label="Insert image"
                          >
                            {inlineImageUploading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <ImageIcon className="h-4 w-4" />
                            )}
                            <span className="text-xs">Image</span>
                          </Button>
                          <input
                            ref={inlineImageInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            className="hidden"
                            onChange={handleInlineImageUpload}
                          />
                        </div>
                      </div>

                      <TabsContent value="write" className="m-0" forceMount>
                        <Textarea
                          id="body"
                          ref={textareaRef}
                          value={body}
                          onChange={(event) => setBody(event.target.value)}
                          rows={28}
                          placeholder="Write your article here. Use headings (##), bullet points (-), and short paragraphs. Click the Image button above to add photos."
                          required
                          disabled={readOnly || hydratingDraft || saving}
                          className="min-h-[560px] resize-y bg-white font-mono text-sm leading-7 text-emerald-950 shadow-inner shadow-emerald-50 ring-1 ring-emerald-100 focus-visible:ring-2 focus-visible:ring-emerald-500"
                        />
                      </TabsContent>

                      <TabsContent value="preview" className="m-0">
                        <div className="prose prose-emerald prose-base max-w-none min-h-[560px] rounded-2xl border border-emerald-100 bg-white p-6 text-emerald-950 shadow-inner overflow-y-auto">
                          {body.trim() ? (
                            <ReactMarkdown 
                              remarkPlugins={[remarkGfm]}
                              components={{
                                img: ({ node, ...props }) => (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img 
                                    {...props} 
                                    alt={props.alt || 'Article image'}
                                    className="rounded-lg max-w-full h-auto my-4 border border-emerald-200"
                                    loading="lazy"
                                  />
                                ),
                                h2: ({ node, ...props }) => (
                                  <h2 {...props} className="text-lg font-semibold text-emerald-900 mt-6 mb-3" />
                                ),
                                h3: ({ node, ...props }) => (
                                  <h3 {...props} className="text-base font-semibold text-emerald-800 mt-4 mb-2" />
                                ),
                                p: ({ node, ...props }) => (
                                  <p {...props} className="text-emerald-900/90 leading-relaxed mb-3" />
                                ),
                                ul: ({ node, ...props }) => (
                                  <ul {...props} className="list-disc list-inside space-y-1 mb-3 text-emerald-900/90" />
                                ),
                                ol: ({ node, ...props }) => (
                                  <ol {...props} className="list-decimal list-inside space-y-1 mb-3 text-emerald-900/90" />
                                ),
                                blockquote: ({ node, ...props }) => (
                                  <blockquote {...props} className="border-l-4 border-emerald-400 pl-4 italic text-emerald-800 my-4" />
                                ),
                                table: ({ node, ...props }) => (
                                  <div className="overflow-x-auto my-4">
                                    <table {...props} className="min-w-full border border-emerald-200 rounded-lg text-sm" />
                                  </div>
                                ),
                                thead: ({ node, ...props }) => (
                                  <thead {...props} className="bg-emerald-100" />
                                ),
                                th: ({ node, ...props }) => (
                                  <th {...props} className="px-3 py-2 text-left font-semibold text-emerald-900 border-b border-emerald-200" />
                                ),
                                td: ({ node, ...props }) => (
                                  <td {...props} className="px-3 py-2 border-b border-emerald-100 text-emerald-800" />
                                ),
                                strong: ({ node, ...props }) => (
                                  <strong {...props} className="font-semibold text-emerald-900" />
                                ),
                                a: ({ node, ...props }) => (
                                  <a {...props} className="text-emerald-600 underline hover:text-emerald-800" target="_blank" rel="noopener noreferrer" />
                                ),
                              }}
                            >
                              {body}
                            </ReactMarkdown>
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              Start writing to see your formatted article preview here.
                            </p>
                          )}
                        </div>
                      </TabsContent>
                    </div>
                  </Tabs>
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
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-emerald-900">Cover image</h2>
                  <p className="text-xs text-muted-foreground">Optional hero image that tops the published article.</p>
                </div>
                <div className="flex gap-2">
                  {coverImage ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveCoverImage}
                      disabled={readOnly || coverImageUploading}
                      className="text-emerald-700 hover:bg-emerald-50"
                    >
                      <X className="mr-1 h-4 w-4" />
                      Remove
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={triggerCoverImageDialog}
                    disabled={readOnly || coverImageUploading}
                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    <ImagePlus className="mr-1 h-4 w-4" />
                    Upload
                  </Button>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverImageChange}
              />

              <div className="mt-4 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/60 p-4 text-center">
                {coverImage ? (
                  <div className="space-y-2">
                    <div className="overflow-hidden rounded-xl">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={coverImage.url}
                        alt="Cover preview"
                        className="h-40 w-full rounded-xl object-cover"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Image is saved with your next draft update.</p>
                  </div>
                ) : (
                  <div className="flex h-40 flex-col items-center justify-center gap-2 text-xs text-muted-foreground">
                    <ImagePlus className="h-6 w-6 text-emerald-500" />
                    <span>Add a high-resolution landscape image (16:9 works best).</span>
                  </div>
                )}
              </div>
              {coverImageUploading ? (
                <p className="mt-2 text-xs text-emerald-700">Uploading image…</p>
              ) : null}
              {coverImageError ? (
                <p className="mt-2 text-xs text-red-600">{coverImageError}</p>
              ) : null}
              {readOnly && coverImage ? (
                <p className="mt-2 text-xs text-muted-foreground">Cover image changes are locked while this submission is {statusLabel?.toLowerCase()}.</p>
              ) : null}
            </div>

            <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-emerald-900">Submission details</h2>
              <div className="mt-4 space-y-3 text-sm">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-emerald-900">Type</Label>
                  <Select
                    value={submissionType}
                    onValueChange={setSubmissionType}
                    disabled={readOnly || hydratingDraft || saving}
                  >
                    <SelectTrigger className="bg-white text-sm shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-sm text-emerald-900 shadow-lg">
                      {submissionTypes.map((type) => (
                        <SelectItem
                          key={type.value}
                          value={type.value}
                          className="rounded-lg py-2 text-sm font-medium text-emerald-900 focus:bg-emerald-50 data-[state=checked]:bg-emerald-100"
                        >
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topics" className="text-sm font-medium text-emerald-900">
                    Topics
                  </Label>
                  <Input
                    id="topics"
                    value={topics}
                    onChange={(event) => setTopics(event.target.value)}
                    placeholder="Comma-separated"
                    disabled={readOnly || hydratingDraft || saving}
                    className="bg-white text-sm leading-6 text-emerald-950 shadow-sm focus-visible:ring-2 focus-visible:ring-emerald-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags" className="text-sm font-medium text-emerald-900">
                    Tags
                  </Label>
                  <Input
                    id="tags"
                    value={tags}
                    onChange={(event) => setTags(event.target.value)}
                    placeholder="Comma-separated"
                    disabled={readOnly || hydratingDraft || saving}
                    className="bg-white text-sm leading-6 text-emerald-950 shadow-sm focus-visible:ring-2 focus-visible:ring-emerald-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-medium text-emerald-900">
                    Note to editor (optional)
                  </Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    rows={3}
                    placeholder="Context, data sources, or special details we should know."
                    disabled={readOnly || hydratingDraft || saving}
                    className="resize-none bg-white text-sm leading-6 text-emerald-950 shadow-sm focus-visible:ring-2 focus-visible:ring-emerald-500"
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
              <h2 className="flex items-center gap-2 text-sm font-semibold text-emerald-900">
                <ListChecks className="h-4 w-4 text-emerald-600" />
                Writing prompts
              </h2>
              <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
                <li>• Quantify your impacts with real numbers—yields, cost, labour, revenue, adoption.</li>
                <li>• Call out the partners, cooperatives, financiers, or suppliers involved.</li>
                <li>• Share at least one unexpected lesson or risk to help peers adapt.</li>
                <li>• Mention supporting assets (spreadsheets, videos) so the team can embed them later.</li>
                <li>• Flag any media you’d like the design team to add during review.</li>
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <Button onClick={() => handleSave(false)} disabled={saving}>
                Save draft
              </Button>
              <Button variant="secondary" onClick={() => setShowSubmitConfirm(true)} disabled={saving || !canSubmit || !adminStatusResolved}>
                {isAdmin ? 'Publish now' : 'Submit for review'}
              </Button>
              <Button asChild variant="ghost">
                <Link href="/knowledgehub/contributors">Back to dashboard</Link>
              </Button>
            </div>
          </aside>
        </div>

        {showSubmitConfirm ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="w-full max-w-md rounded-3xl border border-emerald-100 bg-white p-6 shadow-xl">
              <h2 className="text-lg font-semibold text-emerald-950">{isAdmin ? 'Publish this article now?' : 'Submit for review?'}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {isAdmin
                  ? 'We’ll save the final draft, bypass the approval queue for your admin account, and publish it to the Knowledge Hub immediately.'
                  : 'We’ll lock this draft, notify the editorial team, and email you once a reviewer responds. You can always add follow-up notes if needed.'}
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setShowSubmitConfirm(false)}>
                  Not yet
                </Button>
                <Button onClick={() => handleSave(true)} disabled={saving}>
                  {saving ? (isAdmin ? 'Publishing…' : 'Submitting…') : isAdmin ? 'Publish' : 'Submit'}
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
