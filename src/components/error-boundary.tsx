"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-8">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 max-w-lg w-full">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <h2 className="text-lg font-semibold text-red-800">
                エラーが発生しました
              </h2>
            </div>

            <p className="text-sm text-red-700 mb-4">
              ページの読み込み中にエラーが発生しました。
            </p>

            {this.state.error && (
              <div className="mb-4 p-3 bg-red-100 rounded text-xs font-mono text-red-800 overflow-auto max-h-32">
                <strong>Error:</strong> {this.state.error.message}
              </div>
            )}

            {this.state.errorInfo && (
              <details className="mb-4">
                <summary className="text-xs text-red-600 cursor-pointer">
                  詳細を表示
                </summary>
                <pre className="mt-2 p-2 bg-red-100 rounded text-xs overflow-auto max-h-48">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            <div className="flex gap-2">
              <Button
                onClick={this.handleReset}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                再試行
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="default"
                size="sm"
              >
                ページを再読み込み
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
