import React from 'react'

interface SimpleTextEditorProps {
  content: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  rows?: number
}

export default function SimpleTextEditor({ 
  content, 
  onChange, 
  placeholder = "开始输入...",
  className = "",
  rows = 6
}: SimpleTextEditorProps) {
  return (
    <textarea
      value={content}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golf-500 focus:border-transparent resize-vertical ${className}`}
    />
  )
}