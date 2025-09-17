import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import mammoth from 'mammoth';

// Import react-pdf CSS
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Import styles
import '../../styles/components/documentViewer.css';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface DocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  document: {
    url: string;
    name: string;
  } | null;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  isOpen,
  onClose,
  document
}) => {
  console.log('DocumentViewer rendered with props:', { isOpen, document });
  
  // Document viewer states
  const [documentLoadError, setDocumentLoadError] = useState(false);
  const [documentLoading, setDocumentLoading] = useState(false);
  
  // PDF viewer states
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfError, setPdfError] = useState<string | null>(null);
  
  // DOCX viewer states
  const [docxContent, setDocxContent] = useState<string>('');
  const [docxError, setDocxError] = useState<string | null>(null);

  // Reset states when document changes
  useEffect(() => {
    if (document) {
      setDocumentLoadError(false);
      setDocumentLoading(true);
      setPdfError(null);
      setDocxError(null);
      setDocxContent('');
      setPageNumber(1);
      setNumPages(null);
    }
  }, [document]);

  // Handle document download
  const handleDocumentDownload = () => {
    if (document) {
      const link = window.document.createElement('a');
      link.href = document.url;
      link.download = document.name;
      link.target = '_blank';
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    }
  };

  // PDF document load success
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    console.log('PDF loaded successfully, pages:', numPages);
    setNumPages(numPages);
    setDocumentLoadError(false);
    setDocumentLoading(false);
    setPdfError(null);
  };

  // PDF document load error
  const onDocumentLoadError = (error: Error) => {
    console.error('PDF load error:', error);
    setPdfError(error.message);
    setDocumentLoadError(true);
    setDocumentLoading(false);
  };

  // Handle DOCX conversion
  const handleDocxConversion = async (url: string) => {
    try {
      setDocumentLoading(true);
      setDocxError(null);
      
      console.log('Attempting to convert DOCX file:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      
      // Check if the file is empty or too small
      if (arrayBuffer.byteLength === 0) {
        throw new Error('File is empty');
      }
      
      // Check if the file is too small to be a valid DOCX (minimum size check)
      if (arrayBuffer.byteLength < 100) {
        throw new Error('File appears to be corrupted or incomplete');
      }
      
      console.log('File size:', arrayBuffer.byteLength, 'bytes');
      
      const result = await mammoth.convertToHtml({ arrayBuffer });
      
      if (result.value.trim() === '') {
        throw new Error('Document appears to be empty or corrupted');
      }
      
      setDocxContent(result.value);
      setDocumentLoadError(false);
      setDocumentLoading(false);
      console.log('DOCX conversion successful');
    } catch (error: any) {
      console.error('DOCX conversion error:', error);
      
      let errorMessage = 'Failed to convert DOCX file';
      
      if (error.message.includes('Can\'t find end of central directory')) {
        errorMessage = 'Invalid DOCX file format. The file may be corrupted or not a valid Word document.';
      } else if (error.message.includes('File is empty')) {
        errorMessage = 'The file is empty and cannot be processed.';
      } else if (error.message.includes('corrupted or incomplete')) {
        errorMessage = 'The file appears to be corrupted or incomplete.';
      } else if (error.message.includes('Document appears to be empty')) {
        errorMessage = 'The document appears to be empty or corrupted.';
      } else if (error.message.includes('HTTP error')) {
        errorMessage = 'Failed to download the file. Please try again.';
      }
      
      setDocxError(errorMessage);
      setDocumentLoadError(true);
      setDocumentLoading(false);
    }
  };

  // Handle DOCX conversion when document changes
  useEffect(() => {
    if (document && document.name.match(/\.(docx|doc)$/i)) {
      handleDocxConversion(document.url);
    }
  }, [document]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      window.document.addEventListener('keydown', handleKeyDown);
      return () => window.document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen || !document) {
    console.log('DocumentViewer returning null - isOpen:', isOpen, 'document:', document);
    return null;
  }
  
  console.log('DocumentViewer rendering modal for document:', document);

  const isPDF = document.name.toLowerCase().endsWith('.pdf');
  const isDOCX = document.name.match(/\.(docx|doc)$/i);
  const isImage = document.name.match(/\.(jpg|jpeg|png|gif)$/i);

  return createPortal(
    <div 
      className="modal-overlay document-viewer-overlay"
      onClick={onClose}
    >
      <div 
        className="document-viewer-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="document-viewer-header">
          <div className="document-viewer-title">
            <h3>Document Viewer</h3>
            <span className="document-name">{document.name}</span>
          </div>
          <div className="document-viewer-actions">
            <button
              className="document-action-btn download-btn"
              onClick={handleDocumentDownload}
              title="Download Document"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M21 15V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="7,10 12,15 17,10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Download
            </button>
            <button
              className="document-action-btn close-btn"
              onClick={onClose}
              title="Close Viewer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Close
            </button>
          </div>
        </div>
        
        <div className="document-viewer-content">
          <div className="document-preview-container">
            {documentLoading ? (
              <div className="document-loading">
                <div className="document-loading-spinner"></div>
                <p>Loading document...</p>
              </div>
            ) : documentLoadError ? (
              <div className="document-error">
                <div className="document-error-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3>Failed to Load Document</h3>
                <p>There was an error loading the document. Please try again.</p>
                <button
                  className="document-action-btn"
                  onClick={() => {
                    setDocumentLoadError(false);
                    setDocumentLoading(true);
                    // Force reload by updating the URL
                    window.location.reload();
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <polyline points="23,4 23,10 17,10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Retry
                </button>
              </div>
            ) : isPDF ? (
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                {pdfError ? (
                  <div className="document-error">
                    <div className="document-error-icon">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                        <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <h3>PDF Load Error</h3>
                    <p>{pdfError}</p>
                    <button
                      className="document-action-btn"
                      onClick={() => {
                        setPdfError(null);
                        setDocumentLoadError(false);
                        setDocumentLoading(true);
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <polyline points="23,4 23,10 17,10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Retry
                    </button>
                  </div>
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Document
                      file={document.url}
                      onLoadSuccess={onDocumentLoadSuccess}
                      onLoadError={onDocumentLoadError}
                      loading={
                        <div className="document-loading">
                          <div className="document-loading-spinner"></div>
                          <p>Loading PDF...</p>
                        </div>
                      }
                      error={
                        <div className="document-error">
                          <h3>PDF Error</h3>
                          <p>Failed to load PDF document</p>
                        </div>
                      }
                    >
                      <div style={{ 
                        width: '100%', 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        overflow: 'auto',
                        maxHeight: 'calc(100vh - 300px)'
                      }}>
                        <Page
                          pageNumber={pageNumber}
                          width={Math.min(800, window.innerWidth - 100)}
                          renderTextLayer={true}
                          renderAnnotationLayer={true}
                        />
                      </div>
                    </Document>
                    
                    {numPages && numPages > 1 && (
                      <div className="document-pagination">
                        <button
                          className="document-action-btn"
                          onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                          disabled={pageNumber <= 1}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <polyline points="15,18 9,12 15,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Previous
                        </button>
                        <span className="page-info">
                          Page {pageNumber} of {numPages}
                        </span>
                        <button
                          className="document-action-btn"
                          onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
                          disabled={pageNumber >= numPages}
                        >
                          Next
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <polyline points="9,18 15,12 9,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : isDOCX ? (
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                {docxError ? (
                  <div className="document-error">
                    <div className="document-error-icon">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                        <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <h3>DOCX Conversion Error</h3>
                    <p>{docxError}</p>
                    <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>
                      The document cannot be displayed in the viewer. You can download it to view with Microsoft Word or another compatible application.
                    </p>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
                      <button
                        className="document-action-btn"
                        onClick={() => handleDocxConversion(document.url)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <polyline points="23,4 23,10 17,10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Retry
                      </button>
                      <button
                        className="document-action-btn"
                        onClick={handleDocumentDownload}
                        style={{ 
                          backgroundColor: '#3b82f6', 
                          color: 'white',
                          border: '1px solid #3b82f6'
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M17 8L12 3L7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Download
                      </button>
                      <button
                        className="document-action-btn"
                        onClick={() => {
                          window.open(`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(document.url)}`, '_blank');
                        }}
                        style={{ 
                          backgroundColor: '#10b981', 
                          color: 'white',
                          border: '1px solid #10b981'
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <polyline points="15,3 21,3 21,9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        View Online
                      </button>
                    </div>
                  </div>
                ) : docxContent ? (
                  <div 
                    className="docx-content"
                    dangerouslySetInnerHTML={{ __html: docxContent }}
                    style={{
                      width: '100%',
                      maxWidth: '800px',
                      margin: '0 auto',
                      padding: '20px',
                      background: 'white',
                      borderRadius: '6px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      overflow: 'auto',
                      maxHeight: 'calc(100vh - 300px)'
                    }}
                  />
                ) : (
                  <div className="document-loading">
                    <div className="document-loading-spinner"></div>
                    <p>Converting DOCX document...</p>
                  </div>
                )}
              </div>
            ) : isImage ? (
              <div style={{ 
                width: '100%', 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                overflow: 'auto',
                maxHeight: 'calc(100vh - 300px)'
              }}>
                <img
                  src={document.url}
                  alt="Document Preview"
                  className="document-image"
                  onLoad={() => {
                    console.log('Image loaded successfully');
                    setDocumentLoadError(false);
                    setDocumentLoading(false);
                  }}
                  onError={(e) => {
                    console.error('Image load error:', e);
                    console.log('Failed to load image from:', document.url);
                    setDocumentLoadError(true);
                    setDocumentLoading(false);
                  }}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    borderRadius: '6px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </div>
            ) : (
              <div className="document-error">
                <div className="document-error-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3>Unsupported File Type</h3>
                <p>This file type cannot be previewed. Please download the file to view it.</p>
                <button
                  className="document-action-btn"
                  onClick={handleDocumentDownload}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M21 15V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="7,10 12,15 17,10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Download File
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    window.document.body
  );
};

export default DocumentViewer;
