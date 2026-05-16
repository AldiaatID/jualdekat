import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';

import { AppProviders } from '@/app/providers';
import { RootNavigator } from '@/navigation/RootNavigator';
import { colors } from '@/constants/colors';

export default function App(): React.ReactElement {
  return (
    <AppProviders>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <RootNavigator />
      </View>
    </AppProviders>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
