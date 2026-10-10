// Talks to the nginx /api/host endpoint, which reports the pod hostname
// and the app version baked into the image at build time.

const els = {
  hostname: document.getElementById("hostname"),
  version: document.getElementById("version"),
  hint: document.getElementById("hint"),
  ping: document.getElementById("ping"),
};

async function loadInfo() {
  try {
    const res = await fetch("/api/host", { cache: "no-store" });
    if (!res.ok) throw new Error("bad status " + res.status);
    const data = await res.json();
    els.hostname.textContent = data.hostname || "unknown";
    els.version.textContent = data.version || "unknown";
    return true;
  } catch (err) {
    els.hostname.textContent = "unavailable";
    els.version.textContent = "unavailable";
    return false;
  }
}

els.ping.addEventListener("click", async () => {
  els.ping.disabled = true;
  els.ping.textContent = "Pinging...";
  await loadInfo();
  els.ping.disabled = false;
  els.ping.textContent = "Ping the pod";
});

// Load once on page load.
loadInfo();
