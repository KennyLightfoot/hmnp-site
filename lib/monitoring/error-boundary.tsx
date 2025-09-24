"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { trackError } from '@/lib/utils/errorTracking';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  context?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * Production-ready error boundary with comprehensive error tracking
 * Catches JavaScript errors anywhere in the child component tree
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      context: this.props.context
    });

    // Track error in monitoring system
    trackError(error, {
      component: 'ErrorBoundary',
      action: 'component_error',
      metadata: {
        context: this.props.context,
        componentStack: errorInfo.componentStack,
        errorBoundary: true
      }
    });

    // Update state with error details
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Something went wrong
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              We're sorry for the inconvenience. Our team has been notified and is working on a fix.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: undefined, errorInfo: undefined });
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Try again
            </button>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm font-medium text-gray-700">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                  {this.state.errorInfo?.componentStack && (
                    <>
                      {'\n\nComponent Stack:'}
                      {this.state.errorInfo.componentStack}
                    </>
                  )}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component to wrap components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  context?: string,
  fallback?: ReactNode
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary context={context} fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

/**
 * Hook to manually report errors to the error tracking system
 */
export function useErrorReporting(context?: string) {
  const reportError = React.useCallback((error: Error | unknown, metadata?: Record<string, any>) => {
    trackError(error, {
      component: context || 'useErrorReporting',
      action: 'manual_error_report',
      metadata
    });
  }, [context]);

  return { reportError };
}

/**
 * Specialized error boundaries for different parts of the app
 */
export const BookingErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary 
    context="booking-system"
    fallback={
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <h3 className="text-red-800 font-medium mb-2">Booking System Error</h3>
        <p className="text-red-700 text-sm">
          We're experiencing issues with the booking system. Please try refreshing the page or contact support.
        </p>
      </div>
    }
  >
    {children}
  </ErrorBoundary>
);

export const PaymentErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary 
    context="payment-system"
    fallback={
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <h3 className="text-yellow-800 font-medium mb-2">Payment System Error</h3>
        <p className="text-yellow-700 text-sm">
          There was an issue processing your payment. Please try again or use a different payment method.
        </p>
      </div>
    }
  >
    {children}
  </ErrorBoundary>
);

export const DashboardErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary 
    context="dashboard"
    fallback={
      <div className="bg-gray-50 border border-gray-200 rounded-md p-6 text-center">
        <h3 className="text-gray-800 font-medium mb-2">Dashboard Error</h3>
        <p className="text-gray-600 text-sm">
          Unable to load dashboard data. Please refresh the page.
        </p>
      </div>
    }
  >
    {children}
  </ErrorBoundary>
);