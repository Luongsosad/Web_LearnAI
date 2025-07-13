import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface NotifyProps {
  message: string | null;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

const Notify = ({ message, type = 'info', duration = 2000, onClose }: NotifyProps) => {
  const [show, setShow] = useState(message);
  const fadeAnim = new Animated.Value(1);

  useEffect(() => {
    if (message) {
      setShow(message);
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setShow(null);
          onClose();
        });
      }, duration);
      return () => clearTimeout(timer);
    } else {
      setShow(null);
    }
  }, [message, duration]);

  if (!show) return null;

  const getColor = () => {
    switch (type) {
      case 'success':
        return styles.success;
      case 'error':
        return styles.error;
      case 'info':
      default:
        return styles.info;
    }
  };

  return (
    <Animated.View style={[styles.container, getColor(), { opacity: fadeAnim }] }>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 48,
    left: '10%',
    right: '10%',
    zIndex: 9999,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  success: { backgroundColor: '#4CAF50' },
  error: { backgroundColor: '#F44336' },
  info: { backgroundColor: '#2196F3' },
});

export default Notify; 