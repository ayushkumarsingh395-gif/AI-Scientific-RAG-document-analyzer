import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-nexus-900 text-slate-200 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-nexus-800 border border-rose-500/40 rounded-2xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
              <AlertTriangle size={28} />
            </div>
            <h2 className="text-xl font-semibold text-white">Something went wrong</h2>
            <p className="text-xs text-slate-400">
              An unexpected error occurred in the workspace interface.
            </p>
            {this.state.error && (
              <div className="p-3 bg-nexus-900/80 rounded-lg border border-nexus-500/30 text-[11px] font-mono text-rose-300 text-left overflow-auto max-h-32">
                {this.state.error.toString()}
              </div>
            )}
            <button
              type="button"
              onClick={this.handleReload}
              className="w-full py-2.5 px-4 bg-primary-500 hover:bg-primary-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} /> Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
