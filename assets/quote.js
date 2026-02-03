(() => {
  const $ = (id) => document.getElementById(id);

  const status = $("q_status");
  const WA_NUMBER = "27615224124";
  const EMAIL_TO  = "solutionsalphawave@gmail.com";

  function getData() {
    const name = ($("q_name").value || "").trim();
    const phone = ($("q_phone").value || "").trim();
    const service = $("q_service").value;
    const device = ($("q_device").value || "").trim();
    const pref = $("q_pref").value;
    const issue = ($("q_issue").value || "").trim();

    return { name, phone, service, device, pref, issue };
  }

  function validate(d) {
    if (!d.name) return "Please enter your name.";
    if (!d.issue) return "Please describe the problem.";
    return "";
  }

  function formatMessage(d) {
    // Keep clean, professional, copyable
    return (
`Hi AlphaWave Solutions,
Please can I get a quote?

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

  function saveLocal(d) {
async function saveRemote(record) {
  const url = window.ALPHAWAVE && window.ALPHAWAVE.TICKETS_API_URL;
  if (!url) return { ok:false, error:"Missing TICKETS_API_URL" };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(record)
  });

  return await res.json();
}

    const record = {
      id: "Q-" + Math.random().toString(36).slice(2, 10).toUpperCase(),
      createdAt: new Date().toISOString(),
      ...d
    };

    list.unshift(record);
    localStorage.setItem(key, JSON.stringify(list));
    return record.id;
  }

function setStatus(text, id) {
  if (!status) return;

  if (!id) {
    status.textContent = text;
    return;
  }

  const trackUrl = `admin.html?id=${encodeURIComponent(id)}`;
  status.innerHTML = `${text} • <a href="${trackUrl}">Track Ticket →</a>`;
}

  $("btn_save")?.addEventListener("click", () => {
    const d = getData();
    const err = validate(d);
    if (err) { setStatus(err); return; }
    const id = saveLocal(d);
   setStatus(`Saved locally ✅ Quote ID: ${id}`, id);
  });

  $("btn_whatsapp")?.addEventListener("click", () => {
    const d = getData();
    const err = validate(d);
    if (err) { setStatus(err); return; }

    const id = saveLocal(d);
    const msg = formatMessage(d) + `\n\nLocal Quote ID: ${id}`;
    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank", "noopener");
    setStatus(`Opened WhatsApp ✅ Saved locally (Quote ID: ${id})`, id);
  });

  $("btn_email")?.addEventListener("click", () => {
    const d = getData();
    const err = validate(d);
    if (err) { setStatus(err); return; }

    const id = saveLocal(d);
 const record = {
  id: "Q-" + Math.random().toString(36).slice(2, 10).toUpperCase(),
  createdAt: new Date().toISOString(),
  ...d
};

// save local
const key = "alphawave_quotes";
const list = JSON.parse(localStorage.getItem(key) || "[]");
list.unshift(record);
localStorage.setItem(key, JSON.stringify(list));

const id = record.id;

// save remote (sheets)
try { await saveRemote(record); } catch(e) {}

    // mail to is best for a static site (no backend needed)
    const url = `mailto:${encodeURIComponent(EMAIL_TO)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = url;

   setStatus(`Opened Email ✅ Saved locally (Quote ID: ${id})`, id);
  });
})();


