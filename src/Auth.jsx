import React, { useState } from 'react';
import { supabase } from './supabaseClient';

const Auth = ({ onAuthSuccess }) => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername) return;

    setLoading(true);
    // Auto-generate a consistent email and password based on the username
    const fakeEmail = `${cleanUsername}@canvanotes.com`;
    const staticPassword = "PermanentPassword123!"; 

    try {
      // 1. Try to Login
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: fakeEmail,
        password: staticPassword,
      });

      if (signInError) {
        // 2. If login fails, try to Register (Sign Up)
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: fakeEmail,
          password: staticPassword,
          options: {
            data: { display_name: cleanUsername }
          }
        });

        if (signUpError) throw signUpError;
        onAuthSuccess(signUpData.user);
      } else {
        // Successfully logged back in as existing user
        onAuthSuccess(signInData.user);
      }
    } catch (error) {
      alert("Auth Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-6">Welcome To Connect</h1>
        <p className="text-gray-500 mb-4">Login with your username to see your saved notes</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="text" 
            placeholder="Username" 
            className="w-full p-4 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button 
            disabled={loading}
            className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold hover:bg-blue-700 transition"
          >
            {loading ? 'Authenticating...' : 'Login / Register'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;