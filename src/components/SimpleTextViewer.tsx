import React from 'react'

interface SimpleTextViewerProps {
  content: string
  className?: string
}

export default function SimpleTextViewer({ content, className = "" }: SimpleTextViewerProps) {
  return (
    <div className={`whitespace-pre-wrap text-gray-700 ${className}`}>
      {content}
    </div>
  )
}