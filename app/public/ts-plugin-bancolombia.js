// src/config.ts
var BANCOLOMBIA_HOST = "canalpersonas-ext.apps.bancolombia.com";
var BALANCE_PATH = "/super-svp/api/v1/security-filters/ch-ms-deposits/hybrid/accounts/customization/consolidated-balance";
var LOGIN_URL = "https://svpersonas.apps.bancolombia.com/*";
const config = {
  name: "Bancolombia Prover",
  description: "Proves your Bancolombia account balance for zkCredit attestation.",
  version: "0.1.0",
  author: "Sentinel Team",
  requests: [
    // Prove consolidated balance (the attestation)
    // session-tracker is captured from intercepted browser headers; no
    // channel-bridge round-trip is needed.
    {
      method: "GET",
      host: BANCOLOMBIA_HOST,
      pathname: BALANCE_PATH,
      verifierUrl: "http://localhost:7047",
      proxyUrl: `${"ws://localhost:7047/proxy"}?token=${BANCOLOMBIA_HOST}`
    }
  ],
  urls: [LOGIN_URL]
};

// ../plugin-sdk/dist/styles.js
var colorTokens = {
  // Neutral
  white: "#ffffff",
  black: "#000000",
  transparent: "transparent",
  // Gray scale
  "gray-50": "#f9fafb",
  "gray-100": "#f3f4f6",
  "gray-200": "#e5e7eb",
  "gray-300": "#d1d5db",
  "gray-400": "#9ca3af",
  "gray-500": "#6b7280",
  "gray-600": "#4b5563",
  "gray-700": "#374151",
  "gray-800": "#1f2937",
  "gray-900": "#111827",
  // Blue
  "blue-100": "#dbeafe",
  "blue-200": "#bfdbfe",
  "blue-300": "#93c5fd",
  "blue-400": "#60a5fa",
  "blue-500": "#3b82f6",
  "blue-600": "#2563eb",
  "blue-700": "#1d4ed8",
  "blue-800": "#1e40af",
  "blue-900": "#1e3a8a",
  // Purple
  "purple-100": "#f3e8ff",
  "purple-200": "#e9d5ff",
  "purple-300": "#d8b4fe",
  "purple-400": "#c084fc",
  "purple-500": "#a855f7",
  "purple-600": "#9333ea",
  "purple-700": "#7e22ce",
  "purple-800": "#6b21a8",
  "purple-900": "#581c87",
  // Red
  "red-100": "#fee2e2",
  "red-200": "#fecaca",
  "red-300": "#fca5a5",
  "red-400": "#f87171",
  "red-500": "#ef4444",
  "red-600": "#dc2626",
  "red-700": "#b91c1c",
  "red-800": "#991b1b",
  "red-900": "#7f1d1d",
  // Yellow
  "yellow-100": "#fef3c7",
  "yellow-200": "#fde68a",
  "yellow-300": "#fcd34d",
  "yellow-400": "#fbbf24",
  "yellow-500": "#f59e0b",
  "yellow-600": "#d97706",
  "yellow-700": "#b45309",
  "yellow-800": "#92400e",
  "yellow-900": "#78350f",
  // Orange
  "orange-100": "#ffedd5",
  "orange-200": "#fed7aa",
  "orange-300": "#fdba74",
  "orange-400": "#fb923c",
  "orange-500": "#f97316",
  "orange-600": "#ea580c",
  "orange-700": "#c2410c",
  "orange-800": "#9a3412",
  "orange-900": "#7c2d12",
  // Green
  "green-100": "#d1fae5",
  "green-200": "#a7f3d0",
  "green-300": "#6ee7b7",
  "green-400": "#34d399",
  "green-500": "#10b981",
  "green-600": "#059669",
  "green-700": "#047857",
  "green-800": "#065f46",
  "green-900": "#064e3b"
};
var spacingTokens = {
  "0": "0",
  "1": "4px",
  "2": "8px",
  "3": "12px",
  "4": "16px",
  "5": "20px",
  "6": "24px",
  "8": "32px",
  "10": "40px",
  "12": "48px",
  // Named aliases
  xs: "8px",
  sm: "12px",
  md: "16px",
  lg: "20px",
  xl: "24px"
};
var fontSizeTokens = {
  xs: "12px",
  sm: "14px",
  md: "15px",
  base: "16px",
  lg: "18px",
  xl: "20px",
  "2xl": "24px"
};
var fontWeightTokens = {
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700"
};
var borderRadiusTokens = {
  none: "0",
  sm: "6px",
  md: "8px",
  lg: "12px",
  full: "9999px",
  circle: "50%"
};
var shadowTokens = {
  sm: "0 2px 4px rgba(0,0,0,0.1)",
  md: "0 -2px 10px rgba(0,0,0,0.1)",
  lg: "0 4px 8px rgba(0,0,0,0.3)",
  xl: "0 10px 25px rgba(0,0,0,0.2)"
};
function resolveColor(token) {
  return colorTokens[token] || token;
}
function resolveSpacing(token) {
  return spacingTokens[token] || token;
}
function resolveFontSize(token) {
  return fontSizeTokens[token] || token;
}
function resolveFontWeight(token) {
  return fontWeightTokens[token] || token;
}
function resolveBorderRadius(token) {
  return borderRadiusTokens[token] || token;
}
function resolveShadow(token) {
  return shadowTokens[token] || token;
}
var color = (value) => ({ color: resolveColor(value) });
var bgColor = (value) => ({ backgroundColor: resolveColor(value) });
var padding = (value) => ({ padding: resolveSpacing(value) });
var paddingX = (value) => {
  const val = resolveSpacing(value);
  return { paddingLeft: val, paddingRight: val };
};
var paddingY = (value) => {
  const val = resolveSpacing(value);
  return { paddingTop: val, paddingBottom: val };
};
var marginBottom = (value) => ({
  marginBottom: resolveSpacing(value)
});
var marginRight = (value) => ({ marginRight: resolveSpacing(value) });
var fontSize = (value) => ({ fontSize: resolveFontSize(value) });
var fontWeight = (value) => ({
  fontWeight: resolveFontWeight(value)
});
var textAlign = (value) => ({ textAlign: value });
var fontFamily = (value) => ({ fontFamily: value });
var display = (value) => ({ display: value });
var position = (value) => ({ position: value });
var width = (value) => ({ width: value });
var height = (value) => ({ height: value });
var alignItems = (value) => ({ alignItems: value });
var justifyContent = (value) => ({ justifyContent: value });
var bottom = (value) => ({ bottom: resolveSpacing(value) });
var right = (value) => ({ right: resolveSpacing(value) });
var border = (value) => ({ border: value });
var borderRadius = (value) => ({
  borderRadius: resolveBorderRadius(value)
});
var boxShadow = (value) => ({ boxShadow: resolveShadow(value) });
var opacity = (value) => ({ opacity: value });
var overflow = (value) => ({ overflow: value });
var zIndex = (value) => ({ zIndex: value });
var cursor = (value) => ({ cursor: value });
var transition = (value = "all 0.2s ease") => ({ transition: value });
var background = (value) => ({ background: value });
function inlineStyle(...styles) {
  return styles.reduce((acc, style) => {
    if (style) {
      Object.assign(acc, style);
    }
    return acc;
  }, {});
}
var defaultFontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

// src/components/FloatingButton.ts
function FloatingButton({ onClick: onClick2, icon = "\u{1F510}" }) {
  return div(
    {
      style: inlineStyle(
        position("fixed"),
        bottom("lg"),
        right("lg"),
        width("60px"),
        height("60px"),
        borderRadius("circle"),
        bgColor("#4CAF50"),
        boxShadow("lg"),
        zIndex("999999"),
        display("flex"),
        alignItems("center"),
        justifyContent("center"),
        cursor("pointer"),
        fontSize("2xl"),
        color("white"),
        transition()
      ),
      onclick: onClick2
    },
    [icon]
  );
}

// src/components/OverlayHeader.ts
function OverlayHeader({ title, onMinimize }) {
  return div(
    {
      style: inlineStyle(
        background("linear-gradient(135deg, #FDD835 0%, #F9A825 100%)"),
        paddingY("sm"),
        paddingX("md"),
        display("flex"),
        justifyContent("space-between"),
        alignItems("center"),
        color("white")
      )
    },
    [
      div(
        {
          style: inlineStyle(
            fontWeight("semibold"),
            fontSize("lg")
          )
        },
        [title]
      ),
      button(
        {
          style: inlineStyle(
            background("transparent"),
            border("none"),
            color("white"),
            fontSize("xl"),
            cursor("pointer"),
            padding("0"),
            width("24px"),
            height("24px"),
            display("flex"),
            alignItems("center"),
            justifyContent("center")
          ),
          onclick: onMinimize
        },
        ["\u2212"]
      )
    ]
  );
}

// src/components/StatusIndicator.ts
function StatusIndicator({ isConnected }) {
  return div(
    {
      style: inlineStyle(
        display("flex"),
        alignItems("center"),
        marginBottom("md")
      )
    },
    [
      // Status dot
      div(
        {
          style: inlineStyle(
            width("8px"),
            height("8px"),
            borderRadius("circle"),
            bgColor(isConnected ? "#48bb78" : "#cbd5e0"),
            marginRight("2")
          )
        },
        []
      ),
      // Status text
      div(
        {
          style: inlineStyle(
            fontSize("sm"),
            color("gray-700")
          )
        },
        [isConnected ? "Connected" : "Waiting for connection..."]
      )
    ]
  );
}

// src/components/ProveButton.ts
function ProveButton({ onClick: onClick2, isPending }) {
  return button(
    {
      style: inlineStyle(
        width("100%"),
        padding("sm"),
        background("linear-gradient(135deg, #FDD835 0%, #F9A825 100%)"),
        color("white"),
        border("none"),
        borderRadius("sm"),
        fontSize("md"),
        fontWeight("semibold"),
        cursor("pointer"),
        transition(),
        isPending && opacity("0.6"),
        isPending && cursor("not-allowed")
      ),
      onclick: onClick2
    },
    [isPending ? "Generating Proof..." : "Prove"]
  );
}

// src/components/LoginPrompt.ts
function LoginPrompt() {
  return div(
    {
      style: inlineStyle(
        textAlign("center"),
        color("gray-600"),
        padding("sm"),
        bgColor("yellow-100"),
        borderRadius("sm"),
        border("1px solid #ffeaa7")
      )
    },
    ["Please log in to Bancolombia Sucursal Virtual in the opened window to continue"]
  );
}

// src/components/PluginOverlay.ts
function PluginOverlay({
  title,
  isConnected,
  isPending,
  error,
  onMinimize,
  onProve
}) {
  return div(
    {
      style: inlineStyle(
        position("fixed"),
        bottom("0"),
        right("xs"),
        width("280px"),
        borderRadius("md"),
        { borderRadius: "8px 8px 0 0" },
        bgColor("white"),
        boxShadow("md"),
        zIndex("999999"),
        fontSize("sm"),
        fontFamily(defaultFontFamily),
        overflow("hidden")
      )
    },
    [
      // Header
      OverlayHeader({ title, onMinimize }),
      // Content area
      div(
        {
          style: inlineStyle(
            padding("lg"),
            bgColor("gray-100")
          )
        },
        [
          // Status indicator
          StatusIndicator({ isConnected }),
          // Error message (e.g. prove failed)
          ...error ? [
            div(
              {
                style: inlineStyle(
                  padding("sm"),
                  borderRadius("sm"),
                  { backgroundColor: "#fed7d7", color: "#c53030", fontSize: "12px", marginBottom: "8px" }
                )
              },
              [error]
            )
          ] : [],
          // Conditional content: button or login prompt
          isConnected ? ProveButton({ onClick: onProve, isPending }) : LoginPrompt()
        ]
      )
    ]
  );
}

// src/index.ts
var BANCOLOMBIA_HOST2 = "canalpersonas-ext.apps.bancolombia.com";
var BALANCE_URL = `https://${BANCOLOMBIA_HOST2}/super-svp/api/v1/security-filters/ch-ms-deposits/hybrid/accounts/customization/consolidated-balance`;
var LOGIN_URL2 = "https://svpersonas.apps.bancolombia.com";
function generateUUID() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : r & 3 | 8;
    return v.toString(16);
  });
}
function formatTimestamp() {
  const d = /* @__PURE__ */ new Date();
  const pad2 = (n) => String(n).padStart(2, "0");
  const pad3 = (n) => String(n).padStart(3, "0");
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}:${pad3(d.getMilliseconds())}`;
}
function buildBaseHeaders(authorization, deviceId, deviceInfo, clientIp, cookie, userAgent) {
  const headers = {
    Host: BANCOLOMBIA_HOST2,
    Accept: "application/json, text/plain, */*",
    "Accept-Encoding": "identity",
    "Accept-Language": "en-US,en;q=0.8",
    Connection: "close",
    "Content-Type": "application/json",
    Origin: "https://svpersonas.apps.bancolombia.com",
    "User-Agent": userAgent ?? "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
    Authorization: authorization,
    channel: "SVP",
    "app-version": "3.0.27",
    "device-id": deviceId ?? "0000000000000000000000000000000000",
    "device-info": deviceInfo ?? '{"device":"Unknown","os":"Unknown","browser":"Unknown"}',
    ip: clientIp ?? "127.0.0.1",
    "platform-type": "web",
    "message-id": generateUUID(),
    "request-timestamp": formatTimestamp()
  };
  if (cookie) {
    headers["Cookie"] = cookie;
  }
  return headers;
}
async function onClick() {
  const isRequestPending = useState("isRequestPending", false);
  if (isRequestPending) return;
  setState("isRequestPending", true);
  setState("error", null);
  const authorization = useState("authorization", null);
  const deviceId = useState("deviceId", null);
  const deviceInfo = useState("deviceInfo", null);
  const clientIp = useState("clientIp", null);
  const cookie = useState("cookie", null);
  const sessionTracker = useState("sessionTracker", null);
  const userAgent = useState("userAgent", null);
  if (!authorization) {
    setState("isRequestPending", false);
    setState("error", "No auth captured. Log in to Bancolombia and wait for the connection indicator.");
    return;
  }
  if (!sessionTracker) {
    setState("isRequestPending", false);
    setState("error", "No session-tracker captured. Wait for the connection indicator after logging in.");
    return;
  }
  try {
    const balanceHeaders = {
      ...buildBaseHeaders(authorization, deviceId, deviceInfo, clientIp, cookie, userAgent),
      "session-tracker": sessionTracker
    };
    const balanceResp = await prove(
      {
        url: BALANCE_URL,
        method: "GET",
        headers: balanceHeaders
      },
      {
        verifierUrl: "http://localhost:7047",
        proxyUrl: `${"ws://localhost:7047/proxy"}?token=${BANCOLOMBIA_HOST2}`,
        maxRecvData: 16384,
        maxSentData: 16384,
        handlers: [
          { type: "SENT", part: "START_LINE", action: "REVEAL" },
          { type: "RECV", part: "START_LINE", action: "REVEAL" },
          {
            type: "RECV",
            part: "BODY",
            action: "REVEAL",
            params: { type: "json", path: "data.accounts[0].balances.available" }
          },
          {
            type: "RECV",
            part: "BODY",
            action: "REVEAL",
            params: { type: "json", path: "data.accounts[0].currency" }
          },
          {
            type: "RECV",
            part: "BODY",
            action: "REVEAL",
            params: { type: "json", path: "data.accounts[0].number" }
          },
          {
            type: "RECV",
            part: "BODY",
            action: "REVEAL",
            params: { type: "json", path: "data.accounts[0].name" }
          }
        ]
      }
    );
    done(JSON.stringify({ results: balanceResp.results, bank: "bancolombia" }));
  } catch (e) {
    setState("isRequestPending", false);
    const msg = e instanceof Error ? e.message : String(e);
    setState("error", msg);
  }
}
function expandUI() {
  setState("isMinimized", false);
}
function minimizeUI() {
  setState("isMinimized", true);
}
function main() {
  const isMinimized = useState("isMinimized", false);
  const isRequestPending = useState("isRequestPending", false);
  const authorization = useState("authorization", null);
  if (!authorization) {
    const [header] = useHeaders(
      (headers) => headers.filter(
        (h) => h.url.includes(BANCOLOMBIA_HOST2) && h.requestHeaders.some((rh) => rh.name.toLowerCase() === "authorization")
      )
    );
    if (header) {
      const auth = header.requestHeaders.find((h) => h.name.toLowerCase() === "authorization")?.value;
      const deviceId = header.requestHeaders.find((h) => h.name.toLowerCase() === "device-id")?.value;
      const deviceInfo = header.requestHeaders.find((h) => h.name.toLowerCase() === "device-info")?.value;
      const clientIp = header.requestHeaders.find((h) => h.name.toLowerCase() === "ip")?.value;
      const cookie = header.requestHeaders.find((h) => h.name.toLowerCase() === "cookie")?.value;
      const sessionTracker = header.requestHeaders.find((h) => h.name.toLowerCase() === "session-tracker")?.value;
      if (auth) {
        setState("authorization", auth);
        try {
          const jwtPayload = JSON.parse(atob(auth.replace(/^Bearer\s+/i, "").split(".")[1]));
          setState("documentType", jwtPayload?.documentType ?? "TIPDOC_FS001");
        } catch {
          setState("documentType", "TIPDOC_FS001");
        }
      }
      if (deviceId) setState("deviceId", deviceId);
      if (deviceInfo) setState("deviceInfo", deviceInfo);
      if (clientIp) setState("clientIp", clientIp);
      if (cookie) setState("cookie", cookie);
      if (sessionTracker) setState("sessionTracker", sessionTracker);
      const userAgent = header.requestHeaders.find((h) => h.name.toLowerCase() === "user-agent")?.value;
      if (userAgent) setState("userAgent", userAgent);
    }
  }
  const isConnected = !!authorization;
  const error = useState("error", null);
  useEffect(() => {
    openWindow(LOGIN_URL2);
  }, []);
  if (isMinimized) {
    return FloatingButton({ onClick: "expandUI" });
  }
  return PluginOverlay({
    title: "Bancolombia Prover",
    isConnected,
    isPending: isRequestPending,
    error: error ?? void 0,
    onMinimize: "minimizeUI",
    onProve: "onClick"
  });
}
var index_default = {
  main,
  onClick,
  expandUI,
  minimizeUI,
  config
};
export {
  index_default as default
};
//# sourceMappingURL=ts-plugin-bancolombia.js.map
