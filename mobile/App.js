import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const App = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Green Call CRM</Text>
      <Text style={styles.subtitle}>Mobile App Working! 🎉</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#22c55e'
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16
  },
  subtitle: {
    fontSize: 18,
    color: '#fff'
  }
});

export default App;
