import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { SessionStorage } from '../storage/sessionStorage';
import LoadedOverlay from '../components/LoadedOverlay';
import Notify from '../components/Notify';
import { User } from '../types/User';

export default function AccountScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ username: '', email: '' });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const userData = await SessionStorage.getUser();
      setUser(userData);
      if (userData) {
        setEditForm({ username: userData.username, email: userData.email });
      }
    } catch (error) {
      setMessage('Lỗi tải thông tin!');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:6789/a/logout', {}, { withCredentials: true });
      await SessionStorage.clearUser();
      setMessage('Đăng xuất thành công!');
      setTimeout(() => router.push('/login'), 1000);
    } catch (error) {
      setMessage('Lỗi đăng xuất!');
    }
  };

  const updateProfile = async () => {
    if (!editForm.username || !editForm.email) {
      setMessage('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.put('http://localhost:6789/a/profile', editForm, { withCredentials: true });
      if (res.data.success) {
        const updatedUser = { ...user, ...editForm };
        await SessionStorage.saveUser(updatedUser);
        setUser(updatedUser);
        setShowEditModal(false);
        setMessage('Cập nhật thành công!');
      }
    } catch (error) {
      setMessage('Lỗi cập nhật!');
    } finally {
      setLoading(false);
    }
  };

  const getPlanName = (planId: number) => {
    switch (planId) {
      case 1: return 'Free';
      case 2: return 'Basic';
      case 3: return 'Pro';
      default: return 'Free';
    }
  };

  const getPlanColor = (planId: number) => {
    switch (planId) {
      case 1: return '#666';
      case 2: return '#FFD600';
      case 3: return '#00C853';
      default: return '#666';
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tài khoản</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Vui lòng đăng nhập</Text>
          <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/login')}>
            <Text style={styles.loginButtonText}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
        {loading && <LoadedOverlay />}
        <Notify message={message} type="info" duration={2000} onClose={() => setMessage(null)} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tài khoản</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{user.username.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.username}>{user.username}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Gói dịch vụ:</Text>
            <View style={[styles.planBadge, { backgroundColor: getPlanColor(user.plan_id) }]}>
              <Text style={styles.planText}>{getPlanName(user.plan_id)}</Text>
            </View>
          </View>

          {user.plan_expires_at && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Hết hạn:</Text>
              <Text style={styles.infoValue}>
                {new Date(user.plan_expires_at).toLocaleDateString('vi-VN')}
              </Text>
            </View>
          )}

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Vai trò:</Text>
            <Text style={styles.infoValue}>{user.role}</Text>
          </View>
        </View>

        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionButton} onPress={() => setShowEditModal(true)}>
            <Text style={styles.actionButtonText}>Chỉnh sửa thông tin</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/plans')}>
            <Text style={styles.actionButtonText}>Nâng cấp gói</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={showEditModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chỉnh sửa thông tin</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Tên người dùng"
              placeholderTextColor="#888"
              value={editForm.username}
              onChangeText={(text) => setEditForm(prev => ({ ...prev, username: text }))}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Email"
              placeholderTextColor="#888"
              value={editForm.email}
              onChangeText={(text) => setEditForm(prev => ({ ...prev, email: text }))}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowEditModal(false)}>
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={updateProfile}>
                <Text style={styles.saveButtonText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {loading && <LoadedOverlay />}
      <Notify message={message} type="info" duration={2000} onClose={() => setMessage(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#181818' },
  header: {
    padding: 16,
    backgroundColor: '#121111',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  content: { flex: 1 },
  contentContainer: { padding: 16 },
  profileSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  username: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  email: { color: '#ccc', fontSize: 16 },
  infoSection: {
    backgroundColor: '#232323',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: { color: '#ccc', fontSize: 16 },
  infoValue: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  planBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  planText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  actionsSection: { gap: 12 },
  actionButton: {
    backgroundColor: '#232323',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  actionButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  logoutButton: {
    backgroundColor: '#F44336',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  logoutButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: { color: '#888', fontSize: 16, marginBottom: 16 },
  loginButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  loginButtonText: { color: '#fff', fontWeight: 'bold' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#232323',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  modalInput: {
    backgroundColor: '#333',
    color: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelButton: { flex: 1, backgroundColor: '#666', padding: 12, borderRadius: 8, alignItems: 'center' },
  cancelButtonText: { color: '#fff', fontWeight: 'bold' },
  saveButton: { flex: 1, backgroundColor: '#4CAF50', padding: 12, borderRadius: 8, alignItems: 'center' },
  saveButtonText: { color: '#fff', fontWeight: 'bold' },
}); 