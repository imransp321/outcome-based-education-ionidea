import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import '../styles/components/UnifiedValidationPopup.css';

interface UnifiedValidationPopupProps {
  isOpen: boolean;
  type: 'error' | 'success';
  title?: string;
  message: string;
  onClose: () => void;
  onTryAgain?: () => void;
  showProgress?: boolean;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

const UnifiedValidationPopup: React.FC<UnifiedValidationPopupProps> = ({
  isOpen,
  type,
  title,
  message,
  onClose,
  onTryAgain,
  showProgress = false,
  autoClose = false,
  autoCloseDelay = 5000
}) => {
  // Auto-close functionality
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getIcon = () => {
    if (type === 'error') {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path 
            d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <path 
            d="M12 8V12" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <circle cx="12" cy="16" r="1" fill="currentColor"/>
        </svg>
      );
    } else {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path 
            d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      );
    }
  };

  const getDefaultTitle = () => {
    return type === 'error' ? 'Validation Error' : 'Success';
  };

  const getDefaultMessage = () => {
    if (type === 'error') {
      return 'Please fix the errors in the form before submitting.\nCheck the highlighted fields and try again.';
    }
    return message;
  };

  return createPortal(
    <div className="unified-popup-overlay" onClick={onClose}>
      <div className={`unified-popup unified-popup-${type}`} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="unified-popup-header">
          <div className="unified-popup-header-left">
            <div className="unified-popup-icon">
              {getIcon()}
            </div>
            <h3 className="unified-popup-title">
              {title || getDefaultTitle()}
            </h3>
          </div>
          <button
            className="unified-popup-close"
            onClick={onClose}
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="unified-popup-content">
          <p className="unified-popup-message">
            {type === 'error' ? getDefaultMessage() : message}
          </p>
        </div>

        {/* Footer */}
        <div className="unified-popup-footer">
          {type === 'error' ? (
            <>
              <button
                className="unified-popup-btn unified-popup-btn-primary"
                onClick={onTryAgain || onClose}
              >
                Try Again
              </button>
              <button
                className="unified-popup-btn unified-popup-btn-secondary"
                onClick={onClose}
              >
                Close
              </button>
            </>
          ) : (
            <button
              className="unified-popup-btn unified-popup-btn-primary"
              onClick={onClose}
            >
              Continue
            </button>
          )}
        </div>

        {/* Progress Bar for Success Messages */}
        {showProgress && type === 'success' && (
          <div className="unified-popup-progress">
            <div className="unified-popup-progress-bar"></div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default UnifiedValidationPopup;
