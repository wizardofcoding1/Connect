import React, { useState } from 'react';
import { FileText, Trash2, Eye, Download, Edit3, Check, X, UploadCloud } from 'lucide-react';

const CanvasEditor = ({ items, onDelete, onFileUpload, uploadProgress, onUpdateTitle }) => {
  const [editingId, setEditingId] = useState(null);
  const [tempTitle, setTempTitle] = useState("");

  const startEditing = (item) => {
    setEditingId(item.id);
    setTempTitle(item.title);
  };

  const saveTitle = async (id) => {
    await onUpdateTitle(id, tempTitle);
    setEditingId(null);
  };

  const handleDownload = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
      // Fallback: open in new tab if blob fetch fails
      window.open(url, '_blank');
    }
  };

  return (
    <div className="p-6 bg-gray-50 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Documents & Assets</h2>
        <label className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold cursor-pointer hover:bg-blue-700 transition shadow-lg flex items-center gap-2">
          <UploadCloud size={20} />
          Upload PDF/Doc
          <input type="file" className="hidden" onChange={onFileUpload} accept=".pdf,.doc,.docx,image/*" />
        </label>
      </div>

      {uploadProgress > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <FileText size={24} />
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                <button onClick={() => startEditing(item)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                  <Edit3 size={18} />
                </button>
                <button onClick={() => onDelete(item.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {editingId === item.id ? (
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  className="border-2 border-blue-500 rounded px-2 py-1 text-sm w-full outline-none"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  autoFocus
                />
                <button onClick={() => saveTitle(item.id)} className="text-green-600"><Check size={20} /></button>
                <button onClick={() => setEditingId(null)} className="text-red-600"><X size={20} /></button>
              </div>
            ) : (
              <h3 className="font-bold text-slate-700 truncate mb-1">{item.title}</h3>
            )}
            
            <p className="text-xs text-slate-400 mb-4 uppercase tracking-wider font-semibold">{item.type}</p>
            
            {/* Split Buttons */}
            <div className="flex gap-2">
              <a 
                href={item.url} 
                target="_blank" 
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-50 text-blue-600 rounded-lg font-bold text-xs hover:bg-blue-100 transition"
              >
                <Eye size={14} /> View
              </a>
              <button 
                onClick={() => handleDownload(item.url, item.title)}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-100 text-slate-600 rounded-lg font-bold text-xs hover:bg-slate-200 transition"
              >
                <Download size={14} /> Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CanvasEditor;