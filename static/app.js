<!-- Paste this entire file as static/app.js (replace your current one) -->
<script>
// ============== ASHEn WAR LITE - FULL FRONTEND (static/app.js) ==============

let currentPlayerName = null;
let currentState = null;

// ====================== PLAYER NAME HANDLING ======================
function getPlayerName() {
  if (currentPlayerName) return currentPlayerName;

  // 1. URL param (?player=CrashOutCrypto)
  const urlParams = new URLSearchParams(window.location.search);
  let player = urlParams.get('player');

  // 2. LocalStorage
  if (!player) player = localStorage.getItem('player_name');

  // 3. Prompt
  if (!player) {
    player = prompt("Enter your player name (e.g. CrashOutCrypto):", "Guest_" + Math.floor(Math.random() * 9999));
    if (!player) player = "Guest_" + Math.floor(Math.random() * 9999);
  }

  currentPlayerName = player.trim();
  localStorage.setItem('player_name', currentPlayerName);
  return currentPlayerName;
}

// ====================== API HELPER (auto-adds player_name) ======================
async function api(endpoint, method = "GET", body = null) {
  const playerName = getPlayerName();
  const url = endpoint + (endpoint.includes("?") ? "&" : "?") + "player_name=" + encodeURIComponent(playerName);

  const options = {
    method: method,
    headers: {}
  };

  if (body) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok) {
    console.error("API Error:", data);
    throw new Error(data.error || "Server error");
  }
  return data;
}

// ====================== RENDER THE ENTIRE GAME UI ======================
function renderState(state) {
  currentState = state;

  // Show/hide sections based on game state
  const hasRun = state.has_run || false;

  // Class selection (only show if no active run)
  document.getElementById("class-selection").style.display = hasRun ? "none" : "block";

  if (!hasRun) return;

  // Player stats
  const player = state.player;
  document.getElementById("player-name").textContent = player.name || getPlayerName();
  document.getElementById("player-class").textContent = player.class.toUpperCase();
  document.getElementById("player-hp").textContent = `${player.hp}/${player.max_hp}`;
  document.getElementById("player-gold").textContent = player.gold;
  document.getElementById("player-room").textContent = state.room || 0;

  // Enemy
  if (state.enemy) {
    document.getElementById("enemy-section").style.display = "block";
    document.getElementById("enemy-name").textContent = state.enemy.name;
    document.getElementById("enemy-hp").textContent = `${state.enemy.hp}/${state.enemy.max_hp}`;
  } else {
    document.getElementById("enemy-section").style.display = "none";
  }

  // Battle log
  const logContainer = document.getElementById("battle-log");
  logContainer.innerHTML = state.battle_log.map(msg => `<div>${msg}</div>`).join("");

  // Reward screen
  const rewardSection = document.getElementById("reward-section");
  if (state.reward_pending) {
    rewardSection.style.display = "block";
    // Populate reward choices (assumes 3 options in state.last_reward)
    const rewardsHTML = state.last_reward.map((item, i) => `
      <button onclick="chooseReward(${i})" class="reward-btn">
        ${item.name} (${item.type})
      </button>
    `).join("");
    document.getElementById("reward-options").innerHTML = rewardsHTML;
  } else {
    rewardSection.style.display = "none";
  }

  // Merchant / Shop
  const shopSection = document.getElementById("shop-section");
  if (state.merchant_quote) {
    shopSection.style.display = "block";
    document.getElementById("merchant-quote").textContent = state.merchant_quote;
  } else {
    shopSection.style.display = "none";
  }

  // Run over screen
  if (state.run_over) {
    document.getElementById("run-over-section").style.display = "block";
  } else {
    document.getElementById("run-over-section").style.display = "none";
  }
}

// ====================== GAME ACTIONS ======================
async function startNewRun(heroClass) {
  try {
    const data = await api("/api/game/new-run", "POST", { heroClass });
    renderState(data);
  } catch (e) {
    alert("Failed to start run: " + e.message);
  }
}

async function fight(action = "attack") {
  try {
    const data = await api("/api/game/fight", "POST", { action });
    renderState(data);
  } catch (e) {
    console.error(e);
  }
}

async function chooseReward(choiceIndex) {
  try {
    const data = await api("/api/game/reward", "POST", { choice: choiceIndex });
    renderState(data);
  } catch (e) {
    console.error(e);
  }
}

async function handleGear(choice) {
  try {
    const data = await api("/api/game/gear", "POST", { choice });
    renderState(data);
  } catch (e) {
    console.error(e);
  }
}

async function shopAction(action) {
  try {
    const data = await api("/api/game/shop", "POST", { action });
    renderState(data);
  } catch (e) {
    console.error(e);
  }
}

async function resetRun() {
  if (confirm("End current run and start fresh?")) {
    await api("/api/game/reset", "POST", {});
    location.reload();
  }
}

async function submitToLeaderboard() {
  try {
    const data = await api("/api/run/submit", "POST", {});
    alert("✅ Run submitted to leaderboard!\n" + data.message);
  } catch (e) {
    alert("Failed to submit: " + e.message);
  }
}

// ====================== INITIAL LOAD ======================
async function initGame() {
  getPlayerName(); // ensure player name is set

  try {
    const state = await api("/api/game/state");
    renderState(state);
  } catch (e) {
    console.error("Failed to load game state:", e);
  }
}

// ====================== EVENT LISTENERS ======================
document.addEventListener("DOMContentLoaded", () => {
  // Class buttons
  document.querySelectorAll(".class-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const heroClass = btn.getAttribute("data-class");
      startNewRun(heroClass);
    });
  });

  // Fight button
  const fightBtn = document.getElementById("fight-btn");
  if (fightBtn) fightBtn.addEventListener("click", () => fight("attack"));

  // Other buttons are wired via onclick in renderState (reward/gear) or separate handlers

  initGame();
});
</script>