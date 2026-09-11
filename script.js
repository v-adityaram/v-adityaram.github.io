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

function syncHeader() {
  if (header) header.classList.toggle("is-scrolled", window.scrollY > 10);
  // A barely-perceptible drift on the dot background, for quiet depth while scrolling.
  if (!reducedMotion.matches) {
    document.body.style.backgroundPosition = `0 ${(window.scrollY * -0.04).toFixed(1)}px`;
  }
}

syncHeader();
window.addEventListener("scroll", syncHeader, { passive: true });

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      nav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.dataset.theme || "light";
    const nextTheme = currentTheme === "light" ? "dark" : "light";

    localStorage.setItem("portfolio-theme", nextTheme);
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

document.querySelectorAll("[data-card-link]").forEach((card) => {
  const href = card.getAttribute("data-card-link");
  if (!href) return;

  card.addEventListener("click", (event) => {
    const target = event.target;
    if (target instanceof Element && target.closest("a, button, input, select, textarea")) return;
    window.location.href = href;
  });

  card.addEventListener("keydown", (event) => {
    if (event.target !== card) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      window.location.href = href;
    }
  });
});

// The Ask-about-Aditya FAB is injected by ask-widget.js after load, so resolve it at click time.
document.addEventListener("click", (event) => {
  const trigger = event.target instanceof Element ? event.target.closest("[data-open-ask]") : null;
  if (!trigger) return;
  const fab = document.querySelector(".ask-fab");
  if (fab) {
    fab.click();
  }
});
