import React, { useState, useEffect } from 'react';
import { Plus, X, Cloud, Check, Save, Edit3 } from 'lucide-react';

const Notepad = ({ tabs, activeTabId, setActiveTabId, onAddTab, onUpdate, onDelete }) => {
  const [localContent, setLocalContent] = useState("");
  const [localTitle, setLocalTitle] = useState(""); // State for the title
  const [isSaving, setIsSaving] = useState(false);
  
  const activeNote = tabs.find(t => t.id === activeTabId);

  // Sync local state when tab changes
  useEffect(() => {
    if (activeNote) {
      setLocalContent(activeNote.content);
      setLocalTitle(activeNote.title);
    }
  }, [activeTabId, activeNote]);

  const handleManualSave = async () => {
    if (!activeNote) return;
    setIsSaving(true);
    // Pass both title and content to the update function
    await onUpdate(activeNote.id, localContent, localTitle);
    setTimeout(() => setIsSaving(false), 800);
  };

  return (
    <div className="flex flex-col h-full bg-[#f0f2f5]">
      {/* Tabs Row */}
      <div className="flex items-center gap-1 p-2 bg-white border-b overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <div 
            key={tab.id} 
            className={`flex items-center gap-2 px-3 py-1 border rounded text-sm cursor-pointer shrink-0 transition ${
              activeTabId === tab.id ? 'bg-white border-blue-500 text-blue-600 shadow-sm' : 'bg-gray-50 border-gray-300 text-gray-500'
            }`}
            onClick={() => setActiveTabId(tab.id)}
          >
            <span className="max-w-[100px] truncate font-medium">{tab.title}</span>
            <button onClick={(e) => { e.stopPropagation(); onDelete(tab.id); }} className="hover:text-red-500"><X size={12} /></button>
          </div>
        ))}
        <button onClick={onAddTab} className="p-1.5 hover:bg-gray-100 rounded border border-gray-300"><Plus size={16} /></button>
      </div>

      {/* Action Bar */}
      <div className="bg-white px-4 py-2 flex justify-between border-b items-center gap-4">
        <div className="flex items-center gap-3 flex-1">
          <input 
            type="text"
            className="bg-gray-50 border border-gray-200 rounded px-3 py-1.5 text-sm font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-blue-400 w-full max-w-xs"
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            placeholder="Tab Name..."
          />
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest hidden md:flex">
            {isSaving ? <><Cloud size={14} className="text-orange-400 animate-bounce" /> <span className="text-orange-500">Syncing...</span></> 
                      : <><Check size={14} className="text-green-500" /> <span className="text-green-600">Saved</span></>}
          </div>
        </div>

        <button 
          onClick={handleManualSave}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition font-bold text-sm shadow-md active:scale-95"
        >
          <Save size={16} /> Save & Rename
        </button>
      </div>

      {/* Editor */}
      <div className="flex-1 p-4 overflow-hidden">
        {activeNote ? (
          <textarea
            className="w-full h-full p-8 border border-gray-300 rounded-lg shadow-inner outline-none font-mono text-gray-700 resize-none bg-white leading-relaxed text-base"
            value={localContent}
            onChange={(e) => setLocalContent(e.target.value)}
            placeholder="Type your notes here..."
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Edit3 size={48} className="mb-2 opacity-20" />
            <p className="italic">Click the + button to create a new tab</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notepad;