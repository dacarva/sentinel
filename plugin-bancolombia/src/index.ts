/**
 * Bancolombia Prover - TypeScript Plugin
 *
 * Proves Bancolombia Sucursal Virtual account balance for zkCredit attestation.
 * Opens the Bancolombia login page; after login, captures the Bearer token and
 * proves /consolidated-balance via TLSNotary.
 */

import type { Handler, DomJson } from '@tlsn/plugin-sdk';
import { config } from './config';
import { FloatingButton, PluginOverlay } from './components';

// Injected at build time via esbuild --define
declare const __VERIFIER_URL__: string;
declare const __PROXY_URL__: string;

const BANCOLOMBIA_HOST = 'canalpersonas-ext.apps.bancolombia.com';
const BALANCE_PATH = '/super-svp/api/v1/security-filters/ch-ms-deposits/hybrid/accounts/customization/consolidated-balance';
const BALANCE_URL = `https://${BANCOLOMBIA_HOST}${BALANCE_PATH}`;
const LOGIN_URL = 'https://svpersonas.apps.bancolombia.com';

/** Generate a UUID v4 using the QuickJS crypto global. */
function generateUUID(): string {
  // crypto.randomUUID() is available in the QuickJS sandbox provided by TLSNotary
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Manual fallback: Math.random-based UUID v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Format current timestamp as "YYYY-MM-DD HH:mm:ss:SSS"
 * matching the request-timestamp header format used by Bancolombia.
 */
function formatTimestamp(): string {
  const d = new Date();
  const pad2 = (n: number) => String(n).padStart(2, '0');
  const pad3 = (n: number) => String(n).padStart(3, '0');
  return (
    `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ` +
    `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}:${pad3(d.getMilliseconds())}`
  );
}

// =============================================================================
// PROOF GENERATION CALLBACK
// =============================================================================
async function onClick(): Promise<void> {
  const isRequestPending = useState<boolean>('isRequestPending', false);
  if (isRequestPending) return;

  setState('isRequestPending', true);
  setState('error', null);

  const authorization = useState<string | null>('authorization', null);
  const sessionTracker = useState<string | null>('sessionTracker', null);

  if (!authorization) {
    setState('isRequestPending', false);
    setState('error', 'No auth captured. Log in to Bancolombia and wait for the connection indicator.');
    return;
  }

  const headers: Record<string, string> = {
    Host: BANCOLOMBIA_HOST,
    'Accept-Encoding': 'identity',
    Connection: 'close',
    Authorization: authorization,
    channel: 'SVP',
    'app-version': '3.0.27',
    'device-id': 'web-sentinel-prover',
    'device-info': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    ip: '127.0.0.1',
    'platform-type': 'web',
    'message-id': generateUUID(),
    'request-timestamp': formatTimestamp(),
  };

  if (sessionTracker) {
    headers['session-tracker'] = sessionTracker;
  }

  try {
    const balanceResp = await prove(
      {
        url: BALANCE_URL,
        method: 'GET',
        headers,
      },
      {
        verifierUrl: __VERIFIER_URL__,
        proxyUrl: `${__PROXY_URL__}?token=${BANCOLOMBIA_HOST}`,
        maxRecvData: 16384,
        maxSentData: 8192,
        handlers: [
          { type: 'SENT', part: 'START_LINE', action: 'REVEAL' } satisfies Handler,
          { type: 'RECV', part: 'START_LINE', action: 'REVEAL' } satisfies Handler,
          {
            type: 'RECV',
            part: 'BODY',
            action: 'REVEAL',
            params: { type: 'json', path: 'data.accounts.0.balances.available' },
          } satisfies Handler,
          {
            type: 'RECV',
            part: 'BODY',
            action: 'REVEAL',
            params: { type: 'json', path: 'data.accounts.0.currency' },
          } satisfies Handler,
          {
            type: 'RECV',
            part: 'BODY',
            action: 'REVEAL',
            params: { type: 'json', path: 'data.accounts.0.number' },
          } satisfies Handler,
        ],
      }
    );

    done(JSON.stringify({ results: balanceResp.results, bank: 'bancolombia' }));
  } catch (e) {
    setState('isRequestPending', false);
    const msg = e instanceof Error ? e.message : String(e);
    setState('error', msg);
  }
}

function expandUI(): void {
  setState('isMinimized', false);
}

function minimizeUI(): void {
  setState('isMinimized', true);
}

// =============================================================================
// MAIN UI FUNCTION
// =============================================================================
function main(): DomJson {
  const isMinimized = useState<boolean>('isMinimized', false);
  const isRequestPending = useState<boolean>('isRequestPending', false);

  const authorization = useState<string | null>('authorization', null);

  if (!authorization) {
    // Intercept requests to the Bancolombia API host and capture auth headers
    const [header] = useHeaders((headers) =>
      headers.filter(
        (h) =>
          h.url.includes(BANCOLOMBIA_HOST) &&
          h.requestHeaders.some((rh) => rh.name.toLowerCase() === 'authorization')
      )
    );

    if (header) {
      const auth = header.requestHeaders.find((h) => h.name.toLowerCase() === 'authorization')?.value;
      const tracker = header.requestHeaders.find((h) => h.name.toLowerCase() === 'session-tracker')?.value;
      if (auth) setState('authorization', auth);
      if (tracker) setState('sessionTracker', tracker);
    }
  }

  const isConnected = !!authorization;
  const error = useState<string | null>('error', null);

  useEffect(() => {
    openWindow(LOGIN_URL);
  }, []);

  if (isMinimized) {
    return FloatingButton({ onClick: 'expandUI' });
  }

  return PluginOverlay({
    title: 'Bancolombia Prover',
    isConnected,
    isPending: isRequestPending,
    error: error ?? undefined,
    onMinimize: 'minimizeUI',
    onProve: 'onClick',
  });
}

export default {
  main,
  onClick,
  expandUI,
  minimizeUI,
  config,
};
