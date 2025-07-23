'use client';
import React from 'react';
import { Copy, RefreshCw, User, Bot, Check } from 'lucide-react';

interface MessageBubbleProps {
  role: 'user' | 'bot';
  content: string;
  isLast?: boolean;
  onCopy?: () => void;
  onRegenerate?: () => void;
  isThinking?: boolean;
}

export default function MessageBubble({
  role,
  content,
  isLast = false,
  onCopy,
  onRegenerate,
  isThinking = false
}: MessageBubbleProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    if (onCopy) {
      onCopy();
    } else {
      await navigator.clipboard.writeText(content);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isThinking) {
    return (
      <div className="flex items-start space-x-3 max-w-[80%] self-start">
        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <Bot size={16} className="text-white" />
        </div>
        <div className="flex-1 bg-gray-800 rounded-2xl rounded-tl-md px-4 py-3 border border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-sm text-gray-400">AI đang suy nghĩ...</span>
          </div>
        </div>
      </div>
    );
  }

  if (role === 'user') {
    return (
      <div className="flex items-start space-x-3 max-w-[80%] self-end ml-auto">
        <div className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl rounded-tr-md px-4 py-3 text-white shadow-lg">
          <div className="whitespace-pre-line break-words">{content}</div>
        </div>
        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center">
          <User size={16} className="text-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start space-x-3 max-w-[80%] self-start">
      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
        <Bot size={16} className="text-white" />
      </div>
      <div className="flex-1 bg-gray-800 rounded-2xl rounded-tl-md px-4 py-3 border border-gray-700 shadow-lg">
        <div className="whitespace-pre-line break-words text-gray-100 leading-relaxed">
          {content}
        </div>
        
        {isLast && (onCopy || onRegenerate) && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
            <div className="flex items-center space-x-2">
              {onCopy && (
                <button
                  onClick={handleCopy}
                  className="flex items-center space-x-1 text-xs text-gray-400 hover:text-white transition-colors duration-200"
                >
                  {copied ? (
                    <>
                      <Check size={12} className="text-green-400" />
                      <span className="text-green-400">Đã sao chép</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>Sao chép</span>
                    </>
                  )}
                </button>
              )}
            </div>
            
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                className="flex items-center space-x-1 text-xs text-gray-400 hover:text-white transition-colors duration-200"
              >
                <RefreshCw size={12} />
                <span>Tạo lại</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 