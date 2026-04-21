<script>
// ============== ASHEn WAR LITE - DEBUG VERSION ==============

console.log("🚀 app.js LOADED successfully");

let currentPlayerName = null;
let currentState = null;

// ====================== PLAYER NAME ======================
function getPlayerName() {
  console.log("👤 getPlayerName() called");
  if (currentPlayerName) {
    console.log("   → Using cached name:", currentPlayerName);
    return currentPlayerName;
  }
  const urlParams = new URLSearchParams(window.location.search);
  let player = urlParams.get('player') || localStorage.getItem('player_name');
  if (!player) {
    console.log("   → No name found, prompting...");
    player = prompt("Enter your player name:", "CrashOutCrypto_" + Math.floor(Math.random()*999));
  }
  currentPlayerName = player.trim();
  localStorage.setItem('player_name', currentPlayerName);
  console.log("   → Final player name:", currentPlayerName);
  return currentPlayerName;
}

// ====================== API HELPER ======================
async function api(endpoint, method = "GET", body = null) {
  console.log(`📡 API CALL → ${method} ${endpoint}`, body ? body : '');
  const playerName = getPlayerName();
  let url = endpoint;
  if (!url.includes("?")) url += "?";
  else url += "&";
  url += "player_name=" + encodeURIComponent(playerName);

  const options = { method, headers: {} };
  if (body) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  const res = await fetch(url, options);
  const data = await res.json();
  console.log(`📥 API RESPONSE (${res.status}) →`, data);

  if (!res.ok) {
    console.error("❌ API ERROR:", data);
    throw new Error(data.error || "API error");
  }
  return data;
}

// ====================== RENDER (with debug) ======================
function renderState(state) {
  console.log("🎨 renderState() called with:", state);
  currentState = state;
  const hasRun = !!state.has_run;

  console.log("   → has_run =", hasRun);

  // Toggle screens
  const classScreen = document.getElementById("class-selection");
  const gameScreen = document.getElementById("game-ui");

  if (classScreen) classScreen.style.display = hasRun ? "none" : "block";
  if (gameScreen) gameScreen.classList.toggle("hidden", !hasRun);

  console.log("   → Class screen hidden:", hasRun);
  console.log("   → Game UI shown:", hasRun);

  if (!hasRun) return;

  // Rest of rendering (stats, enemy, etc.)
  console.log("   → Rendering full game UI");
  // ... (the rest of your render code remains the same)
  const p = state.player || {};
  document.getElementById("player-name").textContent = p.name || getPlayerName();
  document.getElementById("player-class").textContent = (p.class || "").toUpperCase();
  document.getElementById("player-hp").textContent = `${p.hp || 0}/${p.max_hp || 100}`;
  document.getElementById("player-gold").textContent = p.gold || 0;
  document.getElementById("player-room").textContent = state.room || 0;

  const hpPercent = Math.max(0, Math.min(100, (p.hp || 0) / (p.max_hp || 100) * 100));
  document.getElementById("hp-bar").style.width = hpPercent + "%";

  const enemySec = document.getElementById("enemy-section");
  if (state.enemy) {
    enemySec.classList.remove("hidden");
    document.getElementById("enemy-name").textContent = state.enemy.name || "Enemy";
    document.getElementById("enemy-hp").textContent = `${state.enemy.hp || 0}/${state.enemy.max_hp || 100}`;
  } else {
    enemySec.classList.add("hidden");
  }

  const logEl = document.getElementById("battle-log");
  logEl.innerHTML = (state.battle_log || []).map(l => `<div class="mb-1">${l}</div>`).join("");

  const rewardSec = document.getElementById("reward-section");
  if (state.reward_pending && state.last_reward) {
    rewardSec.classList.remove("hidden");
    const html = state.last_reward.map((item, i) => `
      <button onclick="chooseReward(${i})" class="w-full bg-emerald-700 hover:bg-emerald-600 py-4 rounded-xl text-left px-6">
        ${item.name} <span class="text-xs text-emerald-300">(${item.type})</span>
      </button>`).join("");
    document.getElementById("reward-options").innerHTML = html;
  } else {
    rewardSec.classList.add("hidden");
  }

  document.getElementById("run-over-section").classList.toggle("hidden", !state.run_over);
}

// ====================== ACTIONS ======================
async function startNewRun(heroClass) {
  console.log("🔥 startNewRun called with class:", heroClass);
  try {
    const data = await api("/api/game/new-run", "POST", { heroClass });
    console.log("✅ New run API succeeded, rendering...");
    renderState(data);
  } catch (e) {
    console.error("💥 startNewRun FAILED:", e);
    alert("Could not start run: " + e.message);
  }
}

async function fight() {
  try {
    const data = await api("/api/game/fight", "POST", { action: "attack" });
    renderState(data);
  } catch (e) { console.error(e); }
}

async function chooseReward(choice) {
  try {
    const data = await api("/api/game/reward", "POST", { choice });
    renderState(data);
  } catch (e) { console.error(e); }
}

async function resetRun() {
  if (confirm("End this run?")) {
    await api("/api/game/reset", "POST", {});
    location.reload();
  }
}

async function submitToLeaderboard() {
  try {
    const data = await api("/api/run/submit", "POST", {});
    alert("✅ Submitted to leaderboard!");
  } catch (e) {
    alert(e.message);
  }
}

// ====================== INIT ======================
async function initGame() {
  console.log("🚀 initGame() started");
  getPlayerName();
  try {
    const state = await api("/api/game/state");
    console.log("📥 Initial state loaded");
    renderState(state);
  } catch (e) {
    console.error("💥 Initial state load FAILED:", e);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("📄 DOM fully loaded");
  initGame();
});
</script>