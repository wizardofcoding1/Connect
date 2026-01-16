import React, { useState } from 'react';
import { FileText, Trash2, Eye, Download, Edit3, Check, X, UploadCloud, AlertCircle, Code, LayoutGrid } from 'lucide-react';

const CanvasEditor = ({ items, onDelete, onFileUpload, uploadProgress, onUpdateTitle }) => {
  const [editingId, setEditingId] = useState(null);
  const [tempTitle, setTempTitle] = useState("");
  const [codeMode, setCodeMode] = useState(false); 
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const startEditing = (item) => {
    setEditingId(item.id);
    setTempTitle(item.title);
  };

  const saveTitle = async (id) => {
    await onUpdateTitle(id, tempTitle);
    setEditingId(null);
  };

  const confirmDelete = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const handleDelete = () => {
    if (itemToDelete) {
      onDelete(itemToDelete.id);
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  return (
    <div className={`p-6 h-full overflow-y-auto relative transition-colors duration-300 ${codeMode ? 'bg-[#0d1117]' : 'bg-gray-50'}`}>
      
      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className={`${codeMode ? 'bg-[#161b22] border border-[#30363d]' : 'bg-white'} rounded-3xl p-8 max-w-sm w-full shadow-2xl transition-colors`}>
            <div className="flex flex-col items-center text-center">
              <div className="bg-red-100 p-4 rounded-full text-red-600 mb-4"><AlertCircle size={32} /></div>
              <h3 className={`text-xl font-bold mb-2 ${codeMode ? 'text-white' : 'text-slate-800'}`}>Delete Document?</h3>
              <p className={`${codeMode ? 'text-slate-400' : 'text-slate-500'} mb-8`}>
                Are you sure you want to delete <span className="font-semibold text-blue-500">"{itemToDelete?.title}"</span>?
              </p>
              <div className="flex gap-3 w-full">
                <button onClick={() => setShowDeleteModal(false)} className={`flex-1 px-6 py-3 rounded-xl font-bold transition ${codeMode ? 'bg-[#30363d] text-white' : 'bg-slate-100 text-slate-600'}`}>Cancel</button>
                <button onClick={handleDelete} className="flex-1 px-6 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${codeMode ? 'text-white' : 'text-slate-800'}`}>Documents & Assets</h2>
          <p className={`text-sm ${codeMode ? 'text-slate-400' : 'text-slate-500'}`}>Manage your project files</p>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto">
          <button 
            onClick={() => setCodeMode(!codeMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all border-2 ${
                codeMode 
                ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                : 'bg-white border-slate-200 text-slate-600 shadow-sm'
            }`}
          >
            {codeMode ? <Code size={20} /> : <LayoutGrid size={20} />}
            {codeMode ? "Code Mode" : "Grid View"}
          </button>

          <label className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold cursor-pointer hover:bg-blue-700 transition shadow-lg flex items-center gap-2 ml-auto">
            <UploadCloud size={20} />
            <span className="hidden sm:inline">Upload</span>
            <input type="file" className="hidden" onChange={onFileUpload} accept=".pdf,.doc,.docx,image/*" />
          </label>
        </div>
      </div>

      {uploadProgress > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-6 overflow-hidden">
          <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
        </div>
      )}

      {/* ITEMS LIST */}
      <div className={codeMode ? "flex flex-col gap-3" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}>
        {items.map((item) => (
          <div 
            key={item.id} 
            className={`transition-all duration-200 ${
              codeMode 
              ? 'bg-[#161b22] border-l-4 border-blue-500 p-4 flex items-center justify-between group hover:bg-[#1c2128]' 
              : 'bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-400 group transition-all duration-300'
            }`}
          >
            {/* ITEM CONTENT */}
            <div className={codeMode ? "flex items-center gap-4 flex-1 min-w-0" : ""}>
              <div className={`p-3 rounded-xl transition-colors ${codeMode ? 'bg-slate-800 text-blue-400' : 'bg-blue-50 text-blue-600'} ${codeMode ? '' : 'mb-4 w-fit'}`}>
                <FileText size={codeMode ? 18 : 24} />
              </div>

              <div className="min-w-0 flex-1">
                {editingId === item.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      className={`rounded px-2 py-1 text-sm outline-none w-full ${codeMode ? 'bg-[#0d1117] text-white border-blue-500 border' : 'bg-gray-50 border-2 border-blue-500 text-slate-700'}`}
                      value={tempTitle}
                      onChange={(e) => setTempTitle(e.target.value)}
                      autoFocus
                    />
                    <button onClick={() => saveTitle(item.id)} className="text-green-500"><Check size={20} /></button>
                    <button onClick={() => setEditingId(null)} className="text-red-500"><X size={20} /></button>
                  </div>
                ) : (
                  <div>
                    {/* CONDITIONAL RENDERING: NORMAL vs CODE DISPLAY */}
                    <h3 className={`font-bold truncate transition-colors ${codeMode ? 'text-slate-300 font-mono text-sm' : 'text-slate-700 mb-1'}`}>
                      {codeMode ? (
                        <>
                          <span className="text-blue-500 opacity-60 mr-2">const</span>
                          {item.title.replace(/\s+/g, '_')} 
                          <span className="text-blue-500 opacity-60"> = </span>
                          <span className="text-orange-400">"{item.type}"</span>
                        </>
                      ) : (
                        item.title /* NORMAL FILE NAME DISPLAY */
                      )}
                    </h3>
                    {!codeMode && <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{item.type}</p>}
                  </div>
                )}
              </div>
            </div>

            {/* ACTIONS */}
            <div className={`flex items-center gap-2 ${codeMode ? 'ml-4' : 'mt-5 border-t border-slate-100 pt-4'}`}>
                <div className={`flex items-center gap-1 transition-opacity ${codeMode ? 'opacity-0 group-hover:opacity-100' : ''}`}>
                    <button onClick={() => startEditing(item)} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition"><Edit3 size={18} /></button>
                    <button onClick={() => confirmDelete(item)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 size={18} /></button>
                </div>
                
                <div className={`flex flex-1 gap-2 pl-2 border-l ${codeMode ? 'border-slate-700' : 'border-slate-100'}`}>
                    <a href={item.url} target="_blank" rel="noreferrer" className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-bold text-xs transition ${codeMode ? 'text-blue-400 bg-blue-500/10 hover:bg-blue-500/20' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-100'}`}>
                        <Eye size={16} /> {codeMode ? '' : 'View File'}
                    </a>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CanvasEditor;