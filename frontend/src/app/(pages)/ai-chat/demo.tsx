'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';
import VoiceRecognition from '@/components/VoiceRecognition';
import VoiceIndicator from '@/components/VoiceIndicator';
import FloatingVoiceButton from '@/components/FloatingVoiceButton';
import MessageBubble from '@/components/MessageBubble';
import WelcomeScreen from '@/components/WelcomeScreen';

export default function AIChatDemo() {
  const { success, error, warning, info } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [messages, setMessages] = useState<Array<{role: 'user' | 'bot', content: string}>>([]);

  const handleVoiceTranscript = (transcript: string) => {
    success(`Đã nhận diện: "${transcript}"`);
    setMessages(prev => [...prev, { role: 'user', content: transcript }]);
  };

  const handleQuickStart = (prompt: string) => {
    setMessages(prev => [...prev, { role: 'user', content: prompt }]);
    success('Đã chọn chủ đề: ' + prompt);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          AI Chat Demo
        </h1>

        {/* Welcome Screen Demo */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Welcome Screen Demo</h2>
          <WelcomeScreen 
            username="Demo User" 
            onQuickStart={handleQuickStart} 
          />
        </div>

        {/* Toast Demo */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Toast Notifications</h2>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => success('Thành công!')} className="bg-green-500 hover:bg-green-600">
              Success Toast
            </Button>
            <Button onClick={() => error('Có lỗi xảy ra!')} className="bg-red-500 hover:bg-red-600">
              Error Toast
            </Button>
            <Button onClick={() => warning('Cảnh báo!')} className="bg-yellow-500 hover:bg-yellow-600">
              Warning Toast
            </Button>
            <Button onClick={() => info('Thông tin!')} className="bg-blue-500 hover:bg-blue-600">
              Info Toast
            </Button>
          </div>
        </div>

        {/* Voice Recognition Demo */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Voice Recognition</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => setShowVoiceModal(!showVoiceModal)}
                className="bg-blue-500 hover:bg-blue-600"
              >
                {showVoiceModal ? 'Đóng Voice Modal' : 'Mở Voice Modal'}
              </Button>
              <Button 
                onClick={() => setIsListening(!isListening)}
                className={isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}
              >
                {isListening ? 'Dừng Listening' : 'Bắt đầu Listening'}
              </Button>
            </div>
            
            <VoiceIndicator 
              isListening={isListening} 
              level={isListening ? 50 : 0}
            />
          </div>
        </div>

        {/* Message Bubbles Demo */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Message Bubbles</h2>
          <div className="space-y-4">
            <MessageBubble
              role="user"
              content="Xin chào! Bạn có thể giúp tôi học tiếng Anh không?"
              isLast={false}
            />
            <MessageBubble
              role="bot"
              content="Chào bạn! Tôi rất vui được giúp bạn học tiếng Anh. Bạn muốn bắt đầu từ đâu? Tôi có thể giúp bạn với từ vựng, ngữ pháp, phát âm hoặc các kỹ năng khác."
              isLast={true}
              onCopy={() => success('Đã sao chép!')}
              onRegenerate={() => info('Đang tạo lại phản hồi...')}
            />
            <MessageBubble
              role="bot"
              content=""
              isThinking={true}
            />
          </div>
        </div>

        {/* Voice Modal */}
        {showVoiceModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-600 max-w-md w-full mx-4">
              <VoiceRecognition
                onTranscript={handleVoiceTranscript}
                isListening={isListening}
                onListeningChange={setIsListening}
                language="vi-VN"
              />
              <div className="mt-4 text-center">
                <Button 
                  onClick={() => setShowVoiceModal(false)}
                  className="bg-gray-600 hover:bg-gray-700"
                >
                  Đóng
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Floating Voice Button */}
        <FloatingVoiceButton
          isListening={isListening}
          onToggle={() => setIsListening(!isListening)}
          onClose={() => setIsListening(false)}
          showCloseButton={isListening}
        />

        {/* Messages History */}
        {messages.length > 0 && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Messages History</h2>
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <MessageBubble
                  key={idx}
                  role={msg.role}
                  content={msg.content}
                  isLast={idx === messages.length - 1}
                  onCopy={() => success('Đã sao chép!')}
                  onRegenerate={() => info('Đang tạo lại phản hồi...')}
                />
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Hướng dẫn sử dụng</h2>
          <div className="space-y-2 text-gray-300">
            <p>• Nhấn các nút Toast để test thông báo</p>
            <p>• Chọn chủ đề từ Welcome Screen để test quick start</p>
            <p>• Nhấn "Mở Voice Modal" để test nhận diện giọng nói</p>
            <p>• Sử dụng Floating Voice Button ở góc màn hình</p>
            <p>• Voice Indicator sẽ hiển thị trạng thái listening</p>
            <p>• Test Message Bubbles với các actions (copy, regenerate)</p>
          </div>
        </div>

        {/* Features List */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Tính năng đã implement</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-blue-400">UI Components</h3>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>✅ WelcomeScreen</li>
                <li>✅ MessageBubble</li>
                <li>✅ ChatInput</li>
                <li>✅ VoiceRecognition</li>
                <li>✅ VoiceIndicator</li>
                <li>✅ FloatingVoiceButton</li>
                <li>✅ Toast</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-green-400">Features</h3>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>✅ Web Speech API</li>
                <li>✅ Continuous Voice Recognition</li>
                <li>✅ Toast Notifications</li>
                <li>✅ Modern Design</li>
                <li>✅ Responsive Layout</li>
                <li>✅ Animations</li>
                <li>✅ Error Handling</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 