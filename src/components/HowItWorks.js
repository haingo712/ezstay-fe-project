'use client';

const steps = [
  {
    icon: (
      <svg className="w-10 h-10 text-blue-600 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 16v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2a2 2 0 002 2h14a2 2 0 002-2z" />
      </svg>
    ),
    title: 'Create an Account',
    desc: 'Sign up for free and complete your profile to get started.'
  },
  {
    icon: (
      <svg className="w-10 h-10 text-blue-600 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7l6 6-6 6M21 7l-6 6 6 6" />
      </svg>
    ),
    title: 'Find or Post a Room',
    desc: 'Browse listings or post your own room for rent easily.'
  },
  {
    icon: (
      <svg className="w-10 h-10 text-blue-600 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ),
    title: 'Connect & Move In',
    desc: 'Contact, chat, and finalize your rental. Move in with confidence!'
  }
];

export default function HowItWorks() {
  return (
    <section className="py-12 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center bg-gray-50 dark:bg-gray-900 rounded-xl shadow p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all">
              {step.icon}
              <div className="font-semibold text-lg text-gray-900 dark:text-white mb-2 text-center">{step.title}</div>
              <div className="text-gray-700 dark:text-gray-300 text-center">{step.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
