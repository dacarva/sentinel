/**
 * Plugin Configuration
 *
 * Defines metadata and permissions for the Mock Bank Prover plugin.
 */

// Type imports only (stripped at compile time)
import type { PluginConfig, RequestPermission } from '@tlsn/plugin-sdk';

// Injected at build time via esbuild --define
declare const __VERIFIER_URL__: string;
declare const __MOCK_BANK_URL__: string;

/** Host for permission declaration only (extension compares using hostname, so no port). */
function mockBankHostForPermission(): string {
  try {
    return new URL(__MOCK_BANK_URL__).hostname;
  } catch {
    return 'localhost';
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
      host: mockBankHostForPermission(),
      pathname: '/account/balance',
      verifierUrl: __VERIFIER_URL__,
    } satisfies RequestPermission,
    {
      method: 'GET',
      host: mockBankHostForPermission(),
      pathname: '/account/transactions',
      verifierUrl: __VERIFIER_URL__,
    } satisfies RequestPermission,
  ],
  urls: [__MOCK_BANK_URL__ + '/*'],
};
