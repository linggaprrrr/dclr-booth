#!/bin/bash

# Setup script for DCLR Photobooth
# This script should be run before starting PM2 processes

echo "Setting up DCLR Photobooth..."

# Create logs directory
mkdir -p logs

# Fix camera permissions
echo "Fixing camera permissions..."
sh ./fix-camera-permission.sh

# Build the application
echo "Building application..."
npm run build

echo "Setup completed successfully!"
echo "You can now start the PM2 processes with: pm2 start ecosystem.config.js"