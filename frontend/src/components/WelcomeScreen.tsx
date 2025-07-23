'use client';
import React from 'react';
import { Bot, MessageCircle, Lightbulb, BookOpen, Languages, Sparkles, Mic } from 'lucide-react';

interface WelcomeScreenProps {
  username?: string;
  onQuickStart: (prompt: string) => void;
}

const quickStartPrompts = [
  {
    icon: <Languages size={20} />,
    title: "Học tiếng Anh",
    description: "Giúp tôi học tiếng Anh từ cơ bản",
    prompt: "Bạn có thể giúp tôi học tiếng Anh từ cơ bản không? Hãy bắt đầu với những câu chào hỏi đơn giản."
  },
  {
    icon: <BookOpen size={20} />,
    title: "Giải thích khái niệm",
    description: "Giải thích một khái niệm phức tạp",
    prompt: "Bạn có thể giải thích khái niệm 'machine learning' một cách đơn giản và dễ hiểu không?"
  },
  {
    icon: <Lightbulb size={20} />,
    title: "Tư vấn sáng tạo",
    description: "Tìm ý tưởng mới cho dự án",
    prompt: "Tôi đang tìm ý tưởng cho một dự án startup. Bạn có thể gợi ý một số ý tưởng thú vị không?"
  },
  {
    icon: <MessageCircle size={20} />,
    title: "Trò chuyện thông thường",
    description: "Chỉ muốn nói chuyện vui vẻ",
    prompt: "Xin chào! Bạn có thể kể cho tôi nghe một câu chuyện thú vị không?"
  }
];

export default function WelcomeScreen({ username, onQuickStart }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
            <Bot size={32} className="text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Chào {username ? username : 'bạn'}! 👋
        </h1>
        <p className="text-xl text-gray-300 mb-1">
          Tôi là AI Assistant của bạn
        </p>
        <p className="text-gray-400">
          Hãy bắt đầu cuộc trò chuyện hoặc chọn một chủ đề bên dưới
        </p>
      </div>

      {/* Quick Start Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl mb-8">
        {quickStartPrompts.map((item, index) => (
          <button
            key={index}
            onClick={() => onQuickStart(item.prompt)}
            className="group bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-blue-500 rounded-xl p-4 text-left transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                {item.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-1 group-hover:text-blue-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-400 text-sm">
                  {item.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <Mic size={24} className="text-white" />
          </div>
          <h3 className="text-white font-semibold mb-2">Nói chuyện tự nhiên</h3>
          <p className="text-gray-400 text-sm">
            Sử dụng giọng nói để trò chuyện với AI một cách tự nhiên
          </p>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <Sparkles size={24} className="text-white" />
          </div>
          <h3 className="text-white font-semibold mb-2">AI thông minh</h3>
          <p className="text-gray-400 text-sm">
            AI hiểu ngữ cảnh và đưa ra câu trả lời chính xác, hữu ích
          </p>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <MessageCircle size={24} className="text-white" />
          </div>
          <h3 className="text-white font-semibold mb-2">Trò chuyện liên tục</h3>
          <p className="text-gray-400 text-sm">
            Duy trì cuộc hội thoại dài và nhớ ngữ cảnh trước đó
          </p>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-8 text-center">
        <p className="text-gray-500 text-sm">
          💡 <strong>Mẹo:</strong> Bạn có thể nói chuyện bằng tiếng Việt hoặc tiếng Anh
        </p>
      </div>
    </div>
  );
} 