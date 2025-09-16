import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import BookChapterTextEditor from './BookChapterTextEditor';
import '../styles/components/modals.css';
import '../styles/components/SharedModal.css';

interface ConferenceOrganizedData {
  id: number;
  programTitle: string;
  type: string;
  eventOrganizer: string;
  collaboration: string;
  startDate: string;
  endDate: string;
  sponsoredBy: string;
  role: string;
  level: string;
  noOfParticipants: string;
  venue: string;
  durationHours: string;
  durationMinutes: string;
  highlights: string;
  uploadFile?: string;
}

interface ConferenceOrganizedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ConferenceOrganizedData) => void;
  editingItem?: ConferenceOrganizedData | null;
}

const ConferenceOrganizedModal: React.FC<ConferenceOrganizedModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem
}) => {
  const [formData, setFormData] = useState({
    programTitle: '',
    type: '',
    eventOrganizer: '',
    collaboration: '',
    startDate: '',
    endDate: '',
    sponsoredBy: '',
    role: '',
    level: 'State',
    noOfParticipants: '',
    venue: '',
    durationHours: '',
    durationMinutes: '',
    highlights: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Initialize form data when editing
  useEffect(() => {
    if (editingItem) {
      setFormData({
        programTitle: editingItem.programTitle,
        type: editingItem.type,
        eventOrganizer: editingItem.eventOrganizer,
        collaboration: editingItem.collaboration,
        startDate: editingItem.startDate,
        endDate: editingItem.endDate,
        sponsoredBy: editingItem.sponsoredBy,
        role: editingItem.role,
        level: editingItem.level,
        noOfParticipants: editingItem.noOfParticipants,
        venue: editingItem.venue,
        durationHours: editingItem.durationHours,
        durationMinutes: editingItem.durationMinutes,
        highlights: editingItem.highlights
      });
    } else {
      setFormData({
        programTitle: '',
        type: '',
        eventOrganizer: '',
        collaboration: '',
        startDate: '',
        endDate: '',
        sponsoredBy: '',
        role: '',
        level: 'State',
        noOfParticipants: '',
        venue: '',
        durationHours: '',
        durationMinutes: '',
        highlights: ''
      });
    }
    setErrors({});
  }, [editingItem, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.programTitle) newErrors.programTitle = 'Program Title is required';
    if (!formData.type) newErrors.type = 'Type is required';
    if (!formData.eventOrganizer) newErrors.eventOrganizer = 'Event Organizer is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const newItem: ConferenceOrganizedData = {
      id: editingItem?.id || Date.now(),
      programTitle: formData.programTitle,
      type: formData.type,
      eventOrganizer: formData.eventOrganizer,
      collaboration: formData.collaboration,
      startDate: formData.startDate,
      endDate: formData.endDate,
      sponsoredBy: formData.sponsoredBy,
      role: formData.role,
      level: formData.level,
      noOfParticipants: formData.noOfParticipants,
      venue: formData.venue,
      durationHours: formData.durationHours,
      durationMinutes: formData.durationMinutes,
      highlights: formData.highlights
    };

    onSave(newItem);
    onClose();
  };

  const closeModal = () => {
    setFormData({
      programTitle: '',
      type: '',
      eventOrganizer: '',
      collaboration: '',
      startDate: '',
      endDate: '',
      sponsoredBy: '',
      role: '',
      level: 'State',
      noOfParticipants: '',
      venue: '',
      durationHours: '',
      durationMinutes: '',
      highlights: ''
    });
    setErrors({});
    onClose();
  };

  // Reset form data
  const handleReset = () => {
    setFormData({
      programTitle: '',
      type: '',
      eventOrganizer: '',
      collaboration: '',
      startDate: '',
      endDate: '',
      sponsoredBy: '',
      role: '',
      level: 'State',
      noOfParticipants: '',
      venue: '',
      durationHours: '',
      durationMinutes: '',
      highlights: ''
    });
    setErrors({});
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal book-chapter-modal-enhanced" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-content">
            <h3>{editingItem ? 'Edit Conference Event' : 'Add New Conference Event'}</h3>
            <p className="modal-subtitle">Manage conference, seminar and workshop organization</p>
          </div>
          <button
            className="message-modal-close"
            onClick={closeModal}
            title="Close Modal"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <div className="book-chapter-form-container">
            <div className="book-chapter-form-layout">
              {/* Left Column */}
              <div className="book-chapter-form-left">
                <div className="book-chapter-form-group">
                  <label className="book-chapter-required">Program Title</label>
                  <div className="book-chapter-input-wrapper">
                    <input
                      type="text"
                      value={formData.programTitle}
                      onChange={(e) => handleInputChange('programTitle', e.target.value)}
                      placeholder="Enter Program Title"
                      className={`book-chapter-input ${errors.programTitle ? 'book-chapter-error' : ''}`}
                    />
                    <div className="book-chapter-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  {errors.programTitle && <span className="book-chapter-error-message">{errors.programTitle}</span>}
                </div>

                <div className="book-chapter-form-group">
                  <label className="book-chapter-required">Type</label>
                  <div className="book-chapter-input-wrapper">
                    <select
                      value={formData.type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="book-chapter-input book-chapter-select"
                    >
                      <option value="">Select Type</option>
                      <option value="Conference">Conference</option>
                      <option value="Seminar">Seminar</option>
                      <option value="Training">Training</option>
                      <option value="Development">Development</option>
                      <option value="Workshop">Workshop</option>
                    </select>
                    <div className="book-chapter-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  {errors.type && <span className="book-chapter-error-message">{errors.type}</span>}
                </div>

                <div className="book-chapter-form-group">
                  <label className="book-chapter-required">Event Organizer</label>
                  <div className="book-chapter-input-wrapper">
                    <input
                      type="text"
                      value={formData.eventOrganizer}
                      onChange={(e) => handleInputChange('eventOrganizer', e.target.value)}
                      placeholder="Enter Event Organizer"
                      className={`book-chapter-input ${errors.eventOrganizer ? 'book-chapter-error' : ''}`}
                    />
                    <div className="book-chapter-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  {errors.eventOrganizer && <span className="book-chapter-error-message">{errors.eventOrganizer}</span>}
                </div>

                <div className="book-chapter-form-group">
                  <label>No. of Participants</label>
                  <div className="book-chapter-input-wrapper">
                    <input
                      type="text"
                      value={formData.noOfParticipants}
                      onChange={(e) => handleInputChange('noOfParticipants', e.target.value)}
                      placeholder="Enter no. of participants"
                      className={`book-chapter-input ${errors.noOfParticipants ? 'book-chapter-error' : ''}`}
                    />
                    <div className="book-chapter-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  {errors.noOfParticipants && <span className="book-chapter-error-message">{errors.noOfParticipants}</span>}
                </div>

                <div className="book-chapter-form-group">
                  <label>Venue</label>
                  <div className="book-chapter-textarea-wrapper">
                    <textarea
                      value={formData.venue}
                      onChange={(e) => handleInputChange('venue', e.target.value)}
                      placeholder="Enter Venue"
                      rows={3}
                      className={`book-chapter-textarea ${errors.venue ? 'book-chapter-error' : ''}`}
                    />
                    <div className="book-chapter-textarea-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  {errors.venue && <span className="book-chapter-error-message">{errors.venue}</span>}
                </div>

                <div className="book-chapter-form-group">
                  <label>Start Date</label>
                  <div className="book-chapter-input-wrapper">
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      className={`book-chapter-input ${errors.startDate ? 'book-chapter-error' : ''}`}
                    />
                    <div className="book-chapter-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  {errors.startDate && <span className="book-chapter-error-message">{errors.startDate}</span>}
                </div>

                <div className="book-chapter-form-group">
                  <label>End Date</label>
                  <div className="book-chapter-input-wrapper">
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      className={`book-chapter-input ${errors.endDate ? 'book-chapter-error' : ''}`}
                    />
                    <div className="book-chapter-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  {errors.endDate && <span className="book-chapter-error-message">{errors.endDate}</span>}
                </div>
              </div>

              {/* Right Column - Additional Fields and Description Editor */}
              <div className="book-chapter-form-right">
                <div className="book-chapter-form-group">
                  <label>Duration (H:M)</label>
                  <div className="book-chapter-duration-group">
                    <div className="book-chapter-input-wrapper">
                      <input
                        type="text"
                        value={formData.durationHours}
                        onChange={(e) => handleInputChange('durationHours', e.target.value)}
                        placeholder="Enter hours"
                        className={`book-chapter-input ${errors.durationHours ? 'book-chapter-error' : ''}`}
                      />
                      <div className="book-chapter-input-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                          <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </div>
                    </div>
                    <div className="book-chapter-input-wrapper">
                      <input
                        type="text"
                        value={formData.durationMinutes}
                        onChange={(e) => handleInputChange('durationMinutes', e.target.value)}
                        placeholder="Enter minu"
                        className={`book-chapter-input ${errors.durationMinutes ? 'book-chapter-error' : ''}`}
                      />
                      <div className="book-chapter-input-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                          <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="book-chapter-form-group">
                  <label className="book-chapter-required">Select Level</label>
                  <div className="book-chapter-input-wrapper">
                    <select
                      value={formData.level}
                      onChange={(e) => handleInputChange('level', e.target.value)}
                      className="book-chapter-input book-chapter-select"
                    >
                      <option value="State">State</option>
                      <option value="National">National</option>
                      <option value="International">International</option>
                      <option value="Regional">Regional</option>
                      <option value="Local">Local</option>
                    </select>
                    <div className="book-chapter-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  {errors.level && <span className="book-chapter-error-message">{errors.level}</span>}
                </div>

                <div className="book-chapter-form-group">
                  <label>Collaboration</label>
                  <div className="book-chapter-input-wrapper">
                    <input
                      type="text"
                      value={formData.collaboration}
                      onChange={(e) => handleInputChange('collaboration', e.target.value)}
                      placeholder="Enter Collabration details"
                      className={`book-chapter-input ${errors.collaboration ? 'book-chapter-error' : ''}`}
                    />
                    <div className="book-chapter-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  {errors.collaboration && <span className="book-chapter-error-message">{errors.collaboration}</span>}
                </div>

                <div className="book-chapter-form-group">
                  <label className="book-chapter-required">Your Role</label>
                  <div className="book-chapter-input-wrapper">
                    <input
                      type="text"
                      value={formData.role}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      placeholder="Enter your role"
                      className={`book-chapter-input ${errors.role ? 'book-chapter-error' : ''}`}
                    />
                    <div className="book-chapter-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  {errors.role && <span className="book-chapter-error-message">{errors.role}</span>}
                </div>

                <div className="book-chapter-form-group">
                  <label className="book-chapter-required">Date</label>
                  <div className="book-chapter-date-group">
                    <div className="book-chapter-date-field">
                      <label>Start Date</label>
                      <div className="book-chapter-input-wrapper">
                        <input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => handleInputChange('startDate', e.target.value)}
                          className={`book-chapter-input ${errors.startDate ? 'book-chapter-error' : ''}`}
                        />
                        <div className="book-chapter-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                      {errors.startDate && <span className="book-chapter-error-message">{errors.startDate}</span>}
                    </div>
                    <div className="book-chapter-date-field">
                      <label>End Date</label>
                      <div className="book-chapter-input-wrapper">
                        <input
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => handleInputChange('endDate', e.target.value)}
                          className={`book-chapter-input ${errors.endDate ? 'book-chapter-error' : ''}`}
                        />
                        <div className="book-chapter-input-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                      {errors.endDate && <span className="book-chapter-error-message">{errors.endDate}</span>}
                    </div>
                  </div>
                </div>

                <div className="book-chapter-form-group">
                  <label className="book-chapter-required">Sponsored by</label>
                  <div className="book-chapter-textarea-wrapper">
                    <textarea
                      value={formData.sponsoredBy}
                      onChange={(e) => handleInputChange('sponsoredBy', e.target.value)}
                      placeholder="Enter sponsoring organization"
                      rows={3}
                      className={`book-chapter-textarea ${errors.sponsoredBy ? 'book-chapter-error' : ''}`}
                    />
                    <div className="book-chapter-textarea-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  {errors.sponsoredBy && <span className="book-chapter-error-message">{errors.sponsoredBy}</span>}
                </div>

                <div className="book-chapter-form-group">
                  <label className="book-chapter-section-label">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="book-chapter-label-icon">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Highlights
                  </label>
                  <BookChapterTextEditor
                    value={formData.highlights}
                    onChange={(value) => handleInputChange('highlights', value)}
                    placeholder="Enter event highlights and details here..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="book-chapter-btn book-chapter-btn-secondary"
            onClick={handleReset}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M1 4V10H7M23 20V14H17M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9 9 0 0 1 3.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Reset
          </button>
          <button
            type="button"
            className="faculty-modal-btn faculty-modal-btn-cancel"
            onClick={closeModal}
          >
            <span className="faculty-modal-btn-icon"></span>
            Cancel
          </button>
          <button
            type="button"
            className="faculty-modal-btn faculty-modal-btn-save"
            onClick={handleSave}
          >
            <span className="faculty-modal-btn-icon"></span>
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConferenceOrganizedModal;
