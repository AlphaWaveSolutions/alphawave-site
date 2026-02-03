(() => {
  const $ = (id) => document.getElementById(id);

  const WA_NUMBER = "27615224124";
  const EMAIL_TO  = "solutionsalphawave@gmail.com";
  const LOCAL_KEY = "alphawave_quotes"; // browser storage key (not your Google Sheet name)

  function getData() {
    const name   = ($("q_name")?.value || "").trim();
    const phone  = ($("q_phone")?.value || "").trim();
    const service= $("q_service")?.value || "";
    const device = ($("q_device")?.value || "").trim();
    const pref   = $("q_pref")?.value || "";
    const issue  = ($("q_issue")?.value || "").trim();
    return { name, phone, service, device, pref, issue };
  }

  function validate(d) {
    if (!d.name) return "Please enter your name.";
    if (!d.issue) return "Please describe the problem.";
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
`Hi AlphaWave Solutions,
Please can I get a quote?

Ticket ID: ${ticketId}
Name: ${d.name}
Phone: ${d.phone || "-"}
Service: ${d.service}
Device: ${d.device || "-"}
Preferred contact: ${d.pref}

Problem:
${d.issue}

Thank you.`
    );
  }

  function saveLocalRecord(record) {
    const list = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
    list.unshift(record);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
  }

  function getApiUrl() {
    return window.ALPHAWAVE && window.ALPHAWAVE.TICKETS_API_URL;
  }

  // Fire-and-forget remote save to avoid popup blockers.
  // Uses keepalive so it still sends even if page navigates to Gmail.
  function fireAndForgetRemote(record) {
    const url = getApiUrl();
    if (!url) return;

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
    const record = {
      id: ticketId,
      createdAt: new Date().toISOString(),
      name: d.name,
      phone: d.phone,
      service: d.service,
      device: d.device,
      pref: d.pref,
      issue: d.issue,
      status: "Received"
    };

    saveLocalRecord(record);
    fireAndForgetRemote(record);

    return { ticketId, record };
  }

  // ✅ Save Quote (Local + Remote)
  $("btn_save")?.addEventListener("click", () => {
    const d = getData();
    const err = validate(d);
    if (err) { setStatus(err); return; }

    const { ticketId } = createTicketNow(d);
    setStatus(`Saved ✅ Ticket ID: ${ticketId}`, ticketId);
  });

  // ✅ WhatsApp (open immediately to avoid blocker)
  $("btn_whatsapp")?.addEventListener("click", () => {
    const d = getData();
    const err = validate(d);
    if (err) { setStatus(err); return; }

    const { ticketId } = createTicketNow(d);

    const msg = formatMessage(d, ticketId);
    const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;

    // open immediately (user-gesture safe)
    window.open(waUrl, "_blank", "noopener");

    setStatus(`Opened WhatsApp ✅ Ticket ID: ${ticketId}`, ticketId);
  });

  // ✅ Email (Gmail compose, opens immediately)
  $("btn_email")?.addEventListener("click", () => {
    const d = getData();
    const err = validate(d);
    if (err) { setStatus(err); return; }

    const { ticketId } = createTicketNow(d);

    const subject = `Quote Request - ${d.service} (Ticket: ${ticketId})`;
    const body = formatMessage(d, ticketId);

    // Same-tab navigation avoids popup blockers
    window.location.href = gmailComposeUrl(EMAIL_TO, subject, body);

    setStatus(`Email draft opened ✅ Ticket ID: ${ticketId} (tap Send in Gmail)`, ticketId);
  });
})();
