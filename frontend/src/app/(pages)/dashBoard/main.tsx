"use client";
import React, { useState, useEffect } from "react";
import { MessageCircle, BookOpen, HelpCircle, Mic, Headphones, Library, Sidebar } from "lucide-react";
import { useRouter } from "next/navigation";
import { SessionStorage } from "@/storage/sessionStorage";
import { useSidebarStore } from "@/storage/sidebarState";
import User from '@/types/User';
import axios, { AxiosError } from 'axios';
import LoadedOverlay from '@/components/LoadedOverlay'
import Notify from '@/components/Notify'

export default function Main() {
  const { toggle } = useSidebarStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const getProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/a/profile`,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      if (res.status !== 200) throw new Error("Lỗi API");

      if (res.data.user) {
        SessionStorage.saveUser(res.data.user);
        setUser(res.data.user);
      }
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      console.log(error);

      SessionStorage.clearUser();
      return;
    }
    finally {
      setLoading(false);
    }
  }

  // Lấy dữ liệu từ sessionStorage khi component mount
  useEffect(() => {
    const storedUser = SessionStorage.getUser();
    if (!storedUser) {
      getProfile();
    } else {
      setUser(storedUser);
    }
  }, []);

  const handleServiceClick = (path: string) => {
    if (!user?.username) {
      router.push("/login");
    } else {
      router.push(path);
    }
  };


  return (
    <div className="flex flex-col max-h-screen text-white w-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 p-3 bg-[#121111] border-b border-gray-700">
        <div className="flex justify-center">
          <button className="text-gray-200 hover:text-white" onClick={() => toggle()}>
            <Sidebar size={24} />
          </button>
        </div>
        <h1 className="text-xl font-bold">Learning by AI</h1>
        <div className="flex space-x-4 justify-end">
          {user?.username ? (
            <div className="flex items-center space-x-4">
              <span className="text-gray-300 truncate overflow-hidden whitespace-nowrap max-w-[100px] md:whitespace-normal md:overflow-visible md:max-w-none md:truncate-0">
                {user.username || "bạn"}
              </span>

            </div>
          ) : (
            <button
              onClick={() => router.push("/login")}
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
          <h2 className="text-xl font-semibold text-gray-300 mb-2">Chào mừng bạn đến với ứng dụng Learning By AI</h2>
          <p className="text-gray-400 mb-3">Khám phá các tính năng học tập thông minh:</p>
          <div className="grid gap-3 md:grid-cols-1">
            {/* Chat with AI */}
            <div
              className="flex items-center bg-[#1c1c1c] p-4 rounded-xl hover:bg-[#2a2a2a] cursor-pointer"
              onClick={() => handleServiceClick("/chat")}
            >
              <MessageCircle className="w-6 h-6 text-red-400 mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-white">Trò chuyện với AI</h3>
                <p className="text-gray-400 text-sm">Trao đổi với AI để học tiếng Anh thông minh hơn.</p>
              </div>
            </div>

            {/* AI Voice Conversation */}
            <div
              className="flex items-center bg-[#1c1c1c] p-4 rounded-xl hover:bg-[#2a2a2a] cursor-pointer"
              onClick={() => handleServiceClick("/conversation")}
            >
              <Headphones className="w-6 h-6 text-orange-400 mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-white">Luyện giao tiếp với AI</h3>
                <p className="text-gray-400 text-sm">Luyện nói tiếng Anh trực tiếp với AI qua hội thoại.</p>
              </div>
            </div>

            {/* Pronunciation Practice */}
            <div
              className="flex items-center bg-[#1c1c1c] p-4 rounded-xl hover:bg-[#2a2a2a] cursor-pointer"
              onClick={() => {
                // handleServiceClick("/pronunciation");
                setMessage("Tính năng đang phát triển!");
              }}
            >
              <Mic className="w-6 h-6 text-blue-400 mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-white">Kiểm tra phát âm</h3>
                <p className="text-gray-400 text-sm">Ghi âm và so sánh phát âm của bạn với người bản xứ.</p>
              </div>
            </div>

            {/* Flashcards */}
            <div
              className="flex items-center bg-[#1c1c1c] p-4 rounded-xl hover:bg-[#2a2a2a] cursor-pointer"
              onClick={() => handleServiceClick("/flashcards")}
            >
              <BookOpen className="w-6 h-6 text-yellow-400 mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-white">Thẻ ghi nhớ</h3>
                <p className="text-gray-400 text-sm">Ôn tập từ vựng hiệu quả qua hệ thống flashcard.</p>
              </div>
            </div>

            {/* Bilingual Stories */}
            <div
              className="flex items-center bg-[#1c1c1c] p-4 rounded-xl hover:bg-[#2a2a2a] cursor-pointer"
              onClick={() => {
                // handleServiceClick("/bilingual-stories");
                setMessage("Tính năng đang phát triển!");
              }}
            >
              <Library className="w-6 h-6 text-purple-400 mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-white">Đọc truyện song ngữ</h3>
                <p className="text-gray-400 text-sm">Cải thiện kỹ năng đọc với truyện song ngữ Anh-Việt.</p>
              </div>
            </div>

            {/* Quiz */}
            <div
              className="flex items-center bg-[#1c1c1c] p-4 rounded-xl hover:bg-[#2a2a2a] cursor-pointer"
              onClick={() => {
                // handleServiceClick("/quiz");
                setMessage("Tính năng đang phát triển!");
              }}
            >
              <HelpCircle className="w-6 h-6 text-green-400 mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-white">Bài tập trắc nghiệm</h3>
                <p className="text-gray-400 text-sm">Kiểm tra kiến thức của bạn với các câu hỏi trắc nghiệm.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#5a595941] text-center">
          <p className="text-sm text-gray-500">© 2025 Learning By AI. All rights reserved.</p>
        </div>
      </div>
      {loading && <LoadedOverlay />}
      <Notify
        message={message}
        type="info"
        duration={2000}
        onClose={() => setMessage(null)}
      />
    </div>
  );
}