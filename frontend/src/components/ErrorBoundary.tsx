import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box } from './UI/Box';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-200 p-4">
          <Box className="max-w-2xl w-full">
            <div className="text-center">
              <svg 
                className="w-16 h-16 mx-auto mb-4 text-red-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Oops! Có lỗi xảy ra
              </h2>
              
              <p className="text-gray-600 mb-4">
                Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left mb-4 p-3 bg-gray-100 border border-gray-400 rounded text-xs">
                  <summary className="cursor-pointer font-medium mb-2">
                    Chi tiết lỗi (Development)
                  </summary>
                  <pre className="overflow-auto">
                    <code>{this.state.error.toString()}</code>
                    {this.state.errorInfo && (
                      <code className="block mt-2">
                        {this.state.errorInfo.componentStack}
                      </code>
                    )}
                  </pre>
                </details>
              )}

              <div className="flex gap-2 justify-center">
                <Box
                  as="button"
                  onClick={this.handleReset}
                  className="bg-gray-300 hover:bg-gray-400"
                >
                  Thử lại
                </Box>
                <Box
                  as="button"
                  onClick={() => window.location.href = '/'}
                  className="bg-gray-300 hover:bg-gray-400"
                >
                  Về trang chủ
                </Box>
              </div>
            </div>
          </Box>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

