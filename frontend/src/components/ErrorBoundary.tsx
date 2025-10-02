import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-red-500/30 p-8 shadow-2xl">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-500/20 to-rose-500/20 flex items-center justify-center border border-red-500/30">
                <span className="text-5xl">⚠️</span>
              </div>
              <h2 className="text-2xl font-black text-white mb-3">Oops! Something went wrong</h2>
              <p className="text-gray-400 mb-6">
                The application encountered an unexpected error. Please refresh the page to try again.
              </p>
              <div className="bg-gray-900/50 rounded-lg p-4 mb-6 border border-gray-700/50">
                <p className="text-xs text-red-400 font-mono break-all">
                  {this.state.error?.message || 'Unknown error'}
                </p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 rounded-xl font-bold text-white transition-all duration-300 hover:scale-105 shadow-lg"
              >
                🔄 Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
