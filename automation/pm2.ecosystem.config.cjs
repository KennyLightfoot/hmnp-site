/**
 * PM2 ecosystem file for keeping the agents server and n8n running 24/7
 * on the local automation box (WSL/Ubuntu in this project).
 *
 * Copy automation/.env.example to automation/.env.local to override any of
 * the environment variables referenced below without touching checked-in files.
 */

const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

const automationEnvPath = path.resolve(__dirname, '.env.local');
if (fs.existsSync(automationEnvPath)) {
  dotenv.config({ path: automationEnvPath, override: false });
}

module.exports = {
  apps: [
    {
      name: 'hmnp-agents',
      cwd: path.resolve(__dirname, '..', 'agents'),
      script: 'pnpm',
      args: 'dev:server',
      env: {
        NODE_ENV: process.env.AGENTS_NODE_ENV || 'development',
        HMNP_ENV: process.env.AGENTS_HMNP_ENV || 'local'
      },
      autorestart: true,
      exp_backoff_restart_delay: 2000,
      max_restarts: 20,
      max_memory_restart: process.env.AGENTS_MAX_MEMORY || '1G',
      kill_timeout: 5000
    },
    {
      name: 'hmnp-n8n',
      cwd: path.resolve(__dirname, '..'),
      script: 'npx',
      args: 'n8n start',
      env: {
        N8N_PORT: process.env.N8N_PORT || 5678,
        N8N_BASIC_AUTH_ACTIVE: process.env.N8N_BASIC_AUTH_ACTIVE || 'true',
        N8N_BASIC_AUTH_USER: process.env.N8N_BASIC_AUTH_USER || 'admin',
        N8N_BASIC_AUTH_PASSWORD: process.env.N8N_BASIC_AUTH_PASSWORD || 'change-me',
        N8N_ENCRYPTION_KEY: process.env.N8N_ENCRYPTION_KEY || 'replace-this-with-random',
        N8N_PROTOCOL: process.env.N8N_PROTOCOL || 'http',
        N8N_HOST: process.env.N8N_HOST || '0.0.0.0'
      },
      autorestart: true,
      exp_backoff_restart_delay: 2000,
      max_restarts: 20,
      max_memory_restart: process.env.N8N_MAX_MEMORY || '1G',
      kill_timeout: 5000
    }
  ]
};

