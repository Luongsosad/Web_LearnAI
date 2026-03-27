'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';
import VoiceRecognition from './VoiceRecognition';
import VoiceIndicator from './VoiceIndicator';
import FloatingVoiceButton from './FloatingVoiceButton';

export default function ChatDemo() {
  const { success, error, warning, info } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);

  const handleVoiceTranscript = (transcript: string) => {
    success(`Đã nhận diện: "${transcript}"`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center mb-8">Chat Interface Demo</h1>

        {/* Toast Demo */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Toast Notifications</h2>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => success('Thành công!')}
              className="bg-green-500 hover:bg-green-600"
            >
              Success Toast
            </Button>
            <Button onClick={() => error('Có lỗi xảy ra!')} className="bg-red-500 hover:bg-red-600">
              Error Toast
            </Button>
            <Button
              onClick={() => warning('Cảnh báo!')}
              className="bg-yellow-500 hover:bg-yellow-600"
            >
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
                className={
                  isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                }
              >
                {isListening ? 'Dừng Listening' : 'Bắt đầu Listening'}
              </Button>
            </div>

            <VoiceIndicator isListening={isListening} level={isListening ? 50 : 0} />
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

        {/* Instructions */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Hướng dẫn sử dụng</h2>
          <div className="space-y-2 text-gray-300">
            <p>• Nhấn các nút Toast để test thông báo</p>
            <p>• Nhấn "Mở Voice Modal" để test nhận diện giọng nói</p>
            <p>• Sử dụng Floating Voice Button ở góc màn hình</p>
            <p>• Voice Indicator sẽ hiển thị trạng thái listening</p>
          </div>
        </div>
      </div>
    </div>
  );
}
