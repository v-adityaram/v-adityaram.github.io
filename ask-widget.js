(function () {
  "use strict";

  const API_URL = "https://ask.vaditya.in/api/ask";

  function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  const fab = document.createElement("button");
  fab.className = "ask-fab";
  fab.type = "button";
  fab.setAttribute("aria-label", "Ask about Aditya");
  fab.setAttribute("aria-controls", "ask-panel");
  fab.setAttribute("aria-haspopup", "dialog");
  fab.setAttribute("aria-expanded", "false");
  fab.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg><span>Ask about Aditya</span>`;

  const panel = document.createElement("div");
  panel.className = "ask-panel";
  panel.id = "ask-panel";
  panel.hidden = true;
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "Ask about Aditya");
  panel.innerHTML = `
    <div class="ask-panel-head">
      <div><strong>Ask about Aditya</strong><span>AI assistant, grounded in this site &amp; resume</span></div>
      <button type="button" class="ask-panel-close" aria-label="Close">&times;</button>
    </div>
    <div class="ask-messages" id="ask-messages" role="log" aria-label="Conversation" aria-live="polite" aria-relevant="additions text"></div>
    <p class="sr-only" role="status" data-ask-status></p>
    <form class="ask-form" id="ask-form">
      <label class="sr-only" for="ask-input">Your question about Aditya</label>
      <input type="text" id="ask-input" name="question" placeholder="Ask about projects or experience…" maxlength="300" autocomplete="off">
      <button type="submit">Ask</button>
    </form>
  `;

  document.body.appendChild(fab);
  document.body.appendChild(panel);

  const messagesEl = panel.querySelector("#ask-messages");
  const formEl = panel.querySelector("#ask-form");
  const inputEl = panel.querySelector("#ask-input");
  const closeBtn = panel.querySelector(".ask-panel-close");
  const sendBtn = formEl.querySelector("button");

  let opened = false;
  let busy = false;
  let returnFocus = fab;

  function addMessage(role, text, opts) {
    opts = opts || {};
    const div = document.createElement("div");
    div.className = "ask-msg " + (role === "user" ? "ask-msg-user" : "ask-msg-bot") + (opts.typing ? " is-typing" : "") + (opts.error ? " is-error" : "");
    if (opts.typing) {
      div.setAttribute("aria-hidden", "true");
      div.innerHTML = '<span class="typing-dots"><i></i><i></i><i></i></span>';
    } else {
      div.textContent = text;
    }
    if (opts.sources && opts.sources.length) {
      const src = document.createElement("div");
      src.className = "ask-sources";
      src.innerHTML = opts.sources.map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)}</a>`).join("");
      div.appendChild(src);
    }
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }

  function open(trigger = fab) {
    returnFocus = trigger;
    panel.hidden = false;
    fab.setAttribute("aria-expanded", "true");
    if (!opened) {
      opened = true;
      addMessage("bot", "Hi! Ask me anything about Aditya's projects, skills, or experience — I'll answer from what's actually on this site and his resume.");
    }
    inputEl.focus({ preventScroll: true });
  }

  function close() {
    panel.hidden = true;
    fab.setAttribute("aria-expanded", "false");
    if (returnFocus.isConnected) returnFocus.focus({ preventScroll: true });
  }

  fab.addEventListener("click", () => (panel.hidden ? open() : close()));
  document.addEventListener("click", (event) => {
    const trigger = event.target instanceof Element ? event.target.closest("[data-open-ask]") : null;
    if (trigger) open(trigger);
  });
  closeBtn.addEventListener("click", close);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !panel.hidden) close();
  });

  formEl.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (busy) return;
    const question = inputEl.value.trim();
    if (!question) return;
    inputEl.value = "";
    addMessage("user", question);

    busy = true;
    sendBtn.disabled = true;
    panel.querySelector('[data-ask-status]').textContent = 'Looking through Aditya’s work…';
    const typingEl = addMessage("bot", "", { typing: true });

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json().catch(() => null);
      typingEl.remove();
      if (!res.ok || !data || !data.answer) {
        addMessage("bot", (data && data.error) || "Something went wrong — try again in a moment.", { error: true });
      } else {
        addMessage("bot", data.answer, { sources: data.sources });
      }
    } catch (err) {
      typingEl.remove();
      addMessage("bot", "Couldn't reach the assistant — check your connection and try again.", { error: true });
    }

    busy = false;
    panel.querySelector('[data-ask-status]').textContent = '';
    sendBtn.disabled = false;
    // Do not steal focus if someone closed the panel or moved elsewhere while waiting.
    if (!panel.hidden && panel.contains(document.activeElement)) inputEl.focus({ preventScroll: true });
  });
})();
