import React from 'react';
import { createPortal } from 'react-dom';
import '../styles/components/ValidationPopup.css';

interface ValidationPopupProps {
  isOpen: boolean;
  type: 'success' | 'error';
  title?: string;
  message: string;
  onClose: () => void;
  showProgress?: boolean;
  progressValue?: number;
  buttonText?: string;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

const ValidationPopup: React.FC<ValidationPopupProps> = ({
  isOpen,
  type,
  title,
  message,
  onClose,
  showProgress = false,
  progressValue = 100,
  buttonText,
  autoClose = false,
  autoCloseDelay = 5000
}) => {
  React.useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  if (!isOpen) return null;

  const getIcon = () => {
    if (type === 'success') {
      return (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    } else {
      return (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
          <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
          <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
        </svg>
      );
    }
  };

  const getButtonIcon = () => {
    if (type === 'success') {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    } else {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    }
  };

  const getDefaultTitle = () => {
    return type === 'success' ? 'Success!' : 'Validation Error';
  };

  const getDefaultButtonText = () => {
    return type === 'success' ? 'Ok' : 'Close';
  };

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className={`validation-popup validation-popup-${type}`} onClick={(e) => e.stopPropagation()}>
        {showProgress && (
          <div className="validation-popup-progress">
            <div 
              className="validation-popup-progress-bar"
              style={{ width: `${progressValue}%` }}
            ></div>
          </div>
        )}
        <div className="validation-popup-content">
          <div className="validation-popup-icon">
            {getIcon()}
          </div>
          <h3 className="validation-popup-title">{title || getDefaultTitle()}</h3>
          <p className="validation-popup-message">{message}</p>
          <button
            className={`validation-popup-button validation-popup-button-${type}`}
            onClick={onClose}
          >
            {getButtonIcon()}
            {buttonText || getDefaultButtonText()}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ValidationPopup;
