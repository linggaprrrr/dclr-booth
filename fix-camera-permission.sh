#!/bin/bash

# Step 1: Detect connected camera using gphoto2
output=$(gphoto2 --auto-detect)

# Step 2: Extract USB bus and port numbers (format: 001,035)
usb_info=$(echo "$output" | grep -o '[0-9]\{3\},[0-9]\{3\}')

# Check if extraction was successful
if [ -z "$usb_info" ]; then
  echo "❌ USB port not found in gphoto2 output."
  exit 1
fi

# Split usb_info into bus and port
usb_bus=$(echo "$usb_info" | cut -d',' -f1)
usb_port=$(echo "$usb_info" | cut -d',' -f2)

# Step 3: Change permission on the USB device
usb_path="/dev/bus/usb/$usb_bus/$usb_port"

if [ -e "$usb_path" ]; then
  echo "🔧 Running: chmod 666 $usb_path"
  sudo chmod 666 "$usb_path"
  echo "✅ Permissions updated for $usb_path"
else
  echo "❌ USB device not found at $usb_path"
  chmod 666 /dev/bus/usb/001/001
  exit 2
fi
