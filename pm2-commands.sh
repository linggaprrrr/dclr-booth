#!/bin/bash

# PM2 Management Commands for DCLR Photobooth

case "$1" in
  "setup")
    echo "Running initial setup..."
    ./setup.sh
    ;;
  "reset-setup")
    echo "Resetting setup marker..."
    rm -f .setup_completed
    echo "Setup will run automatically on next start"
    ;;
  "start")
    echo "Starting PM2 processes..."
    pm2 start ecosystem.config.js
    ;;
  "stop")
    echo "Stopping PM2 processes..."
    pm2 stop ecosystem.config.js
    ;;
  "restart")
    echo "Restarting PM2 processes..."
    pm2 restart ecosystem.config.js
    ;;
  "reload")
    echo "Reloading PM2 processes..."
    pm2 reload ecosystem.config.js
    ;;
  "delete")
    echo "Deleting PM2 processes..."
    pm2 delete ecosystem.config.js
    ;;
  "status")
    echo "PM2 process status..."
    pm2 status
    ;;
  "logs")
    echo "Showing PM2 logs..."
    pm2 logs
    ;;
  "logs-server")
    echo "Showing server logs..."
    pm2 logs dclr-photobooth-server
    ;;
  "logs-worker")
    echo "Showing worker logs..."
    pm2 logs dclr-photobooth-worker
    ;;
  "monitor")
    echo "Opening PM2 monitor..."
    pm2 monit
    ;;
  "save")
    echo "Saving PM2 process list..."
    pm2 save
    ;;
  "startup")
    echo "Setting up PM2 startup script..."
    pm2 startup
    echo "After running the generated command, run: ./pm2-commands.sh save"
    ;;
  "fresh-start")
    echo "Fresh start: reset setup + delete old processes + start new ones..."
    rm -f .setup_completed
    pm2 delete all 2>/dev/null || true
    pm2 start ecosystem.config.js
    pm2 save
    ;;
  *)
    echo "Usage: $0 {setup|reset-setup|start|stop|restart|reload|delete|status|logs|logs-server|logs-worker|monitor|save|startup|fresh-start}"
    echo ""
    echo "Commands:"
    echo "  setup       - Run initial setup (camera permissions, build)"
    echo "  reset-setup - Reset setup marker (forces setup on next start)"
    echo "  start       - Start PM2 processes"
    echo "  stop        - Stop PM2 processes"
    echo "  restart     - Restart PM2 processes"
    echo "  reload      - Gracefully reload PM2 processes"
    echo "  delete      - Delete PM2 processes"
    echo "  status      - Show PM2 process status"
    echo "  logs        - Show all logs"
    echo "  logs-server - Show server logs only"
    echo "  logs-worker - Show worker logs only"
    echo "  monitor     - Open PM2 monitor"
    echo "  save        - Save current PM2 process list"
    echo "  startup     - Setup PM2 to start on system boot"
    echo "  fresh-start - Complete fresh restart (recommended after system reboot)"
    exit 1
    ;;
esac
