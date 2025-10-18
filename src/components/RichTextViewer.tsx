import React from 'react'

interface RichTextViewerProps {
  content: string
  className?: string
}

export default function RichTextViewer({ content, className = "" }: RichTextViewerProps) {
  return (
    <div 
      className={`rich-text-viewer prose max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}