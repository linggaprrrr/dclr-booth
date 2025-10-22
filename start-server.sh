#!/bin/bash

# Auto-setup wrapper for server
# This runs setup only once, then starts the server

SETUP_MARKER=".setup_completed"

# Check if setup has been completed
if [ ! -f "$SETUP_MARKER" ]; then
    echo "[AUTO-SETUP] Running initial setup..."
    
    # Create logs directory
    mkdir -p logs
    
    # Fix camera permissions
    echo "[AUTO-SETUP] Fixing camera permissions..."
    sh ./fix-camera-permission.sh
    
    # Build the application
    echo "[AUTO-SETUP] Building application..."
    npm run build
    
    # Mark setup as completed
    touch "$SETUP_MARKER"
    echo "[AUTO-SETUP] Setup completed successfully!"
else
    echo "[AUTO-SETUP] Setup already completed, starting server..."
fi

# Start the server
echo "[SERVER] Starting photobooth server..."
exec npm run start