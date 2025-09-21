'use client';
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Lamp, Sidebar, Volume2, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import FlagCard from './tabFlagCard';
import { useSidebarStore } from '@/lib/storage/sidebarState';
import LoadedOverlay from '@/components/LoadedOverlay';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth.context';

interface Word {
  id: number;
  word: string;
  pronunciation: string;
  meaning: string;
  type: string;
  audio: string;
  level: string;
  example: string;
  view: boolean;
  topic_id?: number;
}

interface Topic {
  id: number;
  name: string;
  category_id: number;
  word_count: number;
}

interface Category {
  id: number;
  name: string;
  topic_count: number;
}

export default function Vocabulary() {
  const { toggle } = useSidebarStore();
  const router = useRouter();
  const [selectedTest, setSelectedTest] = useState<Category | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0); // 0: Categories, 1: Topics, 2: Words, 3: Test, 4: Flag Card
  const [expandedWordId, setExpandedWordId] = useState<number | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (user?.plan_id && user?.plan_id >= 1) {
      setLoading(false);
      setIsAuthorized(true);
    }
  }, [user]);

  // Fetch categories when component mounts, only if categories are empty
  useEffect(() => {
    const fetchCategories = async () => {
      if (categories.length > 0) return; // Skip if categories already exist
      try {
        setLoading(true);
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/w/categories`, {
          withCredentials: true,
        });
        console.log('Fetched categories:', res.data);
        setCategories(res.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [categories]);

  // Fetch topics when a category is selected, only if topics for this category are not yet fetched
  useEffect(() => {
    if (tab === 1 && selectedTest && topics.length === 0) {
      if (topics.length > 0) return; // Skip if topics already exist
      console.log('Fetching topics for category:', selectedTest.name);
      const fetchTopics = async () => {
        try {
          setLoading(true);
          const res = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/w/categories/${selectedTest.id}/topics`,
            { withCredentials: true }
          );
          setTopics(res.data);
        } catch (err) {
          console.error('Error fetching topics:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchTopics();
    }
  }, [tab, selectedTest, topics]);

  // Fetch words and their audio when a topic is selected, only if no words for this topic exist
  useEffect(() => {
    if (tab === 2 && selectedTopic) {
      if (words.some((word) => word.topic_id === selectedTopic.id)) {
        return; // Skip if words for this topic already exist
      }
      const fetchWords = async () => {
        try {
          setLoading(true);
          const res = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/w/topics/${selectedTopic.id}/words`,
            { withCredentials: true }
          );
          const wordsWithView = res.data.map((word: Word) => ({ ...word, view: false }));

          // Merge new words into existing words, avoiding duplicates
          setWords((prevWords) => {
            const newWords = wordsWithView.filter(
              (newWord: Word) => !prevWords.some((word) => word.id === newWord.id)
            );
            return [...prevWords, ...newWords];
          });

          // Fetch audio for words that don't have it
          const audioPromises = wordsWithView.map(async (word: Word) => {
            if (word.audio) return word; // Skip if audio already exists
            const audioUrl = await fetchAudio(word);
            return { ...word, audio: audioUrl };
          });
          const updatedWordsWithAudio = await Promise.all(audioPromises);

          // Update words with audio, preserving existing words
          setWords((prevWords) => {
            const mergedWords = prevWords.map((word) => {
              const updatedWord = updatedWordsWithAudio.find((w) => w.id === word.id);
              return updatedWord || word;
            });
            const newWords = updatedWordsWithAudio.filter(
              (newWord: Word) => !prevWords.some((word) => word.id === newWord.id)
            );
            return [...mergedWords, ...newWords];
          });
        } catch (err) {
          console.error('Error fetching words:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchWords();
    }
  }, [tab, selectedTopic]);

  // Fetch audio for a word when needed
  const fetchAudio = async (word: Word) => {
    if (word.audio) return word.audio; // Skip if audio already exists
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/audio/voice`,
        { text: word.word },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );
      if (res.status === 200 && res.data.audioUrl) {
        return res.data.audioUrl;
      }
    } catch (error) {
      console.error(`Error fetching audio for "${word.word}":`, error);
    }
    return '';
  };

  // Handle word click to expand/collapse
  const handleWordClick = (wordId: number) => {
    setExpandedWordId((prev) => (prev === wordId ? null : wordId));
  };

  if (!isAuthorized) return null;

  return (
    <div className="w-full flex flex-col h-screen text-white overflow-hidden p-4 md:p-0">
      {loading && <LoadedOverlay />}
      {user && <></>}
      <div className="fixed top-0 left-0 w-full bg-[#111111]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <button className="text-gray-200 hover:text-white" onClick={() => toggle()}>
            <Sidebar size={24} />
          </button>
          <div className="text-xl font-semibold">Thẻ ghi nhớ</div>
          <button className="text-gray-200 hover:text-white" onClick={() => console.log('Lamp')}>
            <Lamp size={24} />
          </button>
        </div>
        <div className="text-center text-sm text-gray-400 mt-1 mb-1">Learning by AI</div>
      </div>

      <div className="max-w-3xl mx-auto w-full mt-[72px] md:mt-[82px]">
        {tab === 0 ? (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold">Chọn loại bài học</h2>
            {categories.map((category, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedTest(category);
                  setTab(1);
                }}
                className="text-[17px] p-4 bg-[#323232] rounded-lg hover:bg-[#444444] text-left text-lg flex justify-between items-center"
              >
                <span>{category.name}</span>
                <span className="text-[15px] text-gray-400">{category.topic_count} chủ đề</span>
              </button>
            ))}
          </div>
        ) : tab === 1 ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedTest(null);
                  // setTopics([]);
                  setTab(0);
                }}
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft size={24} />
              </button>
              <h2 className="text-xl font-semibold">{selectedTest?.name}</h2>
            </div>
            <div className="text-gray-400">Tổng số chủ đề: {topics.length}</div>
            <h2 className="text-xl font-semibold text-gray-400">Danh sách chủ đề</h2>
            <div className="overflow-hidden custom-scroll overflow-y-auto max-h-screen w-full flex-col">
              <div className="mb-[400px]">
                {topics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => {
                      setSelectedTopic(topic);
                      setTab(2);
                    }}
                    className="text-[17px] p-4 bg-[#323232] rounded-lg hover:bg-[#444444] text-left text-lg w-full mb-2 flex justify-between items-center"
                  >
                    <span>{topic.name}</span>
                    <span className="text-[15px] text-gray-400">{topic.word_count} từ</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : tab >= 2 ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (tab === 2) {
                    setSelectedTopic(null);
                    setTab(1);
                  } else {
                    setTab(2);
                  }
                }}
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft size={24} />
              </button>
              {tab === 2 ? (
                <h2 className="text-xl font-semibold">{selectedTopic?.name}</h2>
              ) : tab === 3 ? (
                <h2 className="text-xl font-semibold">Chế độ kiểm tra</h2>
              ) : (
                <h2 className="text-xl font-semibold">Chế độ Flag Card</h2>
              )}
            </div>
            {tab === 2 && (
              <div className="text-gray-400">
                Tổng số từ: {words.filter((word) => word.topic_id === selectedTopic?.id).length} |
                Đã thuộc:{' '}
                {words.filter((word) => word.topic_id === selectedTopic?.id && word.view).length} |
                Chưa thuộc:{' '}
                {words.filter((word) => word.topic_id === selectedTopic?.id && !word.view).length}
              </div>
            )}
            {tab === 2 && (
              <div className="flex gap-2 mb-1">
                <button
                  onClick={() => setTab(3)}
                  className="p-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white w-fit"
                >
                  Chế độ Flash Card
                </button>
              </div>
            )}
            {tab === 2 ? (
              <div className="overflow-hidden custom-scroll overflow-y-auto max-h-screen w-full flex-col">
                <div className="mb-[400px]">
                  {words
                    .filter((word) => word.topic_id === selectedTopic?.id)
                    .map((word) => (
                      <div
                        key={word.id}
                        className="p-4 bg-[#323232] rounded-lg mb-3 cursor-pointer"
                        onClick={() => handleWordClick(word.id)}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="font-semibold">{word.word}</div>
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                const audioUrl = await fetchAudio(word);
                                if (audioUrl) {
                                  const audio = new Audio(audioUrl);
                                  audio
                                    .play()
                                    .catch((err) => console.error('Lỗi phát âm thanh:', err));
                                }
                              }}
                              aria-label="Phát âm thanh"
                              className="p-1 hover:text-white text-gray-400"
                            >
                              <Volume2 size={16} />
                            </button>
                          </div>
                          <motion.div
                            animate={{ rotate: expandedWordId === word.id ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <ChevronDown size={16} className="text-gray-400" />
                          </motion.div>
                        </div>
                        <AnimatePresence>
                          {expandedWordId === word.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-2">
                                <div>
                                  <strong>Phiên âm:</strong> {word.pronunciation}
                                </div>
                                <div>
                                  <strong>Nghĩa:</strong> {word.meaning}
                                </div>
                                <div>
                                  <strong>Loại từ:</strong> {word.type}
                                </div>
                                <div>
                                  <strong>Ví dụ:</strong> {word.example}
                                </div>
                                <div>
                                  <strong>Cấp độ:</strong> {word.level}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                </div>
              </div>
            ) : tab === 3 ? (
              <FlagCard
                vocabularyData={{
                  [selectedTest!.name]: [
                    {
                      Category: selectedTopic!.name,
                      Words: words.filter((word) => word.topic_id === selectedTopic?.id),
                    },
                  ],
                }}
                setVocabularyData={() => {
                  // Update words if needed
                }}
                selectedTest={selectedTest!.name}
                selectedCategory={selectedTopic!.name}
                setTab={setTab}
              />
            ) : null}
          </div>
        ) : null}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
