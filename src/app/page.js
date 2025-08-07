'use client';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Features from '../components/Features';
import Stats from '../components/Stats';
import Hero from '../components/Hero';
import FeaturedPosts from '../components/FeaturedPosts';
import SearchBar from '../components/SearchBar';
import CustomerReviews from '../components/CustomerReviews';
import HowItWorks from '../components/HowItWorks';
import BlogNews from '../components/BlogNews';
import FAQ from '../components/FAQ';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
      <Navbar />
      <Hero />
      <SearchBar />
      <Stats />
      <HowItWorks />
      <FeaturedPosts />
      <Features />
      <BlogNews />
      <CustomerReviews />
      <FAQ />
      <Footer />
    </div>
  );
}
