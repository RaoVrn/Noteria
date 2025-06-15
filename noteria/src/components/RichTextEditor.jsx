import { useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneLight, oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { 
  Bold, 
  Italic, 
  Code, 
  List, 
  ListOrdered, 
  Link2, 
  Image, 
  Eye, 
  Edit3,
  Copy,
  Check
} from 'lucide-react'

const RichTextEditor = ({ value, onChange, darkMode }) => {
  const [isPreview, setIsPreview] = useState(false)
  const [copied, setCopied] = useState(false)
  const textareaRef = useRef(null)

  const insertAtCursor = (text) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const newValue = value.substring(0, start) + text + value.substring(end)
    
    onChange(newValue)
    
    // Set cursor position after insertion
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + text.length, start + text.length)
    }, 0)
  }

  const wrapSelection = (prefix, suffix = prefix) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    
    const newText = prefix + selectedText + suffix
    const newValue = value.substring(0, start) + newText + value.substring(end)
    
    onChange(newValue)
    
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + prefix.length, end + prefix.length)
    }, 0)
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const toolbarButtons = [
    { icon: Bold, action: () => wrapSelection('**'), tooltip: 'Bold' },
    { icon: Italic, action: () => wrapSelection('*'), tooltip: 'Italic' },
    { icon: Code, action: () => wrapSelection('`'), tooltip: 'Inline Code' },
    { icon: List, action: () => insertAtCursor('\n- '), tooltip: 'Bullet List' },
    { icon: ListOrdered, action: () => insertAtCursor('\n1. '), tooltip: 'Numbered List' },
    { icon: Link2, action: () => insertAtCursor('[link text](url)'), tooltip: 'Link' },
    { icon: Image, action: () => insertAtCursor('![alt text](image-url)'), tooltip: 'Image' },
  ]

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center space-x-2">
          {toolbarButtons.map((button, index) => (
            <button
              key={index}
              onClick={button.action}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
              title={button.tooltip}
            >
              <button.icon size={16} />
            </button>
          ))}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsPreview(!isPreview)}
            className={`flex items-center space-x-2 px-3 py-1 rounded text-sm transition-colors ${
              isPreview 
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {isPreview ? <Edit3 size={16} /> : <Eye size={16} />}
            <span>{isPreview ? 'Edit' : 'Preview'}</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="relative">
        {isPreview ? (
          <div className="p-4 min-h-[300px] prose dark:prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '')
                  const codeString = String(children).replace(/\n$/, '')
                  
                  return !inline && match ? (
                    <div className="relative">
                      <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-900 px-4 py-2 rounded-t-lg">
                        <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                          {match[1]}
                        </span>
                        <button
                          onClick={() => copyToClipboard(codeString)}
                          className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                        >
                          {copied ? <Check size={14} /> : <Copy size={14} />}
                          <span>{copied ? 'Copied!' : 'Copy'}</span>
                        </button>
                      </div>
                      <SyntaxHighlighter
                        style={darkMode ? oneDark : oneLight}
                        language={match[1]}
                        PreTag="div"
                        className="!mt-0 !rounded-t-none"
                        {...props}
                      >
                        {codeString}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm" {...props}>
                      {children}
                    </code>
                  )
                }
              }}
            >
              {value || '*Start typing to see preview...*'}
            </ReactMarkdown>
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Start writing your note... Use Markdown for formatting!"
            className="w-full h-[400px] p-4 border-none outline-none resize-none bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        )}
      </div>

      {/* Help Text */}
      {!isPreview && (
        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Supports Markdown formatting. Use ** for bold, * for italic, ` for code, and more.
          </p>
        </div>
      )}
    </div>
  )
}

export default RichTextEditor
