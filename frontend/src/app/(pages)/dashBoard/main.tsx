"use client";
import React, { useState, useEffect } from "react";
import { MessageCircle, BookOpen, HelpCircle, Mic, LogOut, Headphones, Library } from "lucide-react";
import { useRouter } from "next/navigation";
import { SessionStorage } from "@/storage/sessionStorage";

interface User {
  username: string;
  email: string;
  token: string;
}

export default function Main() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  // Lấy dữ liệu từ sessionStorage khi component mount
  useEffect(() => {
    const storedUser = SessionStorage.getUser();
    setUser(storedUser);
  }, []);

  const handleServiceClick = (path: string) => {
    if (!user?.username) {
      router.push("/login");
    } else {
      router.push(path);
    }
  };

  const handleLogout = () => {
    SessionStorage.clearUser(); // Xóa dữ liệu người dùng
    setUser(null);
    router.push("/login"); // Điều hướng về login
  };

  return (
    <div className="flex flex-col max-h-screen text-white bg-[#0f0f0f]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-[#121111] border-b border-gray-700">
        <h1 className="text-xl font-bold">Learning By AI</h1>
        <div className="flex space-x-4">
          {user?.username ? (
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">{user.username || "bạn"}</span>
              <button
                onClick={handleLogout}
                className="p-1 hover:bg-gray-700 rounded-3xl bg-red-400 pl-3 pr-3"
              >
                <LogOut className="w-4 h-4 inline" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => router.push("/login")}
              className="p-1 hover:bg-gray-700 rounded-3xl bg-red-400 pl-5 pr-5"
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="custom-scroll">
        <div className="flex-1 p-5 min-h-full">
        <h2 className="text-xl font-semibold text-gray-300 mb-4">Chào mừng bạn đến với ứng dụng Learning By AI</h2>
        <p className="text-gray-400 mb-5">Khám phá các tính năng học tập thông minh:</p>

        <div className="grid gap-4 md:grid-cols-2">
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
            onClick={() => handleServiceClick("/pronunciation")}
          >
            <Mic className="w-6 h-6 text-blue-400 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-white">Kiểm tra phát âm</h3>
              <p className="text-gray-400 text-sm">Ghi âm và so sánh phát âm của bạn với người bản xứ.</p>
            </div>
          </div>

          {/* Bilingual Stories */}
          <div
            className="flex items-center bg-[#1c1c1c] p-4 rounded-xl hover:bg-[#2a2a2a] cursor-pointer"
            onClick={() => handleServiceClick("/bilingual-stories")}
          >
            <Library className="w-6 h-6 text-purple-400 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-white">Đọc truyện song ngữ</h3>
              <p className="text-gray-400 text-sm">Cải thiện kỹ năng đọc với truyện song ngữ Anh-Việt.</p>
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

          {/* Quiz */}
          <div
            className="flex items-center bg-[#1c1c1c] p-4 rounded-xl hover:bg-[#2a2a2a] cursor-pointer"
            onClick={() => handleServiceClick("/quiz")}
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
      <div className="p-4 bg-[#111111] border-t border-gray-700 text-center">
        <p className="text-sm text-gray-500">© 2025 Learning By AI. All rights reserved.</p>
      </div>
      </div>
    </div>
  );
}