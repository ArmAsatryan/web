import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("App render error:", error, info.componentStack);
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
          <div className="max-w-md text-center">
            <h1 className="mb-3 text-2xl font-bold">Something went wrong</h1>
            <p className="mb-6 text-muted-foreground">
              The page could not load. Please try again.
            </p>
            <button
              type="button"
              onClick={this.handleRetry}
              className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
