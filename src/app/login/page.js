'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';

export default function LoginPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [form, setForm] = useState({
    usernameOrEmail: '',
    password: '',
    remember: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validate = () => {
    if (!form.usernameOrEmail.trim()) return 'Username or Email is required.';
    if (!form.password) return 'Password is required.';
    return '';
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setLoading(true);
    // Mock login (replace with real API call when backend ready)
    setTimeout(() => {
      setSuccess('Login successful! Redirecting...');
      setLoading(false);
      setTimeout(() => router.push('/'), 1200);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl space-y-6 relative border border-gray-200 dark:border-gray-700"
      >
        <button
          type="button"
          onClick={toggleTheme}
          className="absolute top-4 right-4 p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <h2 className="text-3xl font-extrabold text-center text-blue-600 dark:text-blue-400 mb-2">Sign In</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">Username or Email</label>
            <input
              type="text"
              name="usernameOrEmail"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring text-gray-900 dark:text-white dark:bg-gray-900 dark:border-gray-400 placeholder-gray-400 dark:placeholder-gray-500"
              value={form.usernameOrEmail}
              onChange={handleChange}
              required
              autoComplete="username"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring text-gray-900 dark:text-white dark:bg-gray-900 dark:border-gray-400 placeholder-gray-400 dark:placeholder-gray-500 pr-10"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
                autoComplete="current-password"
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  // Eye open (Heroicons solid)
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12C3.5 7.5 7.5 4.5 12 4.5s8.5 3 9.75 7.5c-1.25 4.5-5.25 7.5-9.75 7.5s-8.5-3-9.75-7.5z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  // Eye slash (Heroicons solid)
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M4.5 4.5C2.5 7.5 2.5 12 4.5 15.5M19.5 19.5C21.5 16.5 21.5 12 19.5 8.5M9.75 9.75A3 3 0 0112 9c1.657 0 3 1.343 3 3 0 .414-.08.81-.22 1.17M15.75 15.75A3 3 0 0112 15c-1.657 0-3-1.343-3-3 0-.414.08-.81.22-1.17" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="remember"
            name="remember"
            checked={form.remember}
            onChange={handleChange}
            className="mr-2"
          />
          <label htmlFor="remember" className="text-sm text-gray-600 dark:text-gray-300">Remember Me</label>
        </div>
        {error && <div className="text-red-600 text-center">{error}</div>}
        {success && <div className="text-green-600 text-center">{success}</div>}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white py-3 rounded-lg hover:from-blue-700 hover:to-blue-500 transition-colors font-bold text-lg shadow-md"
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
        <div className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
          Do not have an account?{' '}
          <Link href="/register" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500">
            Register
          </Link>
        </div>
      </form>
    </div>
  );
}
