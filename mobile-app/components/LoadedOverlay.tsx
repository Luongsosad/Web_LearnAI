import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

const LoadedOverlay = () => (
  <View style={styles.overlay}>
    <ActivityIndicator size="large" color="#2196F3" />
    <Text style={styles.text}>Đang xử lý...</Text>
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(29,27,27,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
  },
  text: {
    color: '#fff',
    marginTop: 12,
    fontSize: 16,
  },
});

export default LoadedOverlay; 