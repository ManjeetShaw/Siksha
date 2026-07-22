import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Read initial state from the actual <html> class (set by the inline script)
    // so React state is always in sync with what's already on the page
    const [theme, setTheme] = useState(
        () => document.documentElement.classList.contains("dark") ? "dark" : "light"
    );

    useEffect(() => {
        const root = document.documentElement;
        if (theme === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () =>
        setTheme((prev) => (prev === "light" ? "dark" : "light"));

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);