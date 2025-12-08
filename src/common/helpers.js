export async function checkLogin() {
  try {
    const response = await fetch(`../resources/api/index.php`, {
      credentials: "include",
    });

    // If we get a 403 (Forbidden) or 401 (Unauthorized), redirect to login
    if (response.status === 403 || response.status === 401) {
      await redirect();
      return false;
    }

    const result = await response.json();

    // If the API returns an access denied error, redirect to login
    if (
      !result.success &&
      (result.error === "Access denied" ||
        result.error === "Admin access required")
    ) {
      await redirect();
      return false;
    }

    return true;
  } catch (error) {
    console.error("Authentication check failed:", error);
    await redirect("Authentication failed. Please log in.");
    return false;
  }
}

export async function redirect(
  message = "Please login first to access to this page.",
  href = "/src/auth/login.html"
) {
  await showAlert(message, "Error");
  setTimeout(() => {
    window.location.href = href;
  }, 10);
}

export async function checkAdmin() {
  try {
    const response = await fetch(`../admin/api/index.php`, {
      credentials: "include",
    });

    // If we get a 403 (Forbidden) or 401 (Unauthorized), redirect to login
    if (response.status === 403 || response.status === 401) {
      await redirect(
        "Access denied.\nOnly Admin have access to this page.",
        "/index.html"
      );
      return false;
    }

    const result = await response.json();

    // If the API returns an access denied error, redirect to login
    if (
      !result.success &&
      (result.error === "Access denied" ||
        result.error === "Admin access required")
    ) {
      await redirect(
        "Access denied.\nOnly Admin have access to this page.",
        "/index.html"
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error("Authentication check failed:", error);
    await redirect(
      "Access denied.\nOnly Admin have access to this page.",
      "/index.html"
    );
    return false;
  }
}

export const RED_X_ICON = `
<svg width="120" height="120" viewBox="0 0 120 120">
  <circle cx="60" cy="60" r="50" fill="#ff4a4a"/>
  <path d="M40 40 L80 80 M80 40 L40 80"
        stroke="white"
        stroke-width="12"
        stroke-linecap="round"/>
</svg>
`;

export function showAlert(message, title = "Error") {
  return new Promise((resolve) => {
    /* ---------------- BACKDROP ---------------- */
    const backdrop = document.createElement("div");
    backdrop.className =
      "fixed inset-0 z-50 flex items-center justify-center " +
      "bg-black/60 backdrop-blur-xl animate-fadeIn p-6";

    /* ---------------- CARD (LIGHT + DARK MODE) ---------------- */
    const card = document.createElement("div");
    card.className =
      "relative max-w-sm w-full rounded-[2rem] px-8 pt-10 pb-8 animate-scaleIn text-center " +
      "border shadow-2xl backdrop-blur-2xl " +
      "bg-white/90 text-gray-900 border-gray-300 " + // LIGHT MODE
      "dark:bg-white/5 dark:text-white dark:border-white/10"; // DARK MODE

    /* ---------------- ICON WITH GLOW ---------------- */
    const iconWrap = document.createElement("div");
    iconWrap.className =
      "relative flex justify-center items-center w-full mb-6 bottom-5";

    // Glow layer
    const glow = document.createElement("div");
    glow.className =
      "absolute w-32 h-32 rounded-full blur-3xl opacity-70 " +
      "bg-red-500/60 dark:bg-red-500/60";

    // Actual icon
    const icon = document.createElement("div");
    icon.className = "relative z-10";
    icon.innerHTML = RED_X_ICON;

    iconWrap.appendChild(glow);
    iconWrap.appendChild(icon);

    /* ---------------- TITLE ---------------- */
    const heading = document.createElement("h2");
    heading.className =
      "text-2xl font-bold tracking-widest mb-2 " +
      "text-gray-900 dark:text-white";
    heading.textContent = title;

    /* ---------------- DESCRIPTION ---------------- */
    const desc = document.createElement("p");
    desc.className =
      "text-sm leading-relaxed mb-8 whitespace-pre-line " +
      "text-gray-700 dark:text-gray-300";
    desc.textContent = message;

    /* ---------------- BUTTON ---------------- */
    const button = document.createElement("button");
    button.className =
      "w-full py-3 rounded-2xl font-semibold tracking-wide transition-all shadow-lg " +
      "active:scale-95 " +
      "bg-black text-gray-100 border border-gray-300 hover:bg-black/80 " + // LIGHT
      "dark:bg-white/10 dark:text-white dark:border-white/20 dark:hover:bg-white/20"; // DARK
    button.textContent = "OK";

    /* ---------------- BUILD TREE ---------------- */
    card.appendChild(iconWrap);
    card.appendChild(heading);
    card.appendChild(desc);
    card.appendChild(button);

    backdrop.appendChild(card);
    document.body.appendChild(backdrop);

    /* ---------------- CLOSE HANDLERS ---------------- */
    const close = () => {
      backdrop.classList.add("animate-fadeOut");
      setTimeout(() => {
        backdrop.remove();
        resolve();
      }, 150);
    };

    button.onclick = close;
    backdrop.onclick = (e) => {
      if (e.target === backdrop) close();
    };
  });
}

export function themeCheck() {
  const storedTheme = localStorage.getItem("theme");
  if (storedTheme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

export function toggleTheme() {
  const isDark = document.documentElement.classList.contains("dark");
  if (isDark) {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  } else {
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  }
}

export function createDarkModeButton() {
  if (document.getElementById("dark-mode-toggle")) return;

  const button = document.createElement("button");
  button.id = "dark-mode-toggle";

  button.className =
    "fixed top-4 right-4 z-50 p-2 rounded-full " +
    "backdrop-blur-md " + // blur for glass effect
    "bg-white/30 dark:bg-black/30 " + // semi-transparent bg
    "border-0 " + // <-- no border at all
    "shadow-lg transition-all duration-300 " +
    "hover:bg-white/40 dark:hover:bg-black/40";

  button.setAttribute("aria-label", "Toggle dark mode");

  // Icon wrapper for animation
  const icon = document.createElement("span");
  icon.className = "block w-5 h-5 transition-all duration-350 ease-in-out";
  button.appendChild(icon);

  const sunSVG = `
        <svg class="w-full h-full text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>`;

  const moonSVG = `
        <svg class="w-full h-full text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>`;

  const updateIcon = (animate = false) => {
    const isDark = document.documentElement.classList.contains("dark");
    const newIcon = isDark ? sunSVG : moonSVG;

    if (animate) {
      icon.style.opacity = "0";
      icon.style.transform = "rotate(180deg)";

      setTimeout(() => {
        icon.innerHTML = newIcon;
        icon.style.opacity = "1";
        icon.style.transform = "rotate(360deg)";
      }, 200);
    } else {
      icon.innerHTML = newIcon;
      icon.style.opacity = "1";
      icon.style.transform = "rotate(0deg)";
    }
  };

  // Initial icon setup after theme is checked
  setTimeout(() => updateIcon(false), 10);

  button.addEventListener("click", () => {
    toggleTheme();
    updateIcon(true);
  });

  document.body.appendChild(button);
}

// Initialize theme immediately when module loads
themeCheck();

// Ensure theme is applied when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    themeCheck();
    createDarkModeButton();
  });
} else {
  // DOM is already ready
  createDarkModeButton();
}

// Also apply theme when the window loads (as a fallback)
window.addEventListener("load", () => {
  themeCheck();
});

// Listen for theme changes from other tabs/pages
window.addEventListener("storage", (e) => {
  if (e.key === "theme") {
    themeCheck();
    // Update the icon if the button exists
    const button = document.getElementById("dark-mode-toggle");
    if (button) {
      const icon = button.querySelector("span");
      if (icon) {
        const isDark = document.documentElement.classList.contains("dark");
        const sunSVG = `
          <svg class="w-full h-full text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>`;
        const moonSVG = `
          <svg class="w-full h-full text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>`;
        icon.innerHTML = isDark ? sunSVG : moonSVG;
      }
    }
  }
});
