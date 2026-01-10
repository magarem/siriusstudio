import { mkdirSync, symlinkSync, existsSync, realpathSync, rmSync, lstatSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process'; // Adicione ao import



const siteName = process.argv[2];

if (!siteName) {
  console.error('❌ Informe o nome do site: node provision-site.mjs nome-do-site');
  process.exit(1);
}

// PWD: /Users/marceloamagalhaes/desenv/apps/siriusstudio
// Subimos um nível para chegar em /Users/marceloamagalhaes/desenv/apps
const APPS_ROOT = resolve(process.cwd(), '..');

const SIRIUSSTUDIO_DIR = resolve(process.cwd());
const STORAGE_DIR = join(APPS_ROOT, 'storage', siteName);
const SITE_DIR = join(APPS_ROOT, 'sites', siteName);
const APP_DIR = join(SITE_DIR, 'app');

console.log(`🚀 Provisionando TOTAL para: ${siteName}...`);
console.log(`📍 Apps Root: ${APPS_ROOT}`);

// --- 1. GARANTIR ESTRUTURA NO STORAGE ---
const allFolders = ['components', 'content', 'images', 'layouts', 'pages', 'data'];
if (!existsSync(STORAGE_DIR)) mkdirSync(STORAGE_DIR, { recursive: true });

allFolders.forEach(f => {
  const path = join(STORAGE_DIR, f);
  if (!existsSync(path)) {
    mkdirSync(path);
    if (f === 'content') writeFileSync(join(path, 'index.md'), `---\ntitle: Home ${siteName}\n---\n# Conteúdo do Storage`);
    if (f === 'pages') writeFileSync(join(path, 'index.vue'), `<template><ContentDoc /></template>`);
  }
});

// --- 2. GARANTIR PASTAS PAI NO SITE SATÉLITE ---
if (!existsSync(SITE_DIR)) {
    console.error(`❌ Erro: Pasta do site não encontrada em ${SITE_DIR}`);
    process.exit(1);
}
if (!existsSync(APP_DIR)) mkdirSync(APP_DIR, { recursive: true });
if (!existsSync(join(SITE_DIR, 'public'))) mkdirSync(join(SITE_DIR, 'public'));

// --- 3. FUNÇÃO DE LINKAGEM ---
const forceSymlink = (target, linkPath) => {
  if (existsSync(linkPath)) {
    rmSync(linkPath, { recursive: true, force: true });
    console.log(`   🗑️  Limpando: ${linkPath.replace(SITE_DIR, '')}`);
  }

  const absoluteTarget = realpathSync(target);
  // 'junction' funciona bem tanto em Unix quanto Windows
  symlinkSync(absoluteTarget, linkPath, 'junction'); 
  console.log(`   🔗 Link Criado: ${linkPath.replace(SITE_DIR, '')} -> Storage`);
};

// --- 4. EXECUÇÃO DOS LINKS ---
try {
  const mappings = [
    [join(STORAGE_DIR, 'components'), join(APP_DIR, 'components')],
    [join(STORAGE_DIR, 'layouts'),    join(APP_DIR, 'layouts')],
    [join(STORAGE_DIR, 'pages'),      join(APP_DIR, 'pages')],
    [join(STORAGE_DIR, 'content'),    join(SITE_DIR, 'content')],
    [join(STORAGE_DIR, 'images'),     join(SITE_DIR, 'public', 'images')],
    [join(STORAGE_DIR, 'images'),     join(SITE_DIR, 'public', 'images')],
    [join(SIRIUSSTUDIO_DIR, 'app/composables'),     join(SITE_DIR, 'app/composables')],
    [join(SIRIUSSTUDIO_DIR, 'server'),     join(SITE_DIR, 'server')],
    [join(SIRIUSSTUDIO_DIR, 'app/components/content'),     join(SITE_DIR, 'app/components/content')]
  ];

  mappings.forEach(([target, link]) => forceSymlink(target, link));

  console.log(`\n✨ Sincronização de "${siteName}" concluída!`);
  console.log(`\n✨ Criando base de dados...`);

// O 'inherit' faz o filho usar o mesmo terminal (stdout/stderr) do pai automaticamente
const result = spawnSync('node', ['scripts/seed-db.mjs', siteName], { stdio: 'inherit' });

if (result.error) {
  console.error('❌ Erro ao executar seed-db:', result.error);
}

console.log(`\n✨ fim!`);

} catch (e) {
  console.error('❌ Erro:', e.message);
}