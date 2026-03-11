/**
 * Bancolombia Prover - TypeScript Plugin
 *
 * Proves Bancolombia Sucursal Virtual account balance for zkCredit attestation.
 *
 * Flow:
 *  1. Open Bancolombia login page; intercept Bearer token, session-tracker,
 *     and WAF cookies from outgoing requests to the API host.
 *  2. onClick():
 *     GET /consolidated-balance with captured headers (including WAF cookies)
 *     → proves balance (the attestation).
 *
 * The session-tracker UUID is generated client-side by the browser app and
 * present in all API request headers from the start; no channel-bridge call
 * is needed to obtain it.
 *
 * WAF cookies (Imperva incap_ses_*, visid_incap_*, reese84) are IP-bound but
 * since the TLSNotary verifier/proxy runs on localhost it shares the same
 * external IP as the browser, so forwarding them works.
 */

import type { Handler, DomJson } from '@tlsn/plugin-sdk';
import { config } from './config';
import { FloatingButton, PluginOverlay } from './components';

// Injected at build time via esbuild --define
declare const __VERIFIER_URL__: string;
declare const __PROXY_URL__: string;

const BANCOLOMBIA_HOST = 'canalpersonas-ext.apps.bancolombia.com';
const BALANCE_URL = `https://${BANCOLOMBIA_HOST}/super-svp/api/v1/security-filters/ch-ms-deposits/hybrid/accounts/customization/consolidated-balance`;
const LOGIN_URL = 'https://svpersonas.apps.bancolombia.com';

/** Generate a UUID v4 using the QuickJS crypto global. */
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
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

/** Build the common request headers shared across prove() calls. */
function buildBaseHeaders(
  authorization: string,
  deviceId: string | null,
  deviceInfo: string | null,
  clientIp: string | null,
  cookie: string | null,
  userAgent: string | null
): Record<string, string> {
  const headers: Record<string, string> = {
    Host: BANCOLOMBIA_HOST,
    Accept: 'application/json, text/plain, */*',
    'Accept-Encoding': 'identity',
    'Accept-Language': 'en-US,en;q=0.8',
    Connection: 'close',
    'Content-Type': 'application/json',
    Origin: 'https://svpersonas.apps.bancolombia.com',
    'User-Agent': userAgent ?? 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
    Authorization: authorization,
    channel: 'SVP',
    'app-version': '3.0.27',
    'device-id': deviceId ?? '0000000000000000000000000000000000',
    'device-info': deviceInfo ?? '{"device":"Unknown","os":"Unknown","browser":"Unknown"}',
    ip: clientIp ?? '127.0.0.1',
    'platform-type': 'web',
    'message-id': generateUUID(),
    'request-timestamp': formatTimestamp(),
  };
  if (cookie) {
    headers['Cookie'] = cookie;
  }
  return headers;
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
  const deviceId = useState<string | null>('deviceId', null);
  const deviceInfo = useState<string | null>('deviceInfo', null);
  const clientIp = useState<string | null>('clientIp', null);
  const cookie = useState<string | null>('cookie', null);
  const sessionTracker = useState<string | null>('sessionTracker', null);
  const userAgent = useState<string | null>('userAgent', null);

  if (!authorization) {
    setState('isRequestPending', false);
    setState('error', 'No auth captured. Log in to Bancolombia and wait for the connection indicator.');
    return;
  }

  if (!sessionTracker) {
    setState('isRequestPending', false);
    setState('error', 'No session-tracker captured. Wait for the connection indicator after logging in.');
    return;
  }

  try {
    // -----------------------------------------------------------------------
    // Prove consolidated balance
    // The session-tracker is captured directly from the intercepted browser
    // headers; no channel-bridge round-trip is needed.
    // -----------------------------------------------------------------------
    const balanceHeaders = {
      ...buildBaseHeaders(authorization, deviceId, deviceInfo, clientIp, cookie, userAgent),
      'session-tracker': sessionTracker,
    };

    const balanceResp = await prove(
      {
        url: BALANCE_URL,
        method: 'GET',
        headers: balanceHeaders,
      },
      {
        verifierUrl: __VERIFIER_URL__,
        proxyUrl: `${__PROXY_URL__}?token=${BANCOLOMBIA_HOST}`,
        maxRecvData: 16384,
        maxSentData: 16384,
        handlers: [
          { type: 'SENT', part: 'START_LINE', action: 'REVEAL' } satisfies Handler,
          { type: 'RECV', part: 'START_LINE', action: 'REVEAL' } satisfies Handler,
          {
            type: 'RECV', part: 'BODY', action: 'REVEAL',
            params: { type: 'json', path: 'data.accounts.0.balances.available' },
          } satisfies Handler,
          {
            type: 'RECV', part: 'BODY', action: 'REVEAL',
            params: { type: 'json', path: 'data.accounts.0.currency' },
          } satisfies Handler,
          {
            type: 'RECV', part: 'BODY', action: 'REVEAL',
            params: { type: 'json', path: 'data.accounts.0.number' },
          } satisfies Handler,
          {
            type: 'RECV', part: 'BODY', action: 'REVEAL',
            params: { type: 'json', path: 'data.accounts.0.name' },
          } satisfies Handler,
        ],
      }
    );

    // Extract balance_raw so the app can generate a ZK proof in the browser.
    // The TLSNotary plugin runs in QuickJS (no WASM support), so proof generation
    // happens in the React app which runs in a real browser context.
    //
    // The extension may return REVEAL results without a `params` field — only a
    // raw fragment like `value: '"available":8352628.1'` — so we try both.
    const byParams = balanceResp.results.find(
      (r) =>
        r.type === 'RECV' &&
        r.part === 'BODY' &&
        (r.params as { path?: string } | undefined)?.path?.endsWith('available')
    );
    const byFragment = balanceResp.results.find(
      (r) =>
        r.type === 'RECV' &&
        r.part === 'BODY' &&
        typeof r.value === 'string' &&
        (r.value as string).includes('"available"')
    );

    let balanceRaw: string | undefined;
    if (byParams?.value !== undefined) {
      balanceRaw = String(byParams.value);
    } else if (byFragment?.value !== undefined) {
      const match = (byFragment.value as string).match(/"available"\s*:\s*([^,}\s"]+)/);
      if (match) balanceRaw = match[1];
    }

    done(JSON.stringify({
      results: balanceResp.results,
      bank: 'bancolombia',
      ...(balanceRaw !== undefined ? { balance_raw: String(balanceRaw) } : {}),
    }));
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
    // Intercept requests to the Bancolombia API host and capture auth, device,
    // WAF cookies, and session-tracker headers.
    // The TLSNotary verifier/proxy runs on localhost and therefore shares the
    // same external IP as the browser, so IP-bound WAF cookies remain valid.
    const [header] = useHeaders((headers) =>
      headers.filter(
        (h) =>
          h.url.includes(BANCOLOMBIA_HOST) &&
          h.requestHeaders.some((rh) => rh.name.toLowerCase() === 'authorization')
      )
    );

    if (header) {
      const auth = header.requestHeaders.find((h) => h.name.toLowerCase() === 'authorization')?.value;
      const deviceId = header.requestHeaders.find((h) => h.name.toLowerCase() === 'device-id')?.value;
      const deviceInfo = header.requestHeaders.find((h) => h.name.toLowerCase() === 'device-info')?.value;
      const clientIp = header.requestHeaders.find((h) => h.name.toLowerCase() === 'ip')?.value;
      const cookie = header.requestHeaders.find((h) => h.name.toLowerCase() === 'cookie')?.value;
      const sessionTracker = header.requestHeaders.find((h) => h.name.toLowerCase() === 'session-tracker')?.value;

      if (auth) {
        setState('authorization', auth);
        // Decode JWT payload to extract documentType dynamically
        try {
          const jwtPayload = JSON.parse(atob(auth.replace(/^Bearer\s+/i, '').split('.')[1]));
          setState('documentType', jwtPayload?.documentType ?? 'TIPDOC_FS001');
        } catch {
          setState('documentType', 'TIPDOC_FS001');
        }
      }
      if (deviceId) setState('deviceId', deviceId);
      if (deviceInfo) setState('deviceInfo', deviceInfo);
      if (clientIp) setState('clientIp', clientIp);
      if (cookie) setState('cookie', cookie);
      if (sessionTracker) setState('sessionTracker', sessionTracker);
      const userAgent = header.requestHeaders.find((h) => h.name.toLowerCase() === 'user-agent')?.value;
      if (userAgent) setState('userAgent', userAgent);
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
