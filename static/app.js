<script>
// ============== ASHEn WAR LITE - ULTRA DEBUG VERSION ==============
console.log("%c🚀 app.js LOADED - Version 2026-04-21 DEBUG", "color: lime; font-size: 16px;");

let currentPlayerName = null;
let currentState = null;

function getPlayerName() {
  console.log("👤 getPlayerName called");
  if (currentPlayerName) return currentPlayerName;
  const urlParams = new URLSearchParams(window.location.search);
  let player = urlParams.get('player') || localStorage.getItem('player_name');
  if (!player) player = prompt("Enter player name:", "CrashOutCrypto");
  currentPlayerName = player.trim();
  localStorage.setItem('player_name', currentPlayerName);
  console.log("✅ Player name set to:", currentPlayerName);
  return currentPlayerName;
}

async function api(endpoint, method = "GET", body = null) {
  console.log(`📡 API → ${method} ${endpoint}`, body || '');
  const playerName = getPlayerName();
  let url = endpoint + (endpoint.includes("?") ? "&" : "?") + "player_name=" + encodeURIComponent(playerName);

  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : null
  });

  const data = await res.json();
  console.log(`📥 API RESPONSE ${res.status}:`, data);

  if (!res.ok) {
    alert("API ERROR: " + (data.error || "Unknown error"));
    throw new Error(data.error);
  }
  return data;
}

function renderState(state) {
  console.log("🎨 renderState called with has_run =", !!state.has_run, state);
  currentState = state;
  const hasRun = !!state.has_run;

  // FORCE screen switch
  const classScreen = document.getElementById("class-selection");
  const gameScreen = document.getElementById("game-ui");

  if (classScreen) classScreen.style.display = hasRun ? "none" : "block";
  if (gameScreen) gameScreen.classList.toggle("hidden", !hasRun);

  console.log("   → Class screen hidden:", hasRun);
  console.log("   → Game UI visible:", !gameScreen.classList.contains("hidden"));

  if (!hasRun) return;

  // Player stats
  const p = state.player || {};
  document.getElementById("player-name").textContent = p.name || getPlayerName();
  document.getElementById("player-class").textContent = (p.class || "").toUpperCase();
  document.getElementById("player-hp").textContent = `${p.hp || 0}/${p.max_hp || 100}`;
  document.getElementById("player-gold").textContent = p.gold || 0;
  document.getElementById("player-room").textContent = state.room || 0;

  // HP bar
  const hpPercent = Math.max(0, Math.min(100, ((p.hp || 0) / (p.max_hp || 100)) * 100));
  document.getElementById("hp-bar").style.width = hpPercent + "%";

  // Enemy
  const enemySec = document.getElementById("enemy-section");
  if (state.enemy) {
    enemySec.classList.remove("hidden");
    document.getElementById("enemy-name").textContent = state.enemy.name || "Enemy";
    document.getElementById("enemy-hp").textContent = `${state.enemy.hp || 0}/${state.enemy.max_hp || 100}`;
  } else {
    enemySec.classList.add("hidden");
  }

  console.log("✅ Full game UI should now be visible!");
}

// ====================== ACTIONS ======================
async function startNewRun(heroClass) {
  console.log("🔥 startNewRun clicked with class:", heroClass);
  alert("Starting new run as " + heroClass + "… (check console)");
  try {
    const data = await api("/api/game/new-run", "POST", { heroClass });
    console.log("✅ New run success:", data);
    renderState(data);
  } catch (e) {
    console.error("💥 startNewRun failed:", e);
    alert("Failed to start run: " + e.message);
  }
}

async function fight() {
  try { const data = await api("/api/game/fight", "POST", { action: "attack" }); renderState(data); } catch(e){console.error(e);}
}

async function chooseReward(choice) {
  try { const data = await api("/api/game/reward", "POST", { choice }); renderState(data); } catch(e){console.error(e);}
}

async function resetRun() {
  if (confirm("Reset run?")) location.reload();
}

// ====================== INIT ======================
async function initGame() {
  console.log("🚀 initGame started");
  getPlayerName();
  try {
    const state = await api("/api/game/state");
    renderState(state);
  } catch (e) {
    console.error("💥 initGame failed:", e);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("📄 DOM ready - initializing game");
  initGame();
});
</script>