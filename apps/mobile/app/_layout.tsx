import { Slot } from 'expo-router';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#0ea5e9', // Medical Blue
    secondary: '#0284c7',
  },
};

export default function RootLayout() {
  return (
    <PaperProvider theme={theme}>
      <Slot />
      <StatusBar style="auto" />
    </PaperProvider>
  );
}
