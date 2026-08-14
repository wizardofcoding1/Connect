import React from "react";
import {
  LogOut,
  FileText,
  StickyNote,
  Sparkles,
  UserX,
  Link2,
  Sun,
  Moon,
} from "lucide-react";

const Sidebar = ({
  userEmail,
  setViewType,
  viewType,
  onLogout,
  onDeleteAccount,
  isDarkMode = true,
  setIsDarkMode,
}) => {
  return (
    <div
      className={`w-64 flex flex-col h-full border-r transition-colors duration-300 shadow-2xl ${
        isDarkMode
          ? "bg-slate-900/90 backdrop-blur-md text-white border-slate-800"
          : "bg-white text-slate-900 border-slate-200"
      }`}
    >
      {/* Sidebar Header */}
      <div
        className={`p-6 border-b flex flex-col gap-1 ${
          isDarkMode ? "border-slate-800/80" : "border-slate-200"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/connect.png"
              alt="Connect Logo"
              className="h-10 w-auto max-w-[150px] object-contain drop-shadow-md rounded-lg"
            />
            <span
              className={`text-xl font-bold bg-clip-text text-transparent ${
                isDarkMode
                  ? "bg-gradient-to-r from-blue-400 to-indigo-100"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600"
              }`}
            >
              Connect
            </span>
          </div>

          {/* Theme Toggle Button */}
          {setIsDarkMode && (
            <button
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className={`p-2 rounded-xl border transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                isDarkMode
                  ? "bg-slate-800 border-slate-700 text-yellow-400 hover:bg-slate-750"
                  : "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200"
              }`}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          )}
        </div>

        <p
          className={`text-[10px] font-bold uppercase tracking-wider mt-3 truncate max-w-full ${
            isDarkMode ? "text-slate-400" : "text-slate-500"
          }`}
        >
          Logged as:{" "}
          <span className="text-blue-500 font-semibold lowercase">
            {userEmail}
          </span>
        </p>
      </div>

      {/* Navigation Options */}
      <nav className="flex-1 p-4 space-y-1.5 mt-2">
        {/* Notes Tab */}
        <button
          onClick={() => setViewType("notes")}
          aria-current={viewType === "notes" ? "page" : undefined}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-semibold text-sm group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
            viewType === "notes"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
              : isDarkMode
              ? "text-slate-400 hover:text-white hover:bg-slate-800/60"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <StickyNote
            size={18}
            className={`transition-colors duration-200 ${
              viewType === "notes"
                ? "text-white"
                : isDarkMode
                ? "text-slate-500 group-hover:text-slate-300"
                : "text-slate-400 group-hover:text-slate-700"
            }`}
          />
          My Notes
        </button>

        {/* Documents Tab */}
        <button
          onClick={() => setViewType("canvas")}
          aria-current={viewType === "canvas" ? "page" : undefined}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-semibold text-sm group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
            viewType === "canvas"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
              : isDarkMode
              ? "text-slate-400 hover:text-white hover:bg-slate-800/60"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <FileText
            size={18}
            className={`transition-colors duration-200 ${
              viewType === "canvas"
                ? "text-white"
                : isDarkMode
                ? "text-slate-500 group-hover:text-slate-300"
                : "text-slate-400 group-hover:text-slate-700"
            }`}
          />
          Documents
        </button>

        {/* Saved Links Tab */}
        <button
          onClick={() => setViewType("links")}
          aria-current={viewType === "links" ? "page" : undefined}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-semibold text-sm group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
            viewType === "links"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
              : isDarkMode
              ? "text-slate-400 hover:text-white hover:bg-slate-800/60"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Link2
            size={18}
            className={`transition-colors duration-200 ${
              viewType === "links"
                ? "text-white"
                : isDarkMode
                ? "text-slate-500 group-hover:text-slate-300"
                : "text-slate-400 group-hover:text-slate-700"
            }`}
          />
          Saved Links
        </button>

        {/* Behind the Spark Tab */}
        <button
          onClick={() => setViewType("story")}
          aria-current={viewType === "story" ? "page" : undefined}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-semibold text-sm group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
            viewType === "story"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
              : isDarkMode
              ? "text-slate-400 hover:text-white hover:bg-slate-800/60"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Sparkles
            size={18}
            className={`transition-colors duration-200 ${
              viewType === "story"
                ? "text-white"
                : isDarkMode
                ? "text-slate-500 group-hover:text-slate-300"
                : "text-slate-400 group-hover:text-slate-700"
            }`}
          />
          Behind the Spark ✨
        </button>
      </nav>

      {/* Sidebar Footer */}
      <div
        className={`p-4 border-t space-y-1.5 ${
          isDarkMode ? "border-slate-800/80" : "border-slate-200"
        }`}
      >
        <button
          onClick={onLogout}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 font-semibold text-xs group active:scale-[0.98] cursor-pointer ${
            isDarkMode
              ? "text-slate-400 hover:bg-slate-800/60 hover:text-white"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <LogOut
            size={16}
            className={`transition-colors ${
              isDarkMode
                ? "text-slate-400 group-hover:text-white"
                : "text-slate-500 group-hover:text-slate-900"
            }`}
          />
          Logout
        </button>

        <button
          onClick={onDeleteAccount}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-red-500 hover:bg-red-500/10 rounded-xl transition-all duration-200 font-semibold text-xs hover:text-red-600 group active:scale-[0.98] cursor-pointer"
        >
          <UserX
            size={16}
            className="text-red-500/80 group-hover:text-red-600 transition-colors"
          />
          Delete Account
        </button>
      </div>
    </div>
  );
};

export default React.memo(Sidebar);
