import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import '../styles/components/MessageModal.css';
import '../styles/components/ResearchPublicationModal.css';

interface ResearchPublicationData {
  id: number;
  titleOfPaper: string;
  authors: string;
  pageNo: string;
  publicationJournalTitle: string;
  publicationYear: string;
  publisher: string;
  volumeNo: string;
  issnIsbn: string;
  scopusSciPeerReviewed: string;
  doi: string;
  impactFactor: string;
  type: string;
  levelStatus: string;
  status: string;
  hIndex: string;
  i10Index: string;
  snip: string;
  sjrIndex: string;
  publishedUrl: string;
  indexTerms: string;
  issueNo: string;
  conferenceName: string;
  eventOrganizer: string;
  anyAwards: boolean;
  institutionalAffiliation: boolean;
  abstract: string;
  uploadFile?: string;
}

interface ResearchPublicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ResearchPublicationData) => void;
  editingItem?: ResearchPublicationData | null;
}

const ResearchPublicationModal: React.FC<ResearchPublicationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem
}) => {
  const [formData, setFormData] = useState({
    titleOfPaper: '',
    authors: '',
    pageNo: '',
    publicationJournalTitle: '',
    publicationYear: '',
    publisher: '',
    volumeNo: '',
    issnIsbn: '',
    scopusSciPeerReviewed: '',
    doi: '',
    impactFactor: '',
    type: 'Journal',
    levelStatus: 'State',
    status: 'Communicated',
    hIndex: '',
    i10Index: '',
    snip: '',
    sjrIndex: '',
    publishedUrl: '',
    indexTerms: '',
    issueNo: '',
    conferenceName: '',
    eventOrganizer: '',
    anyAwards: false,
    institutionalAffiliation: false,
    abstract: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Initialize form data when editing
  useEffect(() => {
    if (editingItem) {
      setFormData({
        titleOfPaper: editingItem.titleOfPaper,
        authors: editingItem.authors,
        pageNo: editingItem.pageNo,
        publicationJournalTitle: editingItem.publicationJournalTitle,
        publicationYear: editingItem.publicationYear,
        publisher: editingItem.publisher,
        volumeNo: editingItem.volumeNo,
        issnIsbn: editingItem.issnIsbn,
        scopusSciPeerReviewed: editingItem.scopusSciPeerReviewed,
        doi: editingItem.doi,
        impactFactor: editingItem.impactFactor,
        type: editingItem.type,
        levelStatus: editingItem.levelStatus,
        status: editingItem.status,
        hIndex: editingItem.hIndex,
        i10Index: editingItem.i10Index,
        snip: editingItem.snip,
        sjrIndex: editingItem.sjrIndex,
        publishedUrl: editingItem.publishedUrl,
        indexTerms: editingItem.indexTerms,
        issueNo: editingItem.issueNo,
        conferenceName: editingItem.conferenceName,
        eventOrganizer: editingItem.eventOrganizer,
        anyAwards: editingItem.anyAwards,
        institutionalAffiliation: editingItem.institutionalAffiliation,
        abstract: editingItem.abstract
      });
    } else {
      setFormData({
        titleOfPaper: '',
        authors: '',
        pageNo: '',
        publicationJournalTitle: '',
        publicationYear: '',
        publisher: '',
        volumeNo: '',
        issnIsbn: '',
        scopusSciPeerReviewed: '',
        doi: '',
        impactFactor: '',
        type: 'Journal',
        levelStatus: 'State',
        status: 'Communicated',
        hIndex: '',
        i10Index: '',
        snip: '',
        sjrIndex: '',
        publishedUrl: '',
        indexTerms: '',
        issueNo: '',
        conferenceName: '',
        eventOrganizer: '',
        anyAwards: false,
        institutionalAffiliation: false,
        abstract: ''
      });
    }
    setErrors({});
  }, [editingItem, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.titleOfPaper) newErrors.titleOfPaper = 'Title of Paper is required';
    if (!formData.publicationJournalTitle) newErrors.publicationJournalTitle = 'Publication/Journal Title is required';
    if (!formData.type) newErrors.type = 'Type is required';
    if (!formData.levelStatus) newErrors.levelStatus = 'Level/Status is required';
    if (!formData.status) newErrors.status = 'Status is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const newItem: ResearchPublicationData = {
      id: editingItem ? editingItem.id : Date.now(),
      titleOfPaper: formData.titleOfPaper,
      authors: formData.authors,
      pageNo: formData.pageNo,
      publicationJournalTitle: formData.publicationJournalTitle,
      publicationYear: formData.publicationYear,
      publisher: formData.publisher,
      volumeNo: formData.volumeNo,
      issnIsbn: formData.issnIsbn,
      scopusSciPeerReviewed: formData.scopusSciPeerReviewed,
      doi: formData.doi,
      impactFactor: formData.impactFactor,
      type: formData.type,
      levelStatus: formData.levelStatus,
      status: formData.status,
      hIndex: formData.hIndex,
      i10Index: formData.i10Index,
      snip: formData.snip,
      sjrIndex: formData.sjrIndex,
      publishedUrl: formData.publishedUrl,
      indexTerms: formData.indexTerms,
      issueNo: formData.issueNo,
      conferenceName: formData.conferenceName,
      eventOrganizer: formData.eventOrganizer,
      anyAwards: formData.anyAwards,
      institutionalAffiliation: formData.institutionalAffiliation,
      abstract: formData.abstract
    };

    onSave(newItem);
    onClose();
  };

  const handleReset = () => {
    setFormData({
      titleOfPaper: '',
      authors: '',
      pageNo: '',
      publicationJournalTitle: '',
      publicationYear: '',
      publisher: '',
      volumeNo: '',
      issnIsbn: '',
      scopusSciPeerReviewed: '',
      doi: '',
      impactFactor: '',
      type: 'Journal',
      levelStatus: 'State',
      status: 'Communicated',
      hIndex: '',
      i10Index: '',
      snip: '',
      sjrIndex: '',
      publishedUrl: '',
      indexTerms: '',
      issueNo: '',
      conferenceName: '',
      eventOrganizer: '',
      anyAwards: false,
      institutionalAffiliation: false,
      abstract: ''
    });
    setErrors({});
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="research-publication-modal" onClick={(e) => e.stopPropagation()}>
        <div className="research-publication-modal-content">
          {/* Modal Header */}
          <div className="research-publication-modal-header">
            <h3>{editingItem ? 'Edit Research Publication' : 'Add New Research Publication'}</h3>
            <button
              className="message-modal-close"
              onClick={onClose}
              title="Close Modal"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Modal Body */}
          <div className="research-publication-modal-body">
            <div className="research-publication-form-layout">
              {/* Left Column */}
              <div className="research-publication-form-left">
                <div className="research-publication-form-group">
                  <label className="research-publication-required">Title of Paper*</label>
                  <input
                    type="text"
                    value={formData.titleOfPaper}
                    onChange={(e) => handleInputChange('titleOfPaper', e.target.value)}
                    placeholder="Enter Title of Paper"
                    className={errors.titleOfPaper ? 'research-publication-error' : ''}
                  />
                  {errors.titleOfPaper && <span className="research-publication-error-message">{errors.titleOfPaper}</span>}
                </div>

                <div className="research-publication-form-group">
                  <label className="research-publication-required">Publication / Journal Title*</label>
                  <input
                    type="text"
                    value={formData.publicationJournalTitle}
                    onChange={(e) => handleInputChange('publicationJournalTitle', e.target.value)}
                    placeholder="Enter Publication / Journal Title"
                    className={errors.publicationJournalTitle ? 'research-publication-error' : ''}
                  />
                  {errors.publicationJournalTitle && <span className="research-publication-error-message">{errors.publicationJournalTitle}</span>}
                </div>

                <div className="research-publication-form-group">
                  <label>Author(s)</label>
                  <textarea
                    value={formData.authors}
                    onChange={(e) => handleInputChange('authors', e.target.value)}
                    placeholder="Enter Author(s)"
                    rows={2}
                    className={errors.authors ? 'research-publication-error' : ''}
                  />
                  {errors.authors && <span className="research-publication-error-message">{errors.authors}</span>}
                </div>

                <div className="research-publication-form-group">
                  <label>Page No.</label>
                  <input
                    type="text"
                    value={formData.pageNo}
                    onChange={(e) => handleInputChange('pageNo', e.target.value)}
                    placeholder="Enter Page No. Ex: 5-10, 13, 19"
                    className={errors.pageNo ? 'research-publication-error' : ''}
                  />
                  {errors.pageNo && <span className="research-publication-error-message">{errors.pageNo}</span>}
                </div>

                <div className="research-publication-form-group">
                  <label>h-Index</label>
                  <input
                    type="text"
                    value={formData.hIndex}
                    onChange={(e) => handleInputChange('hIndex', e.target.value)}
                    placeholder="Enter h-Index"
                    className={errors.hIndex ? 'research-publication-error' : ''}
                  />
                  {errors.hIndex && <span className="research-publication-error-message">{errors.hIndex}</span>}
                </div>

                <div className="research-publication-form-group">
                  <label>i10 Index</label>
                  <input
                    type="text"
                    value={formData.i10Index}
                    onChange={(e) => handleInputChange('i10Index', e.target.value)}
                    placeholder="Enter i10 Index"
                    className={errors.i10Index ? 'research-publication-error' : ''}
                  />
                  {errors.i10Index && <span className="research-publication-error-message">{errors.i10Index}</span>}
                </div>

                <div className="research-publication-form-group">
                  <label>Scopus / SCI / Peer Reviewed</label>
                  <input
                    type="text"
                    value={formData.scopusSciPeerReviewed}
                    onChange={(e) => handleInputChange('scopusSciPeerReviewed', e.target.value)}
                    placeholder="Enter Scopus / SCI Peer Reviewed"
                    className={errors.scopusSciPeerReviewed ? 'research-publication-error' : ''}
                  />
                  {errors.scopusSciPeerReviewed && <span className="research-publication-error-message">{errors.scopusSciPeerReviewed}</span>}
                </div>

                <div className="research-publication-form-group">
                  <label>SNIP</label>
                  <input
                    type="text"
                    value={formData.snip}
                    onChange={(e) => handleInputChange('snip', e.target.value)}
                    placeholder="Enter Source Normalized Impact per P"
                    className={errors.snip ? 'research-publication-error' : ''}
                  />
                  {errors.snip && <span className="research-publication-error-message">{errors.snip}</span>}
                </div>

                <div className="research-publication-form-group">
                  <label>SJR Index</label>
                  <input
                    type="text"
                    value={formData.sjrIndex}
                    onChange={(e) => handleInputChange('sjrIndex', e.target.value)}
                    placeholder="Enter Scientific Journal Rankings Inde"
                    className={errors.sjrIndex ? 'research-publication-error' : ''}
                  />
                  {errors.sjrIndex && <span className="research-publication-error-message">{errors.sjrIndex}</span>}
                </div>

                <div className="research-publication-form-group">
                  <label className="research-publication-required">Status*</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className={errors.status ? 'research-publication-error' : ''}
                  >
                    <option value="Communicated">Communicated</option>
                    <option value="Published">Published</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                  {errors.status && <span className="research-publication-error-message">{errors.status}</span>}
                </div>

                <div className="research-publication-form-group">
                  <label>Publisher</label>
                  <textarea
                    value={formData.publisher}
                    onChange={(e) => handleInputChange('publisher', e.target.value)}
                    placeholder="Enter Publisher"
                    rows={2}
                    className={errors.publisher ? 'research-publication-error' : ''}
                  />
                  {errors.publisher && <span className="research-publication-error-message">{errors.publisher}</span>}
                </div>

                <div className="research-publication-form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.anyAwards}
                      onChange={(e) => handleInputChange('anyAwards', e.target.checked)}
                    />
                    Any awards it has won
                  </label>
                </div>
              </div>

              {/* Middle Column */}
              <div className="research-publication-form-middle">
                <div className="research-publication-form-group">
                  <label className="research-publication-required">Type*</label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className={errors.type ? 'research-publication-error' : ''}
                  >
                    <option value="Journal">Journal</option>
                    <option value="Conference">Conference</option>
                    <option value="Book">Book</option>
                    <option value="Book Chapter">Book Chapter</option>
                    <option value="Patent">Patent</option>
                  </select>
                  {errors.type && <span className="research-publication-error-message">{errors.type}</span>}
                </div>

                <div className="research-publication-form-group">
                  <label className="research-publication-required">Level / Status*</label>
                  <select
                    value={formData.levelStatus}
                    onChange={(e) => handleInputChange('levelStatus', e.target.value)}
                    className={errors.levelStatus ? 'research-publication-error' : ''}
                  >
                    <option value="State">State</option>
                    <option value="National">National</option>
                    <option value="International">International</option>
                    <option value="Regional">Regional</option>
                  </select>
                  {errors.levelStatus && <span className="research-publication-error-message">{errors.levelStatus}</span>}
                </div>

                <div className="research-publication-form-group">
                  <label>ISSN / ISBN</label>
                  <input
                    type="text"
                    value={formData.issnIsbn}
                    onChange={(e) => handleInputChange('issnIsbn', e.target.value)}
                    placeholder="International Standard Serial Number"
                    className={errors.issnIsbn ? 'research-publication-error' : ''}
                  />
                  {errors.issnIsbn && <span className="research-publication-error-message">{errors.issnIsbn}</span>}
                </div>

                <div className="research-publication-form-group">
                  <label>Published URL</label>
                  <input
                    type="url"
                    value={formData.publishedUrl}
                    onChange={(e) => handleInputChange('publishedUrl', e.target.value)}
                    placeholder="Enter Published URL"
                    className={errors.publishedUrl ? 'research-publication-error' : ''}
                  />
                  {errors.publishedUrl && <span className="research-publication-error-message">{errors.publishedUrl}</span>}
                </div>

                <div className="research-publication-form-group">
                  <label>Index Term(s)</label>
                  <textarea
                    value={formData.indexTerms}
                    onChange={(e) => handleInputChange('indexTerms', e.target.value)}
                    placeholder="Enter Index Term(s)"
                    rows={2}
                    className={errors.indexTerms ? 'research-publication-error' : ''}
                  />
                  {errors.indexTerms && <span className="research-publication-error-message">{errors.indexTerms}</span>}
                </div>

                <div className="research-publication-form-group">
                  <label>Volume No.</label>
                  <input
                    type="text"
                    value={formData.volumeNo}
                    onChange={(e) => handleInputChange('volumeNo', e.target.value)}
                    placeholder="Enter Volume No."
                    className={errors.volumeNo ? 'research-publication-error' : ''}
                  />
                  {errors.volumeNo && <span className="research-publication-error-message">{errors.volumeNo}</span>}
                </div>

                <div className="research-publication-form-group">
                  <label>Issue No.</label>
                  <input
                    type="text"
                    value={formData.issueNo}
                    onChange={(e) => handleInputChange('issueNo', e.target.value)}
                    placeholder="Enter Issue Number"
                    className={errors.issueNo ? 'research-publication-error' : ''}
                  />
                  {errors.issueNo && <span className="research-publication-error-message">{errors.issueNo}</span>}
                </div>

                <div className="research-publication-form-group">
                  <label>Digital Object Identifier (DOI)</label>
                  <input
                    type="text"
                    value={formData.doi}
                    onChange={(e) => handleInputChange('doi', e.target.value)}
                    placeholder="Enter Digital Object Identifier"
                    className={errors.doi ? 'research-publication-error' : ''}
                  />
                  {errors.doi && <span className="research-publication-error-message">{errors.doi}</span>}
                </div>

                <div className="research-publication-form-group">
                  <label>Publication Year</label>
                  <div className="research-publication-input-with-icon">
                    <select
                      value={formData.publicationYear}
                      onChange={(e) => handleInputChange('publicationYear', e.target.value)}
                      className={errors.publicationYear ? 'research-publication-error' : ''}
                    >
                      <option value="">Select Year</option>
                      {Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - i).map(year => (
                        <option key={year} value={year.toString()}>{year}</option>
                      ))}
                    </select>
                    <svg className="research-publication-calendar-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  {errors.publicationYear && <span className="research-publication-error-message">{errors.publicationYear}</span>}
                </div>

                <div className="research-publication-form-group">
                  <label>Impact Factor</label>
                  <textarea
                    value={formData.impactFactor}
                    onChange={(e) => handleInputChange('impactFactor', e.target.value)}
                    placeholder="Enter Impact Factor"
                    rows={2}
                    className={errors.impactFactor ? 'research-publication-error' : ''}
                  />
                  {errors.impactFactor && <span className="research-publication-error-message">{errors.impactFactor}</span>}
                </div>

                <div className="research-publication-form-group">
                  <label>Name of the Conference</label>
                  <input
                    type="text"
                    value={formData.conferenceName}
                    onChange={(e) => handleInputChange('conferenceName', e.target.value)}
                    placeholder="Enter Name of the Conference"
                    className={errors.conferenceName ? 'research-publication-error' : ''}
                  />
                  {errors.conferenceName && <span className="research-publication-error-message">{errors.conferenceName}</span>}
                </div>

                <div className="research-publication-form-group">
                  <label>Name of the Event Organizer</label>
                  <input
                    type="text"
                    value={formData.eventOrganizer}
                    onChange={(e) => handleInputChange('eventOrganizer', e.target.value)}
                    placeholder="Enter Name of the Event Organizer"
                    className={errors.eventOrganizer ? 'research-publication-error' : ''}
                  />
                  {errors.eventOrganizer && <span className="research-publication-error-message">{errors.eventOrganizer}</span>}
                </div>

                <div className="research-publication-form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.institutionalAffiliation}
                      onChange={(e) => handleInputChange('institutionalAffiliation', e.target.checked)}
                    />
                    Institutional affiliation (if yes, check)
                  </label>
                </div>
              </div>

              {/* Right Column - Abstract Editor */}
              <div className="research-publication-form-right">
                <div className="research-publication-form-group">
                  <label>Abstract</label>
                  <div className="research-publication-rich-text-editor">
                    <div className="research-publication-editor-toolbar">
                      <div className="research-publication-toolbar-row">
                        <select className="research-publication-toolbar-select">
                          <option>File</option>
                        </select>
                        <select className="research-publication-toolbar-select">
                          <option>Edit</option>
                        </select>
                        <select className="research-publication-toolbar-select">
                          <option>Insert</option>
                        </select>
                        <select className="research-publication-toolbar-select">
                          <option>View</option>
                        </select>
                        <select className="research-publication-toolbar-select">
                          <option>Format</option>
                        </select>
                        <select className="research-publication-toolbar-select">
                          <option>Table</option>
                        </select>
                        <select className="research-publication-toolbar-select">
                          <option>Tools</option>
                        </select>
                      </div>
                      <div className="research-publication-toolbar-row">
                        <button className="research-publication-toolbar-btn" title="Undo">↶</button>
                        <button className="research-publication-toolbar-btn" title="Redo">↷</button>
                        <select className="research-publication-toolbar-select">
                          <option>Formats</option>
                        </select>
                        <button className="research-publication-toolbar-btn" title="Bold"><b>B</b></button>
                        <button className="research-publication-toolbar-btn" title="Italic"><i>I</i></button>
                        <button className="research-publication-toolbar-btn" title="Underline"><u>U</u></button>
                        <button className="research-publication-toolbar-btn" title="Strikethrough"><s>S</s></button>
                        <button className="research-publication-toolbar-btn" title="Left Align">⫷</button>
                        <button className="research-publication-toolbar-btn" title="Center Align">⫸</button>
                        <button className="research-publication-toolbar-btn" title="Right Align">⫸</button>
                        <button className="research-publication-toolbar-btn" title="Justify">⫸</button>
                        <button className="research-publication-toolbar-btn" title="Bulleted List">•</button>
                        <button className="research-publication-toolbar-btn" title="Numbered List">1.</button>
                        <button className="research-publication-toolbar-btn" title="Indent">⫸</button>
                        <button className="research-publication-toolbar-btn" title="Outdent">⫷</button>
                        <button className="research-publication-toolbar-btn" title="Link">🔗</button>
                        <button className="research-publication-toolbar-btn" title="Image">🖼</button>
                        <button className="research-publication-toolbar-btn" title="Upload">📤</button>
                      </div>
                    </div>
                    <textarea
                      value={formData.abstract}
                      onChange={(e) => handleInputChange('abstract', e.target.value)}
                      placeholder="Enter abstract content here..."
                      className="research-publication-editor-textarea"
                      rows={12}
                    />
                    <div className="research-publication-editor-footer">
                      <span>p</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="research-publication-modal-footer">
            <button
              type="button"
              className="research-publication-btn research-publication-btn-secondary"
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
              onClick={onClose}
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
      </div>
    </div>,
    document.body
  );
};

export default ResearchPublicationModal;
