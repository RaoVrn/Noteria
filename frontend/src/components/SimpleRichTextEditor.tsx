import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Heading1, 
  Heading2, 
  Heading3,
  Image,
  Link,
  Save,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  Type,
  Highlighter,
  Minus,
  Upload,
  FileText,
  ChevronUp,
  ChevronDown,
  Maximize2,
  Minimize2,
  RotateCcw,
  RotateCw,
  Table,
  Indent,
  Outdent,
  Subscript,
  Superscript,
  Settings,
  MoreHorizontal,
  Zap,
  Grid3X3,
  Hash,
  Pen,
  PenTool,
  Eraser,
  Globe,
  Square,
  Circle,
  Eye,
  EyeOff,
  Download,
  CheckSquare,
  Calendar,
  Clock,
  MapPin,
  Smile,
  Languages
} from 'lucide-react';

interface SimpleRichTextEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  onSave?: (content: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
  onNavigateUp?: () => void;
  onNavigateDown?: () => void;
  hasNextNote?: boolean;
  hasPreviousNote?: boolean;
}

const SimpleRichTextEditor: React.FC<SimpleRichTextEditorProps> = ({
  content = '',
  onChange,
  onSave,
  placeholder = 'Start writing your note...',
  readOnly = false,
  className = '',
  onNavigateUp,
  onNavigateDown,
  hasNextNote = false,
  hasPreviousNote = false
}) => {
  const [editorContent, setEditorContent] = useState(content);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showAdvancedMenu, setShowAdvancedMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  
  // Drawing state
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawingTool, setDrawingTool] = useState<'pen' | 'pencil' | 'eraser'>('pen');
  const [drawingColor, setDrawingColor] = useState('#000000');
  const [drawingSize, setDrawingSize] = useState(3);
  const [showDrawingPanel, setShowDrawingPanel] = useState(false);
  
  // Language and text direction
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [textDirection, setTextDirection] = useState<'ltr' | 'rtl'>('ltr');
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  
  // Additional features
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showInsertMenu, setShowInsertMenu] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);

  // Close dropdowns when clicking outside - simplified approach
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Close dropdowns if clicking outside
      if (!target.closest('.color-picker-container')) {
        setShowColorPicker(false);
      }
      if (!target.closest('.highlight-picker-container')) {
        setShowHighlightPicker(false);
      }
      if (!target.closest('.advanced-menu-container')) {
        setShowAdvancedMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (editorRef.current && content !== editorContent) {
      editorRef.current.innerHTML = content;
      setEditorContent(content);
    }
  }, [content, editorContent]);

  // Force left-to-right text direction on mount and content changes
  useEffect(() => {
    if (editorRef.current) {
      const element = editorRef.current;
      element.dir = 'ltr';
      element.style.direction = 'ltr';
      element.style.textAlign = 'left';
      element.style.unicodeBidi = 'embed';
      
      // Set initial content if provided
      if (content && element.innerHTML !== content) {
        element.innerHTML = content;
      }
    }
  }, [content]);

  // Initialize word count on mount
  useEffect(() => {
    if (content) {
      calculateStats(content);
    }
  }, []);

  // Initialize drawing canvas when drawing mode is enabled
  useEffect(() => {
    if (isDrawingMode && editorRef.current) {
      setTimeout(initDrawingCanvas, 100);
    }
  }, [isDrawingMode]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ensure text direction is maintained
    if (editorRef.current) {
      editorRef.current.style.direction = 'ltr';
      editorRef.current.style.textAlign = 'left';
    }

    // Keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 's':
          e.preventDefault();
          onSave?.(editorContent);
          break;
        case 'b':
          e.preventDefault();
          execCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          execCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          execCommand('underline');
          break;
        case 'z':
          e.preventDefault();
          if (e.shiftKey) {
            execCommand('redo');
          } else {
            execCommand('undo');
          }
          break;
      }
    }

    // Navigation shortcuts
    if (e.altKey) {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          onNavigateUp?.();
          break;
        case 'ArrowDown':
          e.preventDefault();
          onNavigateDown?.();
          break;
      }
    }

    // Markdown shortcuts
    handleMarkdownShortcuts(e);
  };

  const handleMarkdownShortcuts = (e: React.KeyboardEvent) => {
    if (e.key === ' ' && editorRef.current) {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      const textNode = range.startContainer;
      
      if (textNode.nodeType === Node.TEXT_NODE) {
        const text = textNode.textContent || '';
        const beforeCursor = text.substring(0, range.startOffset);
        
        // Check for markdown patterns
        if (beforeCursor.endsWith('#')) {
          e.preventDefault();
          replaceTextBeforeCursor(beforeCursor, '<h1>', '</h1>');
        } else if (beforeCursor.endsWith('##')) {
          e.preventDefault();
          replaceTextBeforeCursor(beforeCursor, '<h2>', '</h2>');
        } else if (beforeCursor.endsWith('###')) {
          e.preventDefault();
          replaceTextBeforeCursor(beforeCursor, '<h3>', '</h3>');
        } else if (beforeCursor.endsWith('*')) {
          e.preventDefault();
          execCommand('insertUnorderedList');
        } else if (beforeCursor.endsWith('1.')) {
          e.preventDefault();
          execCommand('insertOrderedList');
        } else if (beforeCursor.endsWith('>')) {
          e.preventDefault();
          insertHTML('<blockquote class="editor-blockquote">Quote</blockquote>');
        }
      }
    }
  };

  const replaceTextBeforeCursor = (beforeCursor: string, openTag: string, closeTag: string) => {
    const selection = window.getSelection();
    if (!selection) return;

    const range = selection.getRangeAt(0);
    const textNode = range.startContainer;
    
    if (textNode.nodeType === Node.TEXT_NODE && textNode.textContent) {
      const newText = textNode.textContent.substring(0, textNode.textContent.length - beforeCursor.length);
      textNode.textContent = newText;
      
      range.setStart(textNode, newText.length);
      range.collapse(true);
      
      const wrapper = document.createElement('div');
      wrapper.innerHTML = openTag + closeTag;
      const element = wrapper.firstChild as HTMLElement;
      
      range.insertNode(element);
      range.setStart(element, 0);
      range.setEnd(element, 0);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      setEditorContent(newContent);
      onChange?.(newContent);
      calculateStats(newContent);
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const insertHTML = (html: string) => {
    document.execCommand('insertHTML', false, html);
    editorRef.current?.focus();
    handleInput();
  };

  const addLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const addImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const src = e.target?.result as string;
          const id = `img-${Date.now()}`;
          insertImage(src, id);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const addImageFromUrl = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      const id = `img-${Date.now()}`;
      insertImage(url, id);
    }
  };

  const insertImage = (src: string, id: string) => {
    insertHTML(`
      <div class="image-container" style="position: relative; display: inline-block; margin: 16px 0; text-align: center;">
        <img 
          id="${id}"
          src="${src}" 
          alt="Image" 
          style="max-width: 100%; height: auto; border-radius: 12px; cursor: pointer; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); transition: all 0.3s ease;"
          onmouseover="this.style.transform='scale(1.02)'; this.style.boxShadow='0 20px 40px -10px rgba(0, 0, 0, 0.15), 0 8px 16px -4px rgba(0, 0, 0, 0.1)';"
          onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';"
          onclick="window.selectImage && window.selectImage('${id}')"
        />
        <div class="image-resize-handles" id="handles-${id}" style="display: none; position: absolute; top: -8px; right: -8px; bottom: -8px; left: -8px; border: 2px dashed #3B82F6; border-radius: 16px; background: rgba(59, 130, 246, 0.05);">
          <div style="position: absolute; bottom: -6px; right: -6px; width: 12px; height: 12px; background: #3B82F6; border: 2px solid white; border-radius: 50%; cursor: se-resize; box-shadow: 0 2px 4px rgba(0,0,0,0.2);" class="resize-handle" onmousedown="window.startResize && window.startResize(event, '${id}')"></div>
          <div style="position: absolute; top: 8px; right: 8px; background: rgba(239, 68, 68, 0.9); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold;" onclick="window.removeImage && window.removeImage('${id}')" title="Remove image">&times;</div>
        </div>
      </div>
    `);
    
    // Set up image interaction
    setTimeout(() => setupImageInteraction(id), 100);
  };

  const setupImageInteraction = (id: string) => {
    (window as any).selectImage = (imageId: string) => {
      // Hide all other resize handles
      document.querySelectorAll('.image-resize-handles').forEach(handle => {
        (handle as HTMLElement).style.display = 'none';
      });
      
      // Show this image's resize handles
      const handles = document.getElementById(`handles-${imageId}`);
      if (handles) {
        handles.style.display = 'block';
      }
    };

    (window as any).removeImage = (imageId: string) => {
      const container = document.getElementById(imageId)?.closest('.image-container');
      if (container && confirm('Remove this image?')) {
        container.remove();
        handleInput();
      }
    };

    (window as any).startResize = (event: MouseEvent, imageId: string) => {
      event.preventDefault();
      event.stopPropagation();
      
      const img = document.getElementById(imageId) as HTMLImageElement;
      if (!img) return;

      const startX = event.clientX;
      const startY = event.clientY;
      const startWidth = img.offsetWidth;
      const startHeight = img.offsetHeight;
      const aspectRatio = startWidth / startHeight;

      const handleMouseMove = (e: MouseEvent) => {
        const deltaX = e.clientX - startX;
        const newWidth = Math.max(100, startWidth + deltaX);
        const newHeight = newWidth / aspectRatio;
        
        img.style.width = `${newWidth}px`;
        img.style.height = `${newHeight}px`;
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        handleInput();
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    // Hide resize handles when clicking elsewhere
    document.addEventListener('click', (e) => {
      if (!(e.target as HTMLElement).closest('.image-container')) {
        document.querySelectorAll('.image-resize-handles').forEach(handle => {
          (handle as HTMLElement).style.display = 'none';
        });
      }
    });
  };

  const setTextColor = (color: string) => {
    execCommand('foreColor', color);
    setShowColorPicker(false);
  };

  const setHighlightColor = (color: string) => {
    execCommand('hiliteColor', color);
    setShowHighlightPicker(false);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const colors = [
    '#000000', '#374151', '#6B7280', '#EF4444', '#F97316', '#EAB308', 
    '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899', '#FFFFFF', '#FCD34D',
    '#A78BFA', '#FB7185', '#34D399', '#60A5FA', '#F472B6', '#FBBF24'
  ];

  const highlightColors = [
    '#FEF08A', '#BBF7D0', '#FECACA', '#BFDBFE', '#E9D5FF', '#FED7AA', '#F3E8FF',
    '#FEE2E2', '#D1FAE5', '#DBEAFE', '#EDE9FE', '#FEF3C7', '#FCE7F3'
  ];

  // Language support
  const languages = [
    { code: 'en', name: 'English', dir: 'ltr' },
    { code: 'ar', name: 'العربية', dir: 'rtl' },
    { code: 'he', name: 'עברית', dir: 'rtl' },
    { code: 'es', name: 'Español', dir: 'ltr' },
    { code: 'fr', name: 'Français', dir: 'ltr' },
    { code: 'de', name: 'Deutsch', dir: 'ltr' },
    { code: 'it', name: 'Italiano', dir: 'ltr' },
    { code: 'ja', name: '日本語', dir: 'ltr' },
    { code: 'ko', name: '한국어', dir: 'ltr' },
    { code: 'zh', name: '中文', dir: 'ltr' },
    { code: 'hi', name: 'हिन्दी', dir: 'ltr' },
    { code: 'ur', name: 'اردو', dir: 'rtl' }
  ];

  // Emoji collection
  const commonEmojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
    '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
    '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
    '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
    '💖', '💕', '💗', '💓', '💘', '💝', '🌟', '⭐', '✨', '🎉',
    '🎊', '🎈', '🎁', '🏆', '🥇', '🎯', '🔥', '💯', '👍', '👏'
  ];

  // Word count and reading time calculation
  const calculateStats = (content: string) => {
    const text = content.replace(/<[^>]*>/g, '').trim();
    const words = text.split(/\s+/).filter(word => word.length > 0).length;
    const readingTime = Math.ceil(words / 200); // Average reading speed
    setWordCount(words);
    setReadingTime(readingTime);
  };

  // Enhanced language switching
  const switchLanguage = (langCode: string) => {
    const language = languages.find(lang => lang.code === langCode);
    if (language) {
      setCurrentLanguage(langCode);
      setTextDirection(language.dir as 'ltr' | 'rtl');
      
      if (editorRef.current) {
        editorRef.current.dir = language.dir;
        editorRef.current.style.direction = language.dir;
        editorRef.current.style.textAlign = language.dir === 'rtl' ? 'right' : 'left';
        editorRef.current.lang = langCode;
      }
    }
    setShowLanguageMenu(false);
  };

  // Drawing functions
  const initDrawingCanvas = () => {
    if (!drawingCanvasRef.current || !editorRef.current) return;
    
    const canvas = drawingCanvasRef.current;
    const editorRect = editorRef.current.getBoundingClientRect();
    
    canvas.width = editorRect.width;
    canvas.height = editorRect.height;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = isDrawingMode ? 'auto' : 'none';
    canvas.style.zIndex = isDrawingMode ? '10' : '1';
  };

  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement> | MouseEvent) => {
    if (!drawingCanvasRef.current || !isDrawingMode) return;
    
    const canvas = drawingCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'clientX' in e ? e.clientX : (e as any).clientX;
    const clientY = 'clientY' in e ? e.clientY : (e as any).clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    
    if (drawingTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = drawingSize * 3;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = drawingColor;
      ctx.lineWidth = drawingSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      if (drawingTool === 'pencil') {
        ctx.globalAlpha = 0.7;
      } else {
        ctx.globalAlpha = 1;
      }
    }
  }, [isDrawingMode, drawingTool, drawingColor, drawingSize]);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement> | MouseEvent) => {
    if (!drawingCanvasRef.current || !isDrawingMode) return;
    
    const canvas = drawingCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'clientX' in e ? e.clientX : (e as any).clientX;
    const clientY = 'clientY' in e ? e.clientY : (e as any).clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  }, [isDrawingMode]);

  const stopDrawing = useCallback(() => {
    if (!drawingCanvasRef.current) return;
    const ctx = drawingCanvasRef.current.getContext('2d');
    if (ctx) {
      ctx.beginPath();
    }
  }, []);

  const clearDrawing = () => {
    if (!drawingCanvasRef.current) return;
    const ctx = drawingCanvasRef.current.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, drawingCanvasRef.current.width, drawingCanvasRef.current.height);
    }
  };

  const saveDrawingAsImage = () => {
    if (!drawingCanvasRef.current) return;
    const canvas = drawingCanvasRef.current;
    const dataURL = canvas.toDataURL('image/png');
    const id = `drawing-${Date.now()}`;
    insertImage(dataURL, id);
    clearDrawing();
    setIsDrawingMode(false);
  };

  const insertTable = () => {
    const rows = prompt('Number of rows (2-10):') || '3';
    const cols = prompt('Number of columns (2-10):') || '3';
    
    const numRows = Math.min(10, Math.max(2, parseInt(rows)));
    const numCols = Math.min(10, Math.max(2, parseInt(cols)));
    
    let tableHTML = '<table class="editor-table" style="border-collapse: collapse; width: 100%; margin: 16px 0; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">';
    
    for (let i = 0; i < numRows; i++) {
      tableHTML += '<tr>';
      for (let j = 0; j < numCols; j++) {
        const cellStyle = 'border: 1px solid #e5e7eb; padding: 12px; background: ' + (i === 0 ? '#f9fafb' : '#ffffff') + ';';
        if (i === 0) {
          tableHTML += `<th style="${cellStyle} font-weight: 600;">Header ${j + 1}</th>`;
        } else {
          tableHTML += `<td style="${cellStyle}">Cell ${i},${j + 1}</td>`;
        }
      }
      tableHTML += '</tr>';
    }
    
    tableHTML += '</table>';
    insertHTML(tableHTML);
  };

  const insertHorizontalRule = () => {
    insertHTML('<hr style="border: none; border-top: 2px solid #e5e7eb; margin: 24px 0; border-radius: 1px;" />');
  };

  const insertCodeBlock = () => {
    const language = prompt('Programming language (optional):') || '';
    const languageClass = language ? ` language-${language}` : '';
    insertHTML(`
      <pre class="editor-code-block${languageClass}" style="
        background: #1f2937; 
        color: #f9fafb; 
        padding: 16px; 
        border-radius: 8px; 
        margin: 16px 0; 
        overflow-x: auto; 
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 14px;
        line-height: 1.5;
        position: relative;
      "><code contenteditable="true" style="background: none; color: inherit; padding: 0;">// Your code here</code></pre>
    `);
  };

  const insertCheckbox = () => {
    insertHTML('<label style="display: flex; align-items: center; margin: 8px 0; cursor: pointer;"><input type="checkbox" style="margin-right: 8px; transform: scale(1.2);"> <span contenteditable="true">Task item</span></label>');
  };

  const formatBlock = (tag: string) => {
    execCommand('formatBlock', tag);
  };

  const ToolbarButton: React.FC<{
    onClick: () => void;
    title: string;
    children: React.ReactNode;
    active?: boolean;
    variant?: 'default' | 'primary' | 'danger';
  }> = ({ onClick, title, children, active = false, variant = 'default' }) => {
    const baseClasses = "p-2.5 rounded-lg transition-all duration-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 active:scale-95";
    
    let variantClasses = '';
    if (variant === 'primary') {
      variantClasses = active 
        ? "bg-blue-600 text-white shadow-md" 
        : "bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200";
    } else if (variant === 'danger') {
      variantClasses = "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200";
    } else {
      variantClasses = active 
        ? "bg-gray-800 text-white shadow-md" 
        : "bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-gray-200 hover:border-gray-300 hover:shadow-sm";
    }
    
    return (
      <button
        onClick={onClick}
        title={title}
        className={`${baseClasses} ${variantClasses}`}
        type="button"
      >
        {children}
      </button>
    );
  };

  const DropdownMenu: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
  }> = ({ isOpen, children, className = '' }) => {
    if (!isOpen) return null;
    
    return (
      <div 
        className={`absolute z-50 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 p-2 min-w-[200px] ${className}`}
        style={{ backdropFilter: 'blur(8px)' }}
      >
        {children}
      </div>
    );
  };

  return (
    <>
      {/* Custom CSS for editor elements */}
      <style>{`
        .editor-blockquote {
          border-left: 4px solid #3B82F6;
          padding-left: 16px;
          margin: 16px 0;
          color: #6B7280;
          font-style: italic;
          background: #F8FAFC;
          padding: 12px 16px;
          border-radius: 0 8px 8px 0;
        }
        
        .editor-code {
          background: #F1F5F9;
          color: #DC2626;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 14px;
        }
        
        .editor-code-block {
          background: #1F2937 !important;
          color: #F9FAFB !important;
          padding: 16px !important;
          border-radius: 8px !important;
          margin: 16px 0 !important;
          overflow-x: auto !important;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace !important;
          font-size: 14px !important;
          line-height: 1.5 !important;
          position: relative !important;
        }
        
        .editor-code-block:before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, #3B82F6, #8B5CF6, #EC4899);
        }
        
        .editor-table {
          border-collapse: collapse !important;
          width: 100% !important;
          margin: 16px 0 !important;
          border: 1px solid #E5E7EB !important;
          border-radius: 8px !important;
          overflow: hidden !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
        }
        
        .editor-table th {
          background: #F9FAFB !important;
          font-weight: 600 !important;
          color: #374151 !important;
        }
        
        .editor-table th,
        .editor-table td {
          border: 1px solid #E5E7EB !important;
          padding: 12px !important;
          text-align: left !important;
        }
        
        .editor-table tr:hover {
          background: #F8FAFC !important;
        }
        
        [data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #9CA3AF;
          font-style: italic;
          pointer-events: none;
        }
        
        /* Enhanced list styling */
        ul, ol {
          margin: 16px 0;
          padding-left: 24px;
        }
        
        li {
          margin: 8px 0;
          line-height: 1.6;
        }
        
        /* Enhanced heading styles */
        h1, h2, h3, h4, h5, h6 {
          margin: 24px 0 16px 0;
          font-weight: 700;
          line-height: 1.3;
          color: #1F2937;
        }
        
        h1 { font-size: 2.25rem; border-bottom: 3px solid #3B82F6; padding-bottom: 8px; }
        h2 { font-size: 1.875rem; border-bottom: 2px solid #6B7280; padding-bottom: 4px; }
        h3 { font-size: 1.5rem; color: #4B5563; }
        h4 { font-size: 1.25rem; color: #6B7280; }
        h5 { font-size: 1.125rem; color: #6B7280; }
        h6 { font-size: 1rem; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em; }
        
        /* Link styling */
        a {
          color: #3B82F6;
          text-decoration: underline;
          transition: color 0.2s;
        }
        
        a:hover {
          color: #1D4ED8;
        }
        
        /* Image enhancements */
        .image-container img {
          transition: all 0.3s ease;
        }
        
        .image-container:hover img {
          transform: scale(1.02);
        }
        
        /* Checkbox styling */
        input[type="checkbox"] {
          accent-color: #3B82F6;
        }
        
        /* Drawing canvas cursor */
        .drawing-canvas {
          cursor: crosshair;
        }
        
        .drawing-canvas.pen { cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>') 2 20, crosshair; }
        .drawing-canvas.pencil { cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>') 2 20, crosshair; }
        .drawing-canvas.eraser { cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 21h10l-2-2H9l-2 2z"/><path d="M9.5 17h5l2-2h-9l2 2z"/><path d="M13.5 13h2l2-2h-6l2 2z"/></svg>') 12 12, crosshair; }
      `}</style>
      
      <div className={`rich-text-editor w-full bg-white rounded-xl overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''} ${className}`}>
      {/* Navigation Bar */}
      {(onNavigateUp || onNavigateDown || onSave) && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3 flex items-center justify-between text-white">
          <div className="flex items-center space-x-3">
            {(hasPreviousNote || hasNextNote) && (
              <div className="flex items-center space-x-1">
                <ToolbarButton
                  onClick={onNavigateUp || (() => {})}
                  title="Previous Note (Alt+↑)"
                  variant="primary"
                >
                  <ChevronUp size={16} />
                </ToolbarButton>
                <ToolbarButton
                  onClick={onNavigateDown || (() => {})}
                  title="Next Note (Alt+↓)"
                  variant="primary"
                >
                  <ChevronDown size={16} />
                </ToolbarButton>
              </div>
            )}
            <span className="text-sm opacity-90">
              Press <kbd className="px-1.5 py-0.5 bg-white/20 rounded text-xs">Ctrl+S</kbd> to save
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <ToolbarButton
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              variant="primary"
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </ToolbarButton>
            
            {onSave && (
              <ToolbarButton 
                onClick={() => onSave(editorContent)} 
                title="Save (Ctrl+S)"
                variant="primary"
              >
                <Save size={16} />
                <span className="ml-1 text-sm">Save</span>
              </ToolbarButton>
            )}
          </div>
        </div>
      )}

      {/* Toolbar */}
      {!readOnly && (
        <div className="border-b border-gray-200 p-4 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex flex-wrap items-center gap-2">
            {/* Text Formatting */}
            <div className="flex items-center space-x-1 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
              <ToolbarButton onClick={() => execCommand('bold')} title="Bold (Ctrl+B)">
                <Bold size={16} />
              </ToolbarButton>
              <ToolbarButton onClick={() => execCommand('italic')} title="Italic (Ctrl+I)">
                <Italic size={16} />
              </ToolbarButton>
              <ToolbarButton onClick={() => execCommand('underline')} title="Underline (Ctrl+U)">
                <Underline size={16} />
              </ToolbarButton>
              <ToolbarButton onClick={() => execCommand('strikeThrough')} title="Strikethrough">
                <Strikethrough size={16} />
              </ToolbarButton>
            </div>

            {/* Headings */}
            <div className="flex items-center space-x-1 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
              <ToolbarButton onClick={() => formatBlock('h1')} title="Heading 1">
                <Heading1 size={16} />
              </ToolbarButton>
              <ToolbarButton onClick={() => formatBlock('h2')} title="Heading 2">
                <Heading2 size={16} />
              </ToolbarButton>
              <ToolbarButton onClick={() => formatBlock('h3')} title="Heading 3">
                <Heading3 size={16} />
              </ToolbarButton>
            </div>

            {/* Lists and Alignment */}
            <div className="flex items-center space-x-1 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
              <ToolbarButton onClick={() => execCommand('insertUnorderedList')} title="Bullet List">
                <List size={16} />
              </ToolbarButton>
              <ToolbarButton onClick={() => execCommand('insertOrderedList')} title="Numbered List">
                <ListOrdered size={16} />
              </ToolbarButton>
              <ToolbarButton onClick={() => execCommand('indent')} title="Indent">
                <Indent size={16} />
              </ToolbarButton>
              <ToolbarButton onClick={() => execCommand('outdent')} title="Outdent">
                <Outdent size={16} />
              </ToolbarButton>
            </div>

            {/* Alignment */}
            <div className="flex items-center space-x-1 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
              <ToolbarButton onClick={() => execCommand('justifyLeft')} title="Align Left">
                <AlignLeft size={16} />
              </ToolbarButton>
              <ToolbarButton onClick={() => execCommand('justifyCenter')} title="Align Center">
                <AlignCenter size={16} />
              </ToolbarButton>
              <ToolbarButton onClick={() => execCommand('justifyRight')} title="Align Right">
                <AlignRight size={16} />
              </ToolbarButton>
            </div>

            {/* Colors */}
            <div className="flex items-center space-x-1 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
              <div className="relative color-picker-container">
                <ToolbarButton
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  title="Text Color"
                >
                  <Type size={16} />
                </ToolbarButton>
                <DropdownMenu
                  isOpen={showColorPicker}
                  onClose={() => setShowColorPicker(false)}
                >
                  <div className="grid grid-cols-6 gap-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setTextColor(color)}
                        className="w-8 h-8 rounded-lg border-2 border-gray-200 hover:border-gray-400 transition-colors"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </DropdownMenu>
              </div>
              
              <div className="relative highlight-picker-container">
                <ToolbarButton
                  onClick={() => setShowHighlightPicker(!showHighlightPicker)}
                  title="Highlight Color"
                >
                  <Highlighter size={16} />
                </ToolbarButton>
                <DropdownMenu
                  isOpen={showHighlightPicker}
                  onClose={() => setShowHighlightPicker(false)}
                >
                  <div className="grid grid-cols-4 gap-2">
                    {highlightColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setHighlightColor(color)}
                        className="w-8 h-8 rounded-lg border-2 border-gray-200 hover:border-gray-400 transition-colors"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </DropdownMenu>
              </div>
            </div>

            {/* Media and Links */}
            <div className="flex items-center space-x-1 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
              <ToolbarButton onClick={addLink} title="Add Link">
                <Link size={16} />
              </ToolbarButton>
              <ToolbarButton onClick={addImage} title="Add Image">
                <Image size={16} />
              </ToolbarButton>
            </div>

            {/* Drawing Tools */}
            <div className="flex items-center space-x-1 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
              <div className="relative">
                <ToolbarButton
                  onClick={() => setShowDrawingPanel(!showDrawingPanel)}
                  title="Drawing Tools"
                  active={isDrawingMode}
                  variant={isDrawingMode ? 'primary' : 'default'}
                >
                  <PenTool size={16} />
                </ToolbarButton>
                
                <DropdownMenu
                  isOpen={showDrawingPanel}
                  onClose={() => setShowDrawingPanel(false)}
                >
                  <div className="space-y-3 p-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Drawing Mode</span>
                      <button
                        onClick={() => {
                          setIsDrawingMode(!isDrawingMode);
                          if (!isDrawingMode) initDrawingCanvas();
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                          isDrawingMode 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {isDrawingMode ? 'ON' : 'OFF'}
                      </button>
                    </div>
                    
                    {isDrawingMode && (
                      <>
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-gray-600">Tool</label>
                          <div className="flex space-x-1">
                            {(['pen', 'pencil', 'eraser'] as const).map((tool) => (
                              <button
                                key={tool}
                                onClick={() => setDrawingTool(tool)}
                                className={`p-2 rounded-lg transition-colors ${
                                  drawingTool === tool 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                                title={tool.charAt(0).toUpperCase() + tool.slice(1)}
                              >
                                {tool === 'pen' && <Pen size={14} />}
                                {tool === 'pencil' && <PenTool size={14} />}
                                {tool === 'eraser' && <Eraser size={14} />}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-medium text-gray-600">Color</label>
                          <input
                            type="color"
                            value={drawingColor}
                            onChange={(e) => setDrawingColor(e.target.value)}
                            className="w-full h-8 rounded-lg border border-gray-300"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-medium text-gray-600">Size: {drawingSize}px</label>
                          <input
                            type="range"
                            min="1"
                            max="20"
                            value={drawingSize}
                            onChange={(e) => setDrawingSize(parseInt(e.target.value))}
                            className="w-full"
                          />
                        </div>

                        <div className="flex space-x-1 pt-2 border-t border-gray-200">
                          <button
                            onClick={clearDrawing}
                            className="flex-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            Clear
                          </button>
                          <button
                            onClick={saveDrawingAsImage}
                            className="flex-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                          >
                            Save as Image
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </DropdownMenu>
              </div>
            </div>

            {/* Language Support */}
            <div className="flex items-center space-x-1 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
              <div className="relative">
                <ToolbarButton
                  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                  title="Language & Direction"
                >
                  <Globe size={16} />
                </ToolbarButton>
                
                <DropdownMenu
                  isOpen={showLanguageMenu}
                  onClose={() => setShowLanguageMenu(false)}
                  className="w-48"
                >
                  <div className="space-y-1">
                    <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-200">
                      Current: {languages.find(l => l.code === currentLanguage)?.name}
                    </div>
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => switchLanguage(lang.code)}
                        className={`flex items-center justify-between w-full px-3 py-2 text-sm rounded-lg transition-colors ${
                          currentLanguage === lang.code
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <span>{lang.name}</span>
                        <span className="text-xs text-gray-500">{lang.dir.toUpperCase()}</span>
                      </button>
                    ))}
                  </div>
                </DropdownMenu>
              </div>
            </div>

            {/* Emoji Picker */}
            <div className="flex items-center space-x-1 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
              <div className="relative">
                <ToolbarButton
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  title="Insert Emoji"
                >
                  <Smile size={16} />
                </ToolbarButton>
                
                <DropdownMenu
                  isOpen={showEmojiPicker}
                  onClose={() => setShowEmojiPicker(false)}
                  className="w-64"
                >
                  <div className="p-2">
                    <div className="text-xs font-medium text-gray-600 mb-2">Popular Emojis</div>
                    <div className="grid grid-cols-8 gap-1">
                      {commonEmojis.map((emoji, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            insertHTML(emoji);
                            setShowEmojiPicker(false);
                          }}
                          className="w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors text-lg flex items-center justify-center"
                          title={emoji}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </DropdownMenu>
              </div>
            </div>

            {/* Advanced Options */}
            <div className="relative advanced-menu-container">
              <ToolbarButton
                onClick={() => setShowAdvancedMenu(!showAdvancedMenu)}
                title="More Options"
                variant="primary"
              >
                <MoreHorizontal size={16} />
              </ToolbarButton>
              
              <DropdownMenu
                isOpen={showAdvancedMenu}
                onClose={() => setShowAdvancedMenu(false)}
                className="right-0"
              >
                <div className="space-y-1">
                  <button
                    onClick={() => { insertHTML('<blockquote class="editor-blockquote">Quote</blockquote>'); setShowAdvancedMenu(false); }}
                    className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    <Quote size={16} className="mr-3" />
                    Quote
                  </button>
                  <button
                    onClick={() => { insertHTML('<code class="editor-code">code</code>'); setShowAdvancedMenu(false); }}
                    className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    <Code size={16} className="mr-3" />
                    Inline Code
                  </button>
                  <button
                    onClick={() => { insertCodeBlock(); setShowAdvancedMenu(false); }}
                    className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    <FileText size={16} className="mr-3" />
                    Code Block
                  </button>
                  <button
                    onClick={() => { insertTable(); setShowAdvancedMenu(false); }}
                    className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    <Table size={16} className="mr-3" />
                    Table
                  </button>
                  <button
                    onClick={() => { insertHorizontalRule(); setShowAdvancedMenu(false); }}
                    className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    <Minus size={16} className="mr-3" />
                    Horizontal Rule
                  </button>
                  <button
                    onClick={() => { insertCheckbox(); setShowAdvancedMenu(false); }}
                    className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    <Grid3X3 size={16} className="mr-3" />
                    Checkbox
                  </button>
                  <div className="border-t border-gray-200 my-1"></div>
                  <button
                    onClick={() => { execCommand('subscript'); setShowAdvancedMenu(false); }}
                    className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    <Subscript size={16} className="mr-3" />
                    Subscript
                  </button>
                  <button
                    onClick={() => { execCommand('superscript'); setShowAdvancedMenu(false); }}
                    className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    <Superscript size={16} className="mr-3" />
                    Superscript
                  </button>
                </div>
              </DropdownMenu>
            </div>

            {/* Undo/Redo */}
            <div className="flex items-center space-x-1 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
              <ToolbarButton onClick={() => execCommand('undo')} title="Undo (Ctrl+Z)">
                <RotateCcw size={16} />
              </ToolbarButton>
              <ToolbarButton onClick={() => execCommand('redo')} title="Redo (Ctrl+Shift+Z)">
                <RotateCw size={16} />
              </ToolbarButton>
            </div>
          </div>
          
          {/* Quick Tips */}
          <div className="mt-3 text-xs text-gray-500 bg-blue-50 rounded-lg p-2 border border-blue-200">
            <div className="flex items-center">
              <Zap size={12} className="mr-1 text-blue-600" />
              <span className="font-medium text-blue-800">Quick tips:</span>
              <span className="ml-2">Type <code className="bg-white px-1 rounded"># </code> for heading, <code className="bg-white px-1 rounded">* </code> for list, <code className="bg-white px-1 rounded">&gt; </code> for quote</span>
            </div>
          </div>
        </div>
      )}

      {/* Editor */}
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable={!readOnly}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          dir={textDirection}
          className={`min-h-[500px] p-8 focus:outline-none ${isFullscreen ? 'min-h-[calc(100vh-200px)]' : ''}`}
          style={{
            fontSize: '16px',
            lineHeight: '1.7',
            color: '#374151',
            direction: textDirection,
            textAlign: textDirection === 'rtl' ? 'right' : 'left',
            unicodeBidi: 'embed',
            backgroundColor: '#ffffff',
            writingMode: 'horizontal-tb',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
          }}
          suppressContentEditableWarning={true}
          data-placeholder={placeholder}
        />
        
        {/* Drawing Canvas Overlay */}
        {isDrawingMode && (
          <canvas
            ref={drawingCanvasRef}
            className="absolute top-0 left-0 pointer-events-auto"
            style={{ zIndex: 10 }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
        )}
        
        {/* Word Count and Stats */}
        {!readOnly && (
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 shadow-sm">
            <div className="flex items-center space-x-4">
              <span>{wordCount} words</span>
              <span>{readingTime} min read</span>
              <span className="text-gray-400">|</span>
              <span className="capitalize">{currentLanguage}</span>
              {isDrawingMode && (
                <>
                  <span className="text-gray-400">|</span>
                  <span className="text-blue-600 font-medium">Drawing Mode</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default SimpleRichTextEditor;
