'use client';

import { useState } from 'react';

import faqs from '../sampleData/faqs';

export default function FAQ() {
  const [open, setOpen] = useState(null);

  return (
    <section className="py-12 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
              <button
                className="w-full flex justify-between items-center px-4 py-3 text-left text-gray-900 dark:text-white font-medium focus:outline-none"
                onClick={() => setOpen(open === idx ? null : idx)}
                aria-expanded={open === idx}
              >
                <span>{faq.question}</span>
                <svg className={`w-5 h-5 ml-2 transform transition-transform ${open === idx ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {open === idx && (
                <div className="px-4 pb-4 text-gray-700 dark:text-gray-300 animate-fade-in">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
