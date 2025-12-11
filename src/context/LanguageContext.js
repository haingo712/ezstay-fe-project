"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import enTranslations from '@/locales/en.json';
import viTranslations from '@/locales/vi.json';

const LanguageContext = createContext(undefined);

const translations = {
    en: enTranslations,
    vi: viTranslations,
};

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState('en'); // Default to English
    const [isLoading, setIsLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Load saved language from localStorage
        const savedLanguage = localStorage.getItem('language');
        if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'vi')) {
            setLanguage(savedLanguage);
        }
        setIsLoading(false);
    }, []);

    const changeLanguage = (newLanguage) => {
        if (newLanguage === 'en' || newLanguage === 'vi') {
            console.log('🌐 Changing language to:', newLanguage);
            setLanguage(newLanguage);
            if (typeof window !== 'undefined') {
                localStorage.setItem('language', newLanguage);
                // Update HTML lang attribute
                document.documentElement.lang = newLanguage;
            }
        }
    };

    const t = (key) => {
        const keys = key.split('.');
        let value = translations[language];

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                console.warn(`Translation key not found: ${key}`);
                return key;
            }
        }

        return value;
    };

    const value = {
        language,
        changeLanguage,
        t,
        isLoading,
        mounted,
    };

    // Prevent hydration mismatch
    if (!mounted) {
        return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
    }

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
