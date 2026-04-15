'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    // Simple auth — stored in localStorage
    // Password is checked against env var or hardcoded for now
    if (password === 'custorian2026') {
      localStorage.setItem('custorian_auth', JSON.stringify({ email, ts: Date.now() }));
      router.push('/');
    } else {
      setError('Invalid credentials. Contact tanya@custorian.org for access.');
    }
  }

  return (
    <div className="min-h-screen bg-[#08080c] flex items-center justify-center px-4">
      <div className="h-0.5 bg-gradient-to-r from-[#7c3aed] via-[#a78bfa] to-[#10b981] fixed top-0 left-0 right-0" />

      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Custorian<span className="text-[#a78bfa]">.</span> Intelligence
          </h1>
          <p className="text-[11px] text-gray-500 mt-2 tracking-widest uppercase">
            Detection Analytics Dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg bg-[#111118] border border-[#1e1e2a] text-white text-sm outline-none focus:border-[#a78bfa] transition-colors placeholder:text-gray-600"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg bg-[#111118] border border-[#1e1e2a] text-white text-sm outline-none focus:border-[#a78bfa] transition-colors placeholder:text-gray-600"
          />

          {error && (
            <div className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-full bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] text-white text-sm font-bold hover:shadow-lg hover:shadow-purple-500/20 transition-all"
          >
            Sign In
          </button>
        </form>

        <div className="text-center mt-12 text-[10px] text-gray-600">
          Custorian Intelligence is for authorised institutional users only.
          <br />Schools, municipalities, and certified partners.
          <br /><a href="https://custorian.org" className="text-[#a78bfa] hover:underline">custorian.org</a>
        </div>
      </div>
    </div>
  );
}
