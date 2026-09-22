import React, {StrictMode, Component, ReactNode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Terminal Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen bg-black text-[#00ff41] font-mono p-8 flex flex-col justify-center items-center">
          <div className="border border-[#00ff41] p-6 max-w-lg w-full space-y-4">
            <h1 className="text-lg font-bold">БІБЛІЯ // ПОМИЛКА ТЕРМІНАЛА</h1>
            <p className="text-sm opacity-80">{this.state.error?.message || 'Невідома помилка'}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 border border-[#00ff41] hover:bg-[#00ff41]/20 text-xs font-bold uppercase"
            >
              Перезавантажити термінал
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
