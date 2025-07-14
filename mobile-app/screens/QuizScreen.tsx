import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { SessionStorage } from '../storage/sessionStorage';
import LoadedOverlay from '../components/LoadedOverlay';
import Notify from '../components/Notify';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface Quiz {
  id: string;
  title: string;
  questions: Question[];
}

export default function QuizScreen() {
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    loadQuiz();
  }, []);

  const loadQuiz = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:6789/q/quiz', { withCredentials: true });
      if (res.data.success) {
        setQuiz(res.data.quiz);
      }
    } catch (error) {
      setMessage('Lỗi tải bài quiz!');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
  };

  const checkAnswer = () => {
    if (selectedAnswer === null || !quiz) return;

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setShowResult(true);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < quiz!.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      // Quiz completed
      setMessage(`Hoàn thành! Điểm số: ${score}/${quiz!.questions.length}`);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
  };

  if (!quiz) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Bài tập luyện tập</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Không có bài quiz nào</Text>
        </View>
        {loading && <LoadedOverlay />}
        <Notify message={message} type="info" duration={2000} onClose={() => setMessage(null)} />
      </View>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{quiz.title}</Text>
        <Text style={styles.progressText}>
          {currentQuestionIndex + 1}/{quiz.questions.length}
        </Text>
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
        </View>

        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                selectedAnswer === index && styles.selectedOption,
                showResult && index === currentQuestion.correctAnswer && styles.correctOption,
                showResult && selectedAnswer === index && index !== currentQuestion.correctAnswer && styles.wrongOption,
              ]}
              onPress={() => handleAnswerSelect(index)}
              disabled={showResult}
            >
              <Text style={[
                styles.optionText,
                selectedAnswer === index && styles.selectedOptionText,
                showResult && index === currentQuestion.correctAnswer && styles.correctOptionText,
                showResult && selectedAnswer === index && index !== currentQuestion.correctAnswer && styles.wrongOptionText,
              ]}>
                {String.fromCharCode(65 + index)}. {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {showResult && currentQuestion.explanation && (
          <View style={styles.explanationContainer}>
            <Text style={styles.explanationTitle}>Giải thích:</Text>
            <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
          </View>
        )}

        <View style={styles.controlsContainer}>
          {!showResult ? (
            <TouchableOpacity
              style={[styles.controlButton, selectedAnswer === null && styles.disabledButton]}
              onPress={checkAnswer}
              disabled={selectedAnswer === null}
            >
              <Text style={styles.controlButtonText}>Kiểm tra</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.controlButton} onPress={nextQuestion}>
              <Text style={styles.controlButtonText}>
                {currentQuestionIndex < quiz.questions.length - 1 ? 'Câu tiếp theo' : 'Hoàn thành'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {currentQuestionIndex === quiz.questions.length - 1 && showResult && (
          <TouchableOpacity style={styles.restartButton} onPress={restartQuiz}>
            <Text style={styles.restartButtonText}>Làm lại</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

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
  progressText: { color: '#ccc', fontSize: 14 },
  progressBar: {
    height: 4,
    backgroundColor: '#333',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  content: { flex: 1 },
  contentContainer: { padding: 16 },
  questionContainer: {
    backgroundColor: '#232323',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  questionText: { color: '#fff', fontSize: 18, lineHeight: 26 },
  optionsContainer: { marginBottom: 24 },
  optionButton: {
    backgroundColor: '#232323',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    borderColor: '#2196F3',
    backgroundColor: '#1E3A8A',
  },
  correctOption: {
    borderColor: '#4CAF50',
    backgroundColor: '#1B5E20',
  },
  wrongOption: {
    borderColor: '#F44336',
    backgroundColor: '#B71C1C',
  },
  optionText: { color: '#fff', fontSize: 16 },
  selectedOptionText: { color: '#90CAF9' },
  correctOptionText: { color: '#81C784' },
  wrongOptionText: { color: '#EF5350' },
  explanationContainer: {
    backgroundColor: '#1E3A8A',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  explanationTitle: { color: '#90CAF9', fontWeight: 'bold', marginBottom: 8 },
  explanationText: { color: '#E3F2FD', lineHeight: 20 },
  controlsContainer: { alignItems: 'center', marginBottom: 16 },
  controlButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  disabledButton: {
    backgroundColor: '#666',
  },
  controlButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  restartButton: {
    backgroundColor: '#FF9800',
    borderRadius: 8,
    paddingHorizontal: 32,
    paddingVertical: 12,
    alignSelf: 'center',
  },
  restartButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#888', fontSize: 16 },
}); 