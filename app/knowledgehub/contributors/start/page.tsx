'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import Link from 'next/link'

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
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="mx-auto max-w-4xl space-y-8 px-4">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700">New submission</p>
          <h1 className="text-3xl font-semibold text-emerald-950 md:text-4xl">Outline your article idea</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Start with a working title, choose the most relevant submission type, and write a short excerpt. You can refine everything while drafting.
          </p>
        </header>

        <form onSubmit={handleContinue} className="space-y-6 rounded-3xl border border-emerald-100 bg-white p-8 shadow-sm">
          <div className="space-y-2">
            <Label htmlFor="title">Working title</Label>
            <Input
              id="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g., Unlocking Cooperative Financing in Northern Ghana"
              required
            />
            <p className="text-xs text-muted-foreground">Make it descriptive. You can refine it after drafting.</p>
          </div>

          <div className="space-y-2">
            <Label>Submission type</Label>
            <Select value={submissionType} onValueChange={setSubmissionType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {submissionTypes.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{option.label}</p>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Short excerpt</Label>
            <Textarea
              id="excerpt"
              value={excerpt}
              onChange={(event) => setExcerpt(event.target.value)}
              rows={4}
              maxLength={maxExcerptLength}
              placeholder="Summarise the key insight, outcome, or case study you’ll cover in ~2-3 sentences."
              required
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{excerpt.length}/{maxExcerptLength} characters</span>
              <span>{excerptWordCount} words</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="topics">Topics (optional)</Label>
            <Input
              id="topics"
              value={topics}
              onChange={(event) => setTopics(event.target.value)}
              placeholder="Comma-separated keywords (e.g., cooperative finance, climate resilience)"
            />
          </div>

          {formError ? <p className="text-sm text-red-600">{formError}</p> : null}

          <div className="flex items-center justify-between">
            <Button asChild variant="ghost">
              <Link href="/knowledgehub/contributors">Cancel</Link>
            </Button>
            <Button type="submit" disabled={!canContinue}>
              Continue to drafting
            </Button>
          </div>
        </form>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-emerald-900/10 bg-white p-6">
            <h2 className="text-lg font-semibold text-emerald-900">Submission guidelines</h2>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>• Focus on insights, case studies, or frameworks agribusiness founders can apply.</li>
              <li>• Avoid promotional content. Keep the tone practical and execution-focused.</li>
              <li>• Include data, examples, or lessons from the field whenever possible.</li>
              <li>• Aim for clarity over jargon — help readers act on what you’ve learned.</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-emerald-900">Quick preview</h2>
            <p className="mt-4 text-base font-semibold text-emerald-950">{title || 'Untitled submission'}</p>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {submissionTypes.find((option) => option.value === submissionType)?.label || 'Choose type'}
            </p>
            <p className="mt-3 line-clamp-4 text-sm text-muted-foreground">{excerpt || 'Add a short excerpt to describe the piece.'}</p>
            <div className="mt-4 text-xs text-muted-foreground">{excerptWordCount} words in excerpt</div>
          </div>
        </section>
      </div>
    </div>
  )
}

