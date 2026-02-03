(() => {
  const $ = (id) => document.getElementById(id);

  const statusEl = $("q_status");
  const WA_NUMBER = "27615224124";
  const EMAIL_TO  = "solutionsalphawave@gmail.com";
  const LOCAL_KEY = "alphawave_quotes";

  function getData() {
    const name = ($("q_name")?.value || "").trim();
    const phone = ($("q_phone")?.value || "").trim();
    const service = $("q_service")?.value || "";
    const device = ($("q_device")?.value || "").trim();
    const pref = $("q_pref")?.value || "";
    const issue = ($("q_issue")?.value || "").trim();

    return { name, phone, service, device, pref, issue };
  }

  function validate(d) {
    if (!d.name) return "Please enter your name.";
    if (!d.issue) return "Please describe the problem.";
    return "";
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

  function setStatus(text, ticketId) {
    if (!statusEl) return;

    if (!ticketId) {
      statusEl.textContent = text;
      return;
    }

    const trackUrl = `admin.html?id=${encodeURIComponent(ticketId)}`;
    statusEl.innerHTML = `${text} • <a href="${trackUrl}">Track Ticket →</a>`;
  }

  function makeTicketId() {
    return "Q-" + Math.random().toString(36).slice(2, 10).toUpperCase();
  }

  function saveLocalRecord(record) {
    const list = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
    list.unshift(record);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
  }

  async function saveRemoteRecord(record) {
    // Uses window.ALPHAWAVE.TICKETS_API_URL from assets/config.js
    const url = window.ALPHAWAVE && window.ALPHAWAVE.TICKETS_API_URL;
    if (!url) return { ok: false, error: "Missing TICKETS_API_URL in assets/config.js" };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record)
    });

    // Apps Script returns JSON
    return await res.json();
  }

  async function createTicket(d) {
    // One ticket record object used for local + remote + messaging
    const ticketId = makeTicketId();

    // Keep field names simple; Apps Script maps these to Title Case headers
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

    // Save locally
    saveLocalRecord(record);

    // Save remotely (Sheets) — do not block the user if it fails
    try {
      const r = await saveRemoteRecord(record);
      if (!r || r.ok !== true) {
        // Remote failed; keep local anyway
        return { ticketId, record, remoteOk: false, remoteError: (r && r.error) ? r.error : "Remote save failed" };
      }
      return { ticketId, record, remoteOk: true };
    } catch (e) {
      return { ticketId, record, remoteOk: false, remoteError: String(e) };
    }
  }

  // SAVE ONLY (C)
  $("btn_save")?.addEventListener("click", async () => {
    const d = getData();
    const err = validate(d);
    if (err) { setStatus(err); return; }

    setStatus("Saving…");
    const { ticketId, remoteOk } = await createTicket(d);

    if (remoteOk) setStatus(`Saved ✅ Ticket ID: ${ticketId}`, ticketId);
    else setStatus(`Saved locally ✅ Ticket ID: ${ticketId} (remote sync pending)`, ticketId);
  });

  // WHATSAPP (A)
  $("btn_whatsapp")?.addEventListener("click", async () => {
    const d = getData();
    const err = validate(d);
    if (err) { setStatus(err); return; }

    setStatus("Preparing WhatsApp…");
    const { ticketId, remoteOk } = await createTicket(d);

    const msg = formatMessage(d, ticketId);
    const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, "_blank", "noopener");

    if (remoteOk) setStatus(`Opened WhatsApp ✅ Ticket ID: ${ticketId}`, ticketId);
    else setStatus(`Opened WhatsApp ✅ Ticket ID: ${ticketId} (remote sync pending)`, ticketId);
  });

  // EMAIL (B)
  $("btn_email")?.addEventListener("click", async () => {
    const d = getData();
    const err = validate(d);
    if (err) { setStatus(err); return; }

    setStatus("Preparing Email…");
    const { ticketId, remoteOk } = await createTicket(d);

    const subject = `Quote Request - ${d.service} (Ticket: ${ticketId})`;
    const body = formatMessage(d, ticketId);

    const mailtoUrl =
      `mailto:${encodeURIComponent(EMAIL_TO)}` +
      `?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoUrl;

    if (remoteOk) setStatus(`Opened Email ✅ Ticket ID: ${ticketId}`, ticketId);
    else setStatus(`Opened Email ✅ Ticket ID: ${ticketId} (remote sync pending)`, ticketId);
  });
})();
