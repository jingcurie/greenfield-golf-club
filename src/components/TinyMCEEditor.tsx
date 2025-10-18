import { useEffect, useRef } from "react";
import { uploadImageToSupabase, validateImageFile } from "../utils/imageUpload";

interface TinyMCEEditorProps {
  content: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
  editorId?: string;
}

export default function TinyMCEEditor({
  content,
  onChange,
  placeholder = "请输入内容...",
  height = 300,
  editorId: propEditorId,
}: TinyMCEEditorProps) {
  const editorId = useRef(propEditorId || `editor-${Math.random().toString(36).substr(2, 9)}`);
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
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'help', 'wordcount', 'emoticons',
            'template', 'codesample', 'hr', 'pagebreak', 'nonbreaking', 'toc',
            'imagetools', 'textpattern', 'noneditable', 'quickbars', 'accordion'
          ],
          toolbar: [
            'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | forecolor backcolor | alignleft aligncenter alignright alignjustify',
            'bullist numlist outdent indent | removeformat | help | link image media table | emoticons charmap | code fullscreen preview | searchreplace | wordcount'
          ],
          toolbar_mode: 'sliding',
          contextmenu: 'link image imagetools table spellchecker configurepermanentpen',
          menubar: 'file edit view insert format tools table help',
          menu: {
            file: { title: '文件', items: 'newdocument restoredraft | preview | export print | deleteallconversations' },
            edit: { title: '编辑', items: 'undo redo | cut copy paste pastetext | selectall | searchreplace' },
            view: { title: '视图', items: 'code | visualaid visualchars visualblocks | spellchecker | preview fullscreen | showcomments' },
            insert: { title: '插入', items: 'image link media template codesample inserttable | charmap emoticons hr | pagebreak nonbreaking anchor toc | insertdatetime' },
            format: { title: '格式', items: 'bold italic underline strikethrough superscript subscript codeformat | blocks fontfamily fontsize align lineheight | forecolor backcolor removeformat' },
            tools: { title: '工具', items: 'spellchecker spellcheckerlanguage | a11ycheck code wordcount' },
            table: { title: '表格', items: 'inserttable | cell row column | tableprops deletetable' },
            help: { title: '帮助', items: 'help' }
          },
          placeholder: placeholder,
          branding: false,
          statusbar: true,
          promotion: false,
          license_key: 'gpl',
          language: 'zh_CN',
          content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif; font-size: 14px; }',
          font_family_formats: '微软雅黑=Microsoft YaHei,Helvetica Neue,PingFang SC,sans-serif;苹果苹方=PingFang SC,Microsoft YaHei,sans-serif;宋体=simsun,serif;仿宋体=FangSong,serif;黑体=SimHei,sans-serif;Arial=arial,helvetica,sans-serif;Arial Black=arial black,avant garde;Times New Roman=times new roman,times;Courier New=courier new,courier;',
          fontsize_formats: '8px 10px 12px 14px 16px 18px 20px 24px 28px 32px 36px 48px 64px 72px 96px',
          image_advtab: true,
          image_caption: true,
          image_title: true,
          image_description: true,
          image_dimensions: true,
          image_class_list: [
            {title: 'Responsive', value: 'img-responsive'},
            {title: 'Rounded', value: 'img-rounded'},
            {title: 'Circle', value: 'img-circle'},
            {title: 'Thumbnail', value: 'img-thumbnail'}
          ],
          table_default_attributes: {
            border: '1'
          },
          table_default_styles: {
            'border-collapse': 'collapse',
            'width': '100%'
          },
          table_class_list: [
            {title: 'None', value: ''},
            {title: 'Table', value: 'table'},
            {title: 'Striped', value: 'table table-striped'},
            {title: 'Bordered', value: 'table table-bordered'},
            {title: 'Hover', value: 'table table-hover'}
          ],
          templates: [
            {
              title: '活动回顾模板',
              description: '标准活动回顾文章模板',
              content: `
                <h2>活动精彩回顾</h2>
                <p><strong>活动时间：</strong></p>
                <p><strong>活动地点：</strong></p>
                <p><strong>参与人数：</strong></p>
                <hr>
                <h3>活动亮点</h3>
                <ul>
                  <li></li>
                  <li></li>
                  <li></li>
                </ul>
                <h3>精彩瞬间</h3>
                <p></p>
                <h3>感谢与展望</h3>
                <p></p>
              `
            }
          ],
          images_upload_handler: async (blobInfo: any, progress: any) => {
            try {
              // 验证文件
              const file = blobInfo.blob() as File
              validateImageFile(file)
              
              // 显示上传进度
              progress(0)
              
              // 上传到 Supabase
              const result = await uploadImageToSupabase(file, 'poster-images', 'articles')
              
              if (result.success && result.url) {
                progress(100)
                return result.url
              } else {
                throw new Error(result.error || '上传失败')
              }
            } catch (error) {
              console.error('图片上传失败:', error)
              throw error
            }
          },
          setup: (editor: any) => {
            editor.on('init', () => {
              console.log('TinyMCE 初始化，设置内容:', content);
              console.log('TinyMCE 初始化，内容长度:', content?.length);
              
              // 强制设置 LTR 方向
              editor.getBody().style.direction = 'ltr';
              editor.getBody().style.textAlign = 'left';
              
              if (content) {
                editor.setContent(content);
                console.log('初始化后编辑器内容:', editor.getContent());
              }
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

  // 监听 content 变化，更新编辑器内容
  useEffect(() => {
    if (window.tinymce) {
      const editor = window.tinymce.get(editorId.current);
      if (editor && editor.getContent) {
        const currentContent = editor.getContent();
        // 只有当内容真正不同时才更新，避免无限循环
        if (currentContent !== content) {
          console.log('TinyMCE 更新内容:', content);
          console.log('TinyMCE 当前编辑器内容:', currentContent);
          editor.setContent(content);
          console.log('设置后编辑器内容:', editor.getContent());
        }
      } else {
        console.log('TinyMCE 编辑器未找到或未初始化');
        // 如果编辑器还没初始化，延迟重试
        if (content) {
          setTimeout(() => {
            const retryEditor = window.tinymce.get(editorId.current);
            if (retryEditor && retryEditor.getContent) {
              console.log('TinyMCE 延迟设置内容:', content);
              retryEditor.setContent(content);
            }
          }, 1000);
        }
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