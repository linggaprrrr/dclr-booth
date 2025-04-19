module.exports = {
  apps : [{
    name: "dclr-photobooth",
    script: 'sh ./fix-camera-permission.sh && npm start',
    watch: '.',
    env_development: {
      NEXT_PUBLIC_REMOTE_SERVER: "https://reka-api-dev.service.beta-point.ranggaa.me",
      API_URL: "https://reka-api-dev.service.beta-point.ranggaa.me", 
      API_KEY: "sHCEtVx2mVXIa6ZUkigfd",
      REDIS_URL: "redis://default:aWpgPYLQpyvvm9ugovfU4a7U0U73He4njJra635soQq1a9zO8TlffFdCj1PxATh8@154.26.130.254:63309/0"
    },
    env_production: {
      API_URL: "https://dclr-api.digitalcreativelab.id",
      API_KEY: "1edd8a8400dc9fb35cfa47cda191238e63927fe80072657b4eb3e1206d7dd459",
      REDIS_URL: "redis://default:aWpgPYLQpyvvm9ugovfU4a7U0U73He4njJra635soQq1a9zO8TlffFdCj1PxATh8@154.26.130.254:63309/1"
    },
  }],
};