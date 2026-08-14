(() => {
  const trigger = document.querySelector("[data-memory-trigger]");
  const dialog = document.querySelector("[data-memory-dialog]");
  const closeButton = document.querySelector("[data-memory-close]");
  const storyLink = document.querySelector("[data-memory-story-link]");

  if (!trigger || !dialog || !closeButton || typeof dialog.showModal !== "function") {
    return;
  }

  const HOLD_DURATION = 2000;
  const TAP_WINDOW = 2600;
  const PANEL_DELAY = 480;
  const PANEL_TRANSITION = 340;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const localPreviewHosts = new Set(["localhost", "127.0.0.1", "[::1]"]);

  if (storyLink && localPreviewHosts.has(window.location.hostname)) {
    storyLink.href = `http://${window.location.hostname}:4173/`;
    storyLink.setAttribute("data-local-preview", "");
  }

  trigger.hidden = false;
  trigger.setAttribute("data-memory-ready", "");

  let holdTimer = 0;
  let revealTimer = 0;
  let closeTimer = 0;
  let tapTimes = [];
  let isRevealing = false;
  let isClosing = false;
  let ignoreClicksUntil = 0;

  function clearHoldTimer() {
    if (!holdTimer) return;
    window.clearTimeout(holdTimer);
    holdTimer = 0;
  }

  function resetTapSequence() {
    tapTimes = [];
  }

  function openInvitation() {
    revealTimer = 0;

    if (dialog.open) return;

    try {
      dialog.showModal();
    } catch (error) {
      console.error("Unable to open the story invitation.", error);
      trigger.classList.remove("is-awakening");
      isRevealing = false;
      return;
    }

    isClosing = false;
    document.body.classList.add("memory-dialog-open");
    trigger.setAttribute("aria-expanded", "true");

    if (reducedMotion.matches) {
      dialog.classList.add("is-open");
    } else {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          if (dialog.open && !isClosing) {
            dialog.classList.add("is-open");
          }
        });
      });
    }

    window.setTimeout(() => trigger.classList.remove("is-awakening"), 760);
  }

  function revealInvitation() {
    if (isRevealing || dialog.open) return;

    isRevealing = true;
    resetTapSequence();
    trigger.classList.remove("is-awakening");

    // Restart the heart animation when the Easter egg is discovered again.
    void trigger.offsetWidth;
    trigger.classList.add("is-awakening");

    const delay = reducedMotion.matches ? 0 : PANEL_DELAY;
    revealTimer = window.setTimeout(openInvitation, delay);
  }

  function finishClose() {
    closeTimer = 0;

    if (dialog.open) {
      dialog.close();
    }
  }

  function closeInvitation() {
    if (!dialog.open || isClosing) return;

    isClosing = true;
    dialog.classList.remove("is-open");
    window.clearTimeout(closeTimer);

    if (reducedMotion.matches) {
      finishClose();
    } else {
      closeTimer = window.setTimeout(finishClose, PANEL_TRANSITION);
    }
  }

  trigger.addEventListener("pointerdown", (event) => {
    if (!event.isPrimary || event.button !== 0 || isRevealing || dialog.open) return;

    clearHoldTimer();
    holdTimer = window.setTimeout(() => {
      holdTimer = 0;
      ignoreClicksUntil = performance.now() + 900;
      revealInvitation();
    }, HOLD_DURATION);
  });

  ["pointerup", "pointercancel", "pointerleave"].forEach((eventName) => {
    trigger.addEventListener(eventName, clearHoldTimer);
  });

  trigger.addEventListener("contextmenu", (event) => event.preventDefault());

  trigger.addEventListener("click", () => {
    const now = performance.now();

    if (now < ignoreClicksUntil || isRevealing || dialog.open) return;

    tapTimes = tapTimes.filter((timestamp) => now - timestamp <= TAP_WINDOW);
    tapTimes.push(now);

    if (tapTimes.length >= 4) {
      revealInvitation();
    }
  });

  closeButton.addEventListener("click", closeInvitation);

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      closeInvitation();
    }
  });

  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeInvitation();
  });

  dialog.addEventListener("close", () => {
    window.clearTimeout(revealTimer);
    window.clearTimeout(closeTimer);
    dialog.classList.remove("is-open");
    document.body.classList.remove("memory-dialog-open");
    trigger.classList.remove("is-awakening");
    trigger.setAttribute("aria-expanded", "false");
    isRevealing = false;
    isClosing = false;
    trigger.focus({ preventScroll: true });
  });
})();
