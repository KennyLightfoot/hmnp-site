"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  eventId: string | null;
}

/**
 * Enhanced React Error Boundary Component
 * Provides comprehensive error handling, logging, and recovery options
 */
export class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      eventId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to monitoring service if available
    this.logErrorToService(error, errorInfo);
  }

  componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;
    
    // Reset error state if resetKeys change
    if (hasError && resetKeys && prevProps.resetKeys) {
      const hasResetKeyChanged = resetKeys.some(
        (key, index) => key !== prevProps.resetKeys![index]
      );
      
      if (hasResetKeyChanged) {
        this.resetErrorBoundary();
      }
    }

    // Reset error state if props change and resetOnPropsChange is true
    if (hasError && resetOnPropsChange && prevProps !== this.props) {
      this.resetErrorBoundary();
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  private async logErrorToService(error: Error, errorInfo: ErrorInfo) {
    try {
      const errorData = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        url: typeof window !== 'undefined' ? window.location.href : '',
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
        eventId: this.state.eventId,
      };

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error Boundary - Full Error Details:', errorData);
      }

      // Send to monitoring service if configured
      if (process.env.NEXT_PUBLIC_ERROR_REPORTING_URL) {
        await fetch(process.env.NEXT_PUBLIC_ERROR_REPORTING_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(errorData),
        }).catch(err => {
          console.warn('Failed to send error to monitoring service:', err);
        });
      }
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
    }
  }

  private resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
    
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    });
  };

  private handleRetry = () => {
    this.resetErrorBoundary();
  };

  private handleRetryWithDelay = () => {
    // Show loading state briefly before retry
    this.resetTimeoutId = window.setTimeout(() => {
      this.resetErrorBoundary();
    }, 1000);
  };

  private handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  private handleReportError = () => {
    const { error, errorInfo, eventId } = this.state;
    
    if (error && typeof window !== 'undefined') {
      const subject = encodeURIComponent(`Error Report - ${eventId}`);
      const body = encodeURIComponent(
        `Error Details:\n\n` +
        `Event ID: ${eventId}\n` +
        `Error: ${error.message}\n` +
        `Stack: ${error.stack}\n` +
        `Component Stack: ${errorInfo?.componentStack}\n` +
        `URL: ${window.location.href}\n` +
        `Timestamp: ${new Date().toISOString()}`
      );
      
      window.open(`mailto:support@hmnp.com?subject=${subject}&body=${body}`);
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center bg-gray-50 rounded-lg border">
          <div className="mb-6 text-red-600">
            <AlertTriangle size={64} />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Something went wrong
          </h2>
          
          <p className="text-gray-600 mb-6 max-w-md">
            We encountered an unexpected error. Please try refreshing the page or contact our support team if the problem persists.
          </p>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-left text-sm max-w-2xl">
              <summary className="cursor-pointer font-medium text-red-800 mb-2">
                Error Details (Development Only)
              </summary>
              <div className="space-y-2">
                <div>
                  <strong>Error:</strong> {this.state.error.message}
                </div>
                <div>
                  <strong>Event ID:</strong> {this.state.eventId}
                </div>
                {this.state.error.stack && (
                  <div>
                    <strong>Stack Trace:</strong>
                    <pre className="mt-1 text-xs overflow-auto max-h-32 bg-white p-2 border rounded">
                      {this.state.error.stack}
                    </pre>
                  </div>
                )}
                {this.state.errorInfo?.componentStack && (
                  <div>
                    <strong>Component Stack:</strong>
                    <pre className="mt-1 text-xs overflow-auto max-h-32 bg-white p-2 border rounded">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}

          <div className="flex flex-wrap gap-3 justify-center">
            <Button 
              onClick={this.handleRetry}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Try Again
            </Button>
            
            <Button 
              onClick={this.handleRetryWithDelay}
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50 flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Retry in 1s
            </Button>
            
            <Button
              onClick={this.handleGoHome}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <Home size={16} />
              Go Home
            </Button>
            
            <Button
              onClick={this.handleReportError}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              Report Error
            </Button>
          </div>

          {this.state.eventId && (
            <p className="text-xs text-gray-500 mt-4">
              Error ID: {this.state.eventId}
            </p>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component for wrapping components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

/**
 * Hook for programmatically triggering error boundary
 */
export function useErrorHandler() {
  return React.useCallback((error: Error) => {
    // Re-throw the error to be caught by the nearest error boundary
    throw error;
  }, []);
}

export default ErrorBoundary;