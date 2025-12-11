"use client";

import Link from "next/link";
import { useTranslation } from '@/hooks/useTranslation';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
              EZStay
            </h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
              {t('footer.about')}
            </p>
            <div className="flex space-x-3 mt-4">
              <a
                href="#"
                aria-label="Facebook"
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M22.675 0h-21.35C.6 0 0 .6 0 1.326v21.348C0 23.4.6 24 1.326 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.4 24 24 23.4 24 22.674V1.326C24 .6 23.4 0 22.675 0" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="text-blue-400 hover:text-blue-600 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 4.557a9.83 9.83 0 01-2.828.775 4.932 4.932 0 002.165-2.724c-.951.564-2.005.974-3.127 1.195a4.916 4.916 0 00-8.38 4.482C7.691 8.095 4.066 6.13 1.64 3.161c-.542.93-.856 2.01-.857 3.17 0 2.188 1.115 4.117 2.823 5.254a4.904 4.904 0 01-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 01-2.224.084c.627 1.956 2.444 3.377 4.6 3.417A9.867 9.867 0 010 21.543a13.94 13.94 0 007.548 2.209c9.058 0 14.009-7.513 14.009-14.009 0-.213-.005-.425-.014-.636A10.012 10.012 0 0024 4.557z" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="text-pink-500 hover:text-pink-700 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.241 1.308 3.608.058 1.266.069 1.646.069 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.241 1.246-3.608 1.308-1.266.058-1.646.069-4.85.069s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.241-1.308-3.608C2.175 15.747 2.163 15.367 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608.974-.974 2.241-1.246 3.608-1.308C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.775.131 4.602.425 3.635 1.392 2.668 2.359 2.374 3.532 2.315 4.809 2.256 6.089 2.243 6.498 2.243 12c0 5.502.013 5.911.072 7.191.059 1.277.353 2.45 1.32 3.417.967.967 2.14 1.261 3.417 1.32 1.28.059 1.689.072 7.191.072s5.911-.013 7.191-.072c1.277-.059 2.45-.353 3.417-1.32.967-.967 1.261-2.14 1.32-3.417.059-1.28.072-1.689.072-7.191s-.013-5.911-.072-7.191c-.059-1.277-.353-2.45-1.32-3.417C19.55.425 18.377.131 17.1.072 15.82.013 15.411 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a3.999 3.999 0 110-7.998 3.999 3.999 0 010 7.998zm6.406-11.845a1.44 1.44 0 11-2.881 0 1.44 1.44 0 012.881 0z" />
                </svg>
              </a>
            </div>
          </div>
          {/* Quick Links */}
          <div>
            <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors"
                >
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link
                  href="/search"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors"
                >
                  {t('footer.findRooms')}
                </Link>
              </li>
              <li>
                <Link
                  href="/owner/posts"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors"
                >
                  {t('footer.postRoom')}
                </Link>
              </li>
              <li>
                <Link
                  href="/support"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors"
                >
                  {t('nav.support')}
                </Link>
              </li>
            </ul>
          </div>
          {/* Services */}
          <div>
            <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
              Services
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/dashboard"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors"
                >
                  User Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/owner"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors"
                >
                  Owner Panel
                </Link>
              </li>
              <li>
                <Link
                  href="/staff"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors"
                >
                  Staff Panel
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors"
                >
                  Admin Panel
                </Link>
              </li>
            </ul>
          </div>
          {/* Contact */}
          <div>
            <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
              Contact Information
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="tel:+84898552368"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors"
                >
                  Hotline: +84 898 552 368
                </a>
              </li>
              <li>
                <a
                  href="mailto:contact@ezstay.com"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors"
                >
                  Email: contact@ezstay.com
                </a>
              </li>
              <li>
                <span className="text-gray-700 dark:text-gray-300">
                  Address: FPT University
                </span>
              </li>
              <li>
                <Link
                  href="/support"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors"
                >
                  Support Center
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 flex flex-col md:flex-row items-center justify-between">
          <div className="text-gray-600 dark:text-gray-400 text-sm">
            © 2025 EZStay. {t('footer.allRightsReserved')}. Built with Next.js, MongoDB &
            ASP.NET Core.
          </div>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link
              href="/terms"
              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 text-sm"
            >
              {t('footer.termsOfService')}
            </Link>
            <Link
              href="/privacy"
              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 text-sm"
            >
              {t('footer.privacyPolicy')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
