#!/usr/bin/env node
/**
 * Build wrapper for Bancolombia TLSN plugin.
 *
 * Injects VERIFIER_URL and PROXY_URL at build time:
 * - Local: loads plugin-bancolombia/.env (see .env.example).
 * - Vercel: use Project Settings → Environment Variables; they are available as process.env.
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const pkg = require('./package.json');

require('dotenv').config({ path: path.join(__dirname, '.env') });

// Derive output filename from package name, stripping @scope/ if present
const pluginName = pkg.name.replace(/^@[^/]+\//, '');
const outfile = `build/${pluginName}.js`;

// Environment variables with defaults
const VERIFIER_URL = process.env.VERIFIER_URL || 'http://localhost:7047';
const PROXY_URL = process.env.PROXY_URL || 'ws://localhost:7047/proxy';

const watch = process.argv.includes('--watch');

// Ensure @tlsn/plugin-sdk is built first so dist/styles.js exists (required for @tlsn/plugin-sdk/styles)
const pluginSdkPath = path.resolve(__dirname, '../plugin-sdk');
const pluginSdkStylesPath = path.join(pluginSdkPath, 'dist', 'styles.js');
if (fs.existsSync(pluginSdkPath) && !fs.existsSync(pluginSdkStylesPath)) {
  console.log('Building @tlsn/plugin-sdk (dist/styles.js required)...');
  execSync('npm run build', { cwd: pluginSdkPath, stdio: 'inherit' });
}

console.log('Building with esbuild...');
console.log(`  VERIFIER_URL: ${VERIFIER_URL}`);
console.log(`  PROXY_URL: ${PROXY_URL}`);
console.log(`  outfile: ${outfile}`);
const args = [
  'src/index.ts',
  '--bundle',
  '--format=esm',
  '--outfile=' + outfile,
  '--sourcemap',
  '--external:@sebastianwessel/quickjs',
  '--external:@jitl/quickjs-ng-wasmfile-release-sync',
  '--external:uuid',
  '--external:fast-deep-equal',
  '--define:__VERIFIER_URL__=' + JSON.stringify(VERIFIER_URL),
  '--define:__PROXY_URL__=' + JSON.stringify(PROXY_URL),
];
if (watch) args.push('--watch');
const { execFileSync } = require('child_process');
execFileSync(require.resolve('esbuild/bin/esbuild'), args, {
  stdio: 'inherit',
  cwd: __dirname,
});

if (!watch) {
  // Post-process: replace `var config = {` with `const config = {` so the
  // TLSNotary extension's regex-based extractConfig (which looks for
  // `const\s+config\s*=\s*{`) can pick up the plugin name and description.
  const output = fs.readFileSync(outfile, 'utf8');
  const patched = output.replace(/^var config = \{/m, 'const config = {');
  if (patched !== output) {
    fs.writeFileSync(outfile, patched);
    console.log('✓ Patched: var config → const config (extractConfig compat)');
  }
  console.log(`✓ Build complete: ${outfile}`);
}
