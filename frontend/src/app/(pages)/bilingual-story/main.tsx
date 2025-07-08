'use client';
import React, { useState } from 'react';
import axios from 'axios';
import LoadedOverlay from '@/components/LoadedOverlay';
import { Lamp, Sidebar as SidebarIcon } from 'lucide-react';
import { useSidebarStore } from '@/storage/sidebarState';
interface Story {
  id: string;
  title: string;
  content_en: string;
  content_vi: string;
  audio_en: string;
}

const TOPICS = [
  { id: 'family', name: 'Gia đình' },
  { id: 'school', name: 'Trường học' },
  { id: 'travel', name: 'Du lịch' },
  { id: 'friendship', name: 'Tình bạn' },
  { id: 'adventure', name: 'Phiêu lưu' },
];

export default function BilingualStoryMain() {
  const { toggle } = useSidebarStore();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [tab, setTab] = useState<'en' | 'vi'>('en');
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState<{
    word: string;
    pronunciation: string;
    meaning: string;
    audio: string;
  } | null>(null);

  // Gọi API lấy danh sách truyện theo chủ đề
  const fetchStories = async (topicId: string) => {
    setLoading(true);
    setSelectedTopic(topicId);
    setStories([]);
    setSelectedStory(null);
    setTab('en');
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/bilingual-story?topic=${topicId}`,
        { withCredentials: true }
      );
      setStories(res.data.stories);
    } catch {
      alert('Lỗi khi lấy truyện');
    } finally {
      setLoading(false);
    }
  };

  // Khi click vào cụm tiếng Anh, gọi API lấy phát âm, nghĩa, audio
  const handleWordClick = async (word: string) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/bilingual-story/word-info?word=${encodeURIComponent(word)}`,
        { withCredentials: true }
      );
      setPopup(res.data);
    } catch {
      alert('Lỗi khi lấy thông tin từ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col h-screen text-white overflow-hidden p-4 md:p-0">
      {loading && <LoadedOverlay />}
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
      <div className="max-w-3xl mx-auto w-full mt-[72px] md:mt-[82px]">
        {!selectedTopic ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-xl mx-auto">
            {TOPICS.map((topic) => (
              <button
                key={topic.id}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-3 font-semibold shadow-md transition"
                onClick={() => fetchStories(topic.id)}
              >
                {topic.name}
              </button>
            ))}
          </div>
        ) : !selectedStory ? (
          <div>
            <button
              className="mb-4 text-blue-500 hover:underline"
              onClick={() => {
                setSelectedTopic(null);
                setStories([]);
              }}
            >
              ← Chọn chủ đề khác
            </button>
            <div className="space-y-8">
              {stories.map((story) => (
                <div
                  key={story.id}
                  className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 shadow cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                  onClick={() => {
                    setSelectedStory(story);
                    setTab('en');
                  }}
                >
                  <h2 className="text-xl font-bold mb-2">{story.title}</h2>
                  <div className="flex gap-2 mt-2">
                    <span className="text-blue-500 underline cursor-pointer">Đọc truyện</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <button
              className="mb-4 text-blue-500 hover:underline"
              onClick={() => {
                setSelectedStory(null);
                setTab('en');
              }}
            >
              ← Quay lại danh sách truyện
            </button>
            <div className="flex gap-4 mb-4">
              <button
                className={`px-4 py-2 rounded-t-lg font-semibold ${tab === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                onClick={() => setTab('en')}
              >
                Đọc tiếng Anh
              </button>
              <button
                className={`px-4 py-2 rounded-t-lg font-semibold ${tab === 'vi' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                onClick={() => setTab('vi')}
              >
                Đọc tiếng Việt
              </button>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 shadow">
              <h2 className="text-xl font-bold mb-2">{selectedStory.title}</h2>
              {tab === 'en' ? (
                <>
                  <audio controls src={selectedStory.audio_en} className="w-full mb-4" />
                  <div className="prose dark:prose-invert max-w-none">
                    {renderStoryContent(selectedStory.content_en, handleWordClick)}
                  </div>
                </>
              ) : (
                <div className="prose dark:prose-invert max-w-none">
                  {renderStoryContent(selectedStory.content_vi, handleWordClick)}
                </div>
              )}
            </div>
          </div>
        )}
        {popup && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-xl max-w-xs w-full relative">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
                onClick={() => setPopup(null)}
              >
                ×
              </button>
              <div className="text-lg font-bold mb-2">{popup.word}</div>
              <div className="mb-1 text-gray-600">
                Phát âm: <span className="font-mono">{popup.pronunciation}</span>
              </div>
              <div className="mb-2">
                Nghĩa: <span className="font-semibold">{popup.meaning}</span>
              </div>
              <audio controls src={popup.audio} className="w-full" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Hàm render nội dung truyện, bọc các cụm tiếng Anh đặc biệt bằng span có thể click
function renderStoryContent(content: string, onWordClick: (word: string) => void) {
  // Giả sử các cụm tiếng Anh được đánh dấu bằng [[...]] trong content
  const parts = content.split(/(\[\[.*?\]\])/g);
  return (
    <>
      {parts.map((part, idx) => {
        const match = part.match(/^\[\[(.*?)\]\]$/);
        if (match) {
          const word = match[1];
          return (
            <span
              key={idx}
              className="text-blue-600 underline cursor-pointer hover:text-blue-800"
              onClick={() => onWordClick(word)}
            >
              {word}
            </span>
          );
        }
        return <span key={idx}>{part}</span>;
      })}
    </>
  );
}
