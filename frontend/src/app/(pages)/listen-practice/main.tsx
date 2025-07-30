'use client';
import React, { useState, useEffect, useRef } from 'react';
import {
  Sidebar,
  Volume2,
  Play,
  RotateCcw,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Lamp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useSidebarStore } from '@/storage/sidebarState';
import LoadedOverlay from '@/components/LoadedOverlay';
import { useRouter } from 'next/navigation';
import { SessionStorage } from '@/storage/sessionStorage';
import { User } from '@/types/User';
import { Button } from '@/components/ui/button';

interface Sentence {
  id: number;
  text: string;
  audioUrl: string;
  fastAudioUrl: string;
  difficulty: 'easy' | 'medium' | 'hard';
  missingWords: string[];
  userAnswer: string;
  isCorrect: boolean;
  vi: string; // Added vi property
}

interface PracticeSettings {
  difficulty: 'easy' | 'medium' | 'hard';
  wordCount: '3-7' | 'percentage';
  percentage: number;
}

export default function ListenPracticeMain() {
  const { toggle } = useSidebarStore();
  const router = useRouter();
  const [_user, setUser] = useState<User | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(false);

  // Practice state
  const [currentStep, setCurrentStep] = useState<'setup' | 'practice' | 'results'>('setup');
  const [settings, setSettings] = useState<PracticeSettings>({
    difficulty: 'medium',
    wordCount: '3-7',
    percentage: 30,
  });

  // Practice session
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  // const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [userAnswers, setUserAnswers] = useState<string[][]>([]);
  const [showResults, setShowResults] = useState(false);
  const [audioCache, setAudioCache] = useState<{ [key: string]: string }>({});
  // State
  const [showHint, setShowHint] = useState<boolean[]>([]);

  const audioRef = useRef<HTMLAudioElement>(null);

  // Check user authorization
  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      const user = await SessionStorage.getUser(
        (loading) => setLoading(loading),
        (user) => setUser(user)
      );

      if (!user) {
        router.push('/login');
        return;
      }

      if (user?.plan_id && user?.plan_id >= 1) {
        setIsAuthorized(true);
      } else {
        router.push('/');
      }
      setLoading(false);
    }
    fetchUser();
  }, [router]);

  // Generate practice sentences
  const generatePractice = async () => {
    try {
      setLoading(true);
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/listen-practice/generate`,
        {
          difficulty: settings.difficulty,
          wordCount: settings.wordCount,
          percentage: settings.percentage,
        },
        {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' },
        }
      );
      if (res.status !== 200 || !res.data.sentences) throw new Error('Lỗi API');
      setSentences(res.data.sentences);
      // Khi generate xong, khởi tạo userAnswers và showHint đúng số câu
      setUserAnswers(new Array(res.data.sentences.length).fill(null).map((_s) => []));
      setShowHint(new Array(res.data.sentences.length).fill(false));
      console.log('Generated sentences:', res.data.sentences);

      // Cache audio URLs từ backend
      const newCache = { ...audioCache };
      res.data.sentences.forEach((sentence: Sentence) => {
        if (sentence.audioUrl) {
          newCache[`${sentence.text}_normal`] = sentence.audioUrl;
        }
        if (sentence.fastAudioUrl) {
          newCache[`${sentence.text}_fast`] = sentence.fastAudioUrl;
        }
      });
      setAudioCache(newCache);

      setCurrentSentenceIndex(0);
      setCurrentStep('practice');
    } catch (error) {
      console.error('Error generating practice:', error);
      alert('Lỗi khi tạo bài luyện tập. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  // Audio controls
  const playAudio = async (speed: 'normal' | 'fast' = 'normal') => {
    const sentence = sentences[currentSentenceIndex];
    if (!sentence) return;

    setIsPlaying(true);
    try {
      // Tạo cache key
      const cacheKey = `${sentence.text}_${speed}`;

      // Kiểm tra cache trước
      let audioUrl = audioCache[cacheKey];

      if (!audioUrl) {
        setLoading(true);
        // Nếu chưa có trong cache, gọi API
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/listen-practice/audio`,
          {
            text: sentence.text,
            speed,
          },
          {
            withCredentials: true,
            headers: { 'Content-Type': 'application/json' },
          }
        );

        if (res.status === 200 && res.data.audioUrl) {
          audioUrl = res.data.audioUrl;
          // Lưu vào cache
          setAudioCache((prev) => ({ ...prev, [cacheKey]: audioUrl }));
        } else {
          throw new Error('Không thể lấy audio URL');
        }
      }

      if (audioRef.current && audioUrl) {
        audioRef.current.src = audioUrl;
        audioRef.current.playbackRate = speed === 'fast' ? 1.4 : 1.0;
        await audioRef.current.play();
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      alert('Lỗi khi phát audio.');
    } finally {
      setLoading(false);
      setIsPlaying(false);
    }
  };

  // const pauseAudio = () => {
  //     if (audioRef.current) {
  //         audioRef.current.pause();
  //         setIsPlaying(false);
  //     }
  // };

  // const changePlaybackSpeed = () => {
  //     const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
  //     const currentIndex = speeds.indexOf(playbackSpeed);
  //     const nextIndex = (currentIndex + 1) % speeds.length;
  //     setPlaybackSpeed(speeds[nextIndex]);

  //     if (audioRef.current) {
  //         audioRef.current.playbackRate = speeds[nextIndex];
  //     }
  // };

  // Navigation
  const nextSentence = () => {
    if (currentSentenceIndex < sentences.length - 1) {
      setCurrentSentenceIndex(currentSentenceIndex + 1);
      setIsPlaying(false);
      setShowResults(false);
    }
  };

  const prevSentence = () => {
    if (currentSentenceIndex > 0) {
      setCurrentSentenceIndex(currentSentenceIndex - 1);
      setIsPlaying(false);
      setShowResults(false);
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentStep === 'practice') {
        if (e.ctrlKey && !e.altKey) {
          e.preventDefault();
          playAudio('normal');
        } else if (e.altKey && !e.ctrlKey) {
          e.preventDefault();
          playAudio('fast');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, showResults, currentSentenceIndex, sentences]);

  // Handle user input for specific missing word
  const handleUserInput = (value: string, wordIndex: number) => {
    setUserAnswers((prev) => {
      const newAnswers = prev.map((arr) => [...arr]);
      if (!newAnswers[currentSentenceIndex]) {
        newAnswers[currentSentenceIndex] = [];
      }
      newAnswers[currentSentenceIndex][wordIndex] = value;
      return newAnswers;
    });
  };

  // Handle Enter key to check answer
  const handleKeyDown = (e: React.KeyboardEvent, _wordIndex: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      checkAnswers();
    }
  };

  // Check answers
  const checkAnswers = () => {
    const currentSentence = sentences[currentSentenceIndex];
    if (!currentSentence) return;

    const userAnswerArray = userAnswers[currentSentenceIndex] || [];
    const isCorrect = currentSentence.missingWords.every((word, wordIndex) => {
      const cleanMissingWord = word.replace(/[.,!?;:]/g, '');
      const userAnswer = userAnswerArray[wordIndex] || '';
      return userAnswer.toLowerCase().includes(cleanMissingWord.toLowerCase());
    });

    const updatedSentences = [...sentences];
    updatedSentences[currentSentenceIndex] = {
      ...currentSentence,
      userAnswer: userAnswerArray.join(' '),
      isCorrect,
    };

    setSentences(updatedSentences);
    setShowResults(true);
  };

  // Calculate progress
  const progress = ((currentSentenceIndex + 1) / sentences.length) * 100;
  // const correctAnswers = sentences.filter(s => s.isCorrect).length;

  if (!isAuthorized) return null;

  return (
    <div className="w-full flex flex-col h-screen text-white overflow-hidden">
      {/* Header */}
      <div className="fixed top-0 left-0 w-full bg-[#111111] z-10">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <button className="text-gray-200 hover:text-white" onClick={() => toggle()}>
            <Sidebar size={24} />
          </button>
          <div className="text-xl font-semibold">Listen with AI</div>
          <div className="w-6"></div>
        </div>
        <div className="text-center text-sm text-gray-400 mt-1 mb-1">Learning by AI</div>
      </div>

      <div className="mt-[82px] mb-[20px] flex-1 flex flex-col px-4 py-4 overflow-y-auto h-full space-y-4 custom-scroll bg-[#111111]">
        {loading && <LoadedOverlay />}

        <AnimatePresence mode="wait">
          {currentStep === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col space-y-6"
            >
              <div className="text-center">
                <h1 className="text-2xl font-bold mb-2">Luyện Nghe Chép Chính Tả</h1>
                <p className="text-gray-400">Chọn cài đặt để bắt đầu luyện tập</p>
              </div>

              {/* Difficulty Selection */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Mức độ khó</h3>
                <div className="grid grid-cols-3 gap-3">
                  {(['easy', 'medium', 'hard'] as const).map((difficulty) => (
                    <Button
                      key={difficulty}
                      variant={settings.difficulty === difficulty ? 'default' : 'outline'}
                      onClick={() => setSettings({ ...settings, difficulty })}
                      className={`h-12 border-2 ${
                        settings.difficulty === difficulty
                          ? 'border-blue-500 bg-blue-600 text-white'
                          : 'border-gray-600 hover:border-gray-400'
                      }`}
                    >
                      {difficulty === 'easy' && 'Dễ'}
                      {difficulty === 'medium' && 'Trung bình'}
                      {difficulty === 'hard' && 'Khó'}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Word Count Selection */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Số từ khuyết</h3>
                <div className="space-y-3">
                  <Button
                    variant={settings.wordCount === '3-7' ? 'default' : 'outline'}
                    onClick={() => setSettings({ ...settings, wordCount: '3-7' })}
                    className={`w-full h-12 border-2 ${
                      settings.wordCount === '3-7'
                        ? 'border-blue-500 bg-blue-600 text-white'
                        : 'border-gray-600 hover:border-gray-400'
                    }`}
                  >
                    3-7 từ mỗi câu
                  </Button>
                  <div className="space-y-2">
                    <Button
                      variant={settings.wordCount === 'percentage' ? 'default' : 'outline'}
                      onClick={() => setSettings({ ...settings, wordCount: 'percentage' })}
                      className={`w-full h-12 border-2 ${
                        settings.wordCount === 'percentage'
                          ? 'border-blue-500 bg-blue-600 text-white'
                          : 'border-gray-600 hover:border-gray-400'
                      }`}
                    >
                      Theo phần trăm
                    </Button>
                    {settings.wordCount === 'percentage' && (
                      <div className="flex items-center space-x-3">
                        <input
                          type="range"
                          min="10"
                          max="50"
                          value={settings.percentage}
                          onChange={(e) =>
                            setSettings({ ...settings, percentage: parseInt(e.target.value) })
                          }
                          className="flex-1"
                        />
                        <span className="text-sm w-12">{settings.percentage}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Button
                onClick={generatePractice}
                className="w-full h-12 text-lg font-semibold border-2 border-red-500 bg-red-600 hover:bg-red-700 text-white"
                disabled={loading}
              >
                Bắt đầu luyện tập
              </Button>
            </motion.div>
          )}

          {currentStep === 'practice' && (
            <motion.div
              key="practice"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col space-y-6"
            >
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>
                    Câu {currentSentenceIndex + 1} / {sentences.length}
                  </span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Audio Controls */}
              <div className="flex items-center justify-center space-x-4 p-4 bg-gray-800 rounded-lg">
                <div className="flex flex-col items-center space-y-1">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => playAudio('normal')}
                    disabled={isPlaying}
                    className="w-16 h-16 border-2 border-gray-600 hover:border-gray-400"
                  >
                    <Play size={24} />
                  </Button>
                  <span className="text-xs text-gray-400">Normal (Ctrl)</span>
                </div>

                <div className="flex flex-col items-center space-y-1">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => playAudio('fast')}
                    disabled={isPlaying}
                    className="w-16 h-16 border-2 border-gray-600 hover:border-gray-400"
                  >
                    <Play size={24} />
                  </Button>
                  <span className="text-xs text-gray-400">Fast (Alt)</span>
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    if (audioRef.current) {
                      audioRef.current.currentTime = 0;
                      playAudio('normal');
                    }
                  }}
                  className="w-12 h-12 border-2 border-gray-600 hover:border-gray-400"
                >
                  <RotateCcw size={20} />
                </Button>
              </div>

              {/* Hidden audio element */}
              <audio
                ref={audioRef}
                onEnded={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                className="hidden"
              />

              {/* Sentence Display */}
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-lg text-gray-300">Nghe và điền từ còn thiếu vào ô trống</p>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Volume2 size={20} className="text-blue-400" />
                      <span className="text-sm text-gray-400">Câu {currentSentenceIndex + 1}</span>
                    </div>

                    {/* Hiển thị câu dịch nghĩa */}
                    <div className="flex items-center justify-center mb-2">
                      <button
                        className="flex items-center px-2 py-1 rounded hover:bg-yellow-100/10 border border-yellow-400 text-yellow-400"
                        onClick={() =>
                          setShowHint((prev) => {
                            const newHint = [...prev];
                            newHint[currentSentenceIndex] = !newHint[currentSentenceIndex];
                            return newHint;
                          })
                        }
                      >
                        <Lamp size={20} className="mr-1" />
                        Gợi ý
                      </button>
                    </div>
                    {showHint[currentSentenceIndex] && (
                      <div className="text-base text-green-400 mt-2 mb-2 text-center">
                        {sentences[currentSentenceIndex]?.vi}
                      </div>
                    )}

                    <div className="text-lg leading-relaxed">
                      {sentences[currentSentenceIndex]?.text.split(' ').map((word, index) => {
                        // Xử lý dấu câu: loại bỏ dấu chấm, phẩy, chấm than, chấm hỏi
                        const cleanWord = word.replace(/[.,!?;:]/g, '');
                        const isMissing = sentences[currentSentenceIndex]?.missingWords.some(
                          (missingWord) => missingWord.replace(/[.,!?;:]/g, '') === cleanWord
                        );
                        const missingWordIndex =
                          sentences[currentSentenceIndex]?.missingWords.findIndex(
                            (missingWord) => missingWord.replace(/[.,!?;:]/g, '') === cleanWord
                          ) || 0;

                        return (
                          <span key={index}>
                            {isMissing ? (
                              <span className="inline-block mx-1">
                                <input
                                  type="text"
                                  value={
                                    userAnswers[currentSentenceIndex]?.[missingWordIndex] || ''
                                  }
                                  onChange={(e) =>
                                    handleUserInput(e.target.value, missingWordIndex)
                                  }
                                  onKeyDown={(e) => handleKeyDown(e, missingWordIndex)}
                                  placeholder="___"
                                  style={{
                                    width: `${Math.max(cleanWord.length * 15, 80)}px`,
                                  }}
                                  className="px-2 py-1 text-center bg-transparent border-b-2 border-blue-500 focus:outline-none focus:border-blue-400"
                                />
                                {/* Hiển thị dấu câu nếu có */}
                                {word.match(/[.,!?;:]/) && (
                                  <span className="mx-1">{word.match(/[.,!?;:]/)?.[0]}</span>
                                )}
                              </span>
                            ) : (
                              <span className="mx-1">{word}</span>
                            )}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={prevSentence}
                  disabled={currentSentenceIndex === 0}
                  className="flex items-center space-x-2"
                >
                  <ChevronLeft size={16} />
                  <span>Câu trước</span>
                </Button>

                {currentSentenceIndex === sentences.length - 1 ? (
                  <Button onClick={checkAnswers} className="flex items-center space-x-2">
                    <Check size={16} />
                    <span>Kiểm tra</span>
                  </Button>
                ) : (
                  <Button onClick={nextSentence} className="flex items-center space-x-2">
                    <span>Câu tiếp</span>
                    <ChevronRight size={16} />
                  </Button>
                )}
              </div>
            </motion.div>
          )}

          {currentStep === 'practice' && showResults && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center">
                <h2 className="text-2xl font-bold">Kết quả: </h2>
                <div className="text-xl ml-4">Câu {currentSentenceIndex + 1} -</div>
                <div
                  className={`text-xl font-bold ml-2 ${sentences[currentSentenceIndex]?.isCorrect ? 'text-green-500' : 'text-red-500'}`}
                >
                  {sentences[currentSentenceIndex]?.isCorrect ? 'Đúng' : 'Sai'}
                </div>
              </div>

              <div className="space-y-4">
                <div
                  className={`p-4 rounded-lg border ${
                    sentences[currentSentenceIndex]?.isCorrect
                      ? 'border-green-500 bg-green-900/20'
                      : 'border-red-500 bg-red-900/20'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    {sentences[currentSentenceIndex]?.isCorrect ? (
                      <Check size={16} className="text-green-400" />
                    ) : (
                      <X size={16} className="text-red-400" />
                    )}
                    <span className="text-sm">Câu {currentSentenceIndex + 1}</span>
                  </div>
                  <p className="text-sm text-gray-300">{sentences[currentSentenceIndex]?.text}</p>
                  {/* Khi show results, luôn hiện dịch nghĩa */}
                  {showResults && (
                    <div className="text-sm text-green-400 mt-1 mb-1">
                      Dịch nghĩa: {sentences[currentSentenceIndex]?.vi}
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Câu trả lời: {sentences[currentSentenceIndex]?.userAnswer || '(không trả lời)'}
                  </p>
                  {!sentences[currentSentenceIndex]?.isCorrect && (
                    <p className="text-xs text-blue-400 mt-1">
                      Đáp án đúng: {sentences[currentSentenceIndex]?.missingWords.join(', ')}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowResults(false);
                    setUserAnswers((prev) => {
                      const newAnswers = [...prev];
                      newAnswers[currentSentenceIndex] = [];
                      return newAnswers;
                    });
                  }}
                  className="flex-1"
                >
                  Thử lại
                </Button>
                {currentSentenceIndex < sentences.length - 1 ? (
                  <Button
                    onClick={() => {
                      setShowResults(false);
                      setCurrentSentenceIndex(currentSentenceIndex + 1);
                    }}
                    className="flex-1"
                  >
                    Câu tiếp
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      setCurrentStep('setup');
                      setShowResults(false);
                      setSentences([]);
                      setUserAnswers([]);
                    }}
                    className="flex-1"
                  >
                    Luyện tập mới
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
