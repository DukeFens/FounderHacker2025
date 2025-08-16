'use client';

import { useApi } from '@/lib/hooks/useApi';

export function ApiStatus() {
  const { apiMode, status, switchToFlask, switchToMock, checkFlaskConnection } = useApi();

  return (
    <div className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg p-4 border">
      <div className="flex items-center space-x-3">
        {/* Status Indicator */}
        <div className="flex items-center space-x-2">
          <div 
            className={`w-3 h-3 rounded-full ${
              status.isLoading 
                ? 'bg-yellow-400 animate-pulse' 
                : status.isConnected 
                ? 'bg-green-400' 
                : 'bg-red-400'
            }`}
          />
          <span className="text-sm font-medium">
            {status.isLoading ? 'Connecting...' : 
             status.isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        {/* API Mode Badge */}
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          apiMode === 'flask' 
            ? 'bg-blue-100 text-blue-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {apiMode.toUpperCase()}
        </span>
      </div>

      {/* Error Message */}
      {status.error && (
        <div className="mt-2 text-xs text-red-600">
          Error: {status.error}
        </div>
      )}

      {/* Mode Switcher */}
      <div className="mt-3 flex space-x-2">
        <button
          onClick={switchToMock}
          className={`px-3 py-1 text-xs rounded ${
            apiMode === 'mock'
              ? 'bg-gray-200 text-gray-800'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Mock
        </button>
        <button
          onClick={switchToFlask}
          className={`px-3 py-1 text-xs rounded ${
            apiMode === 'flask'
              ? 'bg-blue-200 text-blue-800'
              : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
          }`}
        >
          Flask
        </button>
        {apiMode === 'flask' && (
          <button
            onClick={checkFlaskConnection}
            className="px-3 py-1 text-xs rounded bg-green-100 text-green-600 hover:bg-green-200"
          >
            Retry
          </button>
        )}
      </div>

      {/* Connection Info */}
      {apiMode === 'flask' && (
        <div className="mt-2 text-xs text-gray-500">
          Flask API: {process.env.NEXT_PUBLIC_FLASK_API_URL || 'http://localhost:5000/api'}
        </div>
      )}
    </div>
  );
}
