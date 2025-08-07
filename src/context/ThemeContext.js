"use client";

import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext({
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
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark");
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
