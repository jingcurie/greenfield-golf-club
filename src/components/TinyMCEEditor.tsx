import { useEffect, useRef } from "react";

interface TinyMCEEditorProps {
  content: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
}

export default function TinyMCEEditor({
  content,
  onChange,
  placeholder = "请输入内容...",
  height = 300,
}: TinyMCEEditorProps) {
  const editorId = useRef(`editor-${Math.random().toString(36).substr(2, 9)}`);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;

    const script = document.createElement('script');
    script.src = '/tinymce/tinymce.min.js';
    script.onload = () => {
      if (window.tinymce) {
        window.tinymce.init({
          selector: `#${editorId.current}`,
          height: height,
          menubar: false,
          plugins: 'lists link image table code',
          toolbar: 'undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist | link image | code',
          placeholder: placeholder,
          branding: false,
          statusbar: false,
          promotion: false,
          license_key: 'gpl',
          setup: (editor: any) => {
            editor.on('init', () => {
              editor.setContent(content);
            });
            editor.on('change keyup', () => {
              onChange(editor.getContent());
            });
          }
        });
        initialized.current = true;
      }
    };
    document.head.appendChild(script);

    return () => {
      if (window.tinymce) {
        window.tinymce.remove(`#${editorId.current}`);
      }
    };
  }, []);

  useEffect(() => {
    if (window.tinymce && initialized.current) {
      const editor = window.tinymce.get(editorId.current);
      if (editor && editor.getContent() !== content) {
        editor.setContent(content);
      }
    }
  }, [content]);

  return <textarea id={editorId.current} />;
}

declare global {
  interface Window {
    tinymce: any;
  }
}
