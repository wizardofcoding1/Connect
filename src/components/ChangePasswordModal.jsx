import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { Lock, X, Eye, EyeOff, CheckCircle2, ShieldCheck, Loader2 } from "lucide-react";
import { validatePassword, readableAuthError, MIN_PASSWORD_LENGTH } from "../lib/auth";

/**
 * Change password, gated on the current one.
 *
 * Holding a session is not proof of identity — a browser could be left open or
 * a token stolen — and Supabase's updateUser() would change the password on
 * the session alone. Re-authenticating with the current password is what
 * establishes the person is the account's genuine owner.
 */
export default function ChangePasswordModal({ isOpen, onClose, isDarkMode = true }) {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const { currentPassword, newPassword, confirmPassword } = form;

  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const reset = () => {
    setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setError(null);
    setSuccess(false);
    setShowPasswords(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!currentPassword) return setError("Enter your current password");

    const passwordError = validatePassword(newPassword);
    if (passwordError) return setError(passwordError);

    if (newPassword !== confirmPassword) return setError("New passwords do not match");
    if (newPassword === currentPassword) {
      return setError("New password must be different from the current one");
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error("Your session has expired. Please sign in again.");

      // Proof of identity: this fails unless they know the current password
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (reauthError) {
        setError("Current password is incorrect");
        setLoading(false);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      setSuccess(true);
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setError(readableAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const panel = isDarkMode
    ? "bg-slate-900 border-slate-700"
    : "bg-white border-slate-200";
  const heading = isDarkMode ? "text-slate-100" : "text-slate-900";
  const muted = isDarkMode ? "text-slate-400" : "text-slate-500";
  const inputClass = `w-full pl-10 pr-11 py-3 rounded-xl border-2 text-sm font-medium outline-none transition-all focus:ring-4 ${
    isDarkMode
      ? "bg-slate-800/60 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/15"
      : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-100"
  }`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md"
      onClick={handleClose}
    >
      <div
        className={`relative w-full max-w-md rounded-2xl border p-6 shadow-2xl ${panel}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className={`absolute right-4 top-4 rounded-lg p-1.5 transition-colors ${
            isDarkMode ? "text-slate-400 hover:bg-white/10" : "text-slate-500 hover:bg-black/5"
          }`}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-500">
            <ShieldCheck size={20} />
          </span>
          <div>
            <h2 className={`text-lg font-bold ${heading}`}>Change password</h2>
            <p className={`text-xs ${muted}`}>
              Confirm your current password to continue
            </p>
          </div>
        </div>

        {success ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-xl border border-green-500/40 bg-green-500/10 p-4">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-green-500" />
              <div>
                <p className="text-sm font-semibold text-green-500">Password updated</p>
                <p className={`mt-1 text-xs ${muted}`}>
                  Use your new password the next time you sign in.
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs font-medium text-red-400">
                {error}
              </div>
            )}

            <div className="relative">
              <Lock size={16} className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${muted}`} />
              <input
                type={showPasswords ? "text" : "password"}
                name="currentPassword"
                value={currentPassword}
                onChange={handleChange}
                placeholder="Current password"
                autoComplete="current-password"
                className={inputClass}
                required
                disabled={loading}
              />
            </div>

            <div className="relative">
              <Lock size={16} className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${muted}`} />
              <input
                type={showPasswords ? "text" : "password"}
                name="newPassword"
                value={newPassword}
                onChange={handleChange}
                placeholder={`New password (min ${MIN_PASSWORD_LENGTH} characters)`}
                autoComplete="new-password"
                className={inputClass}
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPasswords((v) => !v)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${muted} hover:text-blue-500`}
                aria-label={showPasswords ? "Hide passwords" : "Show passwords"}
              >
                {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="relative">
              <Lock size={16} className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${muted}`} />
              <input
                type={showPasswords ? "text" : "password"}
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
                autoComplete="new-password"
                className={inputClass}
                required
                disabled={loading}
              />
            </div>

            {confirmPassword && newPassword !== confirmPassword && (
              <p className="pl-1 text-[11px] font-semibold text-red-400">
                Passwords do not match
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-semibold text-white transition-all hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Updating...
                </>
              ) : (
                "Update password"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
