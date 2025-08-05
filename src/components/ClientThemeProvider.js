'use client';

import { ThemeProvider } from '@/context/ThemeContext';

export default function ClientThemeProvider({ children }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
