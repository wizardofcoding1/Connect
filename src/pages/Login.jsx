import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { User, Lock, ArrowRight, X, Sparkles, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import OurStory from "../components/OurStory";
import { usernameToEmail, normalizeUsername, readableAuthError } from "../lib/auth";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isStoryOpen, setIsStoryOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Set after a successful registration redirect
  const justRegistered = location.state?.registered;

  useEffect(() => {
    if (justRegistered && location.state?.username) {
      setUsername(location.state.username);
    }
  }, [justRegistered, location.state]);

  // Set dynamic browser document title based on modal state
  useEffect(() => {
    if (isStoryOpen) {
      document.title = "Behind the Spark ✨ - Connect";
    } else {
      document.title = "Login - Connect";
    }
  }, [isStoryOpen]);

  // Redirect if user is already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/", { replace: true });
      }
    });
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanUsername = normalizeUsername(username);
    if (!cleanUsername || !password) return;

    setLoading(true);
    setError(null);

    try {
      // Sign in only. Accounts are created on the register page, so a typo in
      // the username can no longer silently create a second account.
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: usernameToEmail(cleanUsername),
        password,
      });

      if (signInError) throw signInError;

      navigate("/", { replace: true });
    } catch (err) {
      setError(readableAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full pl-11 pr-4 py-4 bg-blue-50/50 border-2 border-blue-100 text-blue-900 placeholder-blue-400 rounded-2xl outline-none transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-sm font-semibold focus:bg-white select-text";
  const iconClass =
    "absolute inset-y-0 left-0 flex items-center pl-4 text-blue-400 group-focus-within:text-blue-600 transition-colors";

  return (
    <main className="relative flex items-center justify-center min-h-screen bg-blue-500 overflow-hidden p-4 select-none">
      {/* 1. Ambient Glowing Blobs to create background depth */}
      <div className="absolute top-1/4 left-1/3 w-[30rem] h-[30rem] bg-blue-400/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[24rem] h-[24rem] bg-indigo-400/25 rounded-full blur-[100px] pointer-events-none z-0"></div>

      {/* 2. Login Box Container - Pristine White Card on Blue-500 Background */}
      <div className="relative bg-white/95 backdrop-blur-2xl border-2 border-blue-500/25 p-8 md:p-12 rounded-[2.5rem] shadow-[0_25px_60px_rgba(29,78,216,0.3)] w-full max-w-md text-center transition-all duration-300 hover:border-blue-500/40 hover:shadow-[0_30px_70px_rgba(29,78,216,0.4)] z-10">

        {/* Logo and Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4 group">
            <div className="absolute inset-0 bg-blue-100 rounded-2xl blur-md transition duration-300"></div>
            <img
              src="/connect.png"
              alt="Connect Logo"
              className="relative h-16 w-auto max-w-[200px] object-contain shadow-sm transition duration-350 group-hover:scale-[1.03]"
            />
          </div>

          <h1 className="text-2xl font-black text-blue-900 tracking-tight">
            Connect
          </h1>
          <p className="text-blue-600 text-xs mt-2 max-w-[280px] leading-relaxed font-semibold">
            Your centralized cloud workspace for notes, canvas files, and assets.
          </p>
        </div>

        {justRegistered && !error && (
          <div className="mb-6 p-4 rounded-2xl bg-green-50 border border-green-200 text-green-700 text-xs text-left leading-relaxed flex items-start gap-2">
            <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-green-600" />
            <span>
              <span className="font-bold uppercase tracking-wider text-[9px] block mb-0.5">
                Account created
              </span>
              Sign in with your new username and password.
            </span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs text-left animate-shake leading-relaxed">
            <span className="font-bold uppercase tracking-wider text-[9px] block mb-0.5 text-red-700">Authentication Failed</span>
            {error}
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative group">
            <span className={iconClass}>
              <User size={18} />
            </span>
            <input
              type="text"
              placeholder="Username"
              className={inputClass}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoCapitalize="none"
              spellCheck="false"
              required
              disabled={loading}
            />
          </div>

          <div className="relative group">
            <span className={iconClass}>
              <Lock size={18} />
            </span>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className={`${inputClass} pr-12`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-400 hover:text-blue-600 transition-colors cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || !username.trim() || !password}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60 text-white py-4 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/35 active:scale-[0.98] border border-blue-500/10"
          >
            {loading ? (
              <span className="flex items-center gap-2 text-white font-bold">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Signing in...
              </span>
            ) : (
              <>
                Let's Go <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </form>

        {/* Register Link */}
        <div className="mt-8 text-center text-xs text-blue-500/80 font-medium">
          New here?{" "}
          <Link
            to="/register"
            className="text-blue-700 font-bold hover:text-blue-900 transition duration-200"
          >
            Create an account
          </Link>
        </div>

        {/* Story Trigger Button */}
        <button
          type="button"
          onClick={() => setIsStoryOpen(true)}
          className="mt-6 text-xs text-blue-600 hover:text-blue-800 font-bold transition duration-200 flex items-center justify-center gap-1.5 mx-auto bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-full border border-blue-100 cursor-pointer shadow-sm"
        >
          <Sparkles size={12} className="text-yellow-500" />
          Behind the Spark ✨
        </button>
      </div>

      {/* Story Modal */}
      {isStoryOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="relative bg-white border-2 border-blue-100 rounded-[2.5rem] shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-zoomIn">
            {/* Close Button */}
            <button
              onClick={() => setIsStoryOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition duration-200 z-50 cursor-pointer"
            >
              <X size={20} />
            </button>

            {/* Modal Scrollable Container */}
            <div className="flex-1 overflow-y-auto">
              <OurStory isModal={true} />
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Login;
