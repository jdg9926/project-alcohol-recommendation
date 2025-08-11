import { createContext, useEffect, useMemo, useState } from "react";

export const ThemeContext = createContext({});

const STORAGE_KEY = "theme"; // "light" | "dark"

export function ThemeProvider({ children }) {
	const [theme, setTheme] = useState(localStorage.getItem(STORAGE_KEY) || "light");

	useEffect(() => {
		localStorage.setItem(STORAGE_KEY, theme);
		document.documentElement.setAttribute("data-theme", theme);
	}, [theme]);

	const value = useMemo(() => ({ theme, setTheme }), [theme]);
	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
