module.exports = {
  apps: [
    {
      name: "dclr-photobooth-server",
      script: "./start-server.sh",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      restart_delay: 5000,
      max_restarts: 10,
      min_uptime: "10s",
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 8000,
      env: {
        NODE_ENV: "production",
        API_URL: "https://dclr-api.digitalcreativelab.id",
        API_KEY:
          "1edd8a8400dc9fb35cfa47cda191238e63927fe80072657b4eb3e1206d7dd459",
        REDIS_URL:
          "redis://default:aWpgPYLQpyvvm9ugovfU4a7U0U73He4njJra635soQq1a9zO8TlffFdCj1PxATh8@154.26.130.254:63309/1",
      },
      error_file: "./logs/server-error.log",
      out_file: "./logs/server-out.log",
      log_file: "./logs/server-combined.log",
      time: true,
    },
    {
      name: "dclr-photobooth-worker",
      script: "./start-worker.sh",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      restart_delay: 3000,
      max_restarts: 15,
      min_uptime: "5s",
      kill_timeout: 5000,
      env: {
        NODE_ENV: "production",
        API_URL: "https://dclr-api.digitalcreativelab.id",
        API_KEY:
          "1edd8a8400dc9fb35cfa47cda191238e63927fe80072657b4eb3e1206d7dd459",
        REDIS_URL:
          "redis://default:aWpgPYLQpyvvm9ugovfU4a7U0U73He4njJra635soQq1a9zO8TlffFdCj1PxATh8@154.26.130.254:63309/1",
      },
      error_file: "./logs/worker-error.log",
      out_file: "./logs/worker-out.log",
      log_file: "./logs/worker-combined.log",
      time: true,
    },
  ],
};