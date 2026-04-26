import React, { Component, ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './lib/i18n';
import { ThemeProvider } from './contexts/ThemeContext';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50 p-6">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl border border-stone-200">
            <h1 className="text-2xl font-serif text-stone-900 mb-4">Divine Disconnect</h1>
            <p className="text-stone-600 mb-6 text-sm leading-relaxed">
              Something went wrong while connecting with the sacred. 
              {this.state.error && <span className="block mt-2 font-mono text-xs text-red-500 bg-red-50 p-2 rounded">{this.state.error.message}</span>}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-stone-900 text-stone-50 py-3 rounded-xl font-medium"
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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
