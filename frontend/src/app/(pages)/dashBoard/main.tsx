'use client';
import React, { useState, useEffect } from 'react';
import {
  MessageCircle,
  BookOpen,
  HelpCircle,
  Mic,
  Headphones,
  Library,
  Sidebar,
  Volume2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSidebarStore } from '@/lib/storage/sidebarState';
import LoadedOverlay from '@/components/LoadedOverlay';
import Notify from '@/components/Notify';
import PlanBadge from '@/components/PlanBadge';
import { useAuth } from '@/contexts/auth.context';
import { PATH } from '@/lib/contants/path';

export default function Main() {
  const { toggle } = useSidebarStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('success');

  const { user } = useAuth();

  useEffect(() => {
    setLoading(false);
  }, [user]);

  const notifyLoginRequired = () => {
    setMessage('Bạn cần đăng nhập/đăng ký để trải nghiệm dịch vụ này.');
    setMessageType('error');
  };

  const handleFeatureAccess = (path: string, minPlan: number) => {
    if (!user) {
      notifyLoginRequired();
      return;
    }

    if (user.plan_id < minPlan) {
      setMessage('Bạn cần nâng cấp gói dịch vụ để sử dụng tính năng này!');
      setMessageType('error');
      return;
    }

    router.push(path);
  };

  return (
    <div className="flex flex-col max-h-screen text-white w-full">
      {/* Header */}
      <div className="relative flex items-center justify-between px-4 py-3.5 bg-[#121111] border-b border-gray-700">
        <div className="flex justify-start">
          <button className="text-gray-200 hover:text-white" onClick={() => toggle()}>
            <Sidebar size={24} />
          </button>
        </div>
        <h1 className="text-xl font-bold absolute left-1/2 transform -translate-x-1/2">Luolingo</h1>
        <div className="flex space-x-4 justify-end">
          {user?.username ? (
            <div className="flex items-center space-x-4">
              <span className="text-gray-300 truncate overflow-hidden whitespace-nowrap max-w-[70px] md:whitespace-normal md:overflow-visible md:max-w-none md:truncate-0">
                {user.username || 'bạn'}
              </span>
            </div>
          ) : (
            <button
              onClick={() => router.push(PATH.LOGIN)}
              className="p-[2px] hover:bg-gray-700 rounded-3xl bg-red-400 pl-5 pr-5"
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="custom-scroll w-full md:w-[768px] mx-auto">
        <div className="flex-1 p-5">
          <h2 className="text-xl font-semibold text-gray-300 mb-2">
            Chào mừng bạn đến với ứng dụng Luolingo
          </h2>
          <p className="text-gray-400 mb-3">Khám phá các tính năng học tập thông minh:</p>
          <div className="grid gap-3 md:grid-cols-1">
            {/* Chat with AI */}
            <div
              className="relative flex items-center bg-[#1c1c1c] p-4 rounded-xl hover:bg-[#2a2a2a] cursor-pointer"
              onClick={() => {
                handleFeatureAccess(PATH.CHAT, 1);
              }}
            >
              <MessageCircle className="w-6 h-6 text-red-400 mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-white">Trò chuyện với AI</h3>
                <p className="text-gray-400 text-sm">
                  Trao đổi với AI để học tiếng Anh thông minh hơn.
                </p>
              </div>
              <PlanBadge level={1} />
            </div>

            {/* AI Voice Conversation */}
            <div
              className="relative flex items-center bg-[#1c1c1c] p-4 rounded-xl hover:bg-[#2a2a2a] cursor-pointer"
              onClick={() => {
                handleFeatureAccess(PATH.CONVERSATION, 2);
              }}
            >
              <Headphones className="w-6 h-6 text-orange-400 mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-white">Luyện giao tiếp với AI</h3>
                <p className="text-gray-400 text-sm">
                  Luyện nói tiếng Anh trực tiếp với AI qua hội thoại.
                </p>
              </div>
              <PlanBadge level={2} />
            </div>

            {/* Listen Practice */}
            <div
              className="relative flex items-center bg-[#1c1c1c] p-4 rounded-xl hover:bg-[#2a2a2a] cursor-pointer"
              onClick={() => {
                handleFeatureAccess(PATH.LISTEN_PRACTICE, 2);
              }}
            >
              <Volume2 className="w-6 h-6 text-pink-400 mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-white">Luyện nghe với AI</h3>
                <p className="text-gray-400 text-sm">
                  Luyện tập nghe chép chính tả với đa dạng câu từ.
                </p>
              </div>
              <PlanBadge level={2} />
            </div>

            {/* Pronunciation Practice */}
            <div
              className="relative flex items-center bg-[#1c1c1c] p-4 rounded-xl hover:bg-[#2a2a2a] cursor-pointer"
              onClick={() => {
                if (!user) {
                  notifyLoginRequired();
                  return;
                }
                setMessage('Tính năng đang phát triển!');
                setMessageType('info');
              }}
            >
              <Mic className="w-6 h-6 text-blue-400 mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-white">Kiểm tra phát âm</h3>
                <p className="text-gray-400 text-sm">
                  Ghi âm và so sánh phát âm của bạn với người bản xứ.
                </p>
              </div>
              <PlanBadge level={3} />
            </div>

            {/* Flashcards */}
            <div
              className="relative flex items-center bg-[#1c1c1c] p-4 rounded-xl hover:bg-[#2a2a2a] cursor-pointer"
              onClick={() => {
                handleFeatureAccess(PATH.FLASHCARDS, 1);
              }}
            >
              <BookOpen className="w-6 h-6 text-yellow-400 mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-white">Thẻ ghi nhớ</h3>
                <p className="text-gray-400 text-sm">
                  Ôn tập từ vựng hiệu quả qua hệ thống flashcard.
                </p>
              </div>
              <PlanBadge level={1} />
            </div>

            {/* Bilingual Stories */}
            <div
              className="relative flex items-center bg-[#1c1c1c] p-4 rounded-xl hover:bg-[#2a2a2a] cursor-pointer"
              onClick={() => {
                handleFeatureAccess(PATH.BILINGUAL_STORY, 2);
              }}
            >
              <Library className="w-6 h-6 text-purple-400 mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-white">Đọc truyện song ngữ</h3>
                <p className="text-gray-400 text-sm">
                  Cải thiện kỹ năng đọc với truyện song ngữ Anh-Việt.
                </p>
              </div>
              <PlanBadge level={2} />
            </div>

            {/* Quiz */}
            <div
              className="relative flex items-center bg-[#1c1c1c] p-4 rounded-xl hover:bg-[#2a2a2a] cursor-pointer"
              onClick={() => {
                handleFeatureAccess(PATH.QUIZ, 3);
              }}
            >
              <HelpCircle className="w-6 h-6 text-green-400 mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-white">Bài tập luyện tập</h3>
                <p className="text-gray-400 text-sm">
                  Kiểm tra kiến thức của bạn với các câu hỏi điền khuyết đa dạng.
                </p>
              </div>
              <PlanBadge level={3} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#5a595941] text-center">
          <p className="text-sm text-gray-500">© 2025 Luolingo. All rights reserved.</p>
        </div>
      </div>
      {loading && <LoadedOverlay />}
      <Notify
        message={message}
        type={messageType}
        duration={2000}
        onClose={() => setMessage(null)}
      />
    </div>
  );
}
