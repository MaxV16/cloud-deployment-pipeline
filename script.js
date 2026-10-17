// Talks to the nginx /api/host endpoint, which reports the pod hostname
// and the app version baked into the image at build time.

// Grab the elements once so I don't keep querying the DOM every time
const els = {
  hostname: document.getElementById("hostname"),
  version: document.getElementById("version"),
  hint: document.getElementById("hint"),
  ping: document.getElementById("ping"),
};

// Calls the API and puts the hostname/version on the page.
// Returns true if it worked and false if something broke, so the
// button handler knows what happened.
async function loadInfo() {
  try {
    // no-store so the browser doesn't cache the response, otherwise
    // after a redeploy we might still see the old pod details
    const res = await fetch("/api/host", { cache: "no-store" });
    if (!res.ok) throw new Error("bad status " + res.status);
    const data = await res.json();
    els.hostname.textContent = data.hostname || "unknown";
    els.version.textContent = data.version || "unknown";
    return true;
  } catch (err) {
    // Probably the backend isn't up yet or the request failed,
    // just show unavailable instead of crashing the page
    els.hostname.textContent = "unavailable";
    els.version.textContent = "unavailable";
    return false;
  }
}

// Re-run the lookup when the button is clicked. Disable it while
// the request is in flight so people can't spam it.
els.ping.addEventListener("click", async () => {
  els.ping.disabled = true;
  els.ping.textContent = "Pinging...";
  await loadInfo();
  els.ping.disabled = false;
  els.ping.textContent = "Ping the pod";
});

// Load once on page load.
loadInfo();
