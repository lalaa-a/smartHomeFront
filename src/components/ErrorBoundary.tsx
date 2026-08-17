import { Component, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
  resetKey: number;
}

/**
 * Render/effect error boundary. Event-handler and async rejections are NOT
 * caught here — those are surfaced by the write-error toast instead.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null, resetKey: 0 };

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.warn('[ErrorBoundary]', error);
  }

  private reset = () => {
    this.setState((s) => ({ error: null, resetKey: s.resetKey + 1 }));
  };

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background px-8">
          <div className="text-center">
            <div className="mx-auto h-1.5 w-1.5 rounded-full bg-danger" />
            <p className="mt-4 font-mono text-xs uppercase tracking-[0.18em] text-danger">
              UI FAULT // RECOVERED
            </p>
            <p className="mt-3 font-sans text-base text-text-primary">
              {this.state.error.message || 'Something went wrong while rendering.'}
            </p>
            <button
              type="button"
              onClick={this.reset}
              className="mt-6 rounded-sm border border-accent-cyan px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] text-accent-cyan transition-colors hover:bg-accent-cyan hover:text-background"
            >
              RELOAD UI
            </button>
          </div>
        </div>
      );
    }
    return <div key={this.state.resetKey}>{this.props.children}</div>;
  }
}
