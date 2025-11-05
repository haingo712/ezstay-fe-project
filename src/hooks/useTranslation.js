import { useLanguage } from '@/context/LanguageContext';

export function useTranslation() {
    const { t, language, changeLanguage } = useLanguage();

    return {
        t,
        language,
        changeLanguage,
    };
}
