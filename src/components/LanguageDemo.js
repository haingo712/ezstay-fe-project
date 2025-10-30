"use client";

import { useTranslation } from '@/hooks/useTranslation';

export default function LanguageDemo() {
    const { t, language } = useTranslation();

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-2xl mx-auto my-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                {t('common.welcome')}
            </h2>

            <div className="space-y-4">
                <div>
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                        Navigation Examples:
                    </h3>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                        <li>{t('nav.home')}</li>
                        <li>{t('nav.rentalPost')}</li>
                        <li>{t('nav.support')}</li>
                        <li>{t('nav.about')}</li>
                    </ul>
                </div>

                <div>
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                        Authentication Examples:
                    </h3>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                        <li>{t('auth.login')}</li>
                        <li>{t('auth.register')}</li>
                        <li>{t('auth.email')}</li>
                        <li>{t('auth.password')}</li>
                    </ul>
                </div>

                <div>
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                        Common Examples:
                    </h3>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                        <li>{t('common.search')}</li>
                        <li>{t('common.save')}</li>
                        <li>{t('common.cancel')}</li>
                        <li>{t('common.delete')}</li>
                    </ul>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Current Language: <span className="font-bold uppercase">{language}</span>
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                        Use the language selector in the navbar to switch between languages.
                    </p>
                </div>
            </div>
        </div>
    );
}
