import React, { useState, useEffect, useRef } from 'react';

interface BookChapterTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const BookChapterTextEditor: React.FC<BookChapterTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Enter chapter description here..."
}) => {
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const text = value.replace(/<[^>]*>/g, '');
    setWordCount(text.split(/\s+/).filter(word => word.length > 0).length);
    setCharCount(text.length);
  }, [value]);

  // Update editor content when value prop changes
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  // Prevent default behavior for certain keys
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
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
          execCommand('undo');
          break;
        case 'y':
          e.preventDefault();
          execCommand('redo');
          break;
        default:
          break;
      }
    }
    
    // Prevent Enter from creating new paragraphs in some cases
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      execCommand('insertHTML', '<br>');
    }
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const content = e.currentTarget.innerHTML;
    onChange(content);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    execCommand('insertText', text);
  };

  const execCommand = (command: string, value?: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, value);
      // Manually trigger the onChange
      const content = editorRef.current.innerHTML;
      onChange(content);
    }
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      execCommand('insertImage', url);
    }
  };

  const clearFormatting = () => {
    execCommand('removeFormat');
  };

  return (
    <div className="book-chapter-rich-text-editor">
      {/* Professional Toolbar */}
      <div className="book-chapter-editor-toolbar">
        <div className="book-chapter-toolbar-section">
          {/* Text Formatting */}
          <div className="book-chapter-toolbar-group">
            <button 
              className="book-chapter-toolbar-btn" 
              title="Bold" 
              onClick={() => execCommand('bold')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button 
              className="book-chapter-toolbar-btn" 
              title="Italic" 
              onClick={() => execCommand('italic')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <line x1="19" y1="4" x2="10" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="14" y1="20" x2="5" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="15" y1="4" x2="9" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button 
              className="book-chapter-toolbar-btn" 
              title="Underline" 
              onClick={() => execCommand('underline')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="4" y1="21" x2="20" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button 
              className="book-chapter-toolbar-btn" 
              title="Strikethrough" 
              onClick={() => execCommand('strikeThrough')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M16 4H9a3 3 0 0 0-3 3v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 20h8a3 3 0 0 0 3-3v-1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          <div className="book-chapter-toolbar-divider"></div>

          {/* Text Alignment */}
          <div className="book-chapter-toolbar-group">
            <button 
              className="book-chapter-toolbar-btn" 
              title="Align Left" 
              onClick={() => execCommand('justifyLeft')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <line x1="17" y1="10" x2="3" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="13" y1="6" x2="3" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="13" y1="14" x2="3" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="17" y1="18" x2="3" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button 
              className="book-chapter-toolbar-btn" 
              title="Align Center" 
              onClick={() => execCommand('justifyCenter')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <line x1="18" y1="10" x2="6" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="15" y1="6" x2="9" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="15" y1="14" x2="9" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="18" y1="18" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button 
              className="book-chapter-toolbar-btn" 
              title="Align Right" 
              onClick={() => execCommand('justifyRight')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <line x1="21" y1="10" x2="7" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="21" y1="6" x2="11" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="21" y1="14" x2="11" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="21" y1="18" x2="7" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button 
              className="book-chapter-toolbar-btn" 
              title="Justify" 
              onClick={() => execCommand('justifyFull')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <line x1="21" y1="10" x2="3" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="21" y1="6" x2="3" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="21" y1="14" x2="3" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="21" y1="18" x2="3" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          <div className="book-chapter-toolbar-divider"></div>

          {/* Lists */}
          <div className="book-chapter-toolbar-group">
            <button 
              className="book-chapter-toolbar-btn" 
              title="Bulleted List" 
              onClick={() => execCommand('insertUnorderedList')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <line x1="8" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="8" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="8" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="3" y1="6" x2="3.01" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="3" y1="12" x2="3.01" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="3" y1="18" x2="3.01" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button 
              className="book-chapter-toolbar-btn" 
              title="Numbered List" 
              onClick={() => execCommand('insertOrderedList')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <line x1="10" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="10" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="10" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 6h1v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 10h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          <div className="book-chapter-toolbar-divider"></div>

          {/* Advanced Features */}
          <div className="book-chapter-toolbar-group">
            <button 
              className="book-chapter-toolbar-btn" 
              title="Insert Link" 
              onClick={insertLink}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button 
              className="book-chapter-toolbar-btn" 
              title="Insert Image" 
              onClick={insertImage}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="21,15 16,10 5,21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button 
              className="book-chapter-toolbar-btn" 
              title="Remove Link" 
              onClick={() => execCommand('unlink')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="2" y1="2" x2="22" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          <div className="book-chapter-toolbar-divider"></div>

          {/* Utility Controls */}
          <div className="book-chapter-toolbar-group">
            <button 
              className="book-chapter-toolbar-btn" 
              title="Undo" 
              onClick={() => execCommand('undo')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M3 7v6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button 
              className="book-chapter-toolbar-btn" 
              title="Redo" 
              onClick={() => execCommand('redo')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M21 7v6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button 
              className="book-chapter-toolbar-btn" 
              title="Clear Formatting" 
              onClick={() => execCommand('removeFormat')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M4 7V4h16v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5 7h14l-1 13H6L5 7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="9" y1="11" x2="15" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Editor Content Area */}
      <div 
        ref={editorRef}
        className="book-chapter-editor-content"
        contentEditable
        suppressContentEditableWarning={true}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        style={{ minHeight: '200px' }}
        data-placeholder={placeholder}
      />

      {/* Editor Footer */}
      <div className="book-chapter-editor-footer">
        <div className="book-chapter-editor-stats">
          <span className="book-chapter-word-count">
            Words: {wordCount}
          </span>
          <span className="book-chapter-char-count">
            Characters: {charCount}
          </span>
        </div>
        <div className="book-chapter-editor-format">
          <span>HTML</span>
        </div>
      </div>
    </div>
  );
};

export default BookChapterTextEditor;
