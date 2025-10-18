import React from 'react'

interface TinyMCEViewerProps {
  content: string
  className?: string
}

export default function TinyMCEViewer({ content, className = "" }: TinyMCEViewerProps) {
  return (
    <div 
      className={`tinymce-viewer prose max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}