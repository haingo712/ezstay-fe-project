"use client";

import { createContext, useContext, useState, useEffect } from "react";

export const ThemeContext = createContext({
  theme: "light",
  toggleTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState("light"); // Luôn bắt đầu với 'light' để tránh hydration mismatch

  useEffect(() => {
    setMounted(true);
    // Chỉ sau khi mounted mới đọc từ localStorage và system preference
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
      // Apply theme to DOM immediately
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Sync DOM when theme changes
  useEffect(() => {
    if (mounted) {
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    // DOM will be updated by useEffect above
  };

  // Trong lần render đầu tiên (server-side), luôn trả về theme 'light'
  // Script trong layout.js sẽ xử lý việc set class dark ngay lập tức
  const currentTheme = mounted ? theme : "light";

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
