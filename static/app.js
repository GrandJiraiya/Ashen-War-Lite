<script>
// ============== ASHEn WAR LITE - FULL FRONTEND (static/app.js) ==============

let currentPlayerName = null;
let currentState = null;

// ====================== PLAYER NAME ======================
function getPlayerName() {
  if (currentPlayerName) return currentPlayerName;
  const urlParams = new URLSearchParams(window.location.search);
  let player = urlParams.get('player') || localStorage.getItem('player_name');
  if (!player) {
    player = prompt("Enter your player name:", "CrashOutCrypto_" + Math.floor(Math.random()*999));
  }
  currentPlayerName = player.trim();
  localStorage.setItem('player_name', currentPlayerName);
  return currentPlayerName;
}

// ====================== API HELPER ======================
async function api(endpoint, method = "GET", body = null) {
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
  if (!res.ok) throw new Error(data.error || "API error");
  return data;
}

// ====================== RENDER (FIXED) ======================
function renderState(state) {
  currentState = state;
  const hasRun = !!state.has_run;

  // Hide class selection, show game UI
  document.getElementById("class-selection").style.display = hasRun ? "none" : "block";
  document.getElementById("game-ui").classList.toggle("hidden", !hasRun);

  if (!hasRun) return;

  // Player stats
  const p = state.player || {};
  document.getElementById("player-name").textContent = p.name || getPlayerName();
  document.getElementById("player-class").textContent = (p.class || "").toUpperCase();
  document.getElementById("player-hp").textContent = `${p.hp || 0}/${p.max_hp || 100}`;
  document.getElementById("player-gold").textContent = p.gold || 0;
  document.getElementById("player-room").textContent = state.room || 0;

  // HP bar
  const hpPercent = Math.max(0, Math.min(100, (p.hp || 0) / (p.max_hp || 100) * 100));
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

  // Battle log
  const logEl = document.getElementById("battle-log");
  logEl.innerHTML = (state.battle_log || []).map(l => `<div class="mb-1">${l}</div>`).join("");

  // Reward
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

  // Run over
  document.getElementById("run-over-section").classList.toggle("hidden", !state.run_over);
}

// ====================== ACTIONS ======================
async function startNewRun(heroClass) {
  try {
    const data = await api("/api/game/new-run", "POST", { heroClass });
    renderState(data);
  } catch (e) {
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
    alert("✅ Submitted to leaderboard!\n" + (data.message || ""));
  } catch (e) {
    alert(e.message);
  }
}

// ====================== INIT ======================
async function initGame() {
  getPlayerName();
  try {
    const state = await api("/api/game/state");
    renderState(state);
  } catch (e) {
    console.error(e);
  }
}

document.addEventListener("DOMContentLoaded", initGame);
</script>