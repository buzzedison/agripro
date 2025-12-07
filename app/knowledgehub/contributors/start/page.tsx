'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import Link from 'next/link'
import { PenSquare, Sparkles, NotebookPen } from 'lucide-react'

import { useContentAccess } from '@/lib/hooks/useContentAccess'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const submissionTypes = [
  { value: 'insight', label: 'Insight Article', description: 'Timely insight on markets, operations, or founder journeys.' },
  { value: 'bestPractice', label: 'Best Practice', description: 'Step-by-step playbooks or field-tested processes.' },
  { value: 'research', label: 'Research Summary', description: 'Summaries of studies, pilots, or impact data.' },
  { value: 'whitepaper', label: 'Whitepaper', description: 'Deep dives on sector trends, technical analyses, or frameworks.' },
]

const maxExcerptLength = 220

export default function ContributorStartPage() {
  const { user, loading } = useContentAccess()
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [submissionType, setSubmissionType] = useState('insight')
  const [excerpt, setExcerpt] = useState('')
  const [topics, setTopics] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const excerptWordCount = useMemo(() => excerpt.trim().split(/\s+/).filter(Boolean).length, [excerpt])

  const canContinue = useMemo(() => {
    return title.trim().length >= 6 && excerpt.trim().length >= 40
  }, [title, excerpt])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 text-center">
        <h1 className="text-2xl font-semibold text-foreground">Sign in to start</h1>
        <p className="max-w-md text-muted-foreground">
          Log in with your contributor account to create and submit Knowledge Hub articles.
        </p>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/auth/login?redirect=/knowledgehub/contributors/start">Sign in</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/auth/signup?redirectTo=/knowledgehub/contributors/start">Create account</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/knowledgehub/contributors">Back to portal</Link>
          </Button>
        </div>
      </div>
    )
  }

  const handleContinue = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canContinue) {
      setFormError('Add a working title and excerpt (minimum ~40 characters).')
      return
    }

    setFormError(null)

    const params = new URLSearchParams({
      title,
      submissionType,
      excerpt,
      topics,
    })

    router.push(`/knowledgehub/contributors/write?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 py-12">
      <div className="mx-auto max-w-4xl space-y-10 px-4">
        <header className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm">
          <div className="relative isolate overflow-hidden">
            <div className="absolute -right-28 -top-24 h-64 w-64 rounded-full bg-emerald-100/70 blur-3xl" />
            <div className="absolute -left-20 bottom-0 h-40 w-40 rounded-full bg-lime-100/70 blur-3xl" />
            <div className="relative flex flex-col gap-6 px-8 py-10 sm:px-10">
              <span className="inline-flex items-center gap-2 self-start rounded-full bg-emerald-100 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700">
                <Sparkles className="h-3.5 w-3.5" />
                New submission
              </span>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-3">
                  <h1 className="text-3xl font-semibold text-emerald-950 md:text-4xl">Outline your article idea</h1>
                  <p className="max-w-2xl text-sm text-emerald-900/80">
                    Start with a working title, choose the most relevant submission type, and capture a short teaser. You can refine everything inside the drafting workspace.
                  </p>
                </div>
                <div className="hidden h-full min-w-[180px] sm:block">
                  <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-600 to-teal-600 p-5 text-white shadow-lg">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
                      <PenSquare className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-medium leading-5">
                      Tip: keep the excerpt punchy—editors use it to queue the right review team.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <form
          onSubmit={handleContinue}
          className="space-y-8 rounded-3xl border border-emerald-100 bg-white p-8 shadow-sm md:p-10"
        >
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-emerald-900">
              Working title
            </Label>
            <div className="relative">
              <Input
                id="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g., Unlocking Cooperative Financing in Northern Ghana"
                required
                className="bg-white text-base leading-6 text-emerald-950 shadow-sm focus-visible:ring-2 focus-visible:ring-emerald-500"
              />
              <NotebookPen className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500" />
            </div>
            <p className="text-xs text-muted-foreground">Make it descriptive. You can refine it after drafting.</p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-emerald-900">Submission type</Label>
            <Select value={submissionType} onValueChange={setSubmissionType}>
              <SelectTrigger className="bg-white text-sm shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="bg-white text-sm text-emerald-900 shadow-lg">
                {submissionTypes.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="rounded-lg py-2 text-sm font-medium text-emerald-900 focus:bg-emerald-50 data-[state=checked]:bg-emerald-100"
                  >
                    <div className="space-y-1">
                      <p>{option.label}</p>
                      <p className="text-xs font-normal text-emerald-800/80">{option.description}</p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt" className="text-sm font-medium text-emerald-900">
              Short excerpt
            </Label>
            <Textarea
              id="excerpt"
              value={excerpt}
              onChange={(event) => setExcerpt(event.target.value)}
              rows={4}
              maxLength={maxExcerptLength}
              placeholder="Summarise the key insight, outcome, or case study you’ll cover in ~2-3 sentences."
              required
              className="resize-none bg-white leading-6 text-emerald-950 shadow-sm focus-visible:ring-2 focus-visible:ring-emerald-500"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{excerpt.length}/{maxExcerptLength} characters</span>
              <span>{excerptWordCount} words</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="topics" className="text-sm font-medium text-emerald-900">
              Topics (optional)
            </Label>
            <Input
              id="topics"
              value={topics}
              onChange={(event) => setTopics(event.target.value)}
              placeholder="Comma-separated keywords (e.g., cooperative finance, climate resilience)"
              className="bg-white text-sm leading-6 text-emerald-950 shadow-sm focus-visible:ring-2 focus-visible:ring-emerald-500"
            />
          </div>

          {formError ? <p className="text-sm text-red-600">{formError}</p> : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button asChild variant="ghost" className="text-emerald-700 hover:bg-emerald-50">
              <Link href="/knowledgehub/contributors">Cancel</Link>
            </Button>
            <Button
              type="submit"
              disabled={!canContinue}
              className="inline-flex items-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
            >
              Continue to drafting
            </Button>
          </div>
        </form>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-emerald-900">
              <PenSquare className="h-5 w-5 text-emerald-600" />
              Submission guidelines
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>• Focus on insights, case studies, or frameworks agribusiness founders can apply.</li>
              <li>• Avoid promotional content. Keep the tone practical and execution-focused.</li>
              <li>• Include data, examples, or lessons from the field whenever possible.</li>
              <li>• Aim for clarity over jargon — help readers act on what you’ve learned.</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-emerald-900">
              <Sparkles className="h-5 w-5 text-emerald-600" />
              Quick preview
            </h2>
            <p className="mt-4 text-base font-semibold text-emerald-950">{title || 'Untitled submission'}</p>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {submissionTypes.find((option) => option.value === submissionType)?.label || 'Choose type'}
            </p>
            <p className="mt-3 line-clamp-4 text-sm text-muted-foreground">
              {excerpt || 'Add a short excerpt to describe the piece.'}
            </p>
            <div className="mt-4 text-xs text-muted-foreground">{excerptWordCount} words in excerpt</div>
          </div>
        </section>
      </div>
    </div>
  )
}
