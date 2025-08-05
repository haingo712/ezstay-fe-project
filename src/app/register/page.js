'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './register.module.css';
import { apiFetch, API_URL } from '../../utils/api';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone_number: '',
    full_name: '',
    remember: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dark, setDark] = useState(false);

  // Sync dark mode with localStorage and html class
  useEffect(() => {
    const saved = localStorage.getItem('ezstay-dark');
    if (saved === 'true') {
      setDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleToggleTheme = () => {
    const newDark = !dark;
    setDark(newDark);
    localStorage.setItem('ezstay-dark', newDark ? 'true' : 'false');
    if (newDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const validate = () => {
    // Username: 6-30 ký tự, chỉ chữ cái, số, _, không bắt đầu bằng số, không khoảng trắng
    if (!form.username.trim()) return 'Username is required.';
    if (!/^[a-zA-Z_][a-zA-Z0-9_]{5,29}$/.test(form.username)) return 'Username must be 6-30 characters, start with a letter or _, and contain only letters, numbers, underscores.';
    // Email
    if (!form.email.trim()) return 'Email is required.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) return 'Invalid email format.';
    // Password: 6+ ký tự, 1 hoa, 1 thường, 1 số
    if (!form.password) return 'Password is required.';
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(form.password))
      return 'Password must be at least 6 characters, include uppercase, lowercase, and number.';
    // Confirm password
    if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    // Phone number: nếu nhập thì phải là số, 9-15 ký tự, có thể bắt đầu bằng +
    if (form.phone_number && !/^\+?\d{9,15}$/.test(form.phone_number))
      return 'Phone number must be 9-15 digits and can start with +.';
    // Full name: nếu nhập thì chỉ chữ cái, khoảng trắng, gạch ngang, tối đa 100 ký tự
    if (form.full_name && !/^[a-zA-Z\s-]{1,100}$/.test(form.full_name))
      return 'Full name can only contain letters, spaces, and hyphens (max 100 characters).';
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
    if (API_URL) {
      // Gọi API backend ASP.NET
      try {
        await apiFetch('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            username: form.username,
            email: form.email,
            password: form.password,
            phone_number: form.phone_number,
            full_name: form.full_name,
          }),
        });
        setSuccess('Registration successful! You can now sign in.');
        setForm({ username: '', email: '', password: '', confirmPassword: '', phone_number: '', full_name: '', remember: false });
        setTimeout(() => router.push('/login'), 1500);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    } else {
      // Mock register nếu chưa có backend
      setTimeout(() => {
        setSuccess('Registration successful! You can now sign in.');
        setLoading(false);
        setForm({ username: '', email: '', password: '', confirmPassword: '', phone_number: '', full_name: '', remember: false });
        setTimeout(() => router.push('/login'), 1500);
      }, 1200);
    }
  };

  return (
    <div className={
      `min-h-screen flex items-center justify-center transition-colors duration-300 ${dark ? 'bg-gray-900' : 'bg-gray-100'}`
    }>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl space-y-6 relative border border-gray-200 dark:border-gray-700"
        style={{ boxShadow: dark ? '0 8px 32px 0 rgba(31, 38, 135, 0.37)' : undefined }}
      >
        <button
          type="button"
          onClick={handleToggleTheme}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-blue-600 transition-colors"
          aria-label="Toggle theme"
        >
          {dark ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
            </svg>
          )}
        </button>
        <h2 className="text-3xl font-extrabold text-center text-blue-600 dark:text-blue-400 mb-2">Create Account</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">Username</label>
            <input
              type="text"
              name="username"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring text-gray-900 dark:text-white dark:bg-gray-900 dark:border-gray-400 placeholder-gray-400 dark:placeholder-gray-500"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">Email</label>
            <input
              type="email"
              name="email"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring text-gray-900 dark:text-white dark:bg-gray-900 dark:border-gray-400 placeholder-gray-400 dark:placeholder-gray-500"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
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
          <div>
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring text-gray-900 dark:text-white dark:bg-gray-900 dark:border-gray-400 placeholder-gray-400 dark:placeholder-gray-500 pr-10"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                minLength={6}
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                onClick={() => setShowConfirmPassword((v) => !v)}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12C3.5 7.5 7.5 4.5 12 4.5s8.5 3 9.75 7.5c-1.25 4.5-5.25 7.5-9.75 7.5s-8.5-3-9.75-7.5z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M4.5 4.5C2.5 7.5 2.5 12 4.5 15.5M19.5 19.5C21.5 16.5 21.5 12 19.5 8.5M9.75 9.75A3 3 0 0112 9c1.657 0 3 1.343 3 3 0 .414-.08.81-.22 1.17M15.75 15.75A3 3 0 0112 15c-1.657 0-3-1.343-3-3 0-.414.08-.81.22-1.17" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">Phone Number</label>
            <input
              type="text"
              name="phone_number"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring text-gray-900 dark:text-white dark:bg-gray-900 dark:border-gray-400 placeholder-gray-400 dark:placeholder-gray-500"
              value={form.phone_number}
              onChange={handleChange}
              maxLength={15}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">Full Name</label>
            <input
              type="text"
              name="full_name"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring text-gray-900 dark:text-white dark:bg-gray-900 dark:border-gray-400 placeholder-gray-400 dark:placeholder-gray-500"
              value={form.full_name}
              onChange={handleChange}
              maxLength={100}
            />
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
          {loading ? 'Registering...' : 'Sign Up'}
        </button>
                <div className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500">
            Sign in
          </Link>
        </div>
      </form>
    </div>
  );
}
