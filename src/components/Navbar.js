'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import AIAssistant from './AIAssistant';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

  const isActive = (path) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  const navLinkClass = (path) => {
    const baseClass = "transition-colors";
    if (isActive(path)) {
      return `${baseClass} text-blue-600 dark:text-blue-400 font-medium`;
    }
    return `${baseClass} text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400`;
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              EZStay
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className={navLinkClass('/')}>
              Home
            </Link>
            <Link href="/search" className={navLinkClass('/search')}>
              Find Rooms
            </Link>
            <Link href="/support" className={navLinkClass('/support')}>
              Support
            </Link>
            <Link href="/about" className={navLinkClass('/about')}>
              About Us
            </Link>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <Link 
              href="/login"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/register"
              className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              Sign Up
            </Link>
          </div>

          <button 
            className="md:hidden w-8 h-8 flex items-center justify-center text-gray-700 dark:text-gray-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t dark:border-gray-800">
          <div className="px-4 py-2 space-y-1">
            <Link href="/" className={`block py-2 ${navLinkClass('/')}`}>
              Home
            </Link>
            <Link href="/search" className={`block py-2 ${navLinkClass('/search')}`}>
              Find Rooms
            </Link>
            <Link href="/support" className={`block py-2 ${navLinkClass('/support')}`}>
              Support
            </Link>
            <Link href="/about" className={`block py-2 ${navLinkClass('/about')}`}>
              About Us
            </Link>
            <div className="py-2 border-t dark:border-gray-800">
              <button 
                onClick={toggleTheme}
                className="flex items-center space-x-2 w-full py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
                <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
              <Link 
                href="/login"
                className="block w-full py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              >
                Sign In
              </Link>
              <Link 
                href="/register"
                className="block w-full bg-blue-600 dark:bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-center mt-2"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}
      
      {/* AI Assistant */}
      <AIAssistant />
    </header>
  );
}
