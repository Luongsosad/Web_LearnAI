import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { SessionStorage } from '../storage/sessionStorage';
import LoadedOverlay from '../components/LoadedOverlay';
import Notify from '../components/Notify';
import { API_ENDPOINTS } from '../config/api';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await axios.post(API_ENDPOINTS.LOGIN, { email, password }, { withCredentials: true });
      if (res.data && res.data.user) {
        await SessionStorage.saveUser(res.data.user);
        setMessage('Đăng nhập thành công!');
        setTimeout(() => router.push('/dashboard'), 1000);
      } else {
        setMessage('Sai thông tin đăng nhập!');
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage('Lỗi đăng nhập!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng nhập</Text>
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Mật khẩu" value={password} onChangeText={setPassword} secureTextEntry />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Đăng nhập</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/register')} style={styles.linkBtn}>
        <Text style={styles.linkText}>Chưa có tài khoản? Đăng ký</Text>
      </TouchableOpacity>
      {loading && <LoadedOverlay />}
      <Notify message={message} type="info" duration={2000} onClose={() => setMessage(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#181818', padding: 16 },
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 24 },
  input: { width: '100%', backgroundColor: '#232323', color: '#fff', borderRadius: 8, padding: 12, marginBottom: 12 },
  button: { backgroundColor: '#2196F3', borderRadius: 8, padding: 12, width: '100%', alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  linkBtn: { marginTop: 16 },
  linkText: { color: '#90caf9', fontSize: 14 },
}); 