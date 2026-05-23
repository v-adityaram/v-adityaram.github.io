const header = document.querySelector("[data-header]");
const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");
const themeToggle = document.querySelector("[data-theme-toggle]");
const themeLabel = document.querySelector("[data-theme-label]");
const storedTheme = localStorage.getItem("portfolio-theme");

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;

  if (themeToggle && themeLabel) {
    const isLight = theme === "light";
    themeToggle.setAttribute("aria-pressed", String(isLight));
    themeToggle.setAttribute("aria-label", `Switch to ${isLight ? "dark" : "light"} mode`);
    themeLabel.textContent = isLight ? "Light" : "Dark";
  }
}

setTheme(storedTheme || "light");

function syncHeader() {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 10);
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
    const currentTheme = document.documentElement.dataset.theme || "dark";
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
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const filterButtons = document.querySelectorAll("[data-filter]");
const projectDetails = document.querySelectorAll("[data-category]");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter || "all";

    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");

    projectDetails.forEach((project) => {
      const categories = project.dataset.category || "";
      project.classList.toggle("is-hidden", filter !== "all" && !categories.includes(filter));
    });
  });
});

const contactForm = document.querySelector("[data-contact-form]");
const clickableCards = document.querySelectorAll("[data-card-link]");

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

clickableCards.forEach((card) => {
  const href = card.getAttribute("data-card-link");

  if (!href) return;

  card.addEventListener("click", (event) => {
    const target = event.target;

    if (target instanceof Element && target.closest("a, button, input, select, textarea")) {
      return;
    }

    window.location.href = href;
  });

  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      window.location.href = href;
    }
  });
});
