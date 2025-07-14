import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { SessionStorage } from '../storage/sessionStorage';
import LoadedOverlay from '../components/LoadedOverlay';
import Notify from '../components/Notify';

interface VoiceMessage {
  id: string;
  text: string;
  audioUrl?: string;
  isUser: boolean;
  timestamp: Date;
}

export default function ConversationScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    SessionStorage.getUser().then(setUser);
  }, []);

  const startRecording = () => {
    setIsRecording(true);
    setMessage('Bắt đầu ghi âm...');
    // TODO: Implement actual recording logic
  };

  const stopRecording = async () => {
    setIsRecording(false);
    setLoading(true);
    
    try {
      // TODO: Implement actual recording stop and upload
      const mockAudioUrl = 'mock-audio-url';
      
      const userMessage: VoiceMessage = {
        id: Date.now().toString(),
        text: 'Tin nhắn voice của bạn',
        audioUrl: mockAudioUrl,
        isUser: true,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMessage]);

      // Simulate AI response
      setTimeout(() => {
        const aiMessage: VoiceMessage = {
          id: (Date.now() + 1).toString(),
          text: 'Phản hồi từ AI',
          audioUrl: 'ai-audio-url',
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
        setLoading(false);
      }, 2000);

    } catch (error) {
      setMessage('Lỗi ghi âm!');
      setLoading(false);
    }
  };

  const playAudio = (audioUrl: string) => {
    // TODO: Implement audio playback
    setMessage('Phát âm thanh...');
  };

  const renderMessage = ({ item }: { item: VoiceMessage }) => (
    <View style={[styles.messageContainer, item.isUser ? styles.userMessage : styles.aiMessage]}>
      <Text style={[styles.messageText, item.isUser ? styles.userText : styles.aiText]}>
        {item.text}
      </Text>
      {item.audioUrl && (
        <TouchableOpacity 
          style={styles.playButton} 
          onPress={() => playAudio(item.audioUrl!)}
        >
          <Text style={styles.playButtonText}>▶ Phát</Text>
        </TouchableOpacity>
      )}
      <Text style={styles.timestamp}>
        {item.timestamp.toLocaleTimeString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Luyện giao tiếp với AI</Text>
      </View>
      
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        style={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />
      
      <View style={styles.controlsContainer}>
        <TouchableOpacity 
          style={[styles.recordButton, isRecording && styles.recordingButton]} 
          onPress={isRecording ? stopRecording : startRecording}
          disabled={loading}
        >
          <Text style={styles.recordButtonText}>
            {isRecording ? '⏹ Dừng' : '🎤 Ghi âm'}
          </Text>
        </TouchableOpacity>
      </View>
      
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
  messagesList: { flex: 1, padding: 16 },
  messageContainer: {
    marginBottom: 12,
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#FF9800',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#333',
  },
  messageText: {
    fontSize: 16,
    marginBottom: 8,
  },
  userText: { color: '#fff' },
  aiText: { color: '#fff' },
  playButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
  },
  controlsContainer: {
    padding: 16,
    backgroundColor: '#121111',
    alignItems: 'center',
  },
  recordButton: {
    backgroundColor: '#F44336',
    borderRadius: 50,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingButton: {
    backgroundColor: '#4CAF50',
  },
  recordButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
}); 