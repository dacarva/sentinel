export type Locale = "en" | "es";

const messages: Record<Locale, Record<string, string>> = {
  en: {
    "webhook.invalidPayload": "Invalid webhook payload",
    "attest.userAddressRequired": "user_address is required",
    "attest.presentationRequired": "presentation is required",
    "attest.webhookRequired":
      "No verifier webhook received for this proof. Ensure the TLSNotary verifier is running and configured to POST to this backend.",
    "attest.verificationFailed": "Presentation verification failed",
    "attestation.notFound": "Attestation not found",
    "verify.usePost": "Use POST to verify an attestation",
  },
  es: {
    "webhook.invalidPayload": "Payload de webhook inválido",
    "attest.userAddressRequired": "user_address es obligatorio",
    "attest.presentationRequired": "presentation es obligatorio",
    "attest.webhookRequired":
      "No se recibió ningún webhook del verificador para esta prueba. Asegúrate de que el verificador TLSNotary esté en ejecución y configurado para hacer POST a este backend.",
    "attest.verificationFailed": "La verificación de la presentación falló",
    "attestation.notFound": "Atestación no encontrada",
    "verify.usePost": "Usa POST para verificar una atestación",
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

