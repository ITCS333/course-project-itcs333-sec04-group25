export const API_HOST = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function checkLogin() {
    try {
        const response = await fetch(`${API_HOST}/resources/api/index.php`, {
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

export async function redirect(message = "Please login first to access to this page.", href = "/src/auth/login.html",) {
    await showAlert(message, "Error");
    setTimeout(() => {
        window.location.href = href;
    }, 10);
}

export async function checkAdmin() {
    try {
        const response = await fetch(`${API_HOST}/admin/api/index.php`, {
            credentials: "include",
        });

        // If we get a 403 (Forbidden) or 401 (Unauthorized), redirect to login
        if (response.status === 403 || response.status === 401) {
            await redirect("Access denied.\nOnly Admin have access to this page.", "/index.html");
            return false;
        }

        const result = await response.json();

        // If the API returns an access denied error, redirect to login
        if (
            !result.success &&
            (result.error === "Access denied" ||
                result.error === "Admin access required")
        ) {
            await redirect("Access denied.\nOnly Admin have access to this page.", "/index.html");
            return false;
        }

        return true;
    } catch (error) {
        console.error("Authentication check failed:", error);
        await redirect("Access denied.\nOnly Admin have access to this page.", "/index.html");
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
            "bg-white/90 text-gray-900 border-gray-300 " +      // LIGHT MODE
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
            "bg-black text-gray-100 border border-gray-300 hover:bg-black/80 " +  // LIGHT
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