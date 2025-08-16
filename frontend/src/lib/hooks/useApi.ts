import { useState, useEffect } from 'react';
import { flaskApi, FlaskApiAdapter } from '@/lib/adapters/flask-api';

export interface ApiStatus {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useApi() {
  const [status, setStatus] = useState<ApiStatus>({
    isConnected: false,
    isLoading: true,
    error: null,
  });

  const [apiMode, setApiMode] = useState<'mock' | 'flask'>(
    (process.env.NEXT_PUBLIC_API_MODE as 'mock' | 'flask') || 'mock'
  );

  // Check Flask API connection
  const checkFlaskConnection = async () => {
    try {
      setStatus(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await flaskApi.healthCheck();
      
      if (response.status === 'healthy') {
        setStatus({
          isConnected: true,
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error('Flask server not healthy');
      }
    } catch (error) {
      setStatus({
        isConnected: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // Switch API mode
  const switchToFlask = () => {
    setApiMode('flask');
    checkFlaskConnection();
  };

  const switchToMock = () => {
    setApiMode('mock');
    setStatus({
      isConnected: true,
      isLoading: false,
      error: null,
    });
  };

  // Auto-check Flask connection on mount
  useEffect(() => {
    if (apiMode === 'flask') {
      checkFlaskConnection();
    } else {
      setStatus({
        isConnected: true,
        isLoading: false,
        error: null,
      });
    }
  }, [apiMode]);

  return {
    apiMode,
    status,
    flaskApi: apiMode === 'flask' ? flaskApi : null,
    switchToFlask,
    switchToMock,
    checkFlaskConnection,
  };
}
