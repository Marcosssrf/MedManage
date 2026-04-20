import { useState, useEffect } from "react";

export function useDarkMode() {
    const [isDark, setIsDark] = useState<boolean>(() => {
        const stored = localStorage.getItem("medmanage-theme");
        if (stored) return stored === "dark";
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
    });

    useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
            root.classList.add("dark");
            localStorage.setItem("medmanage-theme", "dark");
        } else {
            root.classList.remove("dark");
            localStorage.setItem("medmanage-theme", "light");
        }
    }, [isDark]);

    const toggle = () => setIsDark((v) => !v);

    return { isDark, toggle };
}
