'use client'

import imageUrlBuilder from '@sanity/image-url'

import { dataset, projectId } from '@/sanity/env'

const builder = imageUrlBuilder({ projectId, dataset })

type ImageValue = {
  asset?: {
    _ref?: string
  }
}

type ImageInputProps = {
  value?: ImageValue
  renderDefault: (props: ImageInputProps) => React.ReactNode
}

export default function FullHeightImageInput(props: ImageInputProps) {
  const imageUrl = props.value?.asset?._ref
    ? builder.image(props.value).width(1800).fit('max').auto('format').url()
    : null

  return (
    <div style={{ display: 'grid', gap: '0.75rem' }}>
      {imageUrl ? (
        <div
          style={{
            border: '1px solid #e5e7eb',
            borderRadius: '0.75rem',
            padding: '0.75rem',
            background: '#f8fafc',
          }}
        >
          <div
            style={{
              marginBottom: '0.5rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#475569',
            }}
          >
            Full image preview
          </div>
          <img
            src={imageUrl}
            alt="Selected image preview"
            style={{
              display: 'block',
              width: '100%',
              height: 'auto',
              maxHeight: '70vh',
              objectFit: 'contain',
              borderRadius: '0.5rem',
              background: '#ffffff',
            }}
          />
        </div>
      ) : null}

      {props.renderDefault(props)}
    </div>
  )
}
