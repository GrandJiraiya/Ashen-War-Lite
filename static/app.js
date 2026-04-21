<script>
// ============== ASHEn WAR LITE - IPHONE DEBUG VERSION ==============

alert("🚀 app.js LOADED successfully on iPhone");

let currentPlayerName = null;

function getPlayerName() {
  if (currentPlayerName) return currentPlayerName;
  const urlParams = new URLSearchParams(window.location.search);
  let player = urlParams.get('player') || localStorage.getItem('player_name');
  if (!player) player = prompt("Enter your player name:", "CrashOutCrypto");
  currentPlayerName = player.trim();
  localStorage.setItem('player_name', currentPlayerName);
  return currentPlayerName;
}

async function api(endpoint, method = "GET", body = null) {
  alert("📡 Calling API: " + endpoint);
  const playerName = getPlayerName();
  let url = endpoint + (endpoint.includes("?") ? "&" : "?") + "player_name=" + encodeURIComponent(playerName);

  const res = await fetch(url, {
    method: method,
    headers: body ? {"Content-Type": "application/json"} : {},
    body: body ? JSON.stringify(body) : null
  });

  const data = await res.json();
  alert("📥 API returned: " + JSON.stringify(data).substring(0, 200) + "...");
  return data;
}

function renderState(state) {
  alert("🎨 renderState called - has_run = " + !!state.has_run);
  const hasRun = !!state.has_run;

  // Force screen switch
  document.getElementById("class-selection").style.display = hasRun ? "none" : "block";
  document.getElementById("game-ui").classList.toggle("hidden", !hasRun);

  alert("✅ Screen should now switch! has_run = " + hasRun);
}

async function startNewRun(heroClass) {
  alert("🔥 You clicked class: " + heroClass + "\nAttempting to start run...");
  try {
    const data = await api("/api/game/new-run", "POST", { heroClass: heroClass });
    alert("✅ New run SUCCESS! Rendering game...");
    renderState(data);
  } catch (e) {
    alert("💥 FAILED to start run:\n" + e.message);
  }
}

async function initGame() {
  alert("🚀 Page loaded - initializing game");
  getPlayerName();
  try {
    const state = await api("/api/game/state");
    renderState(state);
  } catch (e) {
    alert("💥 Could not load initial state: " + e.message);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  alert("📄 DOM ready - starting initGame");
  initGame();
});
</script>