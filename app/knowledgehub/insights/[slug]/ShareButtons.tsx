'use client'

import { Twitter, Linkedin, Facebook, Link2, Check } from 'lucide-react'
import { useState } from 'react'

interface ShareButtonsProps {
  title: string
  url: string
}

export default function ShareButtons({ title, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="flex gap-2">
      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-blue-100 hover:text-blue-500"
        title="Share on Twitter"
      >
        <Twitter className="h-4 w-4" />
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-blue-100 hover:text-blue-700"
        title="Share on LinkedIn"
      >
        <Linkedin className="h-4 w-4" />
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-blue-100 hover:text-blue-600"
        title="Share on Facebook"
      >
        <Facebook className="h-4 w-4" />
      </a>
      <button
        onClick={handleCopyLink}
        className={`flex h-10 w-10 items-center justify-center rounded-full transition ${
          copied 
            ? 'bg-green-100 text-green-700' 
            : 'bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-700'
        }`}
        title={copied ? 'Copied!' : 'Copy link'}
      >
        {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
      </button>
    </div>
  )
}
