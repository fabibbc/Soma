import React from 'react';
import { SupplementProvider } from './store/SupplementContext';
import HomeScreen from './screens/HomeScreen';

export default function App() {
  return (
    <SupplementProvider>
      <HomeScreen />
    </SupplementProvider>
  );
}
