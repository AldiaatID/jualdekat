import React, { type PropsWithChildren } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

/**
 * Global providers wrapper.
 * Future tasks will add: NavigationContainer, AuthProvider, etc.
 */
export function AppProviders({ children }: PropsWithChildren): React.ReactElement {
  return <SafeAreaProvider>{children}</SafeAreaProvider>;
}
