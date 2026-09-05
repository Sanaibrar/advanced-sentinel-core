"""Command Line Interface module for Advanced Sentinel Core."""

import argparse

def parse_arguments():
    """Parse command line arguments for runtime options."""
    parser = argparse.ArgumentParser(description="Advanced Sentinel Core - Network Intrusion Detection System")
    parser.add_argument(
        "--interval", 
        type=int, 
        default=60, 
        help="Scan interval in seconds (default: 60)"
    )
    parser.add_argument(
        "--once", 
        action="store_true", 
        help="Run a single scan cycle and exit"
    )
    return parser.parse_args()