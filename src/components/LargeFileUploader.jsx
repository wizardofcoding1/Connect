import React, { useState, useRef } from 'react';
import { uploadLargeFile, cancelLargeFileUpload, formatFileSize } from '../services/largeFileUploadService';
import { UploadCloud, X, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';

export default function LargeFileUploader({ tabId, onUploadSuccess, isDarkMode = true }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);
    setUploadedFile(null);

    try {
      const result = await uploadLargeFile(file, tabId, (progress) => {
        setUploadProgress(Math.round(progress.percent));
      });

      setUploadedFile({
        name: result.fileName,
        formattedSize: result.formattedSize
      });

      onUploadSuccess?.(result);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCancel = () => {
    cancelLargeFileUpload();
    setIsUploading(false);
    setUploadProgress(0);
  };

  // Past 100% the browser is done sending, but the backend is still pushing to
  // GitHub — say so, otherwise a stuck bar looks like a hang
  const isFinalizing = isUploading && uploadProgress >= 100;

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        id="large-file-input"
        onChange={handleFileSelect}
        className="hidden"
      />

      {!isUploading ? (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl
                     bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-5 py-3 text-sm font-semibold
                     text-white shadow-lg shadow-blue-600/25 transition-all hover:shadow-xl hover:shadow-purple-600/30
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2
                     active:scale-[0.99] sm:w-auto"
        >
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent
                           transition-transform duration-700 group-hover:translate-x-full" />
          <UploadCloud className="h-5 w-5 shrink-0" />
          <span>Upload Large File</span>
          <Sparkles className="h-4 w-4 shrink-0 opacity-80" />
        </button>
      ) : (
        <div className={`rounded-xl border p-3 ${
          isDarkMode ? 'border-slate-700 bg-slate-800/60' : 'border-slate-200 bg-white'
        }`}>
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 shrink-0 animate-spin text-blue-500" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className={`truncate text-sm font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                  {isFinalizing ? 'Transferring to GitHub...' : 'Uploading...'}
                </span>
                <span className="shrink-0 font-mono text-xs tabular-nums text-blue-500">
                  {uploadProgress}%
                </span>
              </div>
              <div className={`mt-2 h-1.5 w-full overflow-hidden rounded-full ${
                isDarkMode ? 'bg-slate-700' : 'bg-slate-200'
              }`}>
                <div
                  className={`h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ${
                    isFinalizing ? 'animate-pulse' : ''
                  }`}
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              {isFinalizing && (
                <p className={`mt-1.5 text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Large files can take a few minutes at this stage.
                </p>
              )}
            </div>
            <button
              onClick={handleCancel}
              className="shrink-0 rounded-md p-1.5 text-red-400 transition-colors hover:bg-red-500/15"
              title="Cancel upload"
              aria-label="Cancel upload"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {error && !isUploading && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-500/40 bg-red-500/10 p-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-red-400">Upload failed</p>
            <p className={`mt-0.5 break-words text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {error}
            </p>
          </div>
          <button
            onClick={() => { setError(null); fileInputRef.current?.click(); }}
            className="shrink-0 rounded-md bg-red-500/20 px-2.5 py-1 text-xs font-medium text-red-300 transition-colors hover:bg-red-500/30"
          >
            Retry
          </button>
        </div>
      )}

      {uploadedFile && !isUploading && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-green-500/40 bg-green-500/10 p-3">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
          <p className={`min-w-0 flex-1 truncate text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            <span className="font-medium text-green-400">Uploaded</span>
            {' — '}{uploadedFile.name} ({uploadedFile.formattedSize})
          </p>
          <button
            onClick={() => setUploadedFile(null)}
            className={`shrink-0 rounded-md p-1 transition-colors ${
              isDarkMode ? 'text-slate-400 hover:bg-white/10' : 'text-slate-500 hover:bg-black/10'
            }`}
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
