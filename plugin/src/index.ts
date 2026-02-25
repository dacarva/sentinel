/**
 * Mock Bank Prover - TypeScript Plugin
 *
 * Proves Mock Bank balance and account data for zkCredit attestation.
 * Opens the Mock Bank login page; after login, proves /account/balance
 * (and optionally transactions) via TLSNotary.
 */

import type { Handler, DomJson } from '@tlsn/plugin-sdk';
import { config } from './config';
import { FloatingButton, PluginOverlay } from './components';

// Injected at build time via esbuild --define
declare const __VERIFIER_URL__: string;
declare const __PROXY_URL__: string;
declare const __MOCK_BANK_URL__: string;

function mockBankOrigin(): string {
  return __MOCK_BANK_URL__.replace(/\/$/, '');
}

function mockBankHost(): string {
  try {
    return new URL(__MOCK_BANK_URL__).host;
  } catch {
    return 'localhost';
  }
}

/** Hostname only (for proxy token so extension permission check passes). */
function mockBankHostname(): string {
  try {
    return new URL(__MOCK_BANK_URL__).hostname;
  } catch {
    return 'localhost';
  }
}

const BALANCE_PATH = '/account/balance';
const TRANSACTIONS_PATH = '/account/transactions';
const balanceUrl = () => `${mockBankOrigin()}${BALANCE_PATH}`;
const transactionsUrl = () => `${mockBankOrigin()}${TRANSACTIONS_PATH}`;

// =============================================================================
// PROOF GENERATION CALLBACK
// =============================================================================
async function onClick(): Promise<void> {
  const isRequestPending = useState<boolean>('isRequestPending', false);
  if (isRequestPending) return;

  setState('isRequestPending', true);
  setState('error', null);

  const authHeader = useState<string | null>('authorization', null);
  const cookie = useState<string | null>('cookie', null);

  if (!authHeader && !cookie) {
    setState('isRequestPending', false);
    setState('error', 'No auth captured. Log in on the Mock Bank page and ensure a request to /account/ or /auth/ was made.');
    return;
  }

  const host = mockBankHost();
  const headers: Record<string, string> = {
    Host: host,
    'Accept-Encoding': 'identity',
    'Connection': 'close',
  };
  if (authHeader) headers['Authorization'] = authHeader;
  if (cookie) headers['Cookie'] = cookie;

  try {
    const balanceResp = await prove(
      {
        url: balanceUrl(),
        method: 'GET',
        headers,
      },
      {
        verifierUrl: __VERIFIER_URL__,
        proxyUrl: `${__PROXY_URL__}?token=${mockBankHost()}`,
        maxRecvData: 1024,
        maxSentData: 512,
        handlers: [
          { type: 'SENT', part: 'START_LINE', action: 'REVEAL' } satisfies Handler,
          { type: 'RECV', part: 'START_LINE', action: 'REVEAL' } satisfies Handler,
          {
            type: 'RECV',
            part: 'BODY',
            action: 'REVEAL',
            params: { type: 'json', path: 'balance' },
          } satisfies Handler,
          {
            type: 'RECV',
            part: 'BODY',
            action: 'REVEAL',
            params: { type: 'json', path: 'currency' },
          } satisfies Handler,
          {
            type: 'RECV',
            part: 'BODY',
            action: 'REVEAL',
            params: { type: 'json', path: 'account_id' },
          } satisfies Handler,
        ],
      }
    );

    const txResp = await prove(
      {
        url: transactionsUrl(),
        method: 'GET',
        headers,
      },
      {
        verifierUrl: __VERIFIER_URL__,
        proxyUrl: `${__PROXY_URL__}?token=${mockBankHost()}`,
        maxRecvData: 1024,
        maxSentData: 512,
        handlers: [
          { type: 'SENT', part: 'START_LINE', action: 'REVEAL' } satisfies Handler,
          { type: 'RECV', part: 'START_LINE', action: 'REVEAL' } satisfies Handler,
          {
            type: 'RECV',
            part: 'BODY',
            action: 'REVEAL',
            params: { type: 'json', path: 'transactions' },
          } satisfies Handler,
        ],
      }
    );

    const mergedResults = [...(balanceResp.results ?? []), ...(txResp.results ?? [])];
    done(JSON.stringify({ results: mergedResults }));
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

  const authHeader = useState<string | null>('authorization', null);
  const cookie = useState<string | null>('cookie', null);

  if (!authHeader && !cookie) {
    const [header] = useHeaders((headers) =>
      headers.filter(
        (h) =>
          h.url.includes(mockBankOrigin()) &&
          (h.url.includes(BALANCE_PATH) || h.url.includes('/account/') || h.url.includes('/auth/'))
      )
    );

    if (header) {
      const a = header.requestHeaders.find((h) => h.name.toLowerCase() === 'authorization')?.value;
      const c = header.requestHeaders.find((h) => h.name === 'Cookie')?.value;
      if (a && !authHeader) setState('authorization', a);
      if (c && !cookie) setState('cookie', c);
    }
  }

  const isConnected = !!(authHeader || cookie);
  const error = useState<string | null>('error', null);

  useEffect(() => {
    openWindow(__MOCK_BANK_URL__);
  }, []);

  if (isMinimized) {
    return FloatingButton({ onClick: 'expandUI' });
  }

  return PluginOverlay({
    title: 'Mock Bank Prover',
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
