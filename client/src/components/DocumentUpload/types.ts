export interface DocumentUploadProps {
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

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}
