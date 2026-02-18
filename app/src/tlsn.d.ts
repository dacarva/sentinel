/**
 * TLSN browser extension injects a provider at window.tlsn.
 * @see https://tlsnotary.org/docs/extension/provider
 */
declare global {
  interface Window {
    tlsn?: {
      connect(): Promise<{
        runPlugin(
          url: string,
          params?: Record<string, string>
        ): Promise<{
          notaryUrl: string
          session: unknown
          substrings: unknown
        }>
      }>
    }
  }
}

export {}
