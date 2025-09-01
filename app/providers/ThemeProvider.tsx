import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";

type Theme = "light" | "dark" | "auto";

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  colors: {
    background: string;
    surface: string;
    primary: string;
    secondary: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
  };
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

// Rust Undead theme colors
const darkColors = {
  background: "#000000", // black background
  surface: "#1a1a1a", // main surface color
  primary: "#cd7f32", // Bronze primary color
  secondary: "#cd7f32",
  text: "#FFFFFF", // Pure white text
  textSecondary: "#CCCCCC", // Slightly dimmed white for secondary text
  border: "#333333", // Subtle border
  error: "#cd7f32", // Use bronze for errors
  success: "#cd7f32", // Use bronze for success
  warning: "#cd7f32", // Use bronze for warnings
};

const lightColors = {
  background: "#FFFFFF",
  surface: "#F5F5F5",
  primary: "#cd7f32",
  secondary: "#cd7f32",
  text: "#1a1a1a",
  textSecondary: "#666666",
  border: "#E0E0E0",
  error: "#cd7f32",
  success: "#cd7f32",
  warning: "#cd7f32",
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<Theme>("dark");

  const isDark =
    theme === "dark" || (theme === "auto" && systemColorScheme === "dark");
  const colors = isDark ? darkColors : lightColors;

  useEffect(() => {
    loadStoredTheme();
  }, []);

  const loadStoredTheme = async () => {
    try {
      const storedTheme = await AsyncStorage.getItem("app_theme");
      if (storedTheme) {
        setThemeState(storedTheme as Theme);
      }
    } catch (error) {
      console.error("Error loading stored theme:", error);
    }
  };

  const setTheme = async (newTheme: Theme) => {
    try {
      setThemeState(newTheme);
      await AsyncStorage.setItem("app_theme", newTheme);
    } catch (error) {
      console.error("Error storing theme:", error);
    }
  };

  const value = {
    theme,
    isDark,
    setTheme,
    colors,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
