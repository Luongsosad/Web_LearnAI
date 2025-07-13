import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Modal, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { SessionStorage } from '../storage/sessionStorage';
import LoadedOverlay from '../components/LoadedOverlay';
import Notify from '../components/Notify';

interface Flashcard {
  id: string;
  word: string;
  meaning: string;
  example: string;
  isLearned: boolean;
}

export default function FlashcardsScreen() {
  const router = useRouter();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCard, setCurrentCard] = useState<Flashcard | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [newCard, setNewCard] = useState({ word: '', meaning: '', example: '' });

  useEffect(() => {
    loadFlashcards();
  }, []);

  const loadFlashcards = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:6789/w/flashcards', { withCredentials: true });
      if (res.data.success) {
        setFlashcards(res.data.flashcards || []);
        if (res.data.flashcards?.length > 0) {
          setCurrentCard(res.data.flashcards[0]);
        }
      }
    } catch (error) {
      setMessage('Lỗi tải thẻ ghi nhớ!');
    } finally {
      setLoading(false);
    }
  };

  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  const markAsLearned = async (cardId: string) => {
    try {
      await axios.put(`http://localhost:6789/w/flashcards/${cardId}/learn`, {}, { withCredentials: true });
      setFlashcards(prev => prev.map(card => 
        card.id === cardId ? { ...card, isLearned: true } : card
      ));
      setMessage('Đã đánh dấu học xong!');
    } catch (error) {
      setMessage('Lỗi cập nhật!');
    }
  };

  const addNewCard = async () => {
    if (!newCard.word || !newCard.meaning) {
      setMessage('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    try {
      const res = await axios.post('http://localhost:6789/w/flashcards', newCard, { withCredentials: true });
      if (res.data.success) {
        const addedCard = res.data.flashcard;
        setFlashcards(prev => [...prev, addedCard]);
        setNewCard({ word: '', meaning: '', example: '' });
        setShowAddModal(false);
        setMessage('Thêm thẻ thành công!');
      }
    } catch (error) {
      setMessage('Lỗi thêm thẻ!');
    }
  };

  const renderCard = ({ item }: { item: Flashcard }) => (
    <TouchableOpacity 
      style={[styles.cardItem, item.isLearned && styles.learnedCard]}
      onPress={() => {
        setCurrentCard(item);
        setIsFlipped(false);
      }}
    >
      <Text style={styles.cardWord}>{item.word}</Text>
      <Text style={styles.cardMeaning}>{item.meaning}</Text>
      {item.isLearned && <Text style={styles.learnedBadge}>✓ Đã học</Text>}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thẻ ghi nhớ</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <Text style={styles.addButtonText}>+ Thêm</Text>
        </TouchableOpacity>
      </View>

      {currentCard ? (
        <View style={styles.cardContainer}>
          <TouchableOpacity style={styles.flashcard} onPress={flipCard}>
            <Text style={styles.cardText}>
              {isFlipped ? currentCard.meaning : currentCard.word}
            </Text>
            {isFlipped && currentCard.example && (
              <Text style={styles.exampleText}>VD: {currentCard.example}</Text>
            )}
          </TouchableOpacity>
          <View style={styles.cardControls}>
            <TouchableOpacity 
              style={styles.learnButton} 
              onPress={() => markAsLearned(currentCard.id)}
            >
              <Text style={styles.learnButtonText}>
                {currentCard.isLearned ? 'Đã học' : 'Đánh dấu học'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Chưa có thẻ ghi nhớ nào</Text>
        </View>
      )}

      <FlatList
        data={flashcards}
        renderItem={renderCard}
        keyExtractor={item => item.id}
        style={styles.cardsList}
        horizontal
        showsHorizontalScrollIndicator={false}
      />

      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Thêm thẻ mới</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Từ vựng"
              placeholderTextColor="#888"
              value={newCard.word}
              onChangeText={(text) => setNewCard(prev => ({ ...prev, word: text }))}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Nghĩa"
              placeholderTextColor="#888"
              value={newCard.meaning}
              onChangeText={(text) => setNewCard(prev => ({ ...prev, meaning: text }))}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Ví dụ (tùy chọn)"
              placeholderTextColor="#888"
              value={newCard.example}
              onChangeText={(text) => setNewCard(prev => ({ ...prev, example: text }))}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAddModal(false)}>
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={addNewCard}>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#121111',
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  addButton: { backgroundColor: '#4CAF50', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
  cardContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  flashcard: {
    backgroundColor: '#232323',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 300,
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardText: { color: '#fff', fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  exampleText: { color: '#ccc', fontSize: 14, marginTop: 8, textAlign: 'center' },
  cardControls: { flexDirection: 'row', gap: 12 },
  learnButton: { backgroundColor: '#FF9800', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 },
  learnButtonText: { color: '#fff', fontWeight: 'bold' },
  cardsList: { maxHeight: 120, paddingHorizontal: 16 },
  cardItem: {
    backgroundColor: '#232323',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    minWidth: 100,
    position: 'relative',
  },
  learnedCard: { backgroundColor: '#2E7D32' },
  cardWord: { color: '#fff', fontWeight: 'bold', marginBottom: 4 },
  cardMeaning: { color: '#ccc', fontSize: 12 },
  learnedBadge: { color: '#4CAF50', fontSize: 10, position: 'absolute', top: 4, right: 4 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#888', fontSize: 16 },
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