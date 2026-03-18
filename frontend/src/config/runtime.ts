export type AppRuntimeMode = 'aws' | 'local-api' | 'mock';

const runtimeModeFromEnv = import.meta.env.VITE_APP_RUNTIME_MODE;

const resolveRuntimeMode = (): AppRuntimeMode => {
  if (runtimeModeFromEnv === 'aws' || runtimeModeFromEnv === 'local-api' || runtimeModeFromEnv === 'mock') {
    return runtimeModeFromEnv;
  }

  return import.meta.env.DEV && !import.meta.env.VITE_API_URL ? 'mock' : 'aws';
};

export const appRuntimeMode = resolveRuntimeMode();
export const apiUrl =
  import.meta.env.VITE_API_URL || (appRuntimeMode === 'local-api' ? 'http://localhost:4010' : '');

export const runtimeDescription =
  appRuntimeMode === 'mock'
    ? 'Mock data persisted in browser storage'
    : appRuntimeMode === 'local-api'
      ? `Local API at ${apiUrl}`
      : `AWS API at ${apiUrl || 'not configured'}`;
