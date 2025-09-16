export interface DocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  document: {
    url: string;
    name: string;
  } | null;
}

export interface DocumentInfo {
  url: string;
  name: string;
}
