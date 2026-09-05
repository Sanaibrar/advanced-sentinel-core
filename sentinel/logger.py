"""Tamper-evident hash-chain audit logging."""

import logging
import hashlib
import os

LOG_FILE = "sentinel_audit.log"
HASH_CHAIN_FILE = "sentinel_hash_chain.log"

class HashChainHandler(logging.Handler):
    """Custom logging handler to create a tamper-evident hash chain."""
    def __init__(self, filename):
        super().__init__()
        self.filename = filename
        if not os.path.exists(self.filename):
            with open(self.filename, "w", encoding="utf-8") as f:
                f.write("PREV_HASH|TIMESTAMP|LEVEL|MESSAGE\n")

    def emit(self, record):
        log_entry = self.format(record)
        timestamp, level, msg = log_entry.split(" | ", 2)
        
        # Get last hash
        prev_hash = "0" * 64
        if os.path.exists(self.filename):
            with open(self.filename, "r", encoding="utf-8") as f:
                lines = f.readlines()
                if len(lines) > 1:
                    last_line = lines[-1].strip()
                    if "|" in last_line:
                        prev_hash = last_line.split("|")[0]

        # Calculate current hash
        raw_data = f"{prev_hash}|{timestamp}|{level}|{msg}"
        current_hash = hashlib.sha256(raw_data.encode("utf-8")).hexdigest()

        # Write to hash chain file
        with open(self.filename, "a", encoding="utf-8") as f:
            f.write(f"{current_hash}|{timestamp}|{level}|{msg}\n")

def get_logger() -> logging.Logger:
    logger = logging.getLogger("sentinel")
    if logger.handlers:
        return logger

    logger.setLevel(logging.INFO)
    fmt = logging.Formatter(
        "%(asctime)s | %(levelname)-8s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )

    # Console output
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(fmt)

    # Standard log file
    file_handler = logging.FileHandler(LOG_FILE, encoding="utf-8")
    file_handler.setFormatter(fmt)

    # Tamper-evident hash chain file handler
    hash_handler = HashChainHandler(HASH_CHAIN_FILE)
    hash_handler.setFormatter(fmt)

    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    logger.addHandler(hash_handler)
    
    return logger