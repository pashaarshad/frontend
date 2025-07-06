import React, { useState, useEffect } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

const DocumentUpload = () => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState([]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (fileList) => {
    const newFiles = Array.from(fileList).map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'pending'
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
  };

  const uploadFile = async (fileData) => {
    const formData = new FormData();
    formData.append('file', fileData.file);

    try {
      const response = await fetch('/api/upload-document', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (response.ok) {
        return {
          ...fileData,
          status: 'success',
          result: result
        };
      } else {
        return {
          ...fileData,
          status: 'error',
          error: result.error || 'Upload failed'
        };
      }
    } catch (error) {
      return {
        ...fileData,
        status: 'error',
        error: 'Network error'
      };
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    const results = [];

    for (const file of files) {
      if (file.status === 'pending') {
        const result = await uploadFile(file);
        results.push(result);
        
        // Update files state with progress
        setFiles(prev => prev.map(f => 
          f.id === file.id ? { ...f, status: result.status } : f
        ));
      }
    }

    setUploadResults(results);
    setUploading(false);
  };

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    switch (ext) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'txt':
        return '📄';
      case 'html':
        return '🌐';
      case 'md':
        return '📝';
      default:
        return '📄';
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Document Upload</h2>
        <p className="text-gray-600">Upload documents to expand the knowledge base</p>
      </div>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt,.html,.md"
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-700 mb-2">
          Drop files here or click to browse
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Supported formats: PDF, DOC, DOCX, TXT, HTML, MD
        </p>
        <p className="text-xs text-gray-400">
          Maximum file size: 16MB
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Selected Files</h3>
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getFileIcon(file.name)}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {file.status === 'pending' && (
                    <span className="text-sm text-gray-500">Ready</span>
                  )}
                  {file.status === 'success' && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {file.status === 'error' && (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  {uploading && file.status === 'pending' && (
                    <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                  )}
                  
                  <button
                    onClick={() => removeFile(file.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                    disabled={uploading}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleUpload}
              disabled={uploading || files.length === 0}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Upload Files</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Upload Results */}
      {uploadResults.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Results</h3>
          <div className="space-y-3">
            {uploadResults.map((result) => (
              <div
                key={result.id}
                className={`p-4 rounded-lg border ${
                  result.status === 'success'
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {result.status === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                  )}
                  
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{result.name}</p>
                    
                    {result.status === 'success' && result.result && (
                      <div className="mt-2 text-sm text-gray-600">
                        <p>✓ Processed successfully</p>
                        <p>• Entities extracted: {result.result.entities_extracted}</p>
                        <p>• Relations extracted: {result.result.relations_extracted}</p>
                      </div>
                    )}
                    
                    {result.status === 'error' && (
                      <p className="mt-2 text-sm text-red-600">
                        Error: {result.error}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
