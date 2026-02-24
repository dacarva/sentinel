/**
 * Plugin Configuration
 *
 * Defines metadata and permissions for the Mock Bank Prover plugin.
 */

// Type imports only (stripped at compile time)
import type { PluginConfig, RequestPermission } from '@tlsn/plugin-sdk';

// Injected at build time via esbuild --define
declare const __VERIFIER_URL__: string;
declare const __PROXY_URL__: string;
declare const __MOCK_BANK_URL__: string;

/** Returns hostname only (e.g. "localhost") — used as the `host` field in RequestPermission. */
function mockBankHostname(): string {
  try {
    return new URL(__MOCK_BANK_URL__).hostname;
  } catch {
    return 'localhost';
  }
}

/** Returns hostname:port (e.g. "localhost:3443") — used as the proxy token in RequestPermission. */
function mockBankHostWithPort(): string {
  try {
    const url = new URL(__MOCK_BANK_URL__);
    return url.port ? `${url.hostname}:${url.port}` : url.hostname;
  } catch {
    return 'localhost:3443';
  }
}

export const config: PluginConfig = {
  name: 'Mock Bank Prover',
  description: 'This plugin will prove your Mock Bank balance and account data for zkCredit attestation.',
  version: '0.1.0',
  author: 'TLSN Team',
  requests: [
    {
      method: 'GET',
      host: mockBankHostname(),
      pathname: '/account/balance',
      verifierUrl: __VERIFIER_URL__,
      proxyUrl: `${__PROXY_URL__}?token=${mockBankHostWithPort()}`,
    } satisfies RequestPermission,
    {
      method: 'GET',
      host: mockBankHostname(),
      pathname: '/account/transactions',
      verifierUrl: __VERIFIER_URL__,
      proxyUrl: `${__PROXY_URL__}?token=${mockBankHostWithPort()}`,
    } satisfies RequestPermission,
  ],
  urls: [__MOCK_BANK_URL__ + '/*'],
};
