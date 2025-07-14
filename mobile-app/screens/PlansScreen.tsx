import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { SessionStorage } from '../storage/sessionStorage';
import LoadedOverlay from '../components/LoadedOverlay';
import Notify from '../components/Notify';
import { User } from '../types/User';

interface Plan {
  id: number;
  name: string;
  price: number;
  duration: number;
  features: string[];
  color: string;
}

export default function PlansScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const plans: Plan[] = [
    {
      id: 1,
      name: 'Free',
      price: 0,
      duration: 0,
      features: [
        'Trò chuyện với AI (5 tin nhắn/ngày)',
        'Thẻ ghi nhớ cơ bản',
        'Hỗ trợ email',
      ],
      color: '#666',
    },
    {
      id: 2,
      name: 'Basic',
      price: 99000,
      duration: 30,
      features: [
        'Trò chuyện với AI không giới hạn',
        'Luyện giao tiếp với AI',
        'Thẻ ghi nhớ nâng cao',
        'Đọc truyện song ngữ',
        'Hỗ trợ ưu tiên',
      ],
      color: '#FFD600',
    },
    {
      id: 3,
      name: 'Pro',
      price: 199000,
      duration: 30,
      features: [
        'Tất cả tính năng Basic',
        'Kiểm tra phát âm',
        'Bài tập luyện tập nâng cao',
        'Hỗ trợ 24/7',
        'Tùy chỉnh nội dung học',
      ],
      color: '#00C853',
    },
  ];

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await SessionStorage.getUser();
      setUser(userData);
    } catch (error) {
      setMessage('Lỗi tải thông tin!');
    }
  };

  const handleSubscribe = async (planId: number) => {
    if (!user) {
      setMessage('Vui lòng đăng nhập!');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:6789/o/create-order', {
        plan_id: planId,
      }, { withCredentials: true });

      if (res.data.success) {
        setMessage('Đăng ký gói thành công!');
        // Reload user data to get updated plan
        const updatedUser = await SessionStorage.getUser();
        setUser(updatedUser);
      } else {
        setMessage('Lỗi đăng ký gói!');
      }
    } catch (error) {
      setMessage('Lỗi đăng ký gói!');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'Miễn phí';
    return `${price.toLocaleString('vi-VN')} VNĐ/tháng`;
  };

  const isCurrentPlan = (planId: number) => {
    return user?.plan_id === planId;
  };

  const isUpgrade = (planId: number) => {
    return user?.plan_id && planId > user.plan_id;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gói dịch vụ</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.subtitle}>Chọn gói phù hợp với nhu cầu học tập của bạn</Text>

        {plans.map((plan) => (
          <View key={plan.id} style={[styles.planCard, { borderColor: plan.color }]}>
            <View style={[styles.planHeader, { backgroundColor: plan.color }]}>
              <Text style={styles.planName}>{plan.name}</Text>
              <Text style={styles.planPrice}>{formatPrice(plan.price)}</Text>
            </View>

            <View style={styles.planFeatures}>
              {plan.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Text style={styles.featureText}>✓ {feature}</Text>
                </View>
              ))}
            </View>

            <View style={styles.planActions}>
              {isCurrentPlan(plan.id) ? (
                <View style={styles.currentPlanBadge}>
                  <Text style={styles.currentPlanText}>Gói hiện tại</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.subscribeButton,
                    { backgroundColor: plan.color },
                    isUpgrade(plan.id) && styles.upgradeButton,
                  ]}
                  onPress={() => handleSubscribe(plan.id)}
                  disabled={loading}
                >
                  <Text style={styles.subscribeButtonText}>
                    {isUpgrade(plan.id) ? 'Nâng cấp' : 'Đăng ký'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Lưu ý:</Text>
          <Text style={styles.infoText}>
            • Gói Basic và Pro có thời hạn 30 ngày kể từ ngày đăng ký
          </Text>
          <Text style={styles.infoText}>
            • Bạn có thể nâng cấp gói bất cứ lúc nào
          </Text>
          <Text style={styles.infoText}>
            • Hỗ trợ thanh toán qua nhiều phương thức
          </Text>
        </View>
      </ScrollView>

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
  subtitle: { color: '#ccc', fontSize: 16, textAlign: 'center', marginBottom: 24 },
  planCard: {
    backgroundColor: '#232323',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 2,
    overflow: 'hidden',
  },
  planHeader: {
    padding: 20,
    alignItems: 'center',
  },
  planName: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  planPrice: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  planFeatures: {
    padding: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: { color: '#fff', fontSize: 14, flex: 1 },
  planActions: {
    padding: 20,
    paddingTop: 0,
  },
  subscribeButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  upgradeButton: {
    backgroundColor: '#FF9800',
  },
  subscribeButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  currentPlanBadge: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  currentPlanText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  infoSection: {
    backgroundColor: '#232323',
    borderRadius: 12,
    padding: 20,
    marginTop: 16,
  },
  infoTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  infoText: { color: '#ccc', fontSize: 14, marginBottom: 8, lineHeight: 20 },
}); 