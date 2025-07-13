import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PlanBadge = ({ level }: { level: number }) => {
  let text = 'Free';
  let color = styles.free;
  if (level === 2) {
    text = 'Basic';
    color = styles.basic;
  } else if (level === 3) {
    text = 'Pro';
    color = styles.pro;
  }
  return (
    <View style={[styles.badge, color]}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    borderTopRightRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    zIndex: 10,
  },
  text: {
    fontSize: 11,
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  free: { backgroundColor: '#666' },
  basic: { backgroundColor: '#FFD600' },
  pro: { backgroundColor: '#00C853' },
});

export default PlanBadge; 