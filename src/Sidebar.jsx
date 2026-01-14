import React from 'react';
import { LogOut, FileText, StickyNote } from 'lucide-react';

const Sidebar = ({ userEmail, setViewType, viewType, onLogout }) => {
  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col h-full">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold text-blue-400">Connect</h1>
        <p className="text-xs text-slate-400 mt-1 truncate">Logged as: {userEmail}</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <button 
          onClick={() => setViewType('notes')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
            viewType === 'notes' ? 'bg-blue-600' : 'hover:bg-slate-800'
          }`}
        >
          <StickyNote size={20} /> My Notes
        </button>
        <button 
          onClick={() => setViewType('canvas')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
            viewType === 'canvas' ? 'bg-blue-600' : 'hover:bg-slate-800'
          }`}
        >
          <FileText size={20} /> Documents
        </button>
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={onLogout} // This triggers the handleLogout in App.jsx
          className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-xl transition"
        >
          <LogOut size={20} /> Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;