import React, { useState, useRef, useCallback } from 'react';

// Import styles
import '../../styles/components/modernUpload.css';

interface DocumentUploadProps {
  selectedFile: File | null;
  filePreview: string | null;
  existingFile: string | null;
  fileLoading: boolean;
  isDragOver: boolean;
  onFileSelect: (file: File) => void;
  onFileDelete: () => void;
  onUploadClick: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  accept?: string;
  maxSize?: number; // in MB
  disabled?: boolean;
  className?: string;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  selectedFile,
  filePreview,
  existingFile,
  fileLoading,
  isDragOver,
  onFileSelect,
  onFileDelete,
  onUploadClick,
  onDragOver,
  onDragLeave,
  onDrop,
  accept = "image/*,.pdf,.doc,.docx",
  maxSize = 10, // 10MB default
  disabled = false,
  className = ""
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File validation helper
  const validateFile = useCallback((file: File): { isValid: boolean; error?: string } => {
    // Check file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Please select a valid file type (JPG, PNG, GIF, PDF, DOC, DOCX)'
      };
    }
    
    // Check file size
    const maxSizeBytes = maxSize * 1024 * 1024; // Convert MB to bytes
    if (file.size > maxSizeBytes) {
      return {
        isValid: false,
        error: `File size must be less than ${maxSize}MB`
      };
    }
    
    return { isValid: true };
  }, [maxSize]);

  // Process file selection
  const processFile = useCallback((file: File) => {
    console.log('Processing file:', file.name);
    
    // Validate file
    const validation = validateFile(file);
    if (!validation.isValid) {
      console.log('File validation failed:', validation.error);
      return;
    }
    
    console.log('File validation passed, storing file');
    // Store the file
    onFileSelect(file);
    
    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          // This will be handled by the parent component
          console.log('Image preview created');
        }
      };
      reader.readAsDataURL(file);
    }
  }, [validateFile, onFileSelect]);

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('=== FILE INPUT CHANGE ===');
    console.log('Event target:', e.target);
    console.log('Files in input:', e.target.files);
    
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.target.files;
    if (files && files.length > 0) {
      console.log('File selected:', files[0].name);
      processFile(files[0]);
    }
    
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      onDragOver(e);
    }
  };

  // Handle drag leave
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      onDragLeave(e);
    }
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    
    console.log('=== FILE DROPPED ===');
    console.log('DataTransfer files:', e.dataTransfer.files);
    console.log('Files length:', e.dataTransfer.files.length);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      console.log('File dropped:', files[0].name);
      processFile(files[0]);
    }
    
    onDrop(e);
  };

  // Handle upload click
  const handleUploadClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  // Handle delete file
  const handleDeleteFile = (e: React.MouseEvent) => {
    console.log('=== DELETE FILE CLICKED ===');
    e.preventDefault();
    e.stopPropagation();
    onFileDelete();
  };

  const hasFile = filePreview || existingFile || selectedFile;

  return (
    <div className={`document-upload-container ${className}`}>
      <div
        key={`upload-area-${hasFile ? 'has-file' : 'empty'}`}
        className={`modern-upload-area ${isDragOver ? 'drag-over' : ''} ${hasFile ? 'has-file' : ''} ${disabled ? 'disabled' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* File Preview */}
        {hasFile ? (
          <div className="file-preview-container">
            {fileLoading && (
              <div className="file-loading-overlay">
                <div className="loading-spinner"></div>
                <p>Loading file...</p>
              </div>
            )}
            
            {selectedFile?.type.startsWith('image/') || (existingFile && typeof existingFile === 'string' && existingFile.startsWith('data:image/')) ? (
              <img
                src={filePreview || existingFile || ''}
                alt="File preview"
                className="file-preview-image"
                onClick={handleUploadClick}
                onLoad={() => {
                  console.log('Image preview loaded');
                }}
                onError={() => {
                  console.error('Failed to load image preview');
                }}
              />
            ) : (
              <div 
                className="file-preview-document"
                onClick={handleUploadClick}
              >
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p className="file-name">{selectedFile?.name || (existingFile && typeof existingFile === 'string' ? existingFile : 'Document')}</p>
              </div>
            )}
            
            <button
              type="button"
              className="delete-file-btn"
              data-action="delete"
              onClick={handleDeleteFile}
              title="Remove file"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        ) : (
          <div className="upload-placeholder" onClick={handleUploadClick}>
            <div className="upload-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path d="M21 15V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V5A2 2 0 0 1 5 3H19A2 2 0 0 1 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17 8L12 3L7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="upload-text">
              <p className="upload-main-text">Drag & drop your file here</p>
              <p className="upload-sub-text">or <span className="click-here">click to browse</span></p>
            </div>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden-file-input"
          accept={accept}
          onChange={handleFileChange}
          disabled={disabled}
        />
      </div>

      {/* Upload Info */}
      <div className="upload-info">
        <p className="upload-hint">
          Supported formats: JPG, PNG, GIF, PDF, DOC, DOCX (Max {maxSize}MB)
        </p>
      </div>
    </div>
  );
};

export default DocumentUpload;
