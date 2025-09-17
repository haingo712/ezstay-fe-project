"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import RoleBasedRedirect from "@/components/RoleBasedRedirect";

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState("contact");
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    category: "general",
  });
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: "bot",
      message: "Hello! I am EZStay virtual assistant. How can I help you?",
      timestamp: new Date(),
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const faqData = [
    {
      id: 1,
      question: "How to find suitable rooms?",
      answer:
        "You can use the search bar on the homepage or search page to filter by area, price, size and desired amenities. The system will display rooms that match your criteria.",
    },
    {
      id: 2,
      question: "Can I contact landlords directly?",
      answer:
        'Yes, after viewing room details, you can click "Contact Landlord" to send a message or call directly. Contact information will be displayed after you register an account.',
    },
    {
      id: 3,
      question: "How to register an account?",
      answer:
        'Click the "Sign Up" button in the top right corner, fill in your personal information and confirm your email. You can choose to register as a tenant or landlord.',
    },
    {
      id: 4,
      question: "Can I post rooms for rent?",
      answer:
        "Yes, after registering a landlord account and verifying your information, you can post rental listings with full images, descriptions and contact information.",
    },
    {
      id: 5,
      question: "What are EZStay service fees?",
      answer:
        "EZStay is free for room seekers. For landlords, we have flexible service packages with reasonable fees for posting and managing rental properties.",
    },
    {
      id: 6,
      question: "How to report inappropriate listings?",
      answer:
        'You can click the "Report" button on the room detail page or contact us through the support form. We will review and handle it as soon as possible.',
    },
  ];

  const quickQuestions = [
    "How to find rooms?",
    "How to contact landlords?",
    "What are the service fees?",
    "How to post listings?",
  ];

  const handleContactSubmit = (e) => {
    e.preventDefault();
    // Handle contact form submission
    alert("Support request sent! We will respond within 24 hours.");
    setContactForm({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
      category: "general",
    });
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    // Add user message
    const userMessage = {
      id: chatMessages.length + 1,
      type: "user",
      message: chatInput,
      timestamp: new Date(),
    };
    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botResponse = getBotResponse(chatInput);
      const botMessage = {
        id: chatMessages.length + 2,
        type: "bot",
        message: botResponse,
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const getBotResponse = (input) => {
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes("find room") || lowerInput.includes("search")) {
      return "To find suitable rooms, you can:\n1. Use the search bar on the homepage\n2. Filter by area, price, size\n3. View details and contact landlords\n\nDo you need more help?";
    }

    if (lowerInput.includes("contact") || lowerInput.includes("landlord")) {
      return 'To contact landlords:\n1. View room details\n2. Click "Contact Landlord"\n3. Fill out the form or call directly\n\nNote: You need to register an account to view contact information.';
    }

    if (lowerInput.includes("register") || lowerInput.includes("account")) {
      return 'To register an account:\n1. Click "Sign Up" in the top right\n2. Choose role (tenant/landlord)\n3. Fill in information and confirm email\n\nWould you like to register now?';
    }

    if (lowerInput.includes("fee") || lowerInput.includes("price")) {
      return "About service fees:\n- Free for room seekers\n- Landlords have flexible service packages\n- Contact us for detailed pricing\n\nDo you have any other questions?";
    }

    return "Thank you for contacting us! I didn't quite understand your question. You can:\n1. Choose suggested questions below\n2. Check the FAQ section\n3. Send a support form for detailed consultation\n\nHow else can I help you?";
  };

  const handleQuickQuestion = (question) => {
    setChatInput(question);
    handleChatSubmit({ preventDefault: () => {} });
  };

  return (
    <RoleBasedRedirect>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-blue-600 dark:bg-blue-800 text-white py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Support Center</h1>
          <p className="text-xl">We are here to help you 24/7</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center mb-8 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("contact")}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === "contact"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
            }`}
          >
            📧 Contact Support
          </button>
          <Link
            href="/"
            className="px-6 py-3 font-medium border-b-2 border-transparent text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-600 dark:hover:border-blue-400 transition-colors"
          >
            🤖 AI Assistant
          </Link>
          <button
            onClick={() => setActiveTab("faq")}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === "faq"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
            }`}
          >
            ❓ FAQ
          </button>
        </div>

        {/* Contact Form Tab */}
        {activeTab === "contact" && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Send Support Request
              </h2>

              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={contactForm.name}
                      onChange={(e) =>
                        setContactForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={contactForm.email}
                      onChange={(e) =>
                        setContactForm((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={contactForm.phone}
                      onChange={(e) =>
                        setContactForm((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={contactForm.category}
                      onChange={(e) =>
                        setContactForm((prev) => ({
                          ...prev,
                          category: e.target.value,
                        }))
                      }
                    >
                      <option value="general">General Question</option>
                      <option value="technical">Technical Issue</option>
                      <option value="account">Account</option>
                      <option value="payment">Payment</option>
                      <option value="report">Report Violation</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={contactForm.subject}
                    onChange={(e) =>
                      setContactForm((prev) => ({
                        ...prev,
                        subject: e.target.value,
                      }))
                    }
                    placeholder="Brief description of your issue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message *
                  </label>
                  <textarea
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={contactForm.message}
                    onChange={(e) =>
                      setContactForm((prev) => ({
                        ...prev,
                        message: e.target.value,
                      }))
                    }
                    placeholder="Describe your issue in detail..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  Send Support Request
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Chat Tab */}
        {activeTab === "chat" && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              <div className="bg-blue-600 dark:bg-blue-800 text-white p-4">
                <h2 className="text-xl font-bold">EZStay Virtual Assistant</h2>
                <p className="text-blue-100">
                  Ask me anything about our services!
                </p>
              </div>

              {/* Chat Messages */}
              <div className="h-96 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.type === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.type === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                      }`}
                    >
                      <p className="whitespace-pre-line">{message.message}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.type === "user"
                            ? "text-blue-100"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Questions */}
              <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Quick questions:
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {quickQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickQuestion(question)}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>

                {/* Chat Input */}
                <form onSubmit={handleChatSubmit} className="flex space-x-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type your question..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* FAQ Tab */}
        {activeTab === "faq" && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Find quick answers to common questions
              </p>
            </div>

            <div className="space-y-4">
              {faqData.map((faq) => (
                <div
                  key={faq.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                >
                  <details className="group">
                    <summary className="flex justify-between items-center p-6 cursor-pointer">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {faq.question}
                      </h3>
                      <svg
                        className="w-5 h-5 text-gray-500 transition-transform group-open:rotate-180"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </summary>
                    <div className="px-6 pb-6">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </details>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Can not find the answer you need?
              </p>
              <button
                onClick={() => setActiveTab("contact")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Contact Support
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Contact Info Section */}
      <section className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Contact Information
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Multiple ways to get in touch with us
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Email
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                support@ezstay.com
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Hotline
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                +1 (555) 123-4567 (24/7)
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Address
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                123 Main Street, New York, NY 10001
              </p>
            </div>
          </div>
        </div>
      </section>
      </div>
    </RoleBasedRedirect>
  );
}
