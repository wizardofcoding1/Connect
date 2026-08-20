import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { User, Lock, IdCard, ArrowRight, Eye, EyeOff } from "lucide-react";
import {
  usernameToEmail,
  normalizeUsername,
  validateUsername,
  validatePassword,
  readableAuthError,
  MIN_PASSWORD_LENGTH,
} from "../lib/auth";

const Register = () => {
  // One object for the form fields; each input carries a matching `name`, so
  // a single handler covers all of them.
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const { fullName, username, password, confirmPassword } = form;

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    document.title = "Register - Connect";
  }, []);

  // Someone already signed in has no business on this page
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/", { replace: true });
    });
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) return setError("Full name is required");

    const usernameError = validateUsername(username);
    if (usernameError) return setError(usernameError);

    const passwordError = validatePassword(password);
    if (passwordError) return setError(passwordError);

    if (password !== confirmPassword) return setError("Passwords do not match");

    setLoading(true);

    try {
      const cleanUsername = normalizeUsername(username);

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: usernameToEmail(cleanUsername),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            username: cleanUsername,
            display_name: cleanUsername,
          },
        },
      });

      if (signUpError) throw signUpError;

      // Supabase may hand back a session straight away. Registration is meant
      // to end at the login page, so drop it rather than slipping the user in.
      if (data?.session) await supabase.auth.signOut();

      navigate("/login", {
        replace: true,
        state: { registered: true, username: cleanUsername },
      });
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
      <div className="absolute top-1/4 left-1/3 w-[30rem] h-[30rem] bg-blue-400/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[24rem] h-[24rem] bg-indigo-400/25 rounded-full blur-[100px] pointer-events-none z-0"></div>

      <div className="relative bg-white/95 backdrop-blur-2xl border-2 border-blue-500/25 p-8 md:p-10 rounded-[2.5rem] shadow-[0_25px_60px_rgba(29,78,216,0.3)] w-full max-w-md text-center transition-all duration-300 hover:border-blue-500/40 z-10">
        <div className="flex flex-col items-center mb-7">
          <div className="relative mb-4 group">
            <div className="absolute inset-0 bg-blue-100 rounded-2xl blur-md transition duration-300"></div>
            <img
              src="/connect.png"
              alt="Connect Logo"
              className="relative h-14 w-auto max-w-[200px] object-contain shadow-sm transition duration-350 group-hover:scale-[1.03]"
            />
          </div>

          <h1 className="text-2xl font-black text-blue-900 tracking-tight">
            Create your account
          </h1>
          <p className="text-blue-600 text-xs mt-2 max-w-[280px] leading-relaxed font-semibold">
            Pick a username and password to get started.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs text-left animate-shake leading-relaxed">
            <span className="font-bold uppercase tracking-wider text-[9px] block mb-0.5 text-red-700">
              Registration Failed
            </span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="relative group">
            <span className={iconClass}>
              <IdCard size={18} />
            </span>
            <input
              type="text"
              placeholder="Full name"
              className={inputClass}
              name="fullName"
              value={fullName}
              onChange={handleChange}
              autoComplete="name"
              required
              disabled={loading}
            />
          </div>

          <div className="relative group">
            <span className={iconClass}>
              <User size={18} />
            </span>
            <input
              type="text"
              placeholder="Username"
              className={inputClass}
              name="username"
              value={username}
              onChange={handleChange}
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
              placeholder={`Password (min ${MIN_PASSWORD_LENGTH} characters)`}
              className={`${inputClass} pr-12`}
              name="password"
              value={password}
              onChange={handleChange}
              autoComplete="new-password"
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

          <div className="relative group">
            <span className={iconClass}>
              <Lock size={18} />
            </span>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm password"
              className={inputClass}
              name="confirmPassword"
              value={confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              required
              disabled={loading}
            />
          </div>

          {confirmPassword && password !== confirmPassword && (
            <p className="text-[11px] text-red-500 font-semibold text-left pl-1">
              Passwords do not match
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60 text-white py-4 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/35 active:scale-[0.98] border border-blue-500/10"
          >
            {loading ? (
              <span className="flex items-center gap-2 text-white font-bold">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Creating account...
              </span>
            ) : (
              <>
                Register <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-7 text-center text-xs text-blue-500/80 font-medium">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-700 font-bold hover:text-blue-900 transition duration-200"
          >
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
};

export default Register;
