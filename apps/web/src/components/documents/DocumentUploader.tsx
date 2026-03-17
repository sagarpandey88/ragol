import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud } from 'lucide-react';

interface Props {
  onFiles: (files: File[]) => void;
  uploading?: boolean;
}

const ACCEPTED = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/plain': ['.txt'],
  'text/markdown': ['.md'],
  'text/csv': ['.csv'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
};

export function DocumentUploader({ onFiles, uploading }: Props) {
  const onDrop = useCallback((accepted: File[]) => {
    if (accepted.length > 0) onFiles(accepted);
  }, [onFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    disabled: uploading,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'}
        ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <input {...getInputProps()} />
      <UploadCloud className="mx-auto mb-2 text-indigo-500" size={36} />
      <p className="text-sm text-gray-600">
        {isDragActive ? 'Drop files here...' : 'Drag & drop files, or click to select'}
      </p>
      <p className="text-xs text-gray-400 mt-1">PDF, DOCX, TXT, MD, CSV, XLSX</p>
    </div>
  );
}
