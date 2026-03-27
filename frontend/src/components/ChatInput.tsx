'use client';
import React, { useRef, useState } from 'react';
import { Send, Mic, Paperclip, Smile, X } from 'lucide-react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onVoiceToggle: () => void;
  isRecording: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export default function ChatInput({
  value,
  onChange,
  onSend,
  onVoiceToggle,
  isRecording,
  placeholder = 'Nhập tin nhắn hoặc nói chuyện với AI...',
  disabled = false,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
    onChange(e.currentTarget.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) {
        onSend();
      }
    }
  };

  const handleSend = () => {
    if (value.trim() && !disabled) {
      onSend();
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  return (
    <div className="w-full bg-gray-900 border-t border-gray-700 p-4">
      <div
        className={`relative max-w-4xl mx-auto transition-all duration-300 ${
          isFocused ? 'ring-2 ring-blue-500/50' : ''
        }`}
      >
        {/* Main Input Container */}
        <div className="bg-gray-800 rounded-2xl border border-gray-600 p-4 shadow-lg">
          {/* Text Input Area */}
          <div className="flex items-end space-x-3">
            <div className="flex-1 min-h-[20px] max-h-[120px] overflow-y-auto">
              <textarea
                ref={textareaRef}
                value={value}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={placeholder}
                disabled={disabled}
                className="w-full bg-transparent resize-none border-none outline-none text-white placeholder-gray-400 text-base leading-relaxed"
                rows={1}
                style={{ minHeight: '20px', maxHeight: '120px' }}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              {/* Attachment Button */}
              <button
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-all duration-200"
                title="Đính kèm file"
              >
                <Paperclip size={20} />
              </button>

              {/* Emoji Button */}
              <button
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-all duration-200"
                title="Chèn emoji"
              >
                <Smile size={20} />
              </button>

              {/* Voice Button */}
              <button
                onClick={onVoiceToggle}
                disabled={disabled}
                className={`p-2 rounded-full transition-all duration-200 ${
                  isRecording
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={isRecording ? 'Dừng ghi âm' : 'Bắt đầu ghi âm'}
              >
                <Mic size={20} />
              </button>

              {/* Send Button */}
              <button
                onClick={handleSend}
                disabled={!value.trim() || disabled}
                className={`p-2 rounded-full transition-all duration-200 ${
                  value.trim() && !disabled
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
                title="Gửi tin nhắn"
              >
                <Send size={20} />
              </button>
            </div>
          </div>

          {/* Voice Status Indicator */}
          {isRecording && (
            <div className="mt-3 flex items-center justify-center space-x-2 text-red-400 text-sm">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-ping"></div>
              <span>Đang ghi âm...</span>
              <button onClick={onVoiceToggle} className="p-1 hover:bg-red-500/20 rounded-full">
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-3 flex items-center justify-center space-x-4 text-xs text-gray-500">
          <span>Nhấn Enter để gửi</span>
          <span>•</span>
          <span>Shift + Enter để xuống dòng</span>
          <span>•</span>
          <span>Nhấn nút mic để nói chuyện</span>
        </div>
      </div>
    </div>
  );
}
