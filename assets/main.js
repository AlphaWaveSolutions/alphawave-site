// assets/main.js
import { qs, qsa, toWhatsAppLink } from "./utils.js";

(function init(){
  // Mobile menu toggle
  const btn = qs("#menuBtn");
  const menu = qs("#mobileMenu");
  if (btn && menu){
    btn.addEventListener("click", () => {
      const open = menu.style.display === "block";
      menu.style.display = open ? "none" : "block";
      btn.setAttribute("aria-expanded", open ? "false" : "true");
    });
  }

  // Active link
  const path = location.pathname.split("/").pop() || "index.html";
  qsa(`a[data-nav]`).forEach(a => {
    const href = (a.getAttribute("href") || "").split("/").pop();
    if (href === path) a.classList.add("active");
  });

  // Footer year
  const y = qs("#year");
  if (y) y.textContent = String(new Date().getFullYear());

  // Quick WhatsApp button handler (if present)
  const wa = qs("#waLink");
  if (wa){
    const cfg = window.ALPHAWAVE_CONFIG;
    const link = toWhatsAppLink(cfg.BUSINESS.phone, "Hi AlphaWave Solutions 👋 I’d like to request a quote.");
    wa.setAttribute("href", link);
  }
})();
