#!/bin/bash

# Auto-setup wrapper for worker
# This waits for setup to complete, then starts the worker

SETUP_MARKER=".setup_completed"

# Wait for setup to complete (in case server is still setting up)
while [ ! -f "$SETUP_MARKER" ]; do
    echo "[WORKER] Waiting for setup to complete..."
    sleep 2
done

echo "[WORKER] Setup detected, starting upload queue worker..."
exec npm run start:worker