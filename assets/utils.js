// assets/utils.js
export function qs(sel, root = document) { return root.querySelector(sel); }
export function qsa(sel, root = document) { return [...root.querySelectorAll(sel)]; }

export function escapeHTML(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function formatDateTimeZA(isoOrDate) {
  const d = (isoOrDate instanceof Date) ? isoOrDate : new Date(isoOrDate);
  // Johannesburg time formatting (client-side)
  try {
    return new Intl.DateTimeFormat("en-ZA", {
      timeZone: "Africa/Johannesburg",
      year: "numeric", month: "short", day: "2-digit",
      hour: "2-digit", minute: "2-digit"
    }).format(d);
  } catch {
    return d.toLocaleString();
  }
}

export function toWhatsAppLink(phone, message) {
  const digits = phone.replace(/[^\d+]/g, "");
  const msg = encodeURIComponent(message || "");
  // Use wa.me format (strip + for wa.me)
  const waNumber = digits.replace("+", "");
  return `https://wa.me/${waNumber}?text=${msg}`;
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

export function isValidPhone(phone) {
  // permissive; accepts SA formatting, spaces, +, etc.
  const cleaned = String(phone || "").trim();
  return cleaned.length >= 8 && cleaned.length <= 20;
}
