'use client';

import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Features from '../components/Features';
import Stats from '../components/Stats';
import Hero from '../components/Hero';
import SearchBar from '../components/SearchBar';
import CustomerReviews from '../components/CustomerReviews';
import HowItWorks from '../components/HowItWorks';
import LatestPosts from '../components/LatestPosts';
import TopRankedHouses from '../components/TopRankedHouses';
import FAQ from '../components/FAQ';
import RoleBasedRedirect from '../components/RoleBasedRedirect';

export default function Home() {
  return (
    <RoleBasedRedirect>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
        <Navbar />
        <Hero />
        <SearchBar />
        <TopRankedHouses />
        <LatestPosts />
        <Stats />
        <HowItWorks />
        <Features />
        <CustomerReviews />
        <FAQ />
        <Footer />
      </div>
    </RoleBasedRedirect>
  );
}
