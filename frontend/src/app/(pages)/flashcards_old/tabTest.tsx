'use client';
import React, { useState, useRef } from 'react';
import { Volume2 } from 'lucide-react';
import { useSwipeable } from 'react-swipeable';
import { motion, AnimatePresence } from 'framer-motion';

interface Word {
  STT: number;
  'Từ vựng': string;
  'Phiên âm': string;
  Nghĩa: string;
  Audio: string;
  view: boolean;
}

interface Category {
  Category: string;
  Words: Word[];
}

interface VocabularyData {
  [key: string]: Category[] | undefined;
  TOEIC_Vocabulary: Category[];
  IELTS_Vocabulary?: Category[];
}

interface TestProps {
  vocabularyData: VocabularyData;
  setVocabularyData: React.Dispatch<React.SetStateAction<VocabularyData>>;
  selectedTest: string;
  selectedCategory: string;
  setTab: React.Dispatch<React.SetStateAction<number>>;
}

export default function Test({
  vocabularyData,
  setVocabularyData,
  selectedTest,
  selectedCategory,
  setTab,
}: TestProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [learnedCount, setLearnedCount] = useState(0);
  const [viewedCount, setViewedCount] = useState(0);
  const playAudioRef = useRef<HTMLAudioElement | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<'Left' | 'Right' | null>(null);

  const words =
    vocabularyData[selectedTest]?.find((cat) => cat.Category === selectedCategory)?.Words || [];
  const totalWords = words.length;
  const unlearnedCount = viewedCount - learnedCount;

  const handleMarkLearned = () => {
    const category = vocabularyData[selectedTest]?.find((cat) => cat.Category === selectedCategory);
    if (category && words[currentWordIndex]) {
      const updatedWords = category.Words.map((word) =>
        word.STT === words[currentWordIndex].STT ? { ...word, view: true } : word
      );
      setVocabularyData((prev) => {
        const updatedCategories = prev[selectedTest]?.map((cat) =>
          cat.Category === selectedCategory ? { ...cat, Words: updatedWords } : cat
        );
        return { ...prev, [selectedTest]: updatedCategories };
      });
      setLearnedCount((prev) => prev + 1);
      setViewedCount((prev) => prev + 1);
      goToNextWord();
    }
  };

  const handleMarkNotLearned = () => {
    setViewedCount((prev) => prev + 1);
    goToNextWord();
  };

  const goToNextWord = () => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
      setFlippedCards(flippedCards.filter((index) => index !== currentWordIndex));
    } else {
      setCurrentWordIndex(0);
      setFlippedCards([]);
    }
  };

  const toggleFlipCard = (index: number) => {
    setFlippedCards((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const playAudio = (audioUrl?: string) => {
    if (playAudioRef.current) {
      playAudioRef.current.pause();
      playAudioRef.current.src = '';
      playAudioRef.current = null;
    }
    if (!audioUrl) {
      console.error('Không có URL âm thanh để phát');
      return;
    }
    const audio = new Audio(audioUrl);
    playAudioRef.current = audio;
    audio.play().catch((err) => console.error('Lỗi phát âm thanh:', err));
    audio.onended = () => {
      playAudioRef.current = null;
    };
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      setSwipeDirection('Left');
      handleMarkLearned();
    },
    onSwipedRight: () => {
      setSwipeDirection('Right');
      handleMarkNotLearned();
    },
    trackMouse: true,
    delta: 50,
  });

  return (
    <div className="flex flex-col gap-4 min-h-[400px] justify-center">
      <AnimatePresence>
        {words.length > 0 && currentWordIndex < words.length ? (
          <motion.div
            key={currentWordIndex}
            initial={{ x: 0, opacity: 1 }}
            exit={{ x: swipeDirection === 'Left' ? -300 : 300, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="p-6 bg-[#323232] rounded-lg shadow-lg cursor-pointer max-w-sm mx-auto"
            {...handlers}
          >
            <div className="min-w-[300px] min-h-[400px]">
              <div className="flex items-center gap-2">
                <div className="text-xl font-semibold">{words[currentWordIndex]['Từ vựng']}</div>
                <button
                  onClick={() => playAudio(words[currentWordIndex].Audio)}
                  aria-label="Phát âm thanh"
                  className="p-1 hover:text-white text-gray-400"
                >
                  <Volume2 size={16} />
                </button>
              </div>
              {flippedCards.includes(currentWordIndex) && (
                <div className="mt-4">
                  <div>{words[currentWordIndex]['Phiên âm']}</div>
                  <div>{words[currentWordIndex].Nghĩa}</div>
                </div>
              )}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => toggleFlipCard(currentWordIndex)}
                  className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white"
                >
                  Xem nghĩa
                </button>
                <button
                  onClick={handleMarkLearned}
                  className="p-2 bg-green-500 hover:bg-green-600 rounded-lg text-white"
                >
                  Đã thuộc
                </button>
                <button
                  onClick={handleMarkNotLearned}
                  className="p-2 bg-red-500 hover:bg-red-600 rounded-lg text-white"
                >
                  Chưa thuộc
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 bg-[#323232] rounded-lg text-center max-w-sm mx-auto"
          >
            <h2 className="text-xl font-semibold">Tổng kết</h2>
            <div className="text-gray-400 mt-4">
              Tổng số từ: {totalWords} | Đã thuộc: {learnedCount} | Chưa thuộc: {unlearnedCount}
            </div>
            <button
              onClick={() => setTab(2)} // Return to category list
              className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white mt-4"
            >
              Quay lại danh sách
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
