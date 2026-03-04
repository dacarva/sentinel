export type Locale = "en" | "es";

const messages: Record<Locale, Record<string, string>> = {
  en: {
    "login.title": "Mock Bank — zkCredit",
    "login.heading": "Mock Bank",
    "login.description": "Sign in for zkCredit attestation. Use user_pass / sentinel123 for testing.",
    "login.usernameLabel": "Username",
    "login.passwordLabel": "Password",
    "login.passwordPlaceholder": "e.g. sentinel123",
    "login.submit": "Sign in",
    "login.script.signedIn": "Signed in. You can continue in the TLSN extension.",
    "login.script.loginFailed": "Login failed",
    "login.script.requestFailed": "Request failed",
    "auth.usernamePasswordRequired": "Username and password required",
    "auth.invalidCredentials": "Username or password incorrect",
    "auth.loginFailed": "Login failed",
    "account.noToken": "No token",
    "account.userNotFound": "User not found",
    "account.failedBalance": "Failed to get balance",
    "account.failedTransactions": "Failed to get transactions",
  },
  es: {
    "login.title": "Banco simulado — zkCredit",
    "login.heading": "Banco simulado",
    "login.description": "Inicia sesión para la atestación zkCredit. Usa user_pass / sentinel123 para pruebas.",
    "login.usernameLabel": "Usuario",
    "login.passwordLabel": "Contraseña",
    "login.passwordPlaceholder": "p. ej. sentinel123",
    "login.submit": "Iniciar sesión",
    "login.script.signedIn": "Sesión iniciada. Puedes continuar en la extensión TLSN.",
    "login.script.loginFailed": "Inicio de sesión fallido",
    "login.script.requestFailed": "La solicitud falló",
    "auth.usernamePasswordRequired": "Usuario y contraseña obligatorios",
    "auth.invalidCredentials": "Usuario o contraseña incorrectos",
    "auth.loginFailed": "Error al iniciar sesión",
    "account.noToken": "Sin token",
    "account.userNotFound": "Usuario no encontrado",
    "account.failedBalance": "Error al obtener el saldo",
    "account.failedTransactions": "Error al obtener las transacciones",
  },
};

export function detectLocale(acceptLanguageHeader: string | undefined): Locale {
  if (!acceptLanguageHeader) return "en";
  const lower = acceptLanguageHeader.toLowerCase();
  if (lower.includes("es")) return "es";
  return "en";
}

export function t(locale: Locale, key: string): string {
  const table = messages[locale] ?? messages.en;
  return table[key] ?? messages.en[key] ?? key;
}

