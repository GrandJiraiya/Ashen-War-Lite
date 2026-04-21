// static/app.js
// REMOVE the opening <script> and closing </script> tags entirely

console.log("app.js loaded");

let currentPlayerName = null;
let currentState = null;

function getPlayerName() {
  if (currentPlayerName) return currentPlayerName;
  const urlParams = new URLSearchParams(window.location.search);
  let player = urlParams.get("player") || localStorage.getItem("player_name");
  if (!player) player = prompt("Enter player name:", "CrashOutCrypto");
  currentPlayerName = (player || "").trim();
  localStorage.setItem("player_name", currentPlayerName);
  return currentPlayerName;
}

async function api(endpoint, method = "GET", body = null) {
  const playerName = getPlayerName();

  const url =
    method === "GET"
      ? endpoint + (endpoint.includes("?") ? "&" : "?") + "player_name=" + encodeURIComponent(playerName)
      : endpoint;

  const payload = body ? { player_name: playerName, ...body } : null;

  const res = await fetch(url, {
    method,
    headers: payload ? { "Content-Type": "application/json" } : {},
    body: payload ? JSON.stringify(payload) : null,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unknown error");
  return data;
}

function renderState(state) {
  currentState = state;
  const hasRun = !!state.has_run;

  const classScreen = document.getElementById("class-selection");
  const gameScreen = document.getElementById("game-ui");

  if (classScreen) classScreen.style.display = hasRun ? "none" : "block";
  if (gameScreen) gameScreen.classList.toggle("hidden", !hasRun);

  if (!hasRun) return;

  const p = state.player || {};
  document.getElementById("player-name").textContent = getPlayerName();
  document.getElementById("player-class").textContent = (p.class_label || p.hero_class || "").toUpperCase();
  document.getElementById("player-hp").textContent = `${p.hp || 0}/${p.max_hp || 100}`;
  document.getElementById("player-gold").textContent = p.gold || 0;
  document.getElementById("player-room").textContent = p.room || 1;

  const hpPercent = Math.max(0, Math.min(100, ((p.hp || 0) / (p.max_hp || 100)) * 100));
  document.getElementById("hp-bar").style.width = hpPercent + "%";

  const enemySec = document.getElementById("enemy-section");
  if (state.enemy) {
    enemySec.classList.remove("hidden");
    document.getElementById("enemy-name").textContent = state.enemy.name || "Enemy";
    document.getElementById("enemy-hp").textContent = `${state.enemy.hp || 0}`;
  } else {
    enemySec.classList.add("hidden");
  }
}
