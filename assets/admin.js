// assets/admin.js
import { qs, escapeHTML, formatDateTimeZA } from "./utils.js";

async function getRecent(url){
  const res = await fetch(url, { method: "GET" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.ok !== true) {
    throw new Error(data?.error || `Failed (${res.status})`);
  }
  return data;
}

function renderRows(rows){
  const tbody = qs("#rows");
  if (!tbody) return;

  if (!rows || rows.length === 0){
    tbody.innerHTML = `<tr><td colspan="7">No submissions found.</td></tr>`;
    return;
  }

  tbody.innerHTML = rows.map(r => {
    return `
      <tr>
        <td>${escapeHTML(formatDateTimeZA(r.timestamp))}</td>
        <td><span class="badge">${escapeHTML(r.ticketId)}</span></td>
        <td>${escapeHTML(r.name)}</td>
        <td>${escapeHTML(r.phone)}</td>
        <td>${escapeHTML(r.serviceType)}</td>
        <td>${escapeHTML(r.deviceType)}</td>
        <td>${escapeHTML(r.preferredContact)}</td>
      </tr>
    `;
  }).join("");
}

(function initAdmin(){
  const cfg = window.ALPHAWAVE_CONFIG || {};
  const endpoint = cfg.GAS_ENDPOINT;
  const token = cfg.ADMIN_TOKEN;

  const banner = qs("#adminBanner");
  const sheetLink = qs("#sheetLink");

  if (!endpoint || endpoint.includes("PASTE_")){
    banner.className = "banner bad";
    banner.innerHTML = "Admin not configured. Set GAS_ENDPOINT in <code>assets/config.js</code>.";
    return;
  }

  // This is not secure. Anyone with the URL + token can read the JSON.
  // It's "hidden by URL" only.
  const url = `${endpoint}?action=recent&token=${encodeURIComponent(token)}&limit=25`;

  qs("#refreshBtn")?.addEventListener("click", async () => {
    banner.className = "banner";
    banner.textContent = "Loading…";
    try{
      const data = await getRecent(url);
      renderRows(data.rows || []);
      banner.className = "banner ok";
      banner.textContent = `Loaded ${data.count || 0} submissions ✅`;
    } catch(err){
      banner.className = "banner bad";
      banner.textContent = `Failed: ${err.message}`;
    }
  });

  // auto-load once
  qs("#refreshBtn")?.click();

  // Optional: if you paste your sheet URL in GAS code, it can be returned; otherwise hide.
  if (sheetLink){
    sheetLink.style.display = "none";
  }
})();
