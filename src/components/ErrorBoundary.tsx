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
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
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
              onClick={() => window.location.reload()}
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
