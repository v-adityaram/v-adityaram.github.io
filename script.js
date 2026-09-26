const header = document.querySelector("[data-header]");
const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");
const themeToggle = document.querySelector("[data-theme-toggle]");
const faviconLink = document.querySelector("[data-favicon-link]");

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;

  if (themeToggle) {
    const isLight = theme === "light";
    const label = `Switch to ${isLight ? "dark" : "light"} mode`;
    themeToggle.setAttribute("aria-pressed", String(isLight));
    themeToggle.setAttribute("aria-label", label);
    themeToggle.title = label;
  }

  if (faviconLink) {
    faviconLink.href = theme === "light" ? "assets/favicon-light.png" : "assets/favicon-dark.png";
  }
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0b1220' : '#f4f2ec');
}

// No stored choice follows the OS/browser preference and stays live if it changes;
// the inline script in <head> already set the initial value before first paint.
const themeQuery = window.matchMedia("(prefers-color-scheme: dark)");
function themeChoice() {
  try { return localStorage.getItem("portfolio-theme") || "system"; } catch (_) { return "system"; }
}
function applyTheme() {
  const choice = themeChoice();
  setTheme(choice === "dark" || (choice === "system" && themeQuery.matches) ? "dark" : "light");
}
applyTheme();
themeQuery.addEventListener("change", () => {
  if (themeChoice() === "system") applyTheme();
});

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

// CSS handles every animation frame. JavaScript only responds to preferences
// and tab visibility; no pointer tracking, scroll parallax or rendering loop.
if (header && themeToggle) {
  const ambient = document.createElement("div");
  ambient.className = "ambient-background";
  ambient.setAttribute("aria-hidden", "true");
  document.body.prepend(ambient);

  const motionToggle = document.createElement("button");
  motionToggle.className = "motion-toggle";
  motionToggle.type = "button";
  motionToggle.setAttribute("aria-label", "Background animation");
  // Phosphor regular icons, inlined to avoid extra requests. See assets/phosphor-LICENSE.txt.
  const motionPaths = {
    pause: "M200,32H160a16,16,0,0,0-16,16V208a16,16,0,0,0,16,16h40a16,16,0,0,0,16-16V48A16,16,0,0,0,200,32Zm0,176H160V48h40ZM96,32H56A16,16,0,0,0,40,48V208a16,16,0,0,0,16,16H96a16,16,0,0,0,16-16V48A16,16,0,0,0,96,32Zm0,176H56V48H96Z",
    play: "M232.4,114.49,88.32,26.35a16,16,0,0,0-16.2-.3A15.86,15.86,0,0,0,64,39.87V216.13A15.94,15.94,0,0,0,80,232a16.07,16.07,0,0,0,8.36-2.35L232.4,141.51a15.81,15.81,0,0,0,0-27ZM80,215.94V40l143.83,88Z"
  };
  const motionIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  motionIcon.setAttribute("viewBox", "0 0 256 256");
  motionIcon.setAttribute("aria-hidden", "true");
  const motionPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  motionIcon.append(motionPath);
  motionToggle.append(motionIcon);
  themeToggle.after(motionToggle);

  let motionPaused = false;
  try { motionPaused = localStorage.getItem("portfolio-motion") === "paused"; } catch (_) {}
  const connection = navigator.connection;
  function syncAmbientMotion() {
    const limited = reducedMotion.matches || Boolean(connection?.saveData);
    const enabled = !motionPaused && !limited;
    document.documentElement.dataset.ambientMotion = enabled && !document.hidden ? "running" : "paused";
    motionToggle.setAttribute("aria-pressed", String(enabled));
    motionToggle.disabled = limited;
    motionToggle.title = limited
      ? "Background animation is off to respect your device preferences"
      : `${enabled ? "Pause" : "Play"} background animation`;
    motionPath.setAttribute("d", enabled ? motionPaths.pause : motionPaths.play);
  }
  motionToggle.addEventListener("click", () => {
    motionPaused = !motionPaused;
    try { localStorage.setItem("portfolio-motion", motionPaused ? "paused" : "running"); } catch (_) {}
    syncAmbientMotion();
  });
  reducedMotion.addEventListener("change", syncAmbientMotion);
  connection?.addEventListener("change", syncAmbientMotion);
  document.addEventListener("visibilitychange", syncAmbientMotion);
  syncAmbientMotion();
}

function syncHeader() {
  if (header) header.classList.toggle("is-scrolled", window.scrollY > 10);
}

syncHeader();
window.addEventListener("scroll", syncHeader, { passive: true });

if (navToggle && nav) {
  const closeNav = (restoreFocus = false) => {
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    if (restoreFocus) navToggle.focus();
  };
  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      closeNav();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("is-open")) closeNav(true);
  });
  document.addEventListener("click", (event) => {
    if (event.target instanceof Node && !nav.contains(event.target) && !navToggle.contains(event.target)) closeNav();
  });
  header?.addEventListener("focusout", (event) => {
    if (event.relatedTarget && !header.contains(event.relatedTarget)) closeNav();
  });
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.dataset.theme || "light";
    const nextTheme = currentTheme === "light" ? "dark" : "light";

    try { localStorage.setItem("portfolio-theme", nextTheme); } catch (_) {}
    setTheme(nextTheme);
  });
}

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        // A diagram can either be the revealed element itself (a standalone
        // figure) or nested inside it (the hero's board card) -- cover both.
        const diagram = entry.target.matches(".diagram") ? entry.target : entry.target.querySelector(".diagram");
        if (diagram) requestAnimationFrame(() => diagram.classList.add("is-drawn"));
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
  document.querySelectorAll(".diagram").forEach((item) => item.classList.add("is-drawn"));
}

const contactForm = document.querySelector("[data-contact-form]");

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const name = formData.get("name") || "";
    const email = formData.get("email") || "";
    const inquiry = formData.get("inquiry") || "Portfolio inquiry";
    const message = formData.get("message") || "";

    const subject = encodeURIComponent(`${inquiry} - Portfolio contact`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nInquiry Type: ${inquiry}\n\nMessage:\n${message}`
    );

    window.location.href = `mailto:vssv.aditya@gmail.com?subject=${subject}&body=${body}`;
  });
}

document.querySelectorAll('[data-copy-email]').forEach(button => {
  button.addEventListener('click', async () => {
    const status = document.querySelector('[data-copy-status]');
    try {
      await navigator.clipboard.writeText('vssv.aditya@gmail.com');
      status.textContent = 'Email address copied.';
    } catch (_) {
      status.textContent = 'Copy this address: vssv.aditya@gmail.com';
    }
  });
});
