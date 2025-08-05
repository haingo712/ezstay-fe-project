'use client';

import reviews from '../sampleData/customerReviews';

function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5 mb-2">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.175 0l-3.385 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118l-3.385-2.46c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z" />
        </svg>
      ))}
    </div>
  );
}

export default function CustomerReviews() {
  return (
    <section className="py-12 bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">What our customers say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all">
              <img src={review.avatar} alt={review.name} className="w-16 h-16 rounded-full mb-3 border-2 border-blue-500" />
              <StarRating rating={review.rating} />
              <p className="text-gray-700 dark:text-gray-300 text-center mb-3">{review.content}</p>
              <div className="font-semibold text-blue-600 dark:text-blue-400">{review.name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
