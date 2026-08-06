import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppErrorBoundary } from './src/components/AppErrorBoundary';
import { AppNavigator } from './src/navigation/AppNavigator';
import { I18nProvider } from './src/i18n/I18nProvider';
import { LivingMemoryProvider } from './src/state/LivingMemoryProvider';
import { RemoteContentProvider } from './src/state/RemoteContentProvider';

export default function App() {
  return (
    <AppErrorBoundary>
      <SafeAreaProvider>
        <RemoteContentProvider>
          <I18nProvider>
            <LivingMemoryProvider>
              <AppNavigator />
            </LivingMemoryProvider>
          </I18nProvider>
        </RemoteContentProvider>
      </SafeAreaProvider>
    </AppErrorBoundary>
  );
}
