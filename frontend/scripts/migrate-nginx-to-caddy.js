import fs from 'fs';
import path from 'path';

// --- CONFIGURAÇÕES ---
const NGINX_SITES_DIR = '/etc/nginx/sites-enabled';
const CADDY_OUTPUT_FILE = 'Caddyfile.new';
const DOMAIN_ROOT = 'siriusstudio.site';

console.log('🔄 INICIANDO MIGRAÇÃO: NGINX -> CADDY...\n');

// 1. VARREDURA DE DADOS (Lê arquivos do Nginx)
function scanNginxConfigs() {
    const sites = [];
    
    if (!fs.existsSync(NGINX_SITES_DIR)) {
        console.error(`❌ Diretório do Nginx não encontrado: ${NGINX_SITES_DIR}`);
        process.exit(1);
    }

    const files = fs.readdirSync(NGINX_SITES_DIR);

    files.forEach(file => {
        // Ignora o arquivo "default" ou arquivos ocultos
        if (file === 'default' || file.startsWith('.')) return;

        const content = fs.readFileSync(path.join(NGINX_SITES_DIR, file), 'utf8');

        // REGEX para extrair Server Name e Porta
        // Procura por: server_name algo.siriusstudio.site;
        const serverNameMatch = content.match(/server_name\s+(.*?);/);
        // Procura por: proxy_pass http://127.0.0.1:4027; ou localhost:4027
        const portMatch = content.match(/proxy_pass\s+http:\/\/(?:127\.0\.0\.1|localhost):(\d+);/);

        if (serverNameMatch && portMatch) {
            const fullDomain = serverNameMatch[1].trim();
            const port = portMatch[1];

            // Limpa possíveis múltiplos domínios na mesma linha, pegando o primeiro que coincida com o root
            const domains = fullDomain.split(/\s+/);
            const targetDomain = domains.find(d => d.includes(DOMAIN_ROOT));

            if (targetDomain && !targetDomain.startsWith('*')) {
                sites.push({
                    domain: targetDomain,
                    subdomain: targetDomain.replace(`.${DOMAIN_ROOT}`, ''),
                    port: port,
                    sourceFile: file
                });
            }
        }
    });

    return sites;
}

// 2. GERAÇÃO DO CADDYFILE
function generateCaddyfile(sites) {
    const header = `# --------------------------------------------------
# Caddyfile Gerado Automaticamente pelo Sirius Migration Tool
# Data: ${new Date().toISOString()}
# --------------------------------------------------

{
    # SSL Automático On-Demand (Gera certificado no primeiro acesso)
    on_demand_tls {
        ask http://localhost:4000/check-domain # Opcional: Script de segurança futuro
    }
}

# Bloco Wildcard Principal
*.${DOMAIN_ROOT}, ${DOMAIN_ROOT} {
    
    # Headers de Segurança e Proxy para Nuxt 3
    header {
        Strict-Transport-Security "max-age=31536000;"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
    }

    # Logs de Acesso
    log {
        output file /var/log/caddy/access.log
        format json
    }

    tls {
        on_demand
    }

    # --- ROTAS MAPEADAS DO NGINX ---
`;

    let body = '';
    
    // Cria um 'handle' para cada site encontrado
    sites.forEach(site => {
        body += `
    # Origem: Nginx /${site.sourceFile}
    @${site.subdomain} host ${site.domain}
    handle @${site.subdomain} {
        reverse_proxy localhost:${site.port} {
            # Headers essenciais para o Nuxt/Nitro saber o IP real
            header_up X-Real-IP {remote_host}
            header_up X-Forwarded-Port {server_port}
            header_up X-Forwarded-Proto {scheme}
        }
    }
`;
    });

    const footer = `
    # Fallback (caso o subdomínio não exista na lista)
    handle {
        respond "Site não configurado no Sirius Studio" 404
    }
}
`;

    return header + body + footer;
}

// --- EXECUÇÃO ---
const foundSites = scanNginxConfigs();

if (foundSites.length === 0) {
    console.log('⚠️  Nenhum site válido encontrado nas configurações do Nginx.');
    process.exit(0);
}

console.log(`✅ Sites Encontrados: ${foundSites.length}`);
console.table(foundSites.map(s => ({ Domain: s.domain, Port: s.port, File: s.sourceFile })));

const caddyContent = generateCaddyfile(foundSites);

// Salva o arquivo .new
fs.writeFileSync(CADDY_OUTPUT_FILE, caddyContent);

console.log('\n📄 PREVIEW DO ARQUIVO GERADO (Primeiras 20 linhas):');
console.log('--------------------------------------------------');
console.log(caddyContent.split('\n').slice(0, 20).join('\n'));
console.log('... (continua) ...');
console.log('--------------------------------------------------');

console.log(`\n💾 Arquivo salvo como: ${path.resolve(CADDY_OUTPUT_FILE)}`);
console.log(`\n🚀 PRÓXIMOS PASSOS:`);
console.log(`   1. Instale o Caddy (se não tiver).`);
console.log(`   2. Mova o arquivo: sudo mv Caddyfile.new /etc/caddy/Caddyfile`);
console.log(`   3. Pare o Nginx: sudo systemctl stop nginx`);
console.log(`   4. Inicie o Caddy: sudo systemctl restart caddy`);
console.log(`   5. Valide: sudo systemctl status caddy`);
