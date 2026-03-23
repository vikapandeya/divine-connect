// @ts-nocheck
import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  private readonly recoveryStorageKey = 'divine-connect-chunk-recovery';

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
    if (this.isChunkLoadError(error)) {
      void this.recoverFromChunkError();
    }
  }

  private isChunkLoadError(error: Error | null) {
    const message = error?.message?.toLowerCase() ?? '';
    return (
      message.includes('failed to fetch dynamically imported module') ||
      message.includes('importing a module script failed') ||
      message.includes('failed to load module script') ||
      message.includes('chunkloaderror')
    );
  }

  private async resetAppRuntime() {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations.map(async (registration) => {
          await registration.update().catch(() => undefined);
          await registration.unregister().catch(() => undefined);
        }),
      );
    }

    if ('caches' in window) {
      const cacheKeys = await caches.keys();
      await Promise.all(
        cacheKeys
          .filter((key) => key.startsWith('divine-connect-'))
          .map((key) => caches.delete(key)),
      );
    }
  }

  private async recoverFromChunkError() {
    if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') {
      return;
    }

    if (sessionStorage.getItem(this.recoveryStorageKey) === 'done') {
      return;
    }

    sessionStorage.setItem(this.recoveryStorageKey, 'done');
    await this.resetAppRuntime();
    window.location.reload();
  }

  private handleRetry = async () => {
    if (this.isChunkLoadError(this.state.error)) {
      await this.resetAppRuntime();
    }

    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(this.recoveryStorageKey);
    }

    window.location.reload();
  }

  render() {
    if (this.state.hasError) {
      const errorMessage =
        this.state.error?.message || 'Something went wrong while loading the DivineConnect experience.';

      return (
        <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4 py-10">
          <div className="w-full max-w-lg rounded-[2.25rem] border border-stone-200 bg-white p-8 text-center shadow-2xl shadow-stone-900/10">
            <div className="mx-auto mb-5 inline-flex rounded-full bg-orange-50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.24em] text-orange-700">
              Recovery Mode
            </div>
            <h2 className="mb-4 text-3xl font-serif font-bold text-stone-900">
              Divine Connection Interrupted
            </h2>
            <p className="mx-auto mb-6 max-w-md leading-relaxed text-stone-600">{errorMessage}</p>
            <div className="rounded-[1.5rem] bg-stone-50 px-5 py-4 text-left text-sm text-stone-500">
              The page can usually be restored by refreshing the experience. If the issue persists, reopen the affected route from the main navigation.
            </div>
            <button
              onClick={() => void this.handleRetry()}
              className="mt-6 rounded-full bg-orange-500 px-6 py-3 font-bold text-white hover:bg-orange-600 transition-colors"
            >
              Retry Connection
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
