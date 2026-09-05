"""Tamper-Evident Evidence Hash-Chain Logger."""

import hashlib
import json
import os
from datetime import datetime

CHAIN_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "audit_chain.json")
GENESIS_HASH = "00000000"


def _compute_hash(prev_hash: str, action: str, timestamp: str) -> str:
    """SHA-256 hash of prev_hash + action + timestamp, truncated to 8 chars."""
    raw = f"{prev_hash}{action}{timestamp}"
    return hashlib.sha256(raw.encode()).hexdigest()[:8] + "..."


def _load_chain() -> list:
    if os.path.exists(CHAIN_FILE):
        with open(CHAIN_FILE, "r") as f:
            return json.load(f)
    return []


def _save_chain(chain: list):
    with open(CHAIN_FILE, "w") as f:
        json.dump(chain, f, indent=2)


def _verify_chain(chain: list) -> bool:
    """Verify every block's hash is consistent with its inputs."""
    for i, block in enumerate(chain):
        expected_prev = GENESIS_HASH + "..." if i == 0 else chain[i - 1]["hash"]
        expected_hash = _compute_hash(
            expected_prev, block["action"], block["timestamp"]
        )
        if block["hash"] != expected_hash or block["prev_hash"] != expected_prev:
            return False
    return True


def append_event(action: str) -> dict:
    """Add a new event to the chain and persist it. Returns the new block."""
    chain = _load_chain()
    timestamp = datetime.now().strftime("%H:%M:%S")
    prev_hash = GENESIS_HASH + "..." if not chain else chain[-1]["hash"]
    new_hash = _compute_hash(prev_hash, action, timestamp)

    block = {
        "id": len(chain) + 1,
        "action": action,
        "timestamp": timestamp,
        "prev_hash": prev_hash,
        "hash": new_hash
    }
    chain.append(block)
    _save_chain(chain)
    return block


def get_chain_with_status() -> dict:
    """Return the full chain + tamper verification status."""
    chain = _load_chain()

    if not chain:
        # Genesis block — system boot
        append_event("System Boot & Core Initialization")
        chain = _load_chain()

    verified = _verify_chain(chain)
    return {
        "audit_chain": chain,
        "status": "Tamper-Evident & Verified" if verified else "⚠️ CHAIN TAMPERED — Integrity Breach Detected"
    }