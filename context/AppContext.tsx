"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Language, Theme, translations } from "@/lib/translations";

interface AppContextType {
  lang: Language;
  theme: Theme;
  t: typeof translations.en;
  toggleLanguage: () => void;
  toggleTheme: () => void;
  setLanguage: (lang: Language) => void;
  setTheme: (theme: Theme) => void;
}

const defaultContextValue: AppContextType = {
  lang: "en",
  theme: "dark",
  t: translations.en,
  toggleLanguage: () => {},
  toggleTheme: () => {},
  setLanguage: () => {},
  setTheme: () => {},
};

const AppContext = createContext<AppContextType>(defaultContextValue);

export function AppContextProvider({ children }: { children: React.ReactNode }) {
  const [lang] = useState<Language>("en");
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    // Restore stored theme preference if present
    const savedTheme = localStorage.getItem("app_theme") as Theme;
    if (savedTheme === "light" || savedTheme === "dark") {
      setThemeState(savedTheme);
    }
  }, []);

  useEffect(() => {
    // Hardcode html to English LTR
    const html = document.documentElement;
    html.setAttribute("lang", "en");
    html.setAttribute("dir", "ltr");

    if (theme === "light") {
      html.classList.add("light");
      html.classList.remove("dark");
    } else {
      html.classList.add("dark");
      html.classList.remove("light");
    }
  }, [theme]);

  const toggleLanguage = () => {};

  const toggleTheme = () => {
    const html = document.documentElement;
    html.classList.add("theme-transitioning");

    const nextTheme = theme === "dark" ? "light" : "dark";
    if (nextTheme === "light") {
      html.classList.add("light");
      html.classList.remove("dark");
    } else {
      html.classList.add("dark");
      html.classList.remove("light");
    }

    setThemeState(nextTheme);
    localStorage.setItem("app_theme", nextTheme);

    setTimeout(() => {
      html.classList.remove("theme-transitioning");
    }, 300);
  };

  const setLanguage = () => {};

  const setTheme = (newTheme: Theme) => {
    const html = document.documentElement;
    html.classList.add("theme-transitioning");

    if (newTheme === "light") {
      html.classList.add("light");
      html.classList.remove("dark");
    } else {
      html.classList.add("dark");
      html.classList.remove("light");
    }

    setThemeState(newTheme);
    localStorage.setItem("app_theme", newTheme);

    setTimeout(() => {
      html.classList.remove("theme-transitioning");
    }, 300);
  };

  const t = translations.en;

  return (
    <AppContext.Provider
      value={{
        lang,
        theme,
        t,
        toggleLanguage,
        toggleTheme,
        setLanguage,
        setTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  return context || defaultContextValue;
}
