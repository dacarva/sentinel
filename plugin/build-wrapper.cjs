#!/usr/bin/env node
/**
 * Build wrapper for TLSN plugins.
 *
 * Output filename is derived from the package.json "name" field
 * (scope stripped if present). Pass --watch for dev mode.
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const pkg = require('./package.json');

// Derive output filename from package name, stripping @scope/ if present
const pluginName = pkg.name.replace(/^@[^/]+\//, '');
const outfile = `build/${pluginName}.js`;

// Environment variables with defaults
const VERIFIER_URL = process.env.VERIFIER_URL || 'http://localhost:7047';
const PROXY_URL = process.env.PROXY_URL || 'ws://localhost:7047/proxy';
const MOCK_BANK_URL = process.env.MOCK_BANK_URL || 'https://localhost:3443';

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
console.log(`  MOCK_BANK_URL: ${MOCK_BANK_URL}`);
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
  '--define:__MOCK_BANK_URL__=' + JSON.stringify(MOCK_BANK_URL),
];
if (watch) args.push('--watch');
const { execFileSync } = require('child_process');
execFileSync(require.resolve('esbuild/bin/esbuild'), args, {
  stdio: 'inherit',
  cwd: __dirname,
});

if (!watch) {
  console.log(`✓ Build complete: ${outfile}`);
}
