import React, { useState } from 'react';
import axios from 'axios';

const CSVUpload: React.FC<{ onUploadSuccess: () => void }> = ({ onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setMessage(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage({ type: 'error', text: 'Please select a CSV file' });
      return;
    }

    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5001/api'}/players/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setMessage({ type: 'success', text: response.data.message || 'Players uploaded successfully!' });
      setFile(null);
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      onUploadSuccess();
    } catch (error: any) {
      console.error('Upload error:', error);
      const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to upload file';
      const errorDetails = error.response?.data?.details ? ` - ${error.response.data.details}` : '';
      setMessage({ 
        type: 'error', 
        text: errorMsg + errorDetails
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* File Input - Hidden */}
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        id="csv-upload-input"
        className="hidden"
      />

      {/* Upload Button */}
      <label
        htmlFor="csv-upload-input"
        className="cursor-pointer px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-lg text-white text-sm font-bold transition-all duration-300 hover:scale-105 flex items-center gap-2 shadow-lg"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        {file ? file.name.substring(0, 15) + (file.name.length > 15 ? '...' : '') : 'Upload CSV'}
      </label>

      {/* Confirm Upload Button */}
      {file && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
            uploading
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-500 text-white hover:scale-105 shadow-lg'
          }`}
        >
          {uploading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Confirm</span>
            </>
          )}
        </button>
      )}

      {/* Toast Message */}
      {message && (
        <div
          className={`fixed top-4 right-4 px-4 py-3 rounded-lg shadow-2xl z-50 animate-slideDown flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-green-600 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          <span className="text-lg">
            {message.type === 'success' ? '✓' : '✗'}
          </span>
          <span className="font-semibold text-sm">{message.text}</span>
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CSVUpload;
