'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BookOpen,
  Globe,
  Home,
  Users,
  GraduationCap,
  Plane,
  Heart,
  Compass,
  ArrowLeft,
  Volume2,
  SidebarIcon,
  Lamp,
  Computer,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import LoadedOverlay from '@/components/LoadedOverlay';
import { useSidebarStore } from '@/lib/storage/sidebarState';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth.context';

interface Story {
  id: string;
  title: string;
  content_en: string;
  content_vi: string;
  audio_en: string;
}

interface WordInfo {
  word: string;
  pronunciation: string;
  meaning: string;
  type: string;
  audio: string;
}

const TOPICS = [
  { id: 'family', name: 'Gia đình', icon: Users, color: 'bg-rose-500 hover:bg-rose-600' },
  { id: 'school', name: 'Trường học', icon: GraduationCap, color: 'bg-blue-500 hover:bg-blue-600' },
  { id: 'travel', name: 'Du lịch', icon: Plane, color: 'bg-emerald-500 hover:bg-emerald-600' },
  { id: 'friendship', name: 'Tình bạn', icon: Heart, color: 'bg-pink-500 hover:bg-pink-600' },
  { id: 'adventure', name: 'Phiêu lưu', icon: Compass, color: 'bg-orange-500 hover:bg-orange-600' },
  {
    id: 'technology',
    name: 'Công nghệ',
    icon: Computer,
    color: 'bg-purple-500 hover:bg-purple-600',
  },
];

export default function BilingualStoryMain() {
  const { toggle } = useSidebarStore();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [tab, setTab] = useState<'en' | 'vi'>('en');
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState<WordInfo | null>(null);
  const router = useRouter();

  // State để lưu trữ thông tin từ vựng theo chủ đề và truyện
  const [wordInfoCache, setWordInfoCache] = useState<{
    [key: string]: { [word: string]: WordInfo };
  }>({});
  const [preparingData, setPreparingData] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (user?.plan_id && user?.plan_id >= 2) {
      setLoading(false);
      setIsAuthorized(true);
    }
  }, [user]);

  const fetchStories = async (topicId: string) => {
    setLoading(true);
    setSelectedTopic(topicId);
    setStories([]);
    setSelectedStory(null);
    setTab('en');
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/bilingual-story?topic=${topicId}`,
        {
          withCredentials: true,
        }
      );
      setStories(res.data.stories);
    } catch (error) {
      console.error('Lỗi khi lấy truyện:', error);
      alert('Lỗi khi lấy truyện');
    } finally {
      setLoading(false);
    }
  };

  // Hàm trích xuất từ vựng từ nội dung truyện
  const extractWordsFromContent = (content: string): string[] => {
    const wordMatches = content.match(/\[\[(.*?)\]\]/g);
    if (!wordMatches) return [];
    return wordMatches.map((match) => match.replace(/\[\[|\]\]/g, ''));
  };

  // Hàm chuẩn bị dữ liệu từ vựng cho truyện
  const prepareWordData = async (story: Story, topicId: string) => {
    console.log('hhh');
    const cacheKey = `${topicId}-${story.id}`;
    console.log('cacheKey', cacheKey);
    console.log('wordInfoCache', wordInfoCache);
    // Kiểm tra cache trước
    if (wordInfoCache[cacheKey]) {
      return wordInfoCache[cacheKey];
    }
    // console.log("prepareWordData", story.content_vi)

    setPreparingData(true);

    try {
      const words = extractWordsFromContent(story.content_vi);
      if (words.length === 0) {
        setWordInfoCache((prev) => ({
          ...prev,
          [cacheKey]: {},
        }));
        return {};
      }

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/bilingual-story/multiple-word-info`,
        { words },
        { withCredentials: true }
      );

      // console.log("res.data.wordInfoList", res.data.wordInfoList)

      const wordInfoMap: { [word: string]: WordInfo } = {};
      res.data.wordInfoList.forEach((item: any) => {
        if (item.data && !item.error) {
          wordInfoMap[item.word] = item.data;
        }
      });

      setWordInfoCache((prev) => ({
        ...prev,
        [cacheKey]: wordInfoMap,
      }));

      return wordInfoMap;
    } catch (error) {
      console.error('Lỗi khi chuẩn bị dữ liệu từ vựng:', error);
      return {};
    } finally {
      setPreparingData(false);
    }
  };

  const handleStorySelect = async (story: Story) => {
    if (!selectedTopic) return;

    setSelectedStory(story);
    setTab('en');

    // Chuẩn bị dữ liệu từ vựng
    await prepareWordData(story, selectedTopic);
  };

  const handleWordClick = async (word: string) => {
    if (!selectedTopic || !selectedStory) return;

    const cacheKey = `${selectedTopic}-${selectedStory.id}`;
    const cachedWordInfo = wordInfoCache[cacheKey]?.[word];

    if (cachedWordInfo) {
      setPopup(cachedWordInfo);
      return;
    }

    // Nếu không có trong cache, gọi API để lấy thông tin cụ thể
    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/bilingual-story/word-info?word=${encodeURIComponent(word)}`,
        { withCredentials: true }
      );

      if (res.data.wordInfo && res.data.wordInfo.length > 0) {
        const wordInfo = res.data.wordInfo[0];
        setPopup(wordInfo);

        // Cập nhật cache
        setWordInfoCache((prev) => ({
          ...prev,
          [cacheKey]: {
            ...prev[cacheKey],
            [word]: wordInfo,
          },
        }));
      }
    } catch (error) {
      console.error('Lỗi khi lấy thông tin từ:', error);
      alert('Lỗi khi lấy thông tin từ');
    } finally {
      setLoading(false);
    }
  };

  const selectedTopicData = TOPICS.find((t) => t.id === selectedTopic);

  if (!isAuthorized) return null;

  return (
    <div className={`min-h-screen transition-colors duration-300"}`}>
      {loading && <LoadedOverlay />}
      {preparingData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p>Đang chuẩn bị dữ liệu từ vựng...</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="fixed top-0 left-0 w-full bg-[#111111] z-20">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <button className="text-gray-200 hover:text-white" onClick={() => toggle()}>
            <SidebarIcon size={24} />
          </button>
          <div className="text-xl font-semibold">Truyện Song Ngữ</div>
          <button className="text-gray-200 hover:text-white" onClick={() => {}}>
            <Lamp size={24} />
          </button>
        </div>
        <div className="text-center text-sm text-gray-400 mt-1 mb-1">Learning by AI</div>
      </div>

      <main className="mt-[64px] mb-[100px] flex-1 flex flex-col px-4 py-4 overflow-y-auto h-full space-y-4 custom-scroll bg-[#111111] pb-7">
        {/* Topic Selection */}
        {!selectedTopic && (
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight">Chọn chủ đề yêu thích</h2>
              <div className="text-lg">
                Khám phá những câu chuyện thú vị để học tiếng Anh hiệu quả
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {TOPICS &&
                TOPICS.map((topic) => {
                  const IconComponent = topic.icon;
                  return (
                    <Card
                      key={topic.id}
                      className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                      onClick={() => fetchStories(topic.id)}
                    >
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center text-center space-y-4">
                          <div
                            className={`p-4 rounded-full ${topic.color} text-white transition-transform group-hover:scale-110`}
                          >
                            <IconComponent className="h-8 w-8" />
                          </div>
                          <h3 className="text-xl font-semibold">{topic.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Khám phá câu chuyện về {topic.name.toLowerCase()}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </div>
        )}

        {/* Story List */}
        {selectedTopic && !selectedStory && (
          <div className="">
            <div className="flex justify-between">
              <Button
                variant="ghost"
                onClick={() => {
                  setSelectedTopic(null);
                  setStories([]);
                }}
                className="gap-2 text-xl font-semibold p-0"
              >
                <ArrowLeft className="h-5 w-5" />
                Chọn chủ đề khác
              </Button>
            </div>
            <div className="mb-4">
              {selectedTopicData && (
                <div className="flex items-center justify-center gap-2">
                  <div className="text-xl font-bold">Chủ đề: </div>
                  <selectedTopicData.icon className="h-5 w-5 text-primary" />
                  <div className="text-xl font-bold">{selectedTopicData.name}</div>
                </div>
              )}
            </div>

            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Đang tải truyện...</p>
              </div>
            ) : stories && stories.length > 0 ? (
              <div className="grid gap-6">
                {stories &&
                  stories.length > 0 &&
                  stories.map((story, index) => (
                    <Card
                      key={story.id}
                      className="group cursor-pointer transition-all duration-300 hover:shadow-md"
                      onClick={() => handleStorySelect(story)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <CardTitle className="text-xl group-hover:text-primary transition-colors">
                              {story.title}
                            </CardTitle>
                            <CardDescription>
                              Câu chuyện số {index + 1} • Chế độ song ngữ
                            </CardDescription>
                          </div>
                          <Badge variant="outline">
                            <BookOpen className="h-3 w-3 mr-1" />
                            Đọc ngay
                          </Badge>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Không có truyện nào được tìm thấy.</p>
              </div>
            )}
          </div>
        )}

        {/* Story Reader */}
        {selectedStory && (
          <div className="">
            <div className="flex items-center gap-4 mb-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setSelectedStory(null);
                  setTab('en');
                }}
                className="gap-2 text-xl font-semibold p-0"
              >
                <ArrowLeft className="h-4 w-4" />
                Danh sách truyện
              </Button>
            </div>
            <Card>
              <CardHeader>
                <div className="flex w-full items-center justify-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <h2 className="text-xl text-center font-bold">{selectedStory.title}</h2>
                </div>
                <Tabs value={tab} onValueChange={(value) => setTab(value as 'en' | 'vi')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger
                      value="en"
                      className="gap-2 text-base rounded-tr-2xl rounded-tl-2xl font-semibold data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                    >
                      <Globe className="h-4 w-4" />
                      Tiếng Anh
                    </TabsTrigger>
                    <TabsTrigger
                      value="vi"
                      className="gap-2 text-base rounded-tr-2xl rounded-tl-2xl font-semibold data-[state=active]:bg-yellow-400 data-[state=active]:text-black"
                    >
                      <Home className="h-4 w-4" />
                      Tiếng Việt
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>

              <CardContent className="space-y-2">
                <Tabs value={tab}>
                  <TabsContent value="en" className="space-y-2">
                    <audio controls src={selectedStory.audio_en} className="w-full h-10" />
                    <Separator />
                    <div className="prose prose-lg max-w-none dark:prose-invert">
                      {renderStoryContent(selectedStory.content_en, handleWordClick)}
                    </div>
                  </TabsContent>

                  <TabsContent value="vi" className="space-y-4">
                    <div className="prose prose-lg max-w-none dark:prose-invert">
                      {renderStoryContent(selectedStory.content_vi, handleWordClick)}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Word Info Dialog */}
        <Dialog open={!!popup} onOpenChange={() => setPopup(null)}>
          <DialogContent className="sm:max-w-md max-w-[86%]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Thông tin từ vựng
              </DialogTitle>
            </DialogHeader>

            {popup && (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-primary">{popup.word}</h3>
                  <p className="text-muted-foreground">/{popup.pronunciation}/</p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Loại từ: {popup.type}</span>
                  </div>

                  <div>
                    <span className="font-medium">Nghĩa: {popup.meaning}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <span className="font-medium flex items-center gap-2">
                    <Volume2 className="h-4 w-4" />
                    Phát âm:
                  </span>
                  <audio controls src={popup.audio} className="w-full h-10" />
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

function renderStoryContent(content: string, onWordClick: (word: string) => void) {
  if (!content) return null;

  const parts = content.split(/(\[\[.*?\]\])/g);
  return (
    <div className="leading-relaxed">
      {parts &&
        parts.map((part, idx) => {
          const match = part.match(/^\[\[(.*?)\]\]$/);
          if (match) {
            const word = match[1];
            return (
              <span
                key={idx}
                className="inline-block px-1 py-0.5 mx-0.5 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors font-medium pt-0 pb-0"
                onClick={() => onWordClick(word)}
              >
                {word}
              </span>
            );
          }
          return (
            <span className="pt-2 pb-2" key={idx}>
              {part}
            </span>
          );
        })}
    </div>
  );
}
