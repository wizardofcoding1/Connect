import React, { useEffect } from "react";
import { AlertTriangle, CheckCircle2, AlertCircle, X, Info } from "lucide-react";

const ToastNotification = ({ notification, onClose }) => {
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4500);

    return () => clearTimeout(timer);
  }, [notification, onClose]);

  if (!notification) return null;

  const { type = "warning", title, message } = notification;

  const getIcon = () => {
    switch (type) {
      case "error":
        return <AlertCircle className="text-red-500 shrink-0" size={22} />;
      case "success":
        return <CheckCircle2 className="text-emerald-500 shrink-0" size={22} />;
      case "info":
        return <Info className="text-blue-500 shrink-0" size={22} />;
      default:
        return <AlertTriangle className="text-amber-500 shrink-0" size={22} />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case "error":
        return "border-red-500/50 bg-slate-900/95 text-slate-100 shadow-red-500/20";
      case "success":
        return "border-emerald-500/50 bg-slate-900/95 text-slate-100 shadow-emerald-500/20";
      case "info":
        return "border-blue-500/50 bg-slate-900/95 text-slate-100 shadow-blue-500/20";
      default:
        return "border-amber-500/60 bg-slate-900/95 text-slate-100 shadow-amber-500/20";
    }
  };

  return (
    <div
      className="fixed top-6 right-6 z-200 max-w-md w-full animate-slideIn"
      role="status"
      aria-live="polite"
    >
      <div
        className={`p-4 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-start gap-3.5 transition-all ${getBorderColor()}`}
      >
        <div className="mt-0.5">{getIcon()}</div>
        <div className="flex-1 min-w-0 pr-2">
          <h4 className="font-extrabold text-sm text-white truncate">
            {title || "Notice"}
          </h4>
          <p className="text-xs text-slate-300 font-medium mt-0.5 leading-relaxed">
            {message}
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Dismiss notification"
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default ToastNotification;
