// src/config.ts
function mockBankHostname() {
  try {
    return new URL("https://localhost:3443").hostname;
  } catch {
    return "localhost";
  }
}
function mockBankHostWithPort() {
  try {
    const url = new URL("https://localhost:3443");
    return url.port ? `${url.hostname}:${url.port}` : url.hostname;
  } catch {
    return "localhost:3443";
  }
}
var config = {
  name: "Mock Bank Prover",
  description: "This plugin will prove your Mock Bank balance and account data for zkCredit attestation.",
  version: "0.1.0",
  author: "TLSN Team",
  requests: [
    {
      method: "GET",
      host: mockBankHostname(),
      pathname: "/account/balance",
      verifierUrl: "http://localhost:7047",
      proxyUrl: `${"ws://localhost:7047/proxy"}?token=${mockBankHostWithPort()}`
    },
    {
      method: "GET",
      host: mockBankHostname(),
      pathname: "/account/transactions",
      verifierUrl: "http://localhost:7047",
      proxyUrl: `${"ws://localhost:7047/proxy"}?token=${mockBankHostWithPort()}`
    }
  ],
  urls: ["https://localhost:3443/*"]
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
        background("linear-gradient(135deg, #667eea 0%, #764ba2 100%)"),
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
        background("linear-gradient(135deg, #667eea 0%, #764ba2 100%)"),
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
    ["Please log in to the Mock Bank page above to continue"]
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
        // Custom override for specific corner rounding
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
function mockBankOrigin() {
  return "https://localhost:3443".replace(/\/$/, "");
}
function mockBankHost() {
  try {
    return new URL("https://localhost:3443").host;
  } catch {
    return "localhost";
  }
}
var BALANCE_PATH = "/account/balance";
var balanceUrl = () => `${mockBankOrigin()}${BALANCE_PATH}`;
async function onClick() {
  const isRequestPending = useState("isRequestPending", false);
  if (isRequestPending) return;
  setState("isRequestPending", true);
  setState("error", null);
  const authHeader = useState("authorization", null);
  const cookie = useState("cookie", null);
  if (!authHeader && !cookie) {
    setState("isRequestPending", false);
    setState("error", "No auth captured. Log in on the Mock Bank page and ensure a request to /account/ or /auth/ was made.");
    return;
  }
  const host = mockBankHost();
  const headers = {
    Host: host,
    "Accept-Encoding": "identity",
    "Connection": "keep-alive"
  };
  if (authHeader) headers["Authorization"] = authHeader;
  if (cookie) headers["Cookie"] = cookie;
  try {
    const resp = await prove(
      {
        url: balanceUrl(),
        method: "GET",
        headers
      },
      {
        verifierUrl: "http://localhost:7047",
        proxyUrl: `${"ws://localhost:7047/proxy"}?token=${mockBankHost()}`,
        maxRecvData: 4096,
        maxSentData: 2048,
        handlers: [
          { type: "SENT", part: "START_LINE", action: "REVEAL" },
          { type: "RECV", part: "START_LINE", action: "REVEAL" },
          {
            type: "RECV",
            part: "BODY",
            action: "REVEAL",
            params: { type: "json", path: "balance" }
          },
          {
            type: "RECV",
            part: "BODY",
            action: "REVEAL",
            params: { type: "json", path: "currency" }
          },
          {
            type: "RECV",
            part: "BODY",
            action: "REVEAL",
            params: { type: "json", path: "account_id" }
          }
        ]
      }
    );
    done(JSON.stringify(resp));
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
  const authHeader = useState("authorization", null);
  const cookie = useState("cookie", null);
  if (!authHeader && !cookie) {
    const [header] = useHeaders(
      (headers) => headers.filter(
        (h) => h.url.includes(mockBankOrigin()) && (h.url.includes(BALANCE_PATH) || h.url.includes("/account/") || h.url.includes("/auth/"))
      )
    );
    if (header) {
      const a = header.requestHeaders.find((h) => h.name.toLowerCase() === "authorization")?.value;
      const c = header.requestHeaders.find((h) => h.name === "Cookie")?.value;
      if (a && !authHeader) setState("authorization", a);
      if (c && !cookie) setState("cookie", c);
    }
  }
  const isConnected = !!(authHeader || cookie);
  const error = useState("error", null);
  useEffect(() => {
    openWindow("https://localhost:3443");
  }, []);
  if (isMinimized) {
    return FloatingButton({ onClick: "expandUI" });
  }
  return PluginOverlay({
    title: "Mock Bank Prover",
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
//# sourceMappingURL=ts-plugin-sample.js.map
