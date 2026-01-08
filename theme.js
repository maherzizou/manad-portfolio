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

	const getPreferredTheme = () => {
		if (window.matchMedia) {
			return window.matchMedia("(prefers-color-scheme: dark)").matches
				? "dark"
				: "light";
		}
		return "dark";
	};

	const setTheme = (theme, persist = true) => {
		root.setAttribute("data-theme", theme);
		if (persist) {
			try {
				localStorage.setItem(storageKey, theme);
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
	setTheme(stored || getPreferredTheme(), false);

	if (toggle) {
		toggle.addEventListener("click", () => {
			const current = root.getAttribute("data-theme") || "dark";
			setTheme(current === "dark" ? "light" : "dark");
		});
	}

	if (window.matchMedia) {
		const media = window.matchMedia("(prefers-color-scheme: dark)");
		const onChange = (event) => {
			if (!getStoredTheme()) {
				setTheme(event.matches ? "dark" : "light", false);
			}
		};
		if (media.addEventListener) {
			media.addEventListener("change", onChange);
		} else if (media.addListener) {
			media.addListener(onChange);
		}
	}
})();
