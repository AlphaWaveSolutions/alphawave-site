// assets/quote.js
import { qs, isValidEmail, isValidPhone, escapeHTML, toWhatsAppLink } from "./utils.js";

async function postJSON(url, payload){
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.ok !== true) {
    const msg = data?.error || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

function setBanner(type, msg){
  const el = qs("#formBanner");
  if (!el) return;
  el.className = `banner ${type || ""}`.trim();
  el.innerHTML = msg;
}

function lockForm(locked){
  const form = qs("#quoteForm");
  if (!form) return;
  [...form.elements].forEach(e => e.disabled = !!locked);
}

function getConfig(){
  const cfg = window.ALPHAWAVE_CONFIG || {};
  if (!cfg.GAS_ENDPOINT || cfg.GAS_ENDPOINT.includes("PASTE_")) {
    throw new Error("Google Apps Script endpoint not configured in assets/config.js");
  }
  return cfg;
}

(function initQuote(){
  const form = qs("#quoteForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const cfg = getConfig();

    const name = qs("#name").value.trim();
    const phone = qs("#phone").value.trim();
    const email = qs("#email").value.trim();
    const serviceType = qs("#serviceType").value.trim();
    const deviceType = qs("#deviceType").value.trim();
    const issue = qs("#issue").value.trim();
    const preferred = qs("#preferredContact").value.trim();
    const consent = qs("#consent").checked;

    // Validation
    if (name.length < 2) return setBanner("bad", "Please enter your full name.");
    if (!isValidPhone(phone)) return setBanner("bad", "Please enter a valid phone number.");
    if (!isValidEmail(email)) return setBanner("bad", "Please enter a valid email address.");
    if (!serviceType) return setBanner("bad", "Please select a service type.");
    if (!deviceType) return setBanner("bad", "Please select a device type.");
    if (issue.length < 10) return setBanner("bad", "Please describe the issue (at least 10 characters).");
    if (!preferred) return setBanner("bad", "Please select a preferred contact method.");
    if (!consent) return setBanner("bad", "Consent is required to submit this request.");

    setBanner("", "Submitting… please wait.");
    lockForm(true);

    const payload = {
      name, phone, email,
      serviceType, deviceType, issueDescription: issue,
      preferredContact: preferred,
      consent: consent ? "Yes" : "No",
      userAgent: navigator.userAgent || "",
      referrer: document.referrer || "",
      page: location.href
    };

    try {
      const data = await postJSON(cfg.GAS_ENDPOINT, payload);

      // Show confirmation screen
      qs("#formSection").style.display = "none";
      qs("#confirmSection").style.display = "block";

      const ticket = String(data.ticketId || "");
      qs("#ticketId").textContent = ticket;

      qs("#confirmSummary").innerHTML = `
        <div class="banner ok">
          <b>Request received ✅</b><br>
          Ticket ID: <b>${escapeHTML(ticket)}</b><br>
          We’ll contact you via <b>${escapeHTML(preferred)}</b> as soon as possible.
        </div>
        <hr class="sep">
        <div class="banner">
          <b>Summary</b><br>
          Name: ${escapeHTML(name)}<br>
          Phone: ${escapeHTML(phone)}<br>
          Email: ${escapeHTML(email)}<br>
          Service: ${escapeHTML(serviceType)}<br>
          Device: ${escapeHTML(deviceType)}<br>
        </div>
      `;

      const copyBtn = qs("#copyTicket");
      copyBtn?.addEventListener("click", async () => {
        try{
          await navigator.clipboard.writeText(ticket);
          copyBtn.textContent = "Copied ✅";
          setTimeout(()=> copyBtn.textContent = "Copy Ticket ID", 1400);
        } catch {
          copyBtn.textContent = "Copy manually";
        }
      });

      // WhatsApp follow-up link
      const waLink = qs("#waConfirm");
      if (waLink){
        const msg =
          `Hi AlphaWave Solutions 👋\n` +
          `My quote request Ticket ID is ${ticket}.\n` +
          `Service: ${serviceType}\nDevice: ${deviceType}\n` +
          `Issue: ${issue}`;
        waLink.href = toWhatsAppLink(cfg.BUSINESS.phone, msg);
      }

    } catch (err) {
      setBanner("bad", `Submission failed: ${escapeHTML(err.message)}<br><small>If this persists, contact us on WhatsApp.</small>`);
      lockForm(false);
    }
  });
})();
