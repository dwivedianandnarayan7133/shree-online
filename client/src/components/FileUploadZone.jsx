import React, { useRef, useState } from 'react';
import { UploadCloud, File, X, Check } from 'lucide-react';

export const FileUploadZone = ({ 
  onFilesSelected, 
  multiple = false, 
  accept = '*/*', 
  title = 'Drag & Drop files here or browse',
  subtitle = 'Supports PDF, JPG, PNG, DOCX, XLSX up to 50MB'
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const inputRef = useRef();

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      const newFiles = multiple ? [...selectedFiles, ...filesArray] : [filesArray[0]];
      setSelectedFiles(newFiles);
      onFilesSelected(multiple ? newFiles : newFiles[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      const newFiles = multiple ? [...selectedFiles, ...filesArray] : [filesArray[0]];
      setSelectedFiles(newFiles);
      onFilesSelected(multiple ? newFiles : newFiles[0]);
    }
  };

  const removeFile = (index, e) => {
    e.stopPropagation();
    const updated = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updated);
    onFilesSelected(multiple ? updated : null);
  };

  return (
    <div className="w-full">
      <div 
        className={`dropzone ${isDragActive ? 'drag-active' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input 
          ref={inputRef} 
          type="file" 
          multiple={multiple} 
          accept={accept} 
          style={{ display: 'none' }} 
          onChange={handleChange}
        />
        <div className="dropzone-icon">
          <UploadCloud size={28} />
        </div>
        <div>
          <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-main)' }}>{title}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>{subtitle}</div>
        </div>
        <button type="button" className="btn btn-secondary btn-sm" style={{ pointerEvents: 'none' }}>
          Select from Computer
        </button>
      </div>

      {selectedFiles.length > 0 && (
        <div className="file-preview-list">
          {selectedFiles.map((file, idx) => (
            <div key={idx} className="file-preview-item">
              <div className="flex items-center gap-2" style={{ overflow: 'hidden' }}>
                <File size={16} color="var(--primary-500)" style={{ flexShrink: 0 }} />
                <span style={{ fontWeight: '600', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {file.name}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  ({Math.round(file.size / 1024)} KB)
                </span>
              </div>
              <button 
                type="button"
                onClick={(e) => removeFile(idx, e)}
                style={{ color: 'var(--accent-rose)', cursor: 'pointer', padding: '2px' }}
                title="Remove file"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
