import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SessionStorage } from '../storage/sessionStorage';
import { User } from '../types/User';
import LoadedOverlay from '../components/LoadedOverlay';
import Notify from '../components/Notify';
import PlanBadge from '../components/PlanBadge';

export default function DashboardScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    SessionStorage.getUser().then((u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const handleServiceClick = (serviceName: string) => {
    if (!user?.username) {
      setMessage('Vui lòng đăng nhập để sử dụng tính năng này!');
    } else {
      setMessage(`Bạn đã click vào ${serviceName}`);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Learning by AI</Text>
        {user?.username ? (
          <Text style={styles.username}>{user.username || 'bạn'}</Text>
        ) : (
          <TouchableOpacity
            style={styles.signInBtn}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.signInText}>Sign In</Text>
          </TouchableOpacity>
        )}
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.welcome}>Chào mừng bạn đến với ứng dụng Learning By AI</Text>
        <Text style={styles.desc}>Khám phá các tính năng học tập thông minh:</Text>
        {/* Chat with AI */}
        <TouchableOpacity style={styles.card} onPress={() => {
          if (user && user.plan_id >= 1) handleServiceClick('Trò chuyện với AI');
          else setMessage('Bạn cần nâng cấp gói dịch vụ để sử dụng tính năng này!');
        }}>
          <Text style={styles.cardTitle}>Trò chuyện với AI</Text>
          <Text style={styles.cardDesc}>Trao đổi với AI để học tiếng Anh thông minh hơn.</Text>
          <PlanBadge level={1} />
        </TouchableOpacity>
        {/* AI Voice Conversation */}
        <TouchableOpacity style={styles.card} onPress={() => {
          if (user && user.plan_id >= 2) handleServiceClick('Luyện giao tiếp với AI');
          else setMessage('Bạn cần nâng cấp gói dịch vụ để sử dụng tính năng này!');
        }}>
          <Text style={styles.cardTitle}>Luyện giao tiếp với AI</Text>
          <Text style={styles.cardDesc}>Luyện nói tiếng Anh trực tiếp với AI qua hội thoại.</Text>
          <PlanBadge level={2} />
        </TouchableOpacity>
        {/* Pronunciation Practice */}
        <TouchableOpacity style={styles.card} onPress={() => setMessage('Tính năng đang phát triển!')}>
          <Text style={styles.cardTitle}>Kiểm tra phát âm</Text>
          <Text style={styles.cardDesc}>Ghi âm và so sánh phát âm của bạn với người bản xứ.</Text>
          <PlanBadge level={3} />
        </TouchableOpacity>
        {/* Flashcards */}
        <TouchableOpacity style={styles.card} onPress={() => {
          if (user && user.plan_id >= 1) handleServiceClick('Thẻ ghi nhớ');
          else setMessage('Bạn cần nâng cấp gói dịch vụ để sử dụng tính năng này!');
        }}>
          <Text style={styles.cardTitle}>Thẻ ghi nhớ</Text>
          <Text style={styles.cardDesc}>Ôn tập từ vựng hiệu quả qua hệ thống flashcard.</Text>
          <PlanBadge level={1} />
        </TouchableOpacity>
        {/* Bilingual Stories */}
        <TouchableOpacity style={styles.card} onPress={() => setMessage('Tính năng đang phát triển!')}>
          <Text style={styles.cardTitle}>Đọc truyện song ngữ</Text>
          <Text style={styles.cardDesc}>Cải thiện kỹ năng đọc với truyện song ngữ Anh-Việt.</Text>
          <PlanBadge level={2} />
        </TouchableOpacity>
        {/* Quiz */}
        <TouchableOpacity style={styles.card} onPress={() => {
          if (user && user.plan_id >= 3) handleServiceClick('Bài tập luyện tập');
          else setMessage('Bạn cần nâng cấp gói dịch vụ để sử dụng tính năng này!');
        }}>
          <Text style={styles.cardTitle}>Bài tập luyện tập</Text>
          <Text style={styles.cardDesc}>Kiểm tra kiến thức của bạn với các câu hỏi điền khuyết đa dạng.</Text>
          <PlanBadge level={3} />
        </TouchableOpacity>
      </ScrollView>
      <Text style={styles.footer}>© 2025 Learning By AI. All rights reserved.</Text>
      {loading && <LoadedOverlay />}
      <Notify message={message} type="info" duration={2000} onClose={() => setMessage(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#181818' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#121111',
  },
  headerTitle: { color: '#fff', fontWeight: 'bold', fontSize: 20 },
  username: { color: '#ccc', fontSize: 16 },
  signInBtn: { backgroundColor: '#F87171', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 4 },
  signInText: { color: '#fff', fontWeight: 'bold' },
  scrollContent: { padding: 16 },
  welcome: { color: '#ccc', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  desc: { color: '#aaa', marginBottom: 12 },
  card: {
    backgroundColor: '#232323',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    position: 'relative',
  },
  cardTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  cardDesc: { color: '#bbb', fontSize: 13, marginBottom: 4 },
  footer: { color: '#888', textAlign: 'center', padding: 12, fontSize: 13 },
}); 