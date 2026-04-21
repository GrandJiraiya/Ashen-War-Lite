from flask import Flask, request, jsonify, render_template
from sqlalchemy.exc import SQLAlchemyError
# Your existing DB imports (adjust paths if needed)
from database import SessionLocal, fetch_player, upsert_player, submit_run, fetch_leaderboard, load_slot, save_slot
# NEW: Game logic imports
from game.logic import (
    create_new_run,
    resolve_battle,
    choose_reward,
    handle_gear_choice,
    shop_action,
    state_for_client,
)

app = Flask(__name__)
app.secret_key = "super-secret-key-change-in-prod"  # for any temp session use if needed

# ====================== ONLINE UI ROUTES (unchanged) ======================
@app.get("/")
def index():
    return render_template("your_existing_landing.html")  # or whatever your current homepage is

@app.post("/api/player/register")
def register_player():
    data = request.get_json(force=True) or {}
    player_name = (data.get("player_name") or "").strip()
    preferred_class = data.get("preferred_class")
    if not player_name:
        return jsonify({"error": "player_name is required."}), 400
    with SessionLocal() as session:
        player = upsert_player(session, player_name, preferred_class)
        session.commit()
        return jsonify({"player": {"player_name": player.player_name, ...}})

@app.post("/api/run/submit")
def submit_run_api():
    # your existing code (unchanged)
    ...

@app.post("/api/save-slot")
def save_slot_api():
    # your existing code (unchanged)
    ...

@app.get("/api/save-slot/")
def load_slot_api():
    player_name = request.args.get("player_name")
    if not player_name:
        return jsonify({"error": "player_name required"}), 400
    with SessionLocal() as session:
        payload = load_slot(session, player_name)
        if payload is None:
            return jsonify({"error": "Save slot not found."}), 404
        return jsonify({"payload": payload})

# ====================== NEW: FULL GAME ROUTES (with DB persistence) ======================
@app.get("/game")
def game_page():
    return render_template("game.html")

@app.get("/api/game/state")
def get_game_state():
    player_name = request.args.get("player_name")
    if not player_name:
        return jsonify({"error": "player_name required"}), 400
    with SessionLocal() as session:
        payload = load_slot(session, player_name)
        if not payload or "run_state" not in payload:
            return jsonify({"has_run": False})
        return jsonify(state_for_client(payload["run_state"]))

@app.post("/api/game/new-run")
def new_run():
    data = request.get_json(force=True) or {}
    player_name = data.get("player_name")
    hero_class = data.get("heroClass")
    if not player_name or hero_class not in {"mage", "warrior", "rogue"}:
        return jsonify({"error": "Invalid player or class"}), 400
    run_state = create_new_run(hero_class)
    with SessionLocal() as session:
        save_slot(session, player_name, {"run_state": run_state})
        session.commit()
    return jsonify(state_for_client(run_state))

@app.post("/api/game/fight")
def fight():
    data = request.get_json(force=True) or {}
    player_name = data.get("player_name")
    action = data.get("action", "attack")
    if not player_name:
        return jsonify({"error": "player_name required"}), 400
    with SessionLocal() as session:
        payload = load_slot(session, player_name)
        run_state = payload.get("run_state") if payload else None
        if not run_state:
            return jsonify({"error": "No active run"}), 400
        run_state = resolve_battle(run_state, action)
        save_slot(session, player_name, {"run_state": run_state})
        session.commit()
    return jsonify(state_for_client(run_state))

# Repeat pattern for /api/game/reward, /api/game/gear, /api/game/shop, /api/game/reset
# (copy the structure above, just call the matching game.logic function and save_slot)

@app.post("/api/game/reset")
def reset_run():
    player_name = request.get_json().get("player_name")
    if player_name:
        with SessionLocal() as session:
            save_slot(session, player_name, {"run_state": None})
            session.commit()
    return jsonify({"ok": True})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)