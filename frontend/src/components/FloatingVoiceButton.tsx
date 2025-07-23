'use client';
import React, { useState } from 'react';
import { Mic, MicOff, X } from 'lucide-react';

interface FloatingVoiceButtonProps {
  isListening: boolean;
  onToggle: () => void;
  onClose?: () => void;
  showCloseButton?: boolean;
}

export default function FloatingVoiceButton({
  isListening,
  onToggle,
  onClose,
  showCloseButton = false
}: FloatingVoiceButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <div className="flex flex-col items-end space-y-2">
        {/* Close Button */}
        {showCloseButton && onClose && (
          <button
            onClick={onClose}
            className="w-10 h-10 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-lg"
          >
            <X size={20} />
          </button>
        )}
        
        {/* Voice Button */}
        <button
          onClick={onToggle}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
            isListening
              ? 'bg-red-500 hover:bg-red-600 text-white scale-110'
              : 'bg-blue-500 hover:bg-blue-600 text-white hover:scale-110'
          }`}
        >
          {isListening ? (
            <>
              <MicOff size={24} className="animate-pulse" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 rounded-full animate-ping" />
            </>
          ) : (
            <Mic size={24} />
          )}
          
          {/* Ripple Effect */}
          {isListening && (
            <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-20" />
          )}
        </button>
        
        {/* Tooltip */}
        {isHovered && (
          <div className="bg-gray-800 text-white text-sm px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
            {isListening ? 'Dừng nhận diện giọng nói' : 'Bắt đầu nhận diện giọng nói'}
          </div>
        )}
      </div>
    </div>
  );
} 