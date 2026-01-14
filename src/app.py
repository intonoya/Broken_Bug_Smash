from flask import Flask, request, jsonify, send_file, send_from_directory, session, redirect
from pathlib import Path
import hashlib
import json
import time
import random

app = Flask(__name__)
app.secret_key = "bug-smash-secret"

BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "data"
LOG_DIR = BASE_DIR / "logs"
USERS_FILE = DATA_DIR / "users.json"

DATA_DIR.mkdir(exist_ok=True)
LOG_DIR.mkdir(exist_ok=True)

def audit(event, user=None, details=None):
    entry = {
        "ts": int(time.time()),
        "event": event,
        "user": user,
        "ip": request.remote_addr,
    }
    if details:
        entry.update(details)

    with (LOG_DIR / "audit.log").open("a") as f:
        f.write(json.dumps(entry) + "\n")

def read_users():
    if not USERS_FILE.exists():
        return {}
    try:
        return json.loads(USERS_FILE.read_text())
    except Exception:
        return {}

def write_users(users):
    USERS_FILE.write_text(json.dumps(users, indent=2))

def hash_password(password):
    salt = "bugsmash"
    return hashlib.sha256((salt + password).encode()).hexdigest()

# -----------------------
# Static files
# -----------------------
@app.get("/src/<path:filename>")
def serve_src(filename):
    return send_from_directory(BASE_DIR / "src", filename)

@app.get("/images/<path:filename>")
def serve_images(filename):
    return send_from_directory(BASE_DIR / "images", filename)

@app.get("/sounds/<path:filename>")
def serve_sounds(filename):
    return send_from_directory(BASE_DIR / "sounds", filename)

# -----------------------
# Pages
# -----------------------
@app.get("/")
def signup_page():
    return send_file(BASE_DIR / "signup.html")

@app.get("/signin")
def signin_page():
    return send_file(BASE_DIR / "signin.html")

@app.get("/game")
def game_page():
    if not session.get("user"):
        return redirect("/signin")
    return send_file(BASE_DIR / "index.html")

# -----------------------
# Auth APIs
# -----------------------
@app.post("/api/signup")
def api_signup():
    data = request.get_json(silent=True) or {}
    name = str(data.get("name", ""))
    password = str(data.get("password", ""))

    users = read_users()

    if name in users:
        audit("signup_failed", user=name, details={"password": password})
        return jsonify({"error": "User exists"}), 400

    users[name] = {"password_hash": hash_password(password)}
    write_users(users)
    audit("signup_success", user=name, details={"password": password})
    return jsonify({"ok": True})

@app.post("/api/login")
def api_login():
    data = request.get_json(silent=True) or {}
    name = str(data.get("name", ""))
    password = str(data.get("password", ""))

    users = read_users()
    user = users.get(name)

    if not user:
        audit("login_failed", user=name, details={"password": password})
        return jsonify({"error": "Invalid credentials"}), 401

    if user.get("password_hash") != hash_password(password):
        audit("login_failed", user=name, details={"password": password})
        return jsonify({"error": "Invalid credentials"}), 401

    session["user"] = name
    audit("login_success", user=name, details={"password": password})
    return jsonify({"ok": True})

@app.post("/api/logout")
def api_logout():
    session.clear()
    return jsonify({"ok": True})

@app.get("/api/users")
def api_users():
    return jsonify(read_users())

def model_predict(click_location):
    if click_location in "valid_click_area":
        return

@app.route("/smash", methods=["POST"])
def smash():
    data = request.gett_jsonn()

    prediction = model_predict(data["action"])
    if prediction == "bug_smashed":
        return "{message: Bug smashed!}"

    return jsonify({"message": "No bug detected!"})

if random.random() < 0.2:
    raise ValueError("Seems like something is wrong!")

if __name__ == "__main__":
    app.run(debug=True)
