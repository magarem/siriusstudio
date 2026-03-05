// scripts/update-nginx.js
import fs from 'fs-extra'
import path from 'path'
import { exec } from 'child_process'

// CONFIGURATION
const SITES_JSON = path.resolve('../sites.json')
const NGINX_OUTPUT = path.resolve('./nginx_sites.conf') // Generates locally first
// const NGINX_OUTPUT = '/etc/nginx/sites-available/sirius_generated.conf' // Production path

const DOMAIN_ROOT = 'siriusstudio.site'
const ADMIN_PORT = 3000

async function generateConfig() {
  console.log('🔄 Reading sites.json...')
  const sites = await fs.readJson(SITES_JSON)

  let nginxConfig = `# AUTOMATICALLY GENERATED - DO NOT EDIT MANUALLY
# Generated at: ${new Date().toISOString()}

server {
    listen 80;
    server_name ${DOMAIN_ROOT};

    # --- MAIN DASHBOARD / ADMIN ---
    location / {
        proxy_pass http://localhost:${ADMIN_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
`

  console.log(`🛠️ Processing ${sites.length} sites...`)

  sites.forEach(site => {
    if (!site.active) {
      console.log(`⚠️ Skipping inactive site: ${site.id}`)
      return
    }

    console.log(`✅ Adding block: ${site.id} -> Port ${site.port}`)

    nginxConfig += `
    # --- SITE: ${site.id} ---
    location ${site.path} {
        # Redirect to specific port
        proxy_pass http://localhost:${site.port};
        
        # Standard Proxy Headers
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
`
  })

  // Close the server block
  nginxConfig += `
}
`

  // Write the file
  await fs.writeFile(NGINX_OUTPUT, nginxConfig)
  console.log(`💾 Configuration saved to: ${NGINX_OUTPUT}`)

  // OPTIONAL: Reload Nginx automatically (Run with sudo)
  // reloadNginx()
}

function reloadNginx() {
  exec('nginx -t && systemctl reload nginx', (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Error reloading Nginx: ${error.message}`);
      return;
    }
    console.log(`🚀 Nginx reloaded successfully!`);
  });
}

generateConfig()