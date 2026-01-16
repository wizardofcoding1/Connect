import React, { useState, useEffect } from 'react';
import { Plus, X, Save, Edit3, Sun, Moon } from 'lucide-react';

const Notepad = ({ tabs, activeTabId, setActiveTabId, onAddTab, onUpdate, onDelete }) => {
  const [localContent, setLocalContent] = useState("");
  const [localTitle, setLocalTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  const activeNote = tabs.find(t => t.id === activeTabId);

  useEffect(() => {
    if (activeNote) {
      setLocalContent(activeNote.content);
      setLocalTitle(activeNote.title);
    }
  }, [activeTabId, activeNote]);

  const handleManualSave = async () => {
    if (!activeNote) return;
    setIsSaving(true);
    await onUpdate(activeNote.id, localContent, localTitle);
    setTimeout(() => setIsSaving(false), 800);
  };

  return (
    <div className={`flex flex-col h-full transition-colors duration-300 ${isDarkMode ? 'bg-[#1e1e1e]' : 'bg-white'}`}>
      
      {/* Tabs Row - Mobile Scrollable */}
      <div className={`flex items-center gap-1 p-2 border-b transition-colors ${
        isDarkMode ? 'bg-[#252526] border-[#333]' : 'bg-gray-100 border-gray-200'
      } overflow-x-auto no-scrollbar`}>
        {tabs.map((tab) => (
          <div 
            key={tab.id} 
            className={`flex items-center gap-2 px-3 py-1.5 border-t-2 rounded-t transition text-xs cursor-pointer shrink-0 ${
              activeTabId === tab.id 
                ? (isDarkMode ? 'bg-[#1e1e1e] border-t-[#007acc] text-white' : 'bg-white border-t-blue-600 text-blue-600 shadow-sm') 
                : (isDarkMode ? 'bg-[#2d2d2d] border-t-transparent text-[#969696] hover:bg-[#37373d]' : 'bg-gray-200 border-t-transparent text-gray-500 hover:bg-gray-300')
            }`}
            onClick={() => setActiveTabId(tab.id)}
          >
            <span className="max-w-[100px] truncate font-medium">{tab.title}</span>
            <button onClick={(e) => { e.stopPropagation(); onDelete(tab.id); }} className="hover:text-red-500 ml-1">
              <X size={14} />
            </button>
          </div>
        ))}
        <button onClick={onAddTab} className={`p-1.5 rounded ml-1 transition ${
          isDarkMode ? 'hover:bg-[#3e3e42] text-[#ccc]' : 'hover:bg-gray-300 text-gray-600'
        }`}>
          <Plus size={18} />
        </button>
      </div>

      {/* Action Bar - Fixed for Mobile Scaling */}
      <div className={`px-4 py-3 flex flex-wrap justify-between border-b items-center gap-3 transition-colors ${
        isDarkMode ? 'bg-[#252526] border-[#333]' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center gap-3 flex-grow sm:flex-grow-0">
          
          {/* Theme Toggle */}
          <div className="flex items-center gap-2 shrink-0">
             <div 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`relative w-12 h-6 rounded-full cursor-pointer flex items-center p-1 transition-all ${
                isDarkMode ? 'bg-[#3c3c3c]' : 'bg-gray-200'
              }`}
            >
              <div className={`absolute w-4 h-4 rounded-full transition-all duration-300 shadow-sm ${
                isDarkMode ? 'translate-x-6 bg-[#007acc]' : 'translate-x-0 bg-white'
              }`} />
              <div className="relative z-10 w-full flex justify-between px-1 pointer-events-none">
                <Sun size={10} className={isDarkMode ? 'text-gray-500' : 'text-orange-500'} />
                <Moon size={10} className={isDarkMode ? 'text-white' : 'text-gray-400'} />
              </div>
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-widest hidden xs:block ${isDarkMode ? 'text-blue-400' : 'text-gray-400'}`}>
              {isDarkMode ? 'Dark' : 'Light'}
            </span>
          </div>

          {/* Title Input */}
          <input 
            type="text"
            className={`rounded px-3 py-2 text-sm font-semibold outline-none transition-colors flex-1 min-w-[100px] sm:w-48 ${
              isDarkMode ? 'bg-[#3c3c3c] border-none text-[#ccc] focus:ring-1 focus:ring-[#007acc]' : 'bg-gray-50 border border-gray-200 text-gray-700'
            }`}
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            placeholder="Tab Name..."
          />
        </div>

        {/* Save Button - Fixed with whitespace-nowrap and shrink-0 */}
        <button 
          onClick={handleManualSave}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm transition active:scale-95 shrink-0 ${
            isDarkMode ? 'bg-[#007acc] text-white hover:bg-[#005fb8]' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
          }`}
        >
          <Save size={16} /> 
          <span className="whitespace-nowrap">{isSaving ? "Syncing..." : "Save Sync"}</span>
        </button>
      </div>

      {/* Editor Area */}
      <div className="flex-1 p-4 md:p-6 overflow-hidden">
        {activeNote ? (
          <textarea
            className={`w-full h-full p-6 md:p-10 border rounded-xl outline-none resize-none leading-relaxed transition-all duration-300 ${
              isDarkMode 
                ? 'bg-[#1e1e1e] border-[#333] text-[#d4d4d4] font-mono text-sm' 
                : 'bg-white border-gray-200 text-gray-700 font-sans text-base shadow-inner'
            }`}
            value={localContent}
            onChange={(e) => setLocalContent(e.target.value)}
            placeholder="Type your notes here..."
            spellCheck={false}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full opacity-20 text-gray-400">
            <Edit3 size={48} className="mb-2" />
            <p>Select a note to begin</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notepad;