'use client';
import React, { useState, useEffect, useRef } from 'react';
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

interface FlagCardProps {
  vocabularyData: VocabularyData;
  setVocabularyData: React.Dispatch<React.SetStateAction<VocabularyData>>;
  selectedTest: string;
  selectedCategory: string;
  setTab: React.Dispatch<React.SetStateAction<number>>;
}

export default function FlagCard({
  vocabularyData,
  setVocabularyData,
  selectedTest,
  selectedCategory,
  setTab,
}: FlagCardProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [shuffledWords, setShuffledWords] = useState<Word[]>([]);
  const [learnedCount, setLearnedCount] = useState(0);
  const [viewedCount, setViewedCount] = useState(0);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const playAudioRef = useRef<HTMLAudioElement | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<'Left' | 'Right' | null>(null);

  useEffect(() => {
    const category = vocabularyData[selectedTest]?.find((cat) => cat.Category === selectedCategory);
    if (category) {
      const unviewedWords = category.Words.filter((word) => !word.view);
      const shuffled = [...unviewedWords].sort(() => Math.random() - 0.5);
      setShuffledWords(shuffled);
    }
  }, [vocabularyData, selectedTest, selectedCategory]);

  const handleMarkLearned = () => {
    const category = vocabularyData[selectedTest]?.find((cat) => cat.Category === selectedCategory);
    if (category && shuffledWords[currentWordIndex]) {
      const updatedWords = category.Words.map((word) =>
        word.STT === shuffledWords[currentWordIndex].STT ? { ...word, view: true } : word
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
    if (currentWordIndex < shuffledWords.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
      setFlippedCards(flippedCards.filter((index) => index !== currentWordIndex));
    } else {
      setCurrentWordIndex(0);
      setFlippedCards([]);
      // Do not set shuffledWords or tab here; show result table instead
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

  const totalWords = shuffledWords.length;
  const unlearnedCount = viewedCount - learnedCount;

  return (
    <div className="flex flex-col gap-4 min-h-full justify-center">
      <AnimatePresence>
        {shuffledWords.length > 0 && currentWordIndex < shuffledWords.length ? (
          <motion.div
            key={currentWordIndex}
            initial={{ x: 0, opacity: 1 }}
            exit={{ x: swipeDirection === 'Left' ? -300 : 300, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="p-6 bg-[#323232] rounded-lg shadow-lg cursor-pointer max-w-sm mx-auto"
            onClick={() => toggleFlipCard(currentWordIndex)}
            {...handlers}
          >
            <div
              className={`card min-w-[300px] min-h-[360px] ${flippedCards.includes(currentWordIndex) ? 'flipped' : ''}`}
            >
              <div className="card-front">
                <div className="text-2xl font-semibold text-center">
                  {shuffledWords[currentWordIndex]['Từ vựng']}
                </div>
                <div className="mx-auto mt-5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playAudio(shuffledWords[currentWordIndex].Audio);
                    }}
                    aria-label="Phát âm thanh"
                    className="p-1 hover:text-white text-gray-400 self-start"
                  >
                    <Volume2 size={16} />
                  </button>
                </div>
              </div>
              <div className="card-back">
                <div className="flex flex-col gap-2">
                  <div className="text-xl font-semibold">
                    {shuffledWords[currentWordIndex]['Từ vựng']}
                  </div>
                  <div>{shuffledWords[currentWordIndex]['Phiên âm']}</div>
                  <div>{shuffledWords[currentWordIndex].Nghĩa}</div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 bg-[#323232] rounded-lg text-center flex flex-col justify-center items-center max-w-sm mx-auto mt-10 min-w-[300px] min-h-[300px]"
          >
            <h2 className="text-xl font-semibold">Tổng kết</h2>
            <div className="text-gray-400 mt-4 h-full">
              <div>Tổng số từ: {totalWords}</div>

              <div>Đã thuộc: {learnedCount}</div>
              <div>Chưa thuộc: {unlearnedCount}</div>
            </div>
            <button
              onClick={() => {
                setShuffledWords([]);
                setTab(2); // Return to category list
              }}
              className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white mt-4"
            >
              Quay lại danh sách
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .card {
          position: relative;
          width: 100%;
          height: 200px;
          perspective: 1000px;
        }

        .card-front,
        .card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          transition: transform 0.6s;
        }

        .card-front {
          transform: rotateY(0deg);
        }

        .card-back {
          transform: rotateY(180deg);
        }

        .card.flipped .card-front {
          transform: rotateY(180deg);
        }

        .card.flipped .card-back {
          transform: rotateY(0deg);
        }
      `}</style>
    </div>
  );
}
