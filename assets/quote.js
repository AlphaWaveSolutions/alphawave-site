(() => {
  const $ = (id) => document.getElementById(id);

  // Business contact details
  const WHATSAPP_NUMBER = "27615224124";
  const SUPPORT_EMAIL   = "solutionsalphawave@gmail.com";

  // Local browser storage key (NOT your Google Sheet name)
  const LOCAL_KEY = "alphawave_tickets";

  function getApiBase() {
    // Must be set in assets/config.js:
    // window.ALPHAWAVE_CONFIG = { API_BASE: "https://your-worker.workers.dev" };
    return window.ALPHAWAVE_CONFIG?.API_BASE || "";
  }

  function getData() {
    const customerName      = ($("q_name")?.value || "").trim();
    const phoneNumber       = ($("q_phone")?.value || "").trim();
    const serviceRequested  = $("q_service")?.value || "";
    const deviceDetails     = ($("q_device")?.value || "").trim();
    const preferredContact  = $("q_pref")?.value || "";
    const issueDescription  = ($("q_issue")?.value || "").trim();

    return {
      customerName,
      phoneNumber,
      serviceRequested,
      deviceDetails,
      preferredContact,
      issueDescription
    };
  }

  function validate(d) {
    if (!d.customerName) return "Please enter your name.";
    if (!d.issueDescription) return "Please describe the problem.";
    return "";
  }

  function makeTicketId() {
    return "Q-" + Math.random().toString(36).slice(2, 10).toUpperCase();
  }

  function setStatus(text, ticketId) {
    const el = $("q_status");
    if (!el) return;

    if (!ticketId) {
      el.textContent = text;
      return;
    }

    const trackUrl = `admin.html?ticketId=${encodeURIComponent(ticketId)}`;
    el.innerHTML = `${text} • <a href="${trackUrl}">Track Ticket →</a>`;
  }

  function formatMessage(d, ticketId) {
    return (
`Hello AlphaWave Solutions,

I would like to request a quotation, please.

Ticket ID: ${ticketId}
Customer Name: ${d.customerName}
Phone Number: ${d.phoneNumber || "-"}
Service Requested: ${d.serviceRequested}
Device Details: ${d.deviceDetails || "-"}
Preferred Contact: ${d.preferredContact}

Issue Description:
${d.issueDescription}

Kind regards,
${d.customerName}`
    );
  }

  function saveLocalRecord(record) {
    const list = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
    list.unshift(record);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
  }

  // Fire-and-forget remote save (keeps user gesture intact + avoids popup blockers)
  function fireAndForgetRemote(record) {
    const apiBase = getApiBase();
    if (!apiBase) return;

    const url = `${apiBase}?action=create`;

    try {
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
        keepalive: true
      }).catch(() => {});
    } catch {
      // ignore
    }
  }

  function gmailComposeUrl(to, subject, body) {
    return (
      "https://mail.google.com/mail/?view=cm&fs=1" +
      `&to=${encodeURIComponent(to)}` +
      `&su=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`
    );
  }

  function createTicketNow(d) {
    const ticketId = makeTicketId();

    // ✅ This matches your Apps Script mapping too (it supports id/name/phone/service/device/pref/issue/status)
    const record = {
      id: ticketId,
      createdAt: new Date().toISOString(),
      name: d.customerName,
      phone: d.phoneNumber,
      service: d.serviceRequested,
      device: d.deviceDetails,
      pref: d.preferredContact,
      issue: d.issueDescription,
      status: "Received"
    };

    saveLocalRecord(record);
    fireAndForgetRemote(record);

    return { ticketId, record };
  }

  // ✅ Save Ticket (Local + Remote)
  $("btn_save")?.addEventListener("click", () => {
    const apiBase = getApiBase();
    if (!apiBase) {
      setStatus("Configuration error: Missing API_BASE in assets/config.js.");
      return;
    }

    const d = getData();
    const err = validate(d);
    if (err) { setStatus(err); return; }

    const { ticketId } = createTicketNow(d);
    setStatus(`Saved ✅ Ticket ID: ${ticketId}`, ticketId);
  });

  // ✅ WhatsApp (open immediately to avoid popup blocker)
  $("btn_whatsapp")?.addEventListener("click", () => {
    const apiBase = getApiBase();
    if (!apiBase) {
      setStatus("Configuration error: Missing API_BASE in assets/config.js.");
      return;
    }

    const d = getData();
    const err = validate(d);
    if (err) { setStatus(err); return; }

    const { ticketId } = createTicketNow(d);

    const msg = formatMessage(d, ticketId);
    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;

    window.open(waUrl, "_blank", "noopener");
    setStatus(`WhatsApp opened ✅ Ticket ID: ${ticketId}`, ticketId);
  });

  // ✅ Email (Gmail compose in same tab)
  $("btn_email")?.addEventListener("click", () => {
    const apiBase = getApiBase();
    if (!apiBase) {
      setStatus("Configuration error: Missing API_BASE in assets/config.js.");
      return;
    }

    const d = getData();
    const err = validate(d);
    if (err) { setStatus(err); return; }

    const { ticketId } = createTicketNow(d);

    const subject = `Quote Request – ${d.serviceRequested} (Ticket ID: ${ticketId})`;
    const body = formatMessage(d, ticketId);

    // Same-tab navigation avoids popup blockers
    window.location.href = gmailComposeUrl(SUPPORT_EMAIL, subject, body);

    setStatus(`Email draft opened ✅ Ticket ID: ${ticketId} (Tap “Send” in Gmail)`, ticketId);
  });
})();
