'use client'

import Link from 'next/link'

export default function Hero() {
  return (
    <div className="relative bg-white dark:bg-gray-800 py-16 px-4 sm:px-6 lg:px-8 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
            CONNECT WITH <br />
            <span className="text-blue-600 dark:text-blue-400">QUALITY TENANTS</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-700 dark:text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Find and list quality rental properties. Safe and transparent transactions guaranteed.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Link
                href="/register"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 md:py-4 md:text-lg md:px-10"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


