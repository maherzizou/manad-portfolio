(() => {
	const root = document.documentElement;
	const toggle = document.getElementById("themeToggle");
	const storageKey = "theme";

	const getStoredTheme = () => {
		try {
			return localStorage.getItem(storageKey);
		} catch (err) {
			return null;
		}
	};

	const setTheme = (theme, persist = true) => {
		root.setAttribute("data-theme", theme);
		if (persist) {
			try {
				if (theme === "dark") {
					localStorage.setItem(storageKey, theme);
				} else {
					localStorage.removeItem(storageKey);
				}
			} catch (err) {
				// Ignore storage errors (private mode, disabled storage).
			}
		}
		if (toggle) {
			const isDark = theme === "dark";
			toggle.setAttribute("aria-pressed", String(isDark));
			toggle.setAttribute(
				"aria-label",
				isDark ? "Passer en mode clair" : "Passer en mode sombre"
			);
			toggle.setAttribute(
				"title",
				isDark ? "Passer en mode clair" : "Passer en mode sombre"
			);
		}
	};

	const stored = getStoredTheme();
	if (stored && stored !== "dark") {
		try {
			localStorage.removeItem(storageKey);
		} catch (err) {
			// Ignore storage errors.
		}
	}
	setTheme(stored === "dark" ? "dark" : "light", false);

	if (toggle) {
		toggle.addEventListener("click", () => {
			const current = root.getAttribute("data-theme") || "light";
			setTheme(current === "dark" ? "light" : "dark");
		});
	}
})();
