/**
 * TLSN browser extension injects a provider at window.tlsn.
 * App uses execCode(pluginCodeString) to run the JS plugin (demo-style flow).
 * @see https://tlsnotary.org/docs/extension/provider
 */
declare global {
  interface Window {
    tlsn?: {
      execCode(code: string): Promise<string>;
    };
  }
}

export {};
