"use client";

export default function NotAuthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">403 - Access Denied</h1>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          You do not have permission to access this page.<br />Please contact the administrator if you believe this is an error.
        </p>
        <a href="/" className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition">Back to Home</a>
      </div>
    </div>
  );
}
