import React from "react";
import { Menu, Sun, Moon } from "lucide-react";

const MobileTopBar = ({ onOpenSidebar, isDarkMode, onToggleDarkMode }) => {
  return (
    <div
      className={`md:hidden flex items-center justify-between p-4 border-b ${
        isDarkMode
          ? "border-slate-800 bg-slate-900/80"
          : "border-slate-200 bg-white/80"
      } backdrop-blur-md`}
    >
      <button
        type="button"
        onClick={onOpenSidebar}
        aria-label="Open menu"
        className="p-2 hover:bg-slate-800 rounded-xl transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        title="Open menu"
      >
        <Menu size={24} className={isDarkMode ? "text-slate-300" : "text-slate-700"} />
      </button>
      <div className="flex items-center gap-2">
        <img src="/connect.png" alt="Connect Logo" className="h-8 w-auto object-contain rounded" />
        <span className="font-extrabold text-blue-500 text-lg tracking-tight">Connect</span>
      </div>
      <button
        type="button"
        onClick={onToggleDarkMode}
        aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        className={`p-2 rounded-xl border transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
          isDarkMode
            ? "bg-slate-800 border-slate-700 text-yellow-400"
            : "bg-slate-100 border-slate-300 text-slate-700"
        }`}
        title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </div>
  );
};

export default React.memo(MobileTopBar);
