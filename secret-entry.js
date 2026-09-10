(() => {
  const trigger = document.querySelector("[data-memory-trigger]");
  const dialog = document.querySelector("[data-memory-dialog]");
  const closeButton = document.querySelector("[data-memory-close]");
  const form = document.querySelector("[data-memory-form]");
  const status = document.querySelector("[data-memory-status]");

  if (!trigger || !dialog || !closeButton || typeof dialog.showModal !== "function") {
    return;
  }

  // The destination is never in this file. The key goes to the site's assistant
  // Worker, which checks it with the private site and returns a one-time link.
  const DOOR_ENDPOINT = "https://ask.vaditya.in/api/door";
  const HOLD_DURATION = 2000;
  const TAP_WINDOW = 2600;
  const PANEL_DELAY = 480;
  const PANEL_TRANSITION = 340;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  trigger.hidden = false;
  trigger.setAttribute("data-memory-ready", "");

  let holdTimer = 0;
  let revealTimer = 0;
  let closeTimer = 0;
  let tapTimes = [];
  let isRevealing = false;
  let isClosing = false;
  let ignoreClicksUntil = 0;

  const keyInput = form ? form.querySelector('input[name="key"]') : null;
  const submitButton = form ? form.querySelector('button[type="submit"]') : null;

  function clearHoldTimer() {
    if (!holdTimer) return;
    window.clearTimeout(holdTimer);
    holdTimer = 0;
  }

  function resetTapSequence() {
    tapTimes = [];
  }

  function resetForm() {
    if (keyInput) keyInput.value = "";
    if (status) status.textContent = "";
    if (submitButton) submitButton.disabled = false;
  }

  function openInvitation() {
    revealTimer = 0;

    if (dialog.open) return;

    try {
      dialog.showModal();
    } catch (error) {
      console.error("Unable to open the dialog.", error);
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

    window.setTimeout(() => {
      trigger.classList.remove("is-awakening");
      if (dialog.open && keyInput) keyInput.focus({ preventScroll: true });
    }, reducedMotion.matches ? 0 : PANEL_TRANSITION + 60);
  }

  function revealInvitation() {
    if (isRevealing || dialog.open) return;

    isRevealing = true;
    resetTapSequence();
    trigger.classList.remove("is-awakening");

    // Restart the animation when the trigger is discovered again.
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

  if (form && keyInput && submitButton) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const key = keyInput.value;
      if (!key) return;

      submitButton.disabled = true;
      if (status) status.textContent = "";

      try {
        const response = await fetch(DOOR_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key }),
        });
        const result = await response.json().catch(() => null);
        keyInput.value = "";

        if (response.ok && result && typeof result.url === "string") {
          window.location.assign(result.url);
          return;
        }

        if (status) {
          status.textContent = response.status === 429 ? "Too many tries. Wait a minute." : "That didn't open anything.";
        }
      } catch (_error) {
        keyInput.value = "";
        if (status) status.textContent = "Couldn't reach the door. Try again.";
      } finally {
        submitButton.disabled = false;
        keyInput.focus({ preventScroll: true });
      }
    });
  }

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
    resetForm();
    isRevealing = false;
    isClosing = false;
    trigger.focus({ preventScroll: true });
  });
})();
