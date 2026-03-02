/**
 * Plugin Configuration
 *
 * Defines metadata and permissions for the Bancolombia Prover plugin.
 */

import type { PluginConfig, RequestPermission } from '@tlsn/plugin-sdk';

// Injected at build time via esbuild --define
declare const __VERIFIER_URL__: string;
declare const __PROXY_URL__: string;

const BANCOLOMBIA_HOST = 'canalpersonas-ext.apps.bancolombia.com';
const CHANNEL_PATH = '/super-svp/api/v1/security-filters/adf-ms-async-channel-bridge/ext/channel';
const BALANCE_PATH = '/super-svp/api/v1/security-filters/ch-ms-deposits/hybrid/accounts/customization/consolidated-balance';
const LOGIN_URL = 'https://svpersonas.apps.bancolombia.com/*';

export const config: PluginConfig = {
  name: 'Bancolombia Prover',
  description: 'Proves your Bancolombia account balance for zkCredit attestation.',
  version: '0.1.0',
  author: 'Sentinel Team',
  requests: [
    // Step 1: open async-channel-bridge → receive channel_alias (= session-tracker)
    {
      method: 'POST',
      host: BANCOLOMBIA_HOST,
      pathname: CHANNEL_PATH,
      verifierUrl: __VERIFIER_URL__,
      proxyUrl: `${__PROXY_URL__}?token=${BANCOLOMBIA_HOST}`,
    } satisfies RequestPermission,
    // Step 2: prove consolidated balance (the actual attestation)
    {
      method: 'GET',
      host: BANCOLOMBIA_HOST,
      pathname: BALANCE_PATH,
      verifierUrl: __VERIFIER_URL__,
      proxyUrl: `${__PROXY_URL__}?token=${BANCOLOMBIA_HOST}`,
    } satisfies RequestPermission,
  ],
  urls: [LOGIN_URL],
};
