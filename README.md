# Advanced Sentinel Core — Phase 1

Local network ARP discovery + device inventory + anomaly logging.

## Zero se Setup (Windows) — step by step

### 1. Python check/install karo
- `Win + R` dabao → type `cmd` → Enter (yeh Command Prompt kholta hai).
- Type karo: `python --version`
- Agar version aa jaye (e.g. `Python 3.11.x`) → aage badho.
- Agar "not recognized" ka error aaye → Python installed nahi hai:
  - https://www.python.org/downloads/ se latest Python download karo.
  - Installer chalate waqt **"Add Python to PATH"** checkbox zaroor tick karo.

### 2. Npcap install karo (ZAROORI — iske bina ARP packets nahi bhejay ja sakte)
Scapy ko raw packets bhejne ke liye Windows par Npcap chahiye hota hai.
- https://npcap.com/#download se Npcap installer download karo.
- Install karte waqt **"Install Npcap in WinPcap API-compatible Mode"** option ko tick rakhna.

### 3. Project folder tayyar karo
- File Explorer mein jahan chaho project rakho (e.g. Desktop).
- Yeh puri `Advanced-Sentinel-Core` folder wahan paste kar do.

### 4. Command Prompt ko Administrator mode mein kholo
- Start menu mein "cmd" search karo → **"Run as administrator"** pe right-click karke chuno.
  (ARP packets bhejne ke liye admin rights zaroori hain, warna PermissionError aayega.)

### 5. Project folder mein jao
```
cd Desktop\Advanced-Sentinel-Core
```
(Apne actual path ke mutabiq adjust karo.)

### 6. Virtual environment banao
```
python -m venv .venv
```

### 7. Virtual environment activate karo
```
.venv\Scripts\activate
```
Successful hone par prompt ke shuru mein `(.venv)` dikhega.

### 8. Dependencies install karo
```
pip install -r requirements.txt
```

### 9. Program run karo
```
python -m sentinel.main
```

Yeh har 60 seconds baad tumhare local network (`/24` subnet) ko ARP scan karega,
naye devices, IP change, ya MAC change ko `sentinel_audit.log` mein log karega,
aur `device_state.json` mein current inventory save karega.

Rukwane ke liye: `Ctrl + C`

## Project Structure
```
Advanced-Sentinel-Core/
├── requirements.txt
├── README.md
└── sentinel/
    ├── __init__.py
    ├── main.py        <- entry point (yeh run karte ho)
    ├── network.py      <- local IP + subnet detect karta hai
    ├── scanner.py       <- Scapy ARP scan
    ├── inventory.py      <- device_state.json read/write, diff detect
    └── logger.py         <- sentinel_audit.log ke liye logging setup
```

## Common Issues
- **PermissionError / "socket.error: [Errno 1] Operation not permitted"**
  → Terminal ko Administrator (Windows) ya sudo (Linux/macOS) ke sath dobara chalao.
- **`ModuleNotFoundError: No module named 'scapy'`**
  → venv activate hai ya nahi check karo (`(.venv)` prompt mein dikhna chahiye), phir `pip install -r requirements.txt` dobara chalao.
- **Koi devices detect nahi ho rahe**
  → Firewall/antivirus ARP packets block kar raha ho sakta hai; Wi-Fi/LAN adapter check karo.

## Next Steps (Phase 1 hardening)
- Gateway detection
- MAC vendor lookup (OUI database)
- Proper SQLite device database (JSON ki jagah)
- ARP anomaly history/timeline
- Severity/risk scoring engine

Phir Phase 2: traffic intelligence.
