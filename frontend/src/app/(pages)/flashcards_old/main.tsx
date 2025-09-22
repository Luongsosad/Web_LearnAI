'use client';
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Lamp, Sidebar, Volume2 } from 'lucide-react';
import axios from 'axios';
import FlagCard from './tabFlagCard';
import Test from './tabTest';
import { useSidebarStore } from '@/lib/storage/sidebarState';
import LoadedOverlay from '@/components/LoadedOverlay';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth.context';

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

export default function Vocabulary() {
  const { toggle } = useSidebarStore();
  const router = useRouter();
  const [vocabularyData, setVocabularyData] = useState<VocabularyData>({ TOEIC_Vocabulary: [] });
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0); // 0: Chọn loại từ vựng, 1: Chọn chủ đề, 2: Danh sách từ vựng, 3: Test, 4: Flag Card
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/data/vocabulary`, {
          withCredentials: true,
        });
        const updatedData = Object.keys(res.data).reduce(
          (acc: VocabularyData, test: string) => {
            acc[test] = res.data[test].map((cat: Category) => ({
              ...cat,
              Words: cat.Words.map((word: Word) => ({ ...word, view: false })),
            }));
            return acc;
          },
          { TOEIC_Vocabulary: [] } as VocabularyData
        );
        setVocabularyData(updatedData);
      } catch (err) {
        console.error('Lỗi khi đọc data.json:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (tab === 2 && selectedTest) {
      const fetchAudioForCategory = async () => {
        setLoading(true);
        const category = vocabularyData[selectedTest]?.find(
          (cat) => cat.Category === selectedCategory
        );
        if (!category) return;

        const updatedWords = [...category.Words];
        for (let i = 0; i < updatedWords.length; i++) {
          const word = updatedWords[i];
          if (!word['Audio']) {
            try {
              const res = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/audio/voice`,
                { text: word['Từ vựng'] },
                {
                  headers: { 'Content-Type': 'application/json' },
                  withCredentials: true,
                }
              );
              if (res.status === 200 && res.data.audioUrl) {
                updatedWords[i] = { ...word, Audio: res.data.audioUrl };
              }
            } catch (error) {
              console.error(`Lỗi khi lấy audio cho từ "${word['Từ vựng']}":`, error);
              updatedWords[i] = { ...word, Audio: '' };
            }
          }
        }

        setVocabularyData((prev) => {
          const updatedCategories = prev[selectedTest!]?.map((cat) =>
            cat.Category === selectedCategory ? { ...cat, Words: updatedWords } : cat
          );
          return { ...prev, [selectedTest!]: updatedCategories };
        });
        setLoading(false);
      };

      fetchAudioForCategory();
    }
  }, [selectedTest, selectedCategory]);

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
            {Object.keys(vocabularyData).map((test) => (
              <button
                key={test}
                onClick={() => {
                  setSelectedTest(test);
                  setTab(1);
                }}
                className="p-4 bg-[#323232] rounded-lg hover:bg-[#444444] text-left text-lg"
              >
                {test.replace('_Vocabulary', '')}
              </button>
            ))}
          </div>
        ) : tab === 1 ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedTest(null);
                  setTab(0);
                }}
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft size={24} />
              </button>
              <h2 className="text-xl font-semibold">{selectedTest?.replace('_Vocabulary', '')}</h2>
            </div>
            <div className="text-gray-400">
              Tổng số từ:{' '}
              {vocabularyData[selectedTest!]?.reduce(
                (acc: number, cat: Category) => acc + cat.Words.length,
                0
              ) || 0}{' '}
              | Đã thuộc:{' '}
              {vocabularyData[selectedTest!]?.reduce(
                (acc: number, cat: Category) =>
                  acc + cat.Words.filter((word: Word) => word.view).length,
                0
              ) || 0}{' '}
              | Chưa thuộc:{' '}
              {vocabularyData[selectedTest!]?.reduce(
                (acc: number, cat: Category) =>
                  acc + cat.Words.filter((word: Word) => !word.view).length,
                0
              ) || 0}
            </div>
            <h2 className="text-xl font-semibold text-gray-400">Danh sách chủ đề</h2>
            <div className="overflow-hidden custom-scroll overflow-y-auto max-h-screen w-full flex-col">
              <div className="mb-[400px]">
                {vocabularyData[selectedTest!]?.map((category: Category) => (
                  <button
                    key={category.Category}
                    onClick={() => {
                      setSelectedCategory(category.Category);
                      setTab(2);
                    }}
                    className="p-4 bg-[#323232] rounded-lg hover:bg-[#444444] text-left text-lg w-full mb-2"
                  >
                    {category.Category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : tab >= 2 ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              {tab == 2 ? (
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setTab(1);
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <ArrowLeft size={24} />
                </button>
              ) : (
                <button
                  onClick={() => {
                    setTab(2);
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <ArrowLeft size={24} />
                </button>
              )}
              {tab === 2 ? (
                <h2 className="text-xl font-semibold">{selectedCategory}</h2>
              ) : tab === 3 ? (
                <h2 className="text-xl font-semibold">Chế độ kiểm tra</h2>
              ) : (
                <h2 className="text-xl font-semibold">Chế độ Flag Card</h2>
              )}
            </div>
            <div className="text-gray-400">
              Tổng số từ:{' '}
              {vocabularyData[selectedTest!]?.find(
                (cat: Category) => cat.Category === selectedCategory
              )?.Words.length || 0}{' '}
              | Đã thuộc:{' '}
              {vocabularyData[selectedTest!]
                ?.find((cat: Category) => cat.Category === selectedCategory)
                ?.Words.filter((word: Word) => word.view).length || 0}{' '}
              | Chưa thuộc:{' '}
              {vocabularyData[selectedTest!]
                ?.find((cat: Category) => cat.Category === selectedCategory)
                ?.Words.filter((word: Word) => !word.view).length || 0}
            </div>
            {tab === 2 && (
              <div className="flex gap-2 mb-1">
                <button
                  onClick={() => setTab(2)}
                  className="p-2 bg-green-500 hover:bg-green-600 rounded-lg text-white w-fit"
                >
                  Chế độ kiểm tra
                </button>
                <button
                  onClick={() => setTab(4)}
                  className="p-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white w-fit"
                >
                  Chế độ Flag Card
                </button>
              </div>
            )}
            {tab === 2 ? (
              <div className="overflow-hidden custom-scroll overflow-y-auto max-h-screen w-full flex-col">
                <div className="mb-[400px]">
                  {vocabularyData[selectedTest!]
                    ?.find((cat: Category) => cat.Category === selectedCategory)
                    ?.Words.map((word: Word) => (
                      <div key={word.STT} className="p-4 bg-[#323232] rounded-lg mb-3">
                        <div className="flex items-center gap-2">
                          <div className="font-semibold">{word['Từ vựng']}</div>
                          <button
                            onClick={() => {
                              const audio = new Audio(word.Audio);
                              audio.play().catch((err) => console.error('Lỗi phát âm thanh:', err));
                            }}
                            aria-label="Phát âm thanh"
                            className="p-1 hover:text-white text-gray-400"
                          >
                            <Volume2 size={16} />
                          </button>
                        </div>
                        <div>{word['Phiên âm']}</div>
                        <div>{word.Nghĩa}</div>
                      </div>
                    ))}
                </div>
              </div>
            ) : tab === 3 ? (
              <Test
                vocabularyData={vocabularyData}
                setVocabularyData={setVocabularyData}
                selectedTest={selectedTest!}
                selectedCategory={selectedCategory!}
                setTab={setTab}
              />
            ) : tab === 4 ? (
              <FlagCard
                vocabularyData={vocabularyData}
                setVocabularyData={setVocabularyData}
                selectedTest={selectedTest!}
                selectedCategory={selectedCategory!}
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
