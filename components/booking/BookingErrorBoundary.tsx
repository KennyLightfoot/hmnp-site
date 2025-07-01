"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface BookingErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface BookingErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

export class BookingErrorBoundary extends React.Component<
  BookingErrorBoundaryProps,
  BookingErrorBoundaryState
> {
  constructor(props: BookingErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): BookingErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service
    console.error('[BOOKING_ERROR_BOUNDARY]', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });

    // Send to error tracking service (e.g., Sentry, LogRocket)
    if (typeof window !== 'undefined') {
      // Track in analytics
      try {
        (window as any).gtag?.('event', 'booking_error', {
          error_message: error.message,
          error_stack: error.stack,
          component_stack: errorInfo.componentStack,
        });
      } catch (trackingError) {
        console.error('[BOOKING_ERROR_BOUNDARY] Failed to track error:', trackingError);
      }
    }

    this.setState({
      error,
      errorInfo,
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} retry={this.handleRetry} />;
      }

      return (
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-2xl mx-auto px-4">
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-800">
                  <AlertTriangle className="h-5 w-5" />
                  Booking System Error
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-red-800">
                    We encountered an unexpected error while processing your booking. 
                    Our team has been notified and is working to resolve this issue.
                  </AlertDescription>
                </Alert>

                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-medium text-gray-900 mb-2">What you can do:</h4>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                    <li>Try refreshing the page and starting your booking again</li>
                    <li>Clear your browser cache and cookies</li>
                    <li>Try using a different browser or device</li>
                    <li>Contact us directly if the problem persists</li>
                  </ul>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button 
                    onClick={this.handleRetry} 
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.href = '/'}
                    className="flex items-center gap-2"
                  >
                    <Home className="h-4 w-4" />
                    Go Home
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.href = '/contact'}
                  >
                    Contact Support
                  </Button>
                </div>

                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="mt-6">
                    <summary className="cursor-pointer font-medium text-sm text-gray-700">
                      Developer Info (Development Only)
                    </summary>
                    <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono">
                      <div className="text-red-600 font-semibold mb-2">
                        {this.state.error.message}
                      </div>
                      <pre className="whitespace-pre-wrap text-gray-700">
                        {this.state.error.stack}
                      </pre>
                      {this.state.errorInfo && (
                        <>
                          <div className="text-blue-600 font-semibold mt-4 mb-2">
                            Component Stack:
                          </div>
                          <pre className="whitespace-pre-wrap text-gray-700">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </>
                      )}
                    </div>
                  </details>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook-based error boundary for functional components
export function useErrorHandler() {
  return React.useCallback((error: Error, errorInfo: React.ErrorInfo) => {
    console.error('[BOOKING_ERROR]', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });

    // Track error in analytics
    if (typeof window !== 'undefined') {
      try {
        (window as any).gtag?.('event', 'booking_error', {
          error_message: error.message,
          error_stack: error.stack,
        });
      } catch (trackingError) {
        console.error('Failed to track error:', trackingError);
      }
    }
  }, []);
}