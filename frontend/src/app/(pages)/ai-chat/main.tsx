'use client';
import React, { useRef, useState, useEffect } from 'react';
import { Sidebar, History } from 'lucide-react';
import axios from 'axios';
import { SessionStorage } from '@/storage/sessionStorage';
import { useSidebarStore } from '@/storage/sidebarState';
import { User } from '@/types/User';
import LoadedOverlay from '@/components/LoadedOverlay';
import { useRouter } from 'next/navigation';
import MessageBubble from '@/components/MessageBubble';
import ChatInput from '@/components/ChatInput';
import WelcomeScreen from '@/components/WelcomeScreen';
import VoiceRecognition from '@/components/VoiceRecognition';
import FloatingVoiceButton from '@/components/FloatingVoiceButton';
import Toast from '@/components/Toast';
import { useToast } from '@/hooks/useToast';

type Message = {
  role: 'user' | 'bot';
  content: string;
};

export default function Main() {
  const { toggle } = useSidebarStore();
  const { toasts, removeToast, success, error } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [text, setText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Lấy dữ liệu từ sessionStorage khi component mount
  useEffect(() => {
    async function fetchUser() {
      const user = await SessionStorage.getUser(
        (loading) => setLoading(loading),
        (user) => setUser(user)
      );

      if (!user) {
        router.push('/login');
      }

      if (user?.plan_id && user?.plan_id >= 1) {
        setIsAuthorized(true); // cho phép hiển thị giao diện
      } else {
        router.push('/'); // chuyển về trang chủ nếu không hợp lệ
      }
    }
    fetchUser();
  }, []);

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content).then(
      () => success('Đã sao chép nội dung!'),
      (_err) => error('Lỗi khi sao chép nội dung')
    );
  };

  const sendMessage = async (prompt?: string, isRegenerate: boolean = false) => {
    const inputPrompt = prompt || text.trim();
    if (!inputPrompt) return;

    if (isRegenerate) {
      setMessages((prev) => prev.slice(0, -1));
    } else {
      const userMessage: Message = { role: 'user', content: inputPrompt };
      setMessages((prev) => [...prev, userMessage]);
      setText('');
    }

    setIsThinking(true);

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/chat`,
        {
          prompt: inputPrompt,
          history: messages.slice(-20),
        },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );

      if (res.status !== 200) throw new Error('Lỗi API');

      const botMessage: Message = {
        role: 'bot',
        content: res.data.script || 'Không có phản hồi.',
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Lỗi khi gọi API:', error);
      const errorMessage = isRegenerate
        ? 'Lỗi khi tạo lại phản hồi, vui lòng thử lại.'
        : 'Lỗi khi lấy phản hồi, vui lòng thử lại.';
      
      const botMessage: Message = {
        role: 'bot',
        content: errorMessage,
      };
      setMessages((prev) => [...prev, botMessage]);
      error(errorMessage);
    } finally {
      setIsThinking(false);
    }
  };

  const regenerateMessage = () => {
    const lastUserMessage = messages
      .slice()
      .reverse()
      .find((msg) => msg.role === 'user');
    if (lastUserMessage) {
      sendMessage(lastUserMessage.content, true);
    }
  };

  const handleQuickStart = (prompt: string) => {
    sendMessage(prompt);
  };

  const handleVoiceTranscript = (transcript: string) => {
    sendMessage(transcript);
  };

  const toggleVoiceRecording = () => {
    setIsRecording(!isRecording);
  };

  const toggleVoiceListening = () => {
    setIsListening(!isListening);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  if (!isAuthorized) return null;

  return (
    <div className="w-full flex flex-col h-screen text-white overflow-hidden bg-gray-900">
      {/* Header */}
      <div className="fixed top-0 left-0 w-full bg-gray-900 border-b border-gray-700 z-20">
        <div className="flex items-center justify-between px-4 py-3">
          <button 
            className="text-gray-200 hover:text-white p-2 hover:bg-gray-800 rounded-lg transition-colors" 
            onClick={() => toggle()}
          >
            <Sidebar size={24} />
          </button>
          <div className="text-xl font-semibold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            AI Assistant
          </div>
          <button 
            className="text-gray-200 hover:text-white p-2 hover:bg-gray-800 rounded-lg transition-colors" 
            onClick={() => console.log('History')}
          >
            <History size={24} />
          </button>
        </div>
        <div className="text-center text-sm text-gray-400 pb-2">
          Trò chuyện thông minh với AI
        </div>
      </div>

      {/* Main Content */}
      <div className="mt-[100px] mb-[140px] flex-1 flex flex-col overflow-y-auto">
        {messages.length === 0 ? (
          <WelcomeScreen 
            username={user?.username} 
            onQuickStart={handleQuickStart} 
          />
        ) : (
          <div className="flex-1 flex flex-col px-4 py-4 space-y-4">
            {messages.map((msg, idx) => (
              <MessageBubble
                key={idx}
                role={msg.role}
                content={msg.content}
                isLast={idx === messages.length - 1}
                onCopy={() => copyToClipboard(msg.content)}
                onRegenerate={regenerateMessage}
              />
            ))}
            {isThinking && (
              <MessageBubble
                role="bot"
                content=""
                isThinking={true}
              />
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Voice Recognition Modal */}
      {isRecording && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-600 max-w-md w-full mx-4">
            <VoiceRecognition
              onTranscript={handleVoiceTranscript}
              isListening={isListening}
              onListeningChange={setIsListening}
              language="vi-VN"
            />
          </div>
        </div>
      )}

      {/* Input Area */}
      <ChatInput
        value={text}
        onChange={setText}
        onSend={() => sendMessage()}
        onVoiceToggle={toggleVoiceRecording}
        isRecording={isRecording}
        disabled={isThinking}
      />

      {/* Floating Voice Button */}
      <FloatingVoiceButton
        isListening={isListening}
        onToggle={toggleVoiceListening}
        onClose={() => setIsListening(false)}
        showCloseButton={isListening}
      />

      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          type={toast.type}
          message={toast.message}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}

      {loading && <LoadedOverlay />}
    </div>
  );
} 